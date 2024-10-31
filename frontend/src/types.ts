/**
 * src/types.ts
 * Type definitions.
 */
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface JobDescription {
  title: string;
  description: string;
  qualifications: string;
  company: string;
  other: string;
}

export type JobDescriptionSection = 'title' | 'description' | 'qualifications' | 'company' | 'other';
