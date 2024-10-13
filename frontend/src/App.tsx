/**
 * src/App.tsx
 * Main frontend entrypoint.
 */
import React from 'react';
import { ChatPane } from './components/ChatPane';
import { JobDescriptionPane } from './components/JobDescriptionPane';
import { useChatMessages } from './hooks/useChatMessages';
import './App.css';

const App: React.FC = () => {
  const { messages, jobDescription, activeSectionKey, handleNewMessage } = useChatMessages();

  return (
    <div className="app">
      <ChatPane messages={messages} onSendMessage={handleNewMessage} />
      <JobDescriptionPane jobDescription={jobDescription} activeSectionKey={activeSectionKey} />
    </div>
  );
};

export default App;
