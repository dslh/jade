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
  return (
    <div className="job-description-pane">
      <div className={`job-section ${activeSectionKey === 'title' ? 'active' : ''}`}>
        <h2>Job Title</h2>
        <ReactMarkdown>{jobDescription.title}</ReactMarkdown>
      </div>
      {(['description', 'qualifications', 'company', 'other'] as const).map((section) => (
        <div key={section} className={`job-section ${activeSectionKey === section ? 'active' : ''}`}>
          <h2>{section.charAt(0).toUpperCase() + section.slice(1)}</h2>
          <ReactMarkdown>{jobDescription[section]}</ReactMarkdown>
        </div>
      ))}
    </div>
  );
};
