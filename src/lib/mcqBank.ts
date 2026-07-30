export interface MCQItem {
  id: string;
  questionNumber: number;
  title: string;
  content: string;
  points: number;
  negativePoints: number;
  options: {
    id: string;
    text: string;
    isCorrect?: boolean;
  }[];
}

export const QUESTION_BANK_15: MCQItem[] = [
  {
    id: 'q-mcq-1',
    questionNumber: 1,
    title: 'PostgreSQL Indexing & Complexity',
    content: 'What is the worst-case time complexity of B-tree index lookup in PostgreSQL for N records?',
    points: 10,
    negativePoints: 2,
    options: [
      { id: 'opt-1a', text: 'O(1) Constant time' },
      { id: 'opt-1b', text: 'O(log N) Logarithmic time' },
      { id: 'opt-1c', text: 'O(N) Linear time' },
      { id: 'opt-1d', text: 'O(N log N) Linearithmic time' }
    ]
  },
  {
    id: 'q-mcq-2',
    questionNumber: 2,
    title: 'Next.js React Server Components',
    content: 'Where do Next.js App Router React Server Components (RSC) execute by default?',
    points: 10,
    negativePoints: 2,
    options: [
      { id: 'opt-2a', text: 'Strictly inside the Web Browser DOM' },
      { id: 'opt-2b', text: 'Exclusively on the Server/Edge Environment' },
      { id: 'opt-2c', text: 'Inside Service Workers only' },
      { id: 'opt-2d', text: 'On Client GPU Accelerators' }
    ]
  },
  {
    id: 'q-mcq-3',
    questionNumber: 3,
    title: 'HTTP/2 Protocol Multiplexing',
    content: 'Which feature of HTTP/2 allows multiple request/response messages to be sent concurrently over a single TCP connection?',
    points: 10,
    negativePoints: 2,
    options: [
      { id: 'opt-3a', text: 'Binary Framing & Request Multiplexing' },
      { id: 'opt-3b', text: 'Gzip Compression Chunking' },
      { id: 'opt-3c', text: 'DNS Prefetching Streams' },
      { id: 'opt-3d', text: 'TLS Session Resumption' }
    ]
  },
  {
    id: 'q-mcq-4',
    questionNumber: 4,
    title: 'Supabase PostgreSQL Row Level Security (RLS)',
    content: 'Which PostgreSQL clause enforces that users can only query rows matching their auth.uid() context?',
    points: 10,
    negativePoints: 2,
    options: [
      { id: 'opt-4a', text: 'CREATE POLICY ... USING (auth.uid() = user_id)' },
      { id: 'opt-4b', text: 'GRANT SELECT ON ALL TABLES TO PUBLIC' },
      { id: 'opt-4c', text: 'ALTER TABLE SET LOGGED' },
      { id: 'opt-4d', text: 'CREATE INDEX USING GIN (auth.uid())' }
    ]
  },
  {
    id: 'q-mcq-5',
    questionNumber: 5,
    title: 'Operating Systems - Deadlock Conditions',
    content: 'Which of the following is NOT one of Coffman\'s four necessary conditions for a system deadlock?',
    points: 10,
    negativePoints: 2,
    options: [
      { id: 'opt-5a', text: 'Mutual Exclusion' },
      { id: 'opt-5b', text: 'Preemption Allowed' },
      { id: 'opt-5c', text: 'Hold and Wait' },
      { id: 'opt-5d', text: 'Circular Wait' }
    ]
  },
  {
    id: 'q-mcq-6',
    questionNumber: 6,
    title: 'Data Structures - Hash Table Collisions',
    content: 'What is the average time complexity of insertion into a Hash Table with open addressing assuming uniform hashing?',
    points: 10,
    negativePoints: 2,
    options: [
      { id: 'opt-6a', text: 'O(1)' },
      { id: 'opt-6b', text: 'O(log N)' },
      { id: 'opt-6c', text: 'O(N)' },
      { id: 'opt-6d', text: 'O(N^2)' }
    ]
  },
  {
    id: 'q-mcq-7',
    questionNumber: 7,
    title: 'Web Security - CORS Preflight',
    content: 'Which HTTP method triggers an automatic CORS preflight request by the browser?',
    points: 10,
    negativePoints: 2,
    options: [
      { id: 'opt-7a', text: 'OPTIONS' },
      { id: 'opt-7b', text: 'GET' },
      { id: 'opt-7c', text: 'HEAD' },
      { id: 'opt-7d', text: 'POST with text/plain' }
    ]
  },
  {
    id: 'q-mcq-8',
    questionNumber: 8,
    title: 'Algorithms - QuickSort Space Complexity',
    content: 'What is the auxiliary space complexity of standard in-place QuickSort algorithm?',
    points: 10,
    negativePoints: 2,
    options: [
      { id: 'opt-8a', text: 'O(log N) due to recursive call stack' },
      { id: 'opt-8b', text: 'O(1) completely constant' },
      { id: 'opt-8c', text: 'O(N) linear buffer' },
      { id: 'opt-8d', text: 'O(N log N)' }
    ]
  },
  {
    id: 'q-mcq-9',
    questionNumber: 9,
    title: 'System Design - CAP Theorem',
    content: 'In CAP Theorem, what does a distributed system guarantee if it prioritizes Availability and Partition Tolerance (AP)?',
    points: 10,
    negativePoints: 2,
    options: [
      { id: 'opt-9a', text: 'Eventual Consistency across nodes' },
      { id: 'opt-9b', text: 'Strict Serializable Consistency' },
      { id: 'opt-9c', text: 'Zero Data Replication' },
      { id: 'opt-9d', text: 'ACID Transactions across regions' }
    ]
  },
  {
    id: 'q-mcq-10',
    questionNumber: 10,
    title: 'PostgreSQL - ACID Isolation Levels',
    content: 'Which PostgreSQL transaction isolation level prevents Phantom Reads?',
    points: 10,
    negativePoints: 2,
    options: [
      { id: 'opt-10a', text: 'Serializable (or Repeatable Read in Postgres)' },
      { id: 'opt-10b', text: 'Read Uncommitted' },
      { id: 'opt-10c', text: 'Read Committed' },
      { id: 'opt-10d', text: 'None of the above' }
    ]
  },
  {
    id: 'q-mcq-11',
    questionNumber: 11,
    title: 'Networking - TCP 3-Way Handshake',
    content: 'What is the correct sequence of packets sent during a TCP 3-way handshake?',
    points: 10,
    negativePoints: 2,
    options: [
      { id: 'opt-11a', text: 'SYN -> SYN-ACK -> ACK' },
      { id: 'opt-11b', text: 'SYN -> ACK -> FIN' },
      { id: 'opt-11c', text: 'ACK -> SYN -> RST' },
      { id: 'opt-11d', text: 'RST -> SYN-ACK -> ACK' }
    ]
  },
  {
    id: 'q-mcq-12',
    questionNumber: 12,
    title: 'JavaScript Event Loop & Microtasks',
    content: 'Which queue processes Promise callbacks (.then()) in the Node.js / V8 Event Loop?',
    points: 10,
    negativePoints: 2,
    options: [
      { id: 'opt-12a', text: 'Microtask Queue' },
      { id: 'opt-12b', text: 'Macrotask Task Queue' },
      { id: 'opt-12c', text: 'Render Queue' },
      { id: 'opt-12d', text: 'I/O Polling Phase' }
    ]
  },
  {
    id: 'q-mcq-13',
    questionNumber: 13,
    title: 'Redis In-Memory Data Structures',
    content: 'Which Redis data structure is optimal for tracking unique real-time leaderboard scores with time complexity O(log N)?',
    points: 10,
    negativePoints: 2,
    options: [
      { id: 'opt-13a', text: 'Sorted Sets (ZSET)' },
      { id: 'opt-13b', text: 'Hashes (HSET)' },
      { id: 'opt-13c', text: 'Lists (LPUSH)' },
      { id: 'opt-13d', text: 'Bitmaps' }
    ]
  },
  {
    id: 'q-mcq-14',
    questionNumber: 14,
    title: 'Docker Resource Isolation',
    content: 'Which Linux kernel mechanism does Docker rely on to restrict CPU and memory allocation per container?',
    points: 10,
    negativePoints: 2,
    options: [
      { id: 'opt-14a', text: 'cgroups (Control Groups)' },
      { id: 'opt-14b', text: 'Namespaces' },
      { id: 'opt-14c', text: 'iptables' },
      { id: 'opt-14d', text: 'chroot' }
    ]
  },
  {
    id: 'q-mcq-15',
    questionNumber: 15,
    title: 'Algorithms - Dynamic Programming',
    content: 'What technique in Dynamic Programming stores results of expensive function calls to avoid recalculation?',
    points: 10,
    negativePoints: 2,
    options: [
      { id: 'opt-15a', text: 'Memoization / Tabulation' },
      { id: 'opt-15b', text: 'Divide and Conquer' },
      { id: 'opt-15c', text: 'Greedy Choice' },
      { id: 'opt-15d', text: 'Backtracking' }
    ]
  }
];

// Helper function to randomize order of options & questions
export function getRandomizedQuestions(): MCQItem[] {
  // Shuffle array using Fisher-Yates
  const shuffled = [...QUESTION_BANK_15].sort(() => Math.random() - 0.5);
  return shuffled.map((q, idx) => ({
    ...q,
    questionNumber: idx + 1,
    options: [...q.options].sort(() => Math.random() - 0.5)
  }));
}
