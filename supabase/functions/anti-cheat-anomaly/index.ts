import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { registrationId, incidentType, metadata } = await req.json();

    // Calculate heuristic risk score
    let riskFactor = 10;
    if (incidentType === "TAB_SWITCH") riskFactor = 30;
    if (incidentType === "COPY_PASTE") riskFactor = 50;
    if (incidentType === "FULLSCREEN_EXIT") riskFactor = 70;

    return new Response(
      JSON.stringify({
        logged: true,
        riskFactor,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
