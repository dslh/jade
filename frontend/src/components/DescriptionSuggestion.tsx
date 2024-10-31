import React from 'react';
import { CircleLoader } from 'react-spinners';
import { JobDescriptionSection } from '../types';
import './DescriptionSuggestion.css';

interface DescriptionSuggestionProps {
  type: JobDescriptionSection;
  text: string;
  isStreaming: boolean;
  onSelect: (type: JobDescriptionSection, text: string) => void;
}

export const DescriptionSuggestion: React.FC<DescriptionSuggestionProps> = ({
  type,
  text,
  isStreaming,
  onSelect,
}) => {
  const previewText = text.slice(0, 50) + (text.length > 50 ? '...' : '');
  const typeDisplayNames: Record<JobDescriptionSection, string> = {
    title: 'Job Title',
    description: 'Job Description',
    qualifications: 'Qualifications',
    company: 'Company Details',
    other: 'Additional Information',
  };

  return (
    <div 
      className={`suggestion-container ${!isStreaming ? 'interactive' : ''}`}
      onClick={() => !isStreaming && onSelect(type, text)}
    >
      <div className="icon-container">
        {isStreaming ? (
          <CircleLoader size={20} color="#6B7280" />
        ) : (
          <span className="arrow-icon">→</span>
        )}
      </div>
      
      <div className="content-container">
        <div className="suggestion-title">
          {typeDisplayNames[type]} Suggestion
        </div>
        <div className="preview-text">
          {previewText}
        </div>
      </div>
    </div>
  );
}; 