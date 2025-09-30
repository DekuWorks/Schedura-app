const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TaskExtraction {
  title: string;
  duration: number;
  priority: "low" | "medium" | "high";
  category?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, fileType } = await req.json();
    console.log('Parsing tasks from content, type:', fileType);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build the prompt
    const systemPrompt = `You are a task extraction assistant. Extract actionable tasks from the provided content.
For each task, determine:
- title: Clear, concise task description
- duration: Estimated time in minutes (default 30 if not specified)
- priority: "low", "medium", or "high"
- category: Optional category (work, personal, etc.)

Look for time indicators like "30m", "1h", "2 hours", etc. and parse them correctly.
Extract ALL tasks from the content, even if they're informal or incomplete.`;

    const userPrompt = `Extract tasks from this content:\n\n${content}`;

    // Call Lovable AI with tool calling for structured output
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_tasks',
              description: 'Extract tasks from content',
              parameters: {
                type: 'object',
                properties: {
                  tasks: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        duration: { type: 'number' },
                        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                        category: { type: 'string' }
                      },
                      required: ['title', 'duration', 'priority'],
                      additionalProperties: false
                    }
                  }
                },
                required: ['tasks'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_tasks' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    console.log('AI response:', JSON.stringify(data, null, 2));

    // Extract tasks from tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tasks extracted from content');
    }

    const parsedArgs = JSON.parse(toolCall.function.arguments);
    const tasks = parsedArgs.tasks || [];

    console.log(`Extracted ${tasks.length} tasks`);

    return new Response(
      JSON.stringify({ tasks }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in parse-tasks function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        tasks: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
