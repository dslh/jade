/**
 * src/App.tsx
 * Main frontend entrypoint.
 */
import React from 'react';
import { ChatPane } from './components/ChatPane';
import { JobDescriptionPane } from './components/JobDescriptionPane';
import { SystemPromptEditor } from './components/SystemPromptEditor';
import { useChatMessages } from './hooks/useChatMessages';
import './App.css';

const App: React.FC = () => {
  const { messages, jobDescription, activeSectionKey, handleNewMessage, setSystemPrompt } = useChatMessages();

  return (
    <div className="app">
      <ChatPane messages={messages} onSendMessage={handleNewMessage} />
      <JobDescriptionPane jobDescription={jobDescription} activeSectionKey={activeSectionKey} />
      <SystemPromptEditor setSystemPrompt={setSystemPrompt} />
    </div>
  );
};

export default App;
