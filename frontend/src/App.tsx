import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

interface JobDescription {
  title: string;
  description: string;
  qualifications: string;
  company: string;
  other: string;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [jobDescription, setJobDescription] = useState<JobDescription>({
    title: '',
    description: '',
    qualifications: '',
    company: '',
    other: ''
  });
  const [activeSectionKey, setActiveSectionKey] = useState<keyof JobDescription | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      let assistantMessage = '';
      let currentSection: keyof JobDescription | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(5);
            if (data === '[DONE]') break;

            try {
              const parsedData = JSON.parse(data);
              const content = parsedData.text;

              if (content.includes('[title]')) {
                currentSection = 'title';
                setActiveSectionKey('title');
              } else if (content.includes('[description]')) {
                currentSection = 'description';
                setActiveSectionKey('description');
              } else if (content.includes('[qualifications]')) {
                currentSection = 'qualifications';
                setActiveSectionKey('qualifications');
              } else if (content.includes('[company]')) {
                currentSection = 'company';
                setActiveSectionKey('company');
              } else if (content.includes('[other]')) {
                currentSection = 'other';
                setActiveSectionKey('other');
              }

              if (currentSection) {
                setJobDescription(prev => ({
                  ...prev,
                  [currentSection]: prev[currentSection] + content.replace(/\[[^\]]+\]/g, '')
                }));
              } else {
                assistantMessage += content;
                setMessages(prev => [
                  ...prev.slice(0, -1),
                  { role: 'assistant', content: assistantMessage }
                ]);
              }
            } catch (error) {
              console.error('Error parsing JSON:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="app">
      <div className="chat-pane">
        <div className="chat-messages" ref={chatRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
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
      <div className="job-description-pane">
        <input
          type="text"
          value={jobDescription.title}
          onChange={(e) => setJobDescription(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Job Title"
          className={`job-section ${activeSectionKey === 'title' ? 'active' : ''}`}
        />
        {(['description', 'qualifications', 'company', 'other'] as const).map((section) => (
          <textarea
            key={section}
            value={jobDescription[section]}
            onChange={(e) => setJobDescription(prev => ({ ...prev, [section]: e.target.value }))}
            placeholder={section.charAt(0).toUpperCase() + section.slice(1)}
            className={`job-section ${activeSectionKey === section ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
