import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { SendIcon } from './icons/SendIcon';
import { Loader } from './Loader';

interface ChatInterfaceProps {
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isDisabled: boolean;
}

// A more robust markdown renderer that handles bolding from both markdown (**) and HTML (<strong>)
const renderMarkdown = (text: string): React.ReactNode => {
    const renderInline = (line: string) => {
        // Normalize <strong> tags to markdown's ** for consistent parsing
        const normalizedLine = line.replace(/<strong>/g, '**').replace(/<\/strong>/g, '**');
        
        const parts = normalizedLine.split(/(\*\*.*?\*\*)/g);
        
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];

    const flushList = () => {
        if (currentList.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-2 pl-4">
                    {currentList.map((item, index) => <li key={index}>{renderInline(item)}</li>)}
                </ul>
            );
            currentList = [];
        }
    };

    text.split('\n').forEach((line) => {
        if (line.startsWith('### ')) {
            flushList();
            elements.push(<h3 key={elements.length} className="text-md font-semibold my-2">{renderInline(line.substring(4))}</h3>);
        } else if (line.startsWith('## ')) {
            flushList();
            elements.push(<h2 key={elements.length} className="text-lg font-semibold my-2">{renderInline(line.substring(3))}</h2>);
        } else if (line.startsWith('# ')) {
            flushList();
            elements.push(<h1 key={elements.length} className="text-xl font-bold my-2">{renderInline(line.substring(2))}</h1>);
        } else if (line.startsWith('* ') || line.startsWith('- ')) {
            currentList.push(line.substring(2));
        } else if (line.trim() === '') {
             if (currentList.length > 0) {
                flushList();
             }
        } else {
            flushList();
            elements.push(<p key={elements.length} className="my-1">{renderInline(line)}</p>);
        }
    });

    flushList(); // Make sure to flush any remaining list items at the end
    
    return <div className="space-y-2">{elements}</div>;
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatHistory, onSendMessage, isLoading, isDisabled }) => {
  const [input, setInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && !isDisabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="bg-surface rounded-xl shadow-lg flex flex-col h-[calc(100vh-12rem)] max-h-[800px] lg:h-full">
      <div className="p-4 border-b border-slate-600 flex-shrink-0">
        <h2 className="text-xl font-semibold text-white text-center">4. Ajukan Pertanyaan Lanjutan</h2>
      </div>

      <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto space-y-4">
        {isDisabled ? (
           <div className="flex items-center justify-center h-full">
            <p className="text-on-surface-muted text-center">Silakan analisis hadis terlebih dahulu untuk mengaktifkan obrolan.</p>
          </div>
        ) : chatHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-on-surface-muted text-center">Ajukan pertanyaan tentang analisis, perawi, atau terminologi.</p>
          </div>
        ) : (
          chatHistory.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md lg:max-w-lg p-3 rounded-xl ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-slate-600 text-on-surface'}`}>
                {msg.role === 'model' ? renderMarkdown(msg.content) : msg.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="max-w-md lg:max-w-lg p-3 rounded-xl bg-slate-600 text-on-surface">
                    <Loader/>
                 </div>
            </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-600 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isDisabled ? "Analisis hadis untuk memulai" : "Ketik pertanyaan Anda..."}
            disabled={isDisabled || isLoading}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isDisabled || isLoading || !input.trim()}
            className="bg-primary text-white p-2.5 rounded-full hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};