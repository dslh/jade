/**
 * src/App.tsx
 * Main frontend entrypoint.
 */
import React from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { ChatPane } from './components/ChatPane';
import { JobDescriptionPane } from './components/JobDescriptionPane';
import { SystemPromptEditor } from './components/SystemPromptEditor';
import { useChatMessages } from './hooks/useChatMessages';
import { useJobDescription } from './hooks/useJobDescription';
import './App.css';

const App: React.FC = () => {
  const { jobDescription, activeSectionKey, setJobDescription } = useJobDescription();
  const { messages, handleNewMessage, setSystemPrompt, done } = useChatMessages(setJobDescription);
  const { width, height } = useWindowSize();

  return (
    <div className="app">
      { done && <Confetti width={width} height={height} /> }
      <ChatPane messages={messages} onSendMessage={handleNewMessage} setJobDescription={setJobDescription} />
      <JobDescriptionPane jobDescription={jobDescription} activeSectionKey={activeSectionKey} />
      <SystemPromptEditor setSystemPrompt={setSystemPrompt} />
    </div>
  );
};

export default App;
