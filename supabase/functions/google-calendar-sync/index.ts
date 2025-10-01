import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, events } = await req.json();
    console.log('Google Calendar sync action:', action);

    // Get the user's Google Calendar connection
    const { data: connection, error: connError } = await supabase
      .from('calendar_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'google')
      .eq('is_active', true)
      .maybeSingle();

    if (connError) throw connError;
    
    if (!connection) {
      return new Response(
        JSON.stringify({ error: 'No Google Calendar connection found. Please connect your Google account first.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if token needs refresh
    if (new Date(connection.token_expiry) <= new Date()) {
      console.log('Token expired, needs refresh');
      // In production, implement token refresh logic here
      return new Response(
        JSON.stringify({ error: 'Token expired. Please reconnect your Google account.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'fetch') {
      // Fetch events from Google Calendar
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${new Date().toISOString()}&maxResults=50&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            'Authorization': `Bearer ${connection.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('Google Calendar API error:', error);
        throw new Error('Failed to fetch events from Google Calendar');
      }

      const data = await response.json();
      const googleEvents = data.items || [];

      // Store events in database
      for (const event of googleEvents) {
        const startTime = event.start?.dateTime || event.start?.date;
        const endTime = event.end?.dateTime || event.end?.date;
        
        if (!startTime || !endTime) continue;

        await supabase
          .from('synced_calendar_events')
          .upsert({
            connection_id: connection.id,
            external_event_id: event.id,
            title: event.summary || 'Untitled Event',
            description: event.description,
            start_time: startTime,
            end_time: endTime,
            location: event.location,
            is_all_day: !event.start?.dateTime,
          }, {
            onConflict: 'connection_id,external_event_id'
          });
      }

      // Update last sync time
      await supabase
        .from('calendar_connections')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', connection.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Synced ${googleEvents.length} events from Google Calendar`,
          count: googleEvents.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'export') {
      // Export events to Google Calendar
      if (!events || events.length === 0) {
        throw new Error('No events to export');
      }

      let exportedCount = 0;
      for (const event of events) {
        const googleEvent = {
          summary: event.title,
          description: event.notes || '',
          start: {
            dateTime: new Date(event.start).toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: new Date(event.end).toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        };

        const response = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${connection.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(googleEvent),
          }
        );

        if (response.ok) {
          exportedCount++;
        } else {
          console.error('Failed to export event:', await response.text());
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Exported ${exportedCount} events to Google Calendar`,
          count: exportedCount
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in google-calendar-sync:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
