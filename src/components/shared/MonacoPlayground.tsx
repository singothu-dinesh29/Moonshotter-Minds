'use client';

import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Send, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Sun, 
  Moon, 
  Save, 
  Terminal, 
  FileCode, 
  Code2, 
  Sparkles,
  Layers
} from 'lucide-react';

export type SupportedLanguage = 'c' | 'cpp' | 'java' | 'python' | 'javascript';

const STARTER_TEMPLATES: Record<SupportedLanguage, string> = {
  c: `#include <stdio.h>\n\nint main() {\n    // Symphosium C Execution Sandbox\n    printf("Hello from Symphosium C Engine!\\n");\n    return 0;\n}`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Symphosium C++ Execution Sandbox\n    cout << "Hello from Symphosium C++ Engine!" << endl;\n    return 0;\n}`,
  java: `public class Solution {\n    public static void main(String[] args) {\n        // Symphosium Java Execution Sandbox\n        System.out.println("Hello from Symphosium Java Engine!");\n    }\n}`,
  python: `def main():\n    # Symphosium Python 3 Execution Sandbox\n    print("Hello from Symphosium Python 3 Engine!")\n\nif __name__ == "__main__":\n    main()`,
  javascript: `function solution(input) {\n  // Symphosium JavaScript Engine\n  console.log("Processing input:", input);\n  return "Execution Complete";\n}\n\nsolution("Test Payload");`
};

interface MonacoPlaygroundProps {
  language?: string;
  initialCode?: string;
  onChange?: (val: string) => void;
  timeLimitSec?: number;
  onRunComplete?: (result: any) => void;
}

export default function MonacoPlayground({
  language: initialLanguage,
  initialCode,
  onChange,
  timeLimitSec,
  onRunComplete
}: MonacoPlaygroundProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Language & Theme State
  const parseLang = (l?: string): SupportedLanguage => {
    if (!l) return 'javascript';
    const norm = l.trim().toLowerCase();
    if (norm === 'c') return 'c';
    if (norm === 'c++' || norm === 'cpp') return 'cpp';
    if (norm === 'java') return 'java';
    if (norm === 'python' || norm === 'py') return 'python';
    if (norm === 'javascript' || norm === 'js') return 'javascript';
    return 'javascript';
  };

  const [language, setLanguage] = useState<SupportedLanguage>(parseLang(initialLanguage));
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [code, setCode] = useState<string>(initialCode || STARTER_TEMPLATES[parseLang(initialLanguage)]);

  useEffect(() => {
    if (initialLanguage) {
      const parsed = parseLang(initialLanguage);
      setLanguage(parsed);
      if (initialCode) setCode(initialCode);
    }
  }, [initialLanguage, initialCode]);
  
  // Custom Stdin Input & Stdout Output Panels
  const [customInput, setCustomInput] = useState<string>('Test Input Data 100');
  const [outputConsole, setOutputConsole] = useState<string>('Ready for code execution...\nClick "Run Code" to compile and view stdout metrics.');
  const [executionStats, setExecutionStats] = useState<{ timeMs: number; memoryMb: number; status: string } | null>(null);

  // Settings Toggles
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('Saved');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  // Switch Language Template
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    setCode(STARTER_TEMPLATES[newLang]);
    setOutputConsole(`Switched language to ${newLang.toUpperCase()}.\nEditor template loaded.`);
  };

  // Auto Save Effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`monaco_playground_${language}`, code);
        setAutoSaveStatus(`Auto-saved ${new Date().toLocaleTimeString()}`);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [code, language]);

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Run Code Execution Engine
  const handleRunCode = () => {
    setIsExecuting(true);
    setOutputConsole(`Compiling ${language.toUpperCase()} source...\nExecuting against Sandbox cgroups limits (Memory: 256MB, CPU: 0.5 Cores)...`);
    
    const startTime = performance.now();

    setTimeout(() => {
      const execTime = Math.round(performance.now() - startTime + Math.random() * 40);
      
      let mockStdout = `[STDOUT]\nHello from Symphosium ${language.toUpperCase()} Engine!\n`;
      if (customInput) {
        mockStdout += `[STDIN RECEIVED]: ${customInput}\n`;
      }
      mockStdout += `\n[PROCESS EXIT CODE 0]: Success`;

      setOutputConsole(mockStdout);
      setExecutionStats({
        timeMs: execTime,
        memoryMb: Math.round(14 + Math.random() * 8),
        status: 'SUCCESS (0)'
      });
      setIsExecuting(false);
    }, 600);
  };

  const handleReset = () => {
    setCode(STARTER_TEMPLATES[language]);
    setOutputConsole('Code reset to initial starter template.');
    setExecutionStats(null);
  };

  return (
    <div ref={containerRef} className={`space-y-4 max-w-7xl mx-auto p-4 md:p-6 ${isFullscreen ? 'bg-slate-950 min-h-screen p-6 overflow-y-auto' : ''}`}>
      
      {/* 1. EDITOR TOP TOOLBAR & CONTROLS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        
        {/* Left: Language Selector & Theme Toggle */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-indigo-400" />
            <span className="text-xs font-bold text-white hidden sm:inline">Language:</span>
          </div>

          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-indigo-300 font-mono font-bold focus:outline-none focus:border-indigo-500"
          >
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="python">Python 3.12</option>
            <option value="java">Java 21 OpenJDK</option>
            <option value="cpp">C++ 20 (GCC 13)</option>
            <option value="c">C 17 (GCC 13)</option>
          </select>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono hover:text-white transition-all"
          >
            {theme === 'vs-dark' ? <Moon className="h-3.5 w-3.5 text-purple-400" /> : <Sun className="h-3.5 w-3.5 text-amber-400" />}
            {theme === 'vs-dark' ? 'Dark Theme' : 'Light Theme'}
          </button>

          {/* Line Numbers Toggle */}
          <button
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
              showLineNumbers ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            Lines: {showLineNumbers ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Right: Fullscreen, Reset & Submit */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <span className="text-[11px] font-mono text-slate-400 hidden lg:inline flex items-center gap-1">
            <Save className="h-3 w-3 text-emerald-400" /> {autoSaveStatus}
          </span>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all"
            title="Reset Starter Template"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            onClick={handleRunCode}
            disabled={isExecuting}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            <Play className="h-4 w-4 fill-current" />
            {isExecuting ? 'Compiling...' : 'Run Code'}
          </button>
        </div>

      </div>

      {/* 2. RESIZABLE SPLIT PANELS: MONACO EDITOR + INPUT/OUTPUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Monaco Code Editor */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[580px]">
          <div className="bg-slate-950 border-b border-slate-800 px-5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-mono text-slate-300">main.{language === 'cpp' ? 'cpp' : language === 'python' ? 'py' : language === 'java' ? 'java' : language === 'c' ? 'c' : 'js'}</span>
            </div>
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              MONACO ENGINE
            </span>
          </div>

          <div className="flex-1 relative">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              language={language}
              theme={theme}
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                fontSize: 13,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                lineNumbers: showLineNumbers ? 'on' : 'off',
                tabSize: 2,
                wordWrap: 'on',
                automaticLayout: true
              }}
            />
          </div>
        </div>

        {/* Right 1 Col: Input Panel & Output Console */}
        <div className="space-y-6 flex flex-col h-[580px]">
          
          {/* Custom Input Panel (stdin) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 flex flex-col h-[200px]">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-cyan-400" /> Input Panel (stdin)
            </h4>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Enter custom stdin test parameters..."
              className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Output Panel (stdout & metrics) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Output Terminal (stdout)
              </h4>

              {executionStats && (
                <div className="flex items-center gap-3 text-[11px] font-mono text-emerald-400">
                  <span>{executionStats.timeMs}ms</span>
                  <span>•</span>
                  <span>{executionStats.memoryMb}MB</span>
                </div>
              )}
            </div>

            <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {outputConsole}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
