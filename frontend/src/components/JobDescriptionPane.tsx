/**
 * src/components/JobDescriptionPane.tsx
 * Displays job descriptions as suggested by the assistant.
 */
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { JobDescription } from '../types';
import './JobDescriptionPane.css';

interface JobDescriptionPaneProps {
  jobDescription: JobDescription;
  activeSectionKey: keyof JobDescription | null;
}

export const JobDescriptionPane: React.FC<JobDescriptionPaneProps> = ({ jobDescription, activeSectionKey }) => {
  const activeRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = activeRef.current;
    if (activeSectionKey && element) {
      element.scrollIntoView({ 
        behavior: 'auto',
        block: 'end'
      });
    }
  }, [activeSectionKey, jobDescription[activeSectionKey ?? 'title']]);

  return (
    <div className="job-description-pane">
      <div 
        ref={activeSectionKey === 'title' ? activeRef : null}
        className={`job-section ${activeSectionKey === 'title' ? 'active' : ''}`}
      >
        <div className="job-section-title">Job Title</div>
        <div className="job-section-content">
          <ReactMarkdown>{jobDescription.title}</ReactMarkdown>
        </div>
      </div>
      {(['description', 'qualifications', 'company', 'other'] as const).map((section) => (
        <div 
          key={section} 
          ref={activeSectionKey === section ? activeRef : null}
          className={`job-section ${activeSectionKey === section ? 'active' : ''}`}
        >
          <div className="job-section-title">{section.charAt(0).toUpperCase() + section.slice(1)}</div>
          <div className="job-section-content">
            <ReactMarkdown>{jobDescription[section]}</ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
};
