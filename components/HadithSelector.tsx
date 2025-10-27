
import React, { useState, useRef, useEffect } from 'react';
import type { Hadith } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface HadithSelectorProps {
  hadiths: Hadith[];
  selectedHadith: Hadith | null;
  onSelect: (hadith: Hadith) => void;
}

export const HadithSelector: React.FC<HadithSelectorProps> = ({ hadiths, selectedHadith, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSelect = (hadith: Hadith) => {
    onSelect(hadith);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        className="relative w-full cursor-default rounded-lg bg-background py-3 pl-4 pr-10 text-left shadow-md focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:text-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="block truncate text-on-surface">
          {selectedHadith ? `Diriwayatkan oleh ${selectedHadith.narrator}` : "Pilih Hadis untuk dianalisis"}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>
      {isOpen && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-slate-600 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {hadiths.map((hadith) => (
            <li
              key={hadith.id}
              className="relative cursor-default select-none py-2 pl-4 pr-4 text-on-surface hover:bg-primary hover:text-white"
              onClick={() => handleSelect(hadith)}
            >
              <span className={`block truncate ${selectedHadith?.id === hadith.id ? 'font-medium' : 'font-normal'}`}>
                {hadith.english.substring(0, 70)}...
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
