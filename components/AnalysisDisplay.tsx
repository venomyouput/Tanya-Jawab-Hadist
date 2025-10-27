
import React, { useMemo } from 'react';
import { Loader } from './Loader';

interface AnalysisDisplayProps {
  analysis: string | null;
  isLoading: boolean;
}

const renderMarkdown = (text: string): React.ReactNode => {
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];

    const flushList = () => {
        if (currentList.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-2 my-4 pl-4 text-on-surface-muted">
                    {currentList.map((item, index) => <li key={index}>{renderInline(item)}</li>)}
                </ul>
            );
            currentList = [];
        }
    };
    
    const renderInline = (line: string) => {
        // Order matters: process bolding first, then other patterns.
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="text-white">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    text.split('\n').forEach((line, index) => {
        if (line.startsWith('### ')) {
            flushList();
            elements.push(<h3 key={index} className="text-lg font-semibold text-primary mt-6 mb-2">{renderInline(line.substring(4))}</h3>);
        } else if (line.startsWith('## ')) {
            flushList();
            elements.push(<h2 key={index} className="text-xl font-bold text-white mt-6 mb-3 border-b-2 border-primary pb-2">{renderInline(line.substring(3))}</h2>);
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
            currentList.push(line.substring(2));
        } else if (line.trim() === '') {
            flushList();
        } else {
            flushList();
            elements.push(<p key={index} className="my-4 text-on-surface-muted leading-relaxed">{renderInline(line)}</p>);
        }
    });

    flushList();
    return elements;
};


export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, isLoading }) => {
  const renderedContent = useMemo(() => {
    if (analysis) return renderMarkdown(analysis);
    return null;
  }, [analysis]);

  return (
    <div className="bg-surface rounded-xl shadow-lg p-6 min-h-[20rem] flex flex-col">
      <h2 className="text-xl font-semibold text-white mb-4 flex-shrink-0">3. Hasil Analisis AI</h2>
      <div className="flex-grow overflow-y-auto">
        {isLoading && <div className="flex items-center justify-center h-full"><Loader /></div>}
        {!isLoading && !analysis && (
          <div className="flex items-center justify-center h-full">
            <p className="text-on-surface-muted text-center">Masukkan topik di atas untuk menemukan hadis yang relevan dan lihat analisis AI di sini.</p>
          </div>
        )}
        {analysis && (
          <div className="prose prose-invert max-w-none">
            {renderedContent}
          </div>
        )}
      </div>
    </div>
  );
};
