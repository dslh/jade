/**
 * src/components/ChatPane.tsx
 * UI for chatting with the assistant.
 */
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import './ChatPane.css';
import { AssistantMessage } from './AssistantMessage';
import { JobDescription } from '../types';

interface ChatPaneProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  setJobDescription: (section: keyof JobDescription, content: string) => void;
}

export const ChatPane: React.FC<ChatPaneProps> = ({ messages, onSendMessage, setJobDescription }) => {
  const [input, setInput] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="chat-pane">
      <div className="chat-messages" ref={chatRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.role === 'assistant' ? (
              <AssistantMessage message={msg} onSelectSuggestion={setJobDescription} />
            ) : (
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};
