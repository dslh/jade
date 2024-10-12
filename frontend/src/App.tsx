import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface JobDescription {
  title: string;
  description: string;
  qualifications: string;
  company: string;
  other: string;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
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
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      let assistantMessage = '';
      let currentSection: keyof JobDescription | null = null;

      // Add an initial empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      const updateJobDescription = (content: string) => {
        const sections: (keyof JobDescription)[] = ['title', 'description', 'qualifications', 'company', 'other'];

        sections.forEach(section => {
          const openTag = `[${section}]`;
          const closeTag = `[/${section}]`;
          const openIndex = content.indexOf(openTag);
          const closeIndex = content.indexOf(closeTag);

          if (openIndex !== -1) {
            if (closeIndex !== -1 && closeIndex > openIndex) {
              // We have a complete section
              const sectionContent = content.slice(openIndex + openTag.length, closeIndex).trim();
              setJobDescription(prev => ({ ...prev, [section]: sectionContent }));
              setActiveSectionKey(section);
            } else {
              // We have an opening tag but no closing tag yet
              setJobDescription(prev => ({ ...prev, [section]: '' }));
              setActiveSectionKey(section);
            }
          } else if (closeIndex !== -1 && section === currentSection) {
            // We have a closing tag for the current section
            const sectionContent = content.slice(0, closeIndex).trim();
            setJobDescription(prev => ({ ...prev, [section]: prev[section] + sectionContent }));
            setActiveSectionKey(null);
          }
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            // The agent tends to use middot for bullet points, we need hyphens for markdown.
            const data = line.slice(5).replace('•', '-');
            if (data === '[DONE]') break;

            try {
              const parsedData = JSON.parse(data);
              const content = parsedData.text;

              assistantMessage += content;
              updateJobDescription(assistantMessage);

              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: 'assistant',
                  content: assistantMessage
                };
                return newMessages;
              });
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
    </div>
  );
};

export default App;
