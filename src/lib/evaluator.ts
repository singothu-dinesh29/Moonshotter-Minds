import { TestCase } from "@/types/database";

export interface EvaluationResult {
  status: 'PASSED' | 'FAILED' | 'COMPILE_ERROR' | 'TIME_LIMIT_EXCEEDED';
  score: number;
  execution_time_ms: number;
  test_results: {
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
  }[];
  error_message?: string;
}

export function evaluateCodeSubmission(
  code: string,
  testCases: TestCase[],
  maxPoints: number
): EvaluationResult {
  const startTime = performance.now();
  const results: EvaluationResult['test_results'] = [];
  let passedCount = 0;

  try {
    // Basic syntax & execution test using Function constructor sandbox
    // (Note: Production uses isolated Docker / Piston runner containers)
    const runner = new Function(`
      ${code}
      return function(inputExpr) {
        return eval(inputExpr);
      };
    `)();

    for (const testCase of testCases) {
      try {
        const actualResult = runner(testCase.input);
        const actualStr = JSON.stringify(actualResult);
        const expectedStr = testCase.expected_output;
        
        // Normalize comparison
        const isPassed = actualStr === expectedStr || String(actualResult) === String(expectedStr);
        if (isPassed) passedCount++;

        results.push({
          input: testCase.input,
          expected: testCase.expected_output,
          actual: actualStr !== undefined ? actualStr : String(actualResult),
          passed: isPassed
        });
      } catch (err: any) {
        results.push({
          input: testCase.input,
          expected: testCase.expected_output,
          actual: `Runtime Error: ${err.message}`,
          passed: false
        });
      }
    }

    const executionTimeMs = Math.round(performance.now() - startTime);
    const score = Math.round((passedCount / testCases.length) * maxPoints);
    const allPassed = passedCount === testCases.length;

    return {
      status: allPassed ? 'PASSED' : 'FAILED',
      score,
      execution_time_ms: executionTimeMs,
      test_results: results
    };

  } catch (compileErr: any) {
    const executionTimeMs = Math.round(performance.now() - startTime);
    return {
      status: 'COMPILE_ERROR',
      score: 0,
      execution_time_ms: executionTimeMs,
      test_results: [],
      error_message: compileErr.message || 'Compilation failed due to syntax error.'
    };
  }
}
