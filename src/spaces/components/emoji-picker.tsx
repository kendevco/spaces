"use client";

import { useEffect, useRef, useState } from "react";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { Smile } from "lucide-react";

interface EmojiPickerProps {
  onChange: (value: string) => void;
}

export const EmojiPicker = ({ onChange }: EmojiPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="h-[24px] w-[24px] hover:opacity-75 transition"
      >
        <Smile className="text-zinc-500 dark:text-zinc-400" />
      </button>
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2">
          <Picker
            data={data}
            onEmojiSelect={(emoji: any) => {
              onChange(emoji.native);
              setIsOpen(false);
            }}
            theme="dark"
          />
        </div>
      )}
    </div>
  );
};
