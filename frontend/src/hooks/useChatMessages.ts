/**
 * src/hooks/useChatMessages.ts
 * React hook for interacting with the backend.
 */
import { useState, useCallback } from 'react';
import { Message, JobDescription } from '../types';

export const useChatMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [jobDescription, setJobDescription] = useState<JobDescription>({
    title: '',
    description: '',
    qualifications: '',
    company: '',
    other: ''
  });
  const [activeSectionKey, setActiveSectionKey] = useState<keyof JobDescription | null>(null);

  const handleNewMessage = useCallback(async (input: string) => {
    const newMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);

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
              const sectionContent = content.slice(openIndex + openTag.length, closeIndex).trim();
              setJobDescription(prev => ({ ...prev, [section]: sectionContent }));
              setActiveSectionKey(section);
            } else {
              setJobDescription(prev => ({ ...prev, [section]: '' }));
              setActiveSectionKey(section);
              const sectionContent = content.slice(openIndex + openTag.length).trim();
              setJobDescription(prev => ({ ...prev, [section]: sectionContent }));
            }
          } else if (closeIndex !== -1) {
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
  }, [messages]);

  return { messages, jobDescription, activeSectionKey, handleNewMessage };
};
