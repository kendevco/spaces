"use client";

import { useEffect, useRef } from "react";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onSubmit?: () => void;
}

export const Editor = ({
  value,
  onChange,
  placeholder,
  className,
  onSubmit
}: EditorProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
      onKeyDown={handleKeyDown}
    />
  );
};
