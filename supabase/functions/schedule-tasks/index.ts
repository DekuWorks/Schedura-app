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

    const { tasks, startDate, endDate, timezone = 'UTC', workingHours } = await req.json();

    console.log('Scheduling tasks for user:', user.id, {
      taskCount: tasks?.length,
      startDate,
      endDate,
      timezone
    });

    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No tasks provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch existing calendar events
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

    // Fetch already scheduled tasks
    const { data: scheduledTasks, error: tasksError } = await supabase
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

    console.log(`Found ${events?.length || 0} events and ${scheduledTasks?.length || 0} scheduled tasks`);

    // Prepare busy blocks for AI
    const busyBlocks = [
      ...(events || []).map(e => ({
        type: 'event',
        title: e.title,
        start: e.start_time,
        end: e.end_time,
        allDay: e.is_all_day
      })),
      ...(scheduledTasks || []).map(t => ({
        type: 'scheduled_task',
        title: t.title,
        start: t.start_time,
        end: t.end_time || new Date(new Date(t.start_time).getTime() + (t.duration_minutes || 30) * 60000).toISOString()
      }))
    ].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    // Call Lovable AI to schedule tasks
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an expert scheduling assistant. Schedule tasks into the user's calendar by finding optimal time slots.

Consider:
- Task priority (high priority tasks get better time slots)
- Task duration and estimated time needed
- Avoid scheduling during existing events or busy blocks
- Prefer working hours: ${workingHours?.start || '9:00'} to ${workingHours?.end || '17:00'}
- Leave buffer time between tasks (at least 10 minutes)
- Group similar tasks together when possible
- Schedule high-priority tasks during peak productivity hours (morning/early afternoon)
- User's timezone: ${timezone}

Rules:
- Never overlap with existing busy blocks
- Respect task duration requirements
- Schedule within the date range provided
- If a task can't fit, explain why in the response`;

    const userPrompt = `Schedule these tasks from ${startDate} to ${endDate} (timezone: ${timezone}):

Tasks to schedule:
${JSON.stringify(tasks.map((t: any) => ({
  id: t.id,
  title: t.title,
  duration: t.duration_minutes || t.duration || 30,
  priority: t.priority || 'medium',
  description: t.description
})), null, 2)}

Current busy blocks (DO NOT schedule during these times):
${JSON.stringify(busyBlocks, null, 2)}

Find optimal time slots for each task and return scheduled times.`;

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
            name: 'schedule_tasks',
            description: 'Return scheduled time slots for tasks',
            parameters: {
              type: 'object',
              properties: {
                scheduledTasks: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      taskId: { type: 'string', description: 'Original task ID' },
                      title: { type: 'string' },
                      startTime: { type: 'string', description: 'ISO timestamp' },
                      endTime: { type: 'string', description: 'ISO timestamp' },
                      reason: { type: 'string', description: 'Why this time was chosen' },
                      confidence: { type: 'number', description: 'Confidence score 1-10' }
                    },
                    required: ['taskId', 'title', 'startTime', 'endTime', 'reason', 'confidence']
                  }
                },
                unscheduledTasks: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      taskId: { type: 'string' },
                      title: { type: 'string' },
                      reason: { type: 'string', description: 'Why it could not be scheduled' }
                    },
                    required: ['taskId', 'title', 'reason']
                  }
                }
              },
              required: ['scheduledTasks', 'unscheduledTasks']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'schedule_tasks' } }
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
      throw new Error('AI scheduling failed');
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const schedule = JSON.parse(toolCall.function.arguments);

    console.log('AI scheduling complete:', {
      scheduled: schedule.scheduledTasks?.length,
      unscheduled: schedule.unscheduledTasks?.length
    });

    return new Response(
      JSON.stringify({
        scheduledTasks: schedule.scheduledTasks || [],
        unscheduledTasks: schedule.unscheduledTasks || [],
        timezone
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in schedule-tasks:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
