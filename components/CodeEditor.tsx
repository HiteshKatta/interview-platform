import { CODING_QUESTIONS, LANGUAGES } from "@/constants";
import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { AlertCircleIcon, BookIcon, LightbulbIcon } from "lucide-react";
import Editor from "@monaco-editor/react";

function CodeEditor() {
  const [selectedQuestion, setSelectedQuestion] = useState(CODING_QUESTIONS[0]);
  const [language, setLanguage] = useState<"javascript" | "python" | "java">(
    LANGUAGES[0].id
  );
  const [code, setCode] = useState(selectedQuestion.starterCode[language]);

  const handleQuestionChange = (questionId: string) => {
    const question = CODING_QUESTIONS.find((q) => q.id === questionId)!;
    setSelectedQuestion(question);
    setCode(question.starterCode[language]);
  };

  const handleLanguageChange = (newLanguage: "javascript" | "python" | "java") => {
    setLanguage(newLanguage);
    setCode(selectedQuestion.starterCode[newLanguage]);
  };

  return (
    // h-full fills whatever height MeetingRoom's right panel gives us
    <div className="h-full w-full overflow-hidden">
      <ResizablePanelGroup
        orientation="vertical"
        className="h-full w-full"
      >
        {/* ── TOP: Question panel ── */}
        <ResizablePanel defaultSize={40} minSize={20} maxSize={90}>
          <ScrollArea className="h-full w-full">
            <div className="p-4 space-y-3">

              {/* Header row: title + selects */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold tracking-tight text-white leading-tight">
                    {selectedQuestion.title}
                  </h2>
                  <p className="text-xs text-white/40 mt-0.5">
                    Choose your language and solve the problem
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Question selector */}
                  <Select value={selectedQuestion.id} onValueChange={handleQuestionChange}>
                    <SelectTrigger className="h-8 text-xs w-[160px] bg-[#1c2128] border-white/10 text-white">
                      <SelectValue placeholder="Select question" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1c2128] border-white/10 text-white">
                      {CODING_QUESTIONS.map((q) => (
                        <SelectItem
                          key={q.id}
                          value={q.id}
                          className="text-xs hover:bg-white/10 focus:bg-white/10"
                        >
                          {q.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Language selector */}
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="h-8 text-xs w-[130px] bg-[#1c2128] border-white/10 text-white">
                      <SelectValue>
                        <div className="flex items-center gap-1.5">
                          <img
                            src={`/${language}.png`}
                            alt={language}
                            className="w-4 h-4 object-contain"
                          />
                          <span>{LANGUAGES.find((l) => l.id === language)?.name}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-[#1c2128] border-white/10 text-white">
                      {LANGUAGES.map((lang) => (
                        <SelectItem
                          key={lang.id}
                          value={lang.id}
                          className="text-xs hover:bg-white/10 focus:bg-white/10"
                        >
                          <div className="flex items-center gap-1.5">
                            <img
                              src={`/${lang.id}.png`}
                              alt={lang.name}
                              className="w-4 h-4 object-contain"
                            />
                            {lang.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Problem Description */}
              <div className="rounded-lg border border-white/10 bg-[#161b22] overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
                  <BookIcon className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                  <span className="text-xs font-medium text-white">Problem Description</span>
                </div>
                <div className="px-3 py-2.5 text-xs leading-relaxed text-white/70">
                  <p className="whitespace-pre-line">{selectedQuestion.description}</p>
                </div>
              </div>

              {/* Examples */}
              <div className="rounded-lg border border-white/10 bg-[#161b22] overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
                  <LightbulbIcon className="h-3.5 w-3.5 text-yellow-400 flex-shrink-0" />
                  <span className="text-xs font-medium text-white">Examples</span>
                </div>
                <div className="px-3 py-2.5 space-y-3">
                  {selectedQuestion.examples.map((example, index) => (
                    <div key={index}>
                      <p className="text-xs font-medium text-white/60 mb-1">
                        Example {index + 1}:
                      </p>
                      <ScrollArea className="w-full rounded-md">
                        <pre className="bg-black/30 px-3 py-2 rounded-md text-xs font-mono text-white/80">
                          <div>Input: {example.input}</div>
                          <div>Output: {example.output}</div>
                          {example.explanation && (
                            <div className="pt-1 text-white/40">
                              Explanation: {example.explanation}
                            </div>
                          )}
                        </pre>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    </div>
                  ))}
                </div>
              </div>

              {/* Constraints */}
              {selectedQuestion.constraints && (
                <div className="rounded-lg border border-white/10 bg-[#161b22] overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
                    <AlertCircleIcon className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                    <span className="text-xs font-medium text-white">Constraints</span>
                  </div>
                  <ul className="px-3 py-2.5 space-y-1">
                    {selectedQuestion.constraints.map((constraint, index) => (
                      <li
                        key={index}
                        className="text-xs text-white/60 flex items-start gap-1.5"
                      >
                        <span className="text-white/30 mt-0.5 flex-shrink-0">•</span>
                        {constraint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <ScrollBar />
          </ScrollArea>
        </ResizablePanel>

        {/* Drag handle between panels */}
        <ResizableHandle
          withHandle
          className="bg-white/10 hover:bg-white/20 transition-colors"
        />

        {/* ── BOTTOM: Monaco code editor ── */}
        <ResizablePanel defaultSize={60} minSize={20} maxSize={80}>
          <div className="h-full w-full ">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
                wordWrap: "on",
                wrappingIndent: "indent",
                tabSize: 2,
                renderLineHighlight: "line",
              }}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default CodeEditor;