"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RichContentRenderer } from "./rich-content-renderer";

interface MessageFormatOptions {
  textWrap?: boolean;
  maxLines?: number;
  allowExpand?: boolean;
}

interface ExpandableMessageProps {
  content?: string;
  contentJson?: any;
  formatOptions?: MessageFormatOptions;
  className?: string;
}

export const ExpandableMessage = ({
  content,
  contentJson,
  formatOptions = {},
  className = ""
}: ExpandableMessageProps) => {
  const {
    textWrap = true,
    maxLines = 20,
    allowExpand = true
  } = formatOptions;

  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  // Determine what content to display
  const hasTextContent = content && content.trim().length > 0;
  const hasJsonContent = contentJson && Object.keys(contentJson).length > 0;
  const displayContent = hasTextContent ? content : null;
  const displayJson = hasJsonContent ? contentJson : null;

  useEffect(() => {
    if (!allowExpand || (!displayContent && !displayJson)) return;

    if (measureRef.current && contentRef.current) {
      const lineHeight = parseInt(window.getComputedStyle(contentRef.current).lineHeight) || 24;
      const maxHeight = lineHeight * maxLines;
      const actualHeight = measureRef.current.scrollHeight;

      setNeedsExpansion(actualHeight > maxHeight);
    }
  }, [displayContent, displayJson, maxLines, allowExpand]);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  // If neither content type is available, return null
  if (!hasTextContent && !hasJsonContent) {
    return null;
  }

  // For JSON content, use RichContentRenderer
  if (displayJson) {
    return (
      <div className={`text-sm text-zinc-300 leading-relaxed ${className}`}>
        <RichContentRenderer content={displayJson} />
      </div>
    );
  }

  // For text content, use expandable functionality
  if (!displayContent) return null;

  return (
    <div className={`relative ${className}`}>
      {/* Hidden element to measure full content height */}
      {allowExpand && (
        <div
          ref={measureRef}
          className="absolute -top-full left-0 w-full opacity-0 pointer-events-none"
          style={{ visibility: "hidden" }}
        >
          <div
            className="text-sm leading-relaxed"
            style={{ whiteSpace: textWrap ? "pre-wrap" : "pre" }}
          >
            {displayContent}
          </div>
        </div>
      )}

      {/* Visible content */}
      <div
        ref={contentRef}
        className={`text-sm text-zinc-300 leading-relaxed transition-all duration-200 ${
          !isExpanded && needsExpansion && allowExpand ? "overflow-hidden" : ""
        }`}
        style={{
          maxHeight: !isExpanded && needsExpansion && allowExpand ? `${maxLines * 1.5}em` : "none",
          WebkitLineClamp: !isExpanded && needsExpansion && allowExpand ? maxLines : "none",
          WebkitBoxOrient: !isExpanded && needsExpansion && allowExpand ? "vertical" : "initial",
          display: !isExpanded && needsExpansion && allowExpand ? "-webkit-box" : "block",
          whiteSpace: textWrap ? "pre-wrap" : "pre",
          wordBreak: textWrap ? "break-word" : "normal"
        }}
      >
        {displayContent}
      </div>

      {/* Gradient fade for collapsed state */}
      {!isExpanded && needsExpansion && allowExpand && (
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#02264a] via-[#02264a]/80 to-transparent pointer-events-none" />
      )}

      {/* Expand/Collapse button */}
      {needsExpansion && allowExpand && (
        <div className="mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpansion}
            className="h-6 px-2 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-black/20 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Show More
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
