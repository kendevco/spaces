'use client'

import { Fragment } from 'react'

interface RichContentRendererProps {
  content: string
  isSystemMessage?: boolean
  className?: string
}

export const RichContentRenderer = ({
  content,
  isSystemMessage = false,
  className = '',
}: RichContentRendererProps) => {
  function renderFormattedLine(line: string): React.ReactNode {
    const elements: React.ReactNode[] = []
    let remainingText = line
    let elementIndex = 0

    // Process the line character by character to find markdown links
    while (remainingText.length > 0) {
      // Look for markdown links [text](url)
      const markdownMatch = remainingText.match(/\[([^\]]+)\]\(([^)]+)\)/)

      if (markdownMatch && markdownMatch.index !== undefined) {
        // Add text before the markdown link
        if (markdownMatch.index > 0) {
          const beforeText = remainingText.substring(0, markdownMatch.index)
          elements.push(
            <Fragment key={elementIndex++}>{processTextFormatting(beforeText)}</Fragment>,
          )
        }

        // Add the markdown link
        elements.push(
          <a
            key={elementIndex++}
            href={markdownMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline transition-colors break-all"
          >
            {markdownMatch[1]}
          </a>,
        )

        // Continue with remaining text
        remainingText = remainingText.substring(markdownMatch.index + markdownMatch[0].length)
      } else {
        // No more markdown links, process remaining text
        elements.push(
          <Fragment key={elementIndex++}>{processTextFormatting(remainingText)}</Fragment>,
        )
        break
      }
    }

    return elements.length === 1 ? elements[0] : <>{elements}</>
  }

  function processTextFormatting(text: string): React.ReactNode {
    return applyTextFormatting(text)
  }

  function applyTextFormatting(text: string): React.ReactNode {
    // Bold formatting (**text**)
    const boldMatch = text.match(/\*\*(.*?)\*\*/)
    if (boldMatch && boldMatch.index !== undefined) {
      const before = text.substring(0, boldMatch.index)
      const boldText = boldMatch[1]
      const after = text.substring(boldMatch.index + boldMatch[0].length)

      return (
        <>
          {before && applyItalicAndCode(before)}
          <strong className="font-bold text-white">{applyItalicAndCode(boldText || '')}</strong>
          {after && applyTextFormatting(after)}
        </>
      )
    }

    return applyItalicAndCode(text)
  }

  function applyItalicAndCode(text: string): React.ReactNode {
    // Code formatting (`text`)
    const codeMatch = text.match(/`(.*?)`/)
    if (codeMatch && codeMatch.index !== undefined) {
      const before = text.substring(0, codeMatch.index)
      const codeText = codeMatch[1]
      const after = text.substring(codeMatch.index + codeMatch[0].length)

      return (
        <>
          {before && applyUrlFormatting(before)}
          <code className="bg-zinc-800 dark:bg-zinc-700 px-1 py-0.5 rounded text-sm font-mono text-yellow-300">
            {codeText}
          </code>
          {after && applyItalicAndCode(after)}
        </>
      )
    }

    // Italic formatting (*text*)
    const italicMatch = text.match(/\*(.*?)\*/)
    if (italicMatch && italicMatch.index !== undefined) {
      const before = text.substring(0, italicMatch.index)
      const italicText = italicMatch[1]
      const after = text.substring(italicMatch.index + italicMatch[0].length)

      return (
        <>
          {before && applyUrlFormatting(before)}
          <em className="italic text-zinc-200">{italicText}</em>
          {after && applyItalicAndCode(after)}
        </>
      )
    }

    return applyUrlFormatting(text)
  }

  function applyUrlFormatting(text: string): React.ReactNode {
    // URL formatting (auto-link plain URLs)
    const urlMatch = text.match(/(https?:\/\/[^\s]+)/)
    if (urlMatch && urlMatch.index !== undefined) {
      const before = text.substring(0, urlMatch.index)
      const url = urlMatch[1]
      const after = text.substring(urlMatch.index + urlMatch[0].length)

      return (
        <>
          {before}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline transition-colors break-all"
          >
            {url}
          </a>
          {after && applyUrlFormatting(after)}
        </>
      )
    }

    return text
  }

  function renderMessage(text: string) {
    const lines = text.split('\n')

    return lines.map((line, index) => {
      // Handle headers
      if (line.match(/^#{1,3}\s+/)) {
        const level = line.match(/^(#{1,3})/)?.[1]?.length || 3
        const headerText = line.replace(/^#{1,3}\s+/, '')
        const headerClass =
          level === 1
            ? 'text-lg font-bold mt-1 mb-0.5'
            : level === 2
              ? 'text-base font-bold mt-1 mb-0.5'
              : 'text-sm font-bold mt-0.5 mb-0.5'
        return (
          <div key={index} className={`${headerClass} text-blue-400 dark:text-blue-300`}>
            {headerText}
          </div>
        )
      }

      // Handle bullet points
      if (line.match(/^[\s]*[-•]\s+/)) {
        return (
          <div key={index} className="ml-3 mb-0 text-zinc-200 dark:text-zinc-300">
            {line.replace(/^[\s]*[-•]\s+/, '• ')}
            {renderFormattedLine(line.replace(/^[\s]*[-•]\s+/, ''))}
          </div>
        )
      }

      // Handle numbered lists
      if (line.match(/^\d+\.\s+/)) {
        return (
          <div key={index} className="ml-3 mb-0 text-zinc-200 dark:text-zinc-300">
            {renderFormattedLine(line)}
          </div>
        )
      }

      // Empty lines for spacing
      if (line.trim() === '') {
        return <div key={index} className="h-0.5" />
      }

      // Regular lines
      return (
        <div key={index} className="mb-0 text-zinc-300 dark:text-zinc-300">
          {renderFormattedLine(line)}
        </div>
      )
    })
  }

  return <div className={`message-content ${className}`}>{renderMessage(content)}</div>
}
