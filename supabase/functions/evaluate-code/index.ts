import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface EvaluationRequest {
  code: string;
  language: string;
  testCases: { input: string; expected_output: string }[];
  maxPoints: number;
}

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
    const { code, language, testCases, maxPoints }: EvaluationRequest = await req.json();

    if (!code || !testCases) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const startTime = performance.now();
    let passedCount = 0;
    const results = [];

    // Evaluate tests in Deno sandbox
    for (const tc of testCases) {
      try {
        const evalFn = new Function("code", `return (function() { ${code}; return eval('${tc.input}'); })()`);
        const actual = evalFn(code);
        const actualStr = JSON.stringify(actual) || String(actual);
        const isPassed = actualStr === tc.expected_output || String(actual) === String(tc.expected_output);
        
        if (isPassed) passedCount++;

        results.push({
          input: tc.input,
          expected: tc.expected_output,
          actual: actualStr,
          passed: isPassed,
        });
      } catch (err: any) {
        results.push({
          input: tc.input,
          expected: tc.expected_output,
          actual: `Runtime Error: ${err.message}`,
          passed: false,
        });
      }
    }

    const executionTimeMs = Math.round(performance.now() - startTime);
    const score = Math.round((passedCount / testCases.length) * maxPoints);
    const allPassed = passedCount === testCases.length;

    return new Response(
      JSON.stringify({
        status: allPassed ? "PASSED" : "FAILED",
        score,
        execution_time_ms: executionTimeMs,
        test_results: results,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
