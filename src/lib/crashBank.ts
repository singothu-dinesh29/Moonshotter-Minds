export interface CrashQuestionItem {
  id: string;
  title: string;
  difficulty: 'MEDIUM';
  description: string;
  crashErrorType: string;
  initialCode: string;
  solutionCode: string;
  expectedPatch: string;
  points: number;
  language?: string;
  testCases: {
    input: string;
    expected_output: string;
  }[];
}

export const CRASH_QUESTIONS_2: CrashQuestionItem[] = [
  {
    id: 'q-crash-1',
    title: 'Question 1: Fix Maximum Call Stack Exceeded (Recursion Crash)',
    difficulty: 'MEDIUM',
    description: 'CRITICAL RUNTIME CRASH: The tree depth calculation function crashes with `RangeError: Maximum call stack size exceeded` on deep branches because it lacks a base null check! Patch the function to prevent the crash.',
    crashErrorType: 'RangeError: Maximum call stack size exceeded',
    initialCode: `function maxDepth(node) {
  // CRASH HAZARD: Lacks null base case check!
  // Causes RangeError: Maximum call stack size exceeded
  const leftDepth = maxDepth(node.left);
  const rightDepth = maxDepth(node.right);
  return Math.max(leftDepth, rightDepth) + 1;
}`,
    solutionCode: `function maxDepth(node) {
  if (!node) return 0;
  const leftDepth = maxDepth(node.left);
  const rightDepth = maxDepth(node.right);
  return Math.max(leftDepth, rightDepth) + 1;
}`,
    expectedPatch: `+ if (!node) return 0;`,
    points: 25,
    testCases: [
      { input: 'maxDepth({ val: 1, left: { val: 2, left: null, right: null }, right: null })', expected_output: '2' },
      { input: 'maxDepth(null)', expected_output: '0' }
    ]
  },
  {
    id: 'q-crash-2',
    title: 'Question 2: Fix Unhandled Promise Rejection (Async Crash)',
    difficulty: 'MEDIUM',
    description: 'CRITICAL RUNTIME CRASH: The data fetch pipeline crashes with `UnhandledPromiseRejection` when an API response is null. Add exception handling to return a default fallback object.',
    crashErrorType: 'UnhandledPromiseRejection: Cannot read properties of null',
    initialCode: `function fetchUserData(apiResponse) {
  // CRASH HAZARD: Throws TypeError when apiResponse is null/undefined
  const profile = apiResponse.data.profile;
  return profile.name.toUpperCase();
}`,
    solutionCode: `function fetchUserData(apiResponse) {
  if (!apiResponse || !apiResponse.data || !apiResponse.data.profile) {
    return 'ANONYMOUS';
  }
  return apiResponse.data.profile.name.toUpperCase();
}`,
    expectedPatch: `+ if (!apiResponse || !apiResponse.data || !apiResponse.data.profile) return 'ANONYMOUS';`,
    points: 25,
    testCases: [
      { input: 'fetchUserData({ data: { profile: { name: "alex" } } })', expected_output: '"ALEX"' },
      { input: 'fetchUserData(null)', expected_output: '"ANONYMOUS"' }
    ]
  }
];
