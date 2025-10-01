import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { startDate, endDate, duration, timezone = 'UTC' } = await req.json();

    console.log('Analyzing availability for user:', user.id, { startDate, endDate, duration, timezone });

    // Fetch all synced calendar events in the date range
    const { data: events, error: eventsError } = await supabase
      .from('synced_calendar_events')
      .select('*, connection_id, calendar_connections!inner(user_id)')
      .eq('calendar_connections.user_id', user.id)
      .gte('start_time', startDate)
      .lte('end_time', endDate)
      .order('start_time');

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      throw eventsError;
    }

    // Fetch all scheduled tasks in the date range
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_scheduled', true)
      .not('start_time', 'is', null)
      .gte('start_time', startDate)
      .lte('start_time', endDate)
      .order('start_time');

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      throw tasksError;
    }

    console.log(`Found ${events?.length || 0} events and ${tasks?.length || 0} tasks`);

    // Prepare data for AI analysis
    const busyBlocks = [
      ...(events || []).map(e => ({
        type: 'event',
        title: e.title,
        start: e.start_time,
        end: e.end_time,
        allDay: e.is_all_day
      })),
      ...(tasks || []).map(t => ({
        type: 'task',
        title: t.title,
        start: t.start_time,
        end: t.end_time || new Date(new Date(t.start_time).getTime() + (t.duration_minutes || 30) * 60000).toISOString()
      }))
    ].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    // Call Lovable AI to analyze availability
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a smart scheduling assistant. Analyze the user's calendar and suggest the best available time slots for meetings.

Consider:
- Prefer gaps of at least 15 minutes between meetings
- Avoid suggesting times right before or after all-day events
- Consider time of day (morning 9-12, afternoon 1-5 are usually best)
- Prefer longer continuous blocks for longer meetings
- User's timezone: ${timezone}

Return your analysis in a structured format.`;

    const userPrompt = `Analyze my availability from ${startDate} to ${endDate} (timezone: ${timezone}).

I need to find time for a ${duration || 30}-minute meeting.

Current busy blocks:
${JSON.stringify(busyBlocks, null, 2)}

Find all available time slots of at least ${duration || 30} minutes, and suggest the top 5 best meeting times with explanations.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'suggest_meeting_times',
            description: 'Return available time slots and top meeting time suggestions',
            parameters: {
              type: 'object',
              properties: {
                availableSlots: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      start: { type: 'string', description: 'ISO timestamp' },
                      end: { type: 'string', description: 'ISO timestamp' },
                      durationMinutes: { type: 'number' }
                    },
                    required: ['start', 'end', 'durationMinutes']
                  }
                },
                topSuggestions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      start: { type: 'string', description: 'ISO timestamp' },
                      end: { type: 'string', description: 'ISO timestamp' },
                      reason: { type: 'string', description: 'Why this is a good time' },
                      score: { type: 'number', description: 'Quality score 1-10' }
                    },
                    required: ['start', 'end', 'reason', 'score']
                  }
                }
              },
              required: ['availableSlots', 'topSuggestions']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'suggest_meeting_times' } }
      })
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      throw new Error('AI analysis failed');
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    console.log('AI analysis complete:', {
      availableSlots: analysis.availableSlots?.length,
      suggestions: analysis.topSuggestions?.length
    });

    return new Response(
      JSON.stringify({
        busyBlocks,
        availableSlots: analysis.availableSlots || [],
        suggestions: analysis.topSuggestions || [],
        timezone
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-availability:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
