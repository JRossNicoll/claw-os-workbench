const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, instance_url, api_token } = await req.json();

    if (!instance_url || !api_token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing instance_url or api_token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize base URL
    const baseUrl = instance_url.replace(/\/+$/, '');

    if (action === 'validate') {
      // Try to reach the gateway status endpoint
      // OpenClaw Gateway exposes status at the root or /tools/invoke with a simple call
      const statusUrl = `${baseUrl}/tools/invoke`;
      
      const statusRes = await fetch(statusUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${api_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool: 'sessions_list',
          action: 'json',
          args: {},
          sessionKey: 'main',
          dryRun: false,
        }),
      });

      if (!statusRes.ok) {
        const errorText = await statusRes.text();
        
        // If 401/403, the token is wrong
        if (statusRes.status === 401 || statusRes.status === 403) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid API token. Check your token and try again.' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ success: false, error: `Gateway returned ${statusRes.status}: ${errorText}` }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const statusData = await statusRes.json();

      return new Response(
        JSON.stringify({ 
          success: true, 
          instance: {
            url: baseUrl,
            sessions: statusData,
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'invoke_tool') {
      // Generic tool invocation proxy
      const { tool, tool_action, args, sessionKey, dryRun } = await req.json();

      const invokeRes = await fetch(`${baseUrl}/tools/invoke`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${api_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool: tool || 'sessions_list',
          action: tool_action || 'json',
          args: args || {},
          sessionKey: sessionKey || 'main',
          dryRun: dryRun ?? false,
        }),
      });

      if (!invokeRes.ok) {
        const errText = await invokeRes.text();
        return new Response(
          JSON.stringify({ success: false, error: `Tool invocation failed [${invokeRes.status}]: ${errText}` }),
          { status: invokeRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const invokeData = await invokeRes.json();
      return new Response(
        JSON.stringify({ success: true, data: invokeData }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'chat') {
      // OpenAI-compatible chat completions proxy
      const { messages, model, max_tokens } = await req.json();

      const chatRes = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${api_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages || [],
          model: model || 'default',
          max_tokens: max_tokens || 1024,
        }),
      });

      if (!chatRes.ok) {
        const errText = await chatRes.text();
        return new Response(
          JSON.stringify({ success: false, error: `Chat completions failed [${chatRes.status}]: ${errText}` }),
          { status: chatRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const chatData = await chatRes.json();
      return new Response(
        JSON.stringify({ success: true, data: chatData }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: `Unknown action: ${action}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    
    // Network errors (instance unreachable)
    if (message.includes('dns') || message.includes('connect') || message.includes('ECONNREFUSED') || message.includes('TypeError')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Could not reach OpenClaw instance. Check the URL and make sure the gateway is running.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
