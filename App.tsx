import React, { useState, useCallback, useRef } from 'react';
import type { Chat } from '@google/genai';
import { ChatInterface } from './components/ChatInterface';
import { findAndAnalyzeHadith, createDiscussionChat } from './services/geminiService';
import type { ChatMessage } from './types';
import { BookIcon } from './components/icons/BookIcon';

const App: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const chatRef = useRef<Chat | null>(null);

  const handleSendMessage = useCallback(async (message: string) => {
    setIsLoading(true);
    setError(null);
    const updatedHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: message }];
    setChatHistory(updatedHistory);

    try {
      let modelResponse: string;
      // Jika ini adalah pesan pertama, lakukan analisis hadis
      if (chatHistory.length === 0) {
        const analysisResult = await findAndAnalyzeHadith(message);
        modelResponse = analysisResult;
        // Buat sesi obrolan baru untuk pertanyaan lanjutan
        chatRef.current = createDiscussionChat(message, analysisResult);
      } else if (chatRef.current) {
        // Jika tidak, lanjutkan obrolan yang sudah ada
        const response = await chatRef.current.sendMessage({ message });
        modelResponse = response.text;
      } else {
        throw new Error("Sesi obrolan tidak diinisialisasi.");
      }
      setChatHistory([...updatedHistory, { role: 'model', content: modelResponse }]);
    } catch (e) {
      const errorMessage = 'Gagal mendapatkan tanggapan. Silakan coba lagi.';
      setError(errorMessage);
      console.error(e);
      // Tambahkan pesan error sebagai respons model untuk ditampilkan di UI
      setChatHistory([...updatedHistory, { role: 'model', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  }, [chatHistory]);

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans flex flex-col p-2 sm:p-4">
      <div className="max-w-4xl w-full mx-auto flex flex-col flex-grow">
        <header className="my-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-2">
            <BookIcon className="w-10 h-10 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Diskusi & Analisis Hadis
            </h1>
          </div>
          <p className="text-on-surface-muted">
            Mulai percakapan dengan mengajukan pertanyaan tentang suatu topik untuk menemukan hadis yang relevan.
          </p>
        </header>

        <main className="flex-grow flex flex-col">
           <ChatInterface
              chatHistory={chatHistory}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
             {error && !isLoading && <div className="mt-2 text-center text-sm text-red-400">{error}</div>}
        </main>
      </div>
    </div>
  );
};

export default App;
