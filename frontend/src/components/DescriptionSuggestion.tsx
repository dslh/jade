import React from 'react';
import { CircleLoader } from 'react-spinners';
import { JobDescriptionSection } from '../types';

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
      className={`
        flex items-center p-4 rounded-lg border border-gray-200 
        ${!isStreaming ? 'hover:bg-gray-50 cursor-pointer' : ''}
      `}
      onClick={() => !isStreaming && onSelect(type, text)}
    >
      <div className="w-8 flex justify-center">
        {isStreaming ? (
          <CircleLoader size={20} color="#6B7280" />
        ) : (
          <span className="text-gray-400">→</span>
        )}
      </div>
      
      <div className="ml-4 flex-1">
        <div className="font-semibold text-gray-700">
          {typeDisplayNames[type]} Suggestion
        </div>
        <div 
          className="text-sm text-gray-500 mt-1"
          style={{
            background: 'linear-gradient(to right, currentColor 60%, transparent)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {previewText}
        </div>
      </div>
    </div>
  );
}; 