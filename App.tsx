
import React, { useState, useCallback, useRef } from 'react';
import type { Chat } from '@google/genai';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { ChatInterface } from './components/ChatInterface';
import { findAndAnalyzeHadith, createDiscussionChat } from './services/geminiService';
import type { ChatMessage } from './types';
import { BookIcon } from './components/icons/BookIcon';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const chatRef = useRef<Chat | null>(null);

  const handleFindAndAnalyze = useCallback(async () => {
    if (!topic.trim()) return;
    setIsLoadingAnalysis(true);
    setError(null);
    setAnalysisResult(null);
    setChatHistory([]);
    chatRef.current = null;
    
    try {
      const result = await findAndAnalyzeHadith(topic);
      setAnalysisResult(result);
      chatRef.current = createDiscussionChat(topic, result);
    } catch (e) {
      setError('Gagal menemukan dan menganalisis hadis untuk topik ini. Silakan coba lagi.');
      console.error(e);
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, [topic]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!chatRef.current || isLoadingQuestion) return;
    setIsLoadingQuestion(true);
    setError(null);

    const updatedHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: message }];
    setChatHistory(updatedHistory);

    try {
      const response = await chatRef.current.sendMessage({ message });
      const modelResponse = response.text;
      setChatHistory([...updatedHistory, { role: 'model', content: modelResponse }]);
    } catch (e) {
      setError('Gagal mendapatkan tanggapan. Silakan coba lagi.');
      console.error(e);
      setChatHistory(updatedHistory); // Keep user message on error
    } finally {
      setIsLoadingQuestion(false);
    }
  }, [chatHistory, isLoadingQuestion]);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFindAndAnalyze();
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-2">
            <BookIcon className="w-10 h-10 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Diskusi & Analisis Hadis
            </h1>
          </div>
          <p className="text-on-surface-muted">
            Diskusikan suatu masalah dan temukan hadis yang relevan beserta analisis Sanad-nya.
          </p>
        </header>

        <main className="flex flex-col gap-8">
          <div className="bg-surface rounded-xl shadow-lg p-6">
            <label htmlFor="topic-input" className="text-xl font-semibold text-white mb-4 block">
              1. Masukkan Topik atau Pertanyaan
            </label>
            <textarea
              id="topic-input"
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="cth., 'Apa pandangan Islam tentang sedekah?' atau 'Hukum menjamak shalat saat bepergian.'"
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
            <button
              onClick={handleFindAndAnalyze}
              disabled={!topic.trim() || isLoadingAnalysis}
              className="mt-4 w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              {isLoadingAnalysis ? 'Mencari & Menganalisis...' : '2. Cari & Analisis Hadis'}
            </button>
          </div>
          
          <AnalysisDisplay analysis={analysisResult} isLoading={isLoadingAnalysis} />

          <div>
            <ChatInterface
              chatHistory={chatHistory}
              onSendMessage={handleSendMessage}
              isLoading={isLoadingQuestion}
              isDisabled={!analysisResult || isLoadingAnalysis}
            />
             {error && <div className="mt-4 text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</div>}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
