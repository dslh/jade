import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, JobDescriptionSection } from '../types';
import { DescriptionSuggestion } from './DescriptionSuggestion';

interface AssistantMessageProps {
  message: Message;
  onSelectSuggestion: (type: JobDescriptionSection, text: string) => void;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({ message, onSelectSuggestion }) => {
  const parts = React.useMemo(() => {
    const content = message.content;
    const result: { type: 'text' | JobDescriptionSection; content: string; isStreaming?: boolean }[] = [];
    let currentIndex = 0;
    
    const tagPattern = /\[(title|description|qualifications|company|other)\]([^\[]*)(\[\/\1\])?/gm;
    let match;
    
    while ((match = tagPattern.exec(content)) !== null) {
      // Add text before the tag
      if (match.index > currentIndex) {
        result.push({
          type: 'text',
          content: content.slice(currentIndex, match.index)
        });
      }
      
      // Add the suggestion
      result.push({
        type: match[1] as JobDescriptionSection,
        content: match[2],
        isStreaming: !match[3] // If there's no closing tag, it's streaming
      });
      
      currentIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (currentIndex < content.length) {
      result.push({
        type: 'text',
        content: content.slice(currentIndex)
      });
    }
    
    return result;
  }, [message.content]);

  debugger;
  return (
    <>
      {parts.map((part, index) => 
        part.type === 'text' ? (
          <ReactMarkdown key={index}>{part.content}</ReactMarkdown>
        ) : (
          <DescriptionSuggestion
            key={index}
            type={part.type}
            text={part.content}
            isStreaming={part.isStreaming || false}
            onSelect={onSelectSuggestion}
          />
        )
      )}
    </>
  );
}; 