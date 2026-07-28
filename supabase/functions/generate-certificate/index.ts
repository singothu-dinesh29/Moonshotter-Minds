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
    const { registrationId, studentName, collegeName, score, rank } = await req.json();

    // Generate SHA-256 Hash
    const encoder = new TextEncoder();
    const data = encoder.encode(`${registrationId}:${studentName}:${Date.now()}`);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const verifyHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").substring(0, 32);

    const certificateNumber = `CERT-SYM-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    return new Response(
      JSON.stringify({
        success: true,
        certificateNumber,
        verifyHash,
        verificationUrl: `https://symphosium.edu/verify/${verifyHash}`,
        issuedAt: new Date().toISOString(),
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
