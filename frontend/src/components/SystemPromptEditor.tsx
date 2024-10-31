import React, { useState, useEffect } from 'react';
import './SystemPromptEditor.css';

interface SystemPromptEditorProps {
  setSystemPrompt: (prompt: string | null) => void;
}

export const SystemPromptEditor: React.FC<SystemPromptEditorProps> = ({ setSystemPrompt }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [promptText, setPromptText] = useState('');

  useEffect(() => {
    // Check localStorage first
    const cachedPrompt = localStorage.getItem('systemPrompt');
    if (cachedPrompt) {
      setPromptText(cachedPrompt);
      setSystemPrompt(cachedPrompt);
    } else {
      // Fetch from server if no cached value exists
      fetch('/system-prompt')
        .then(response => response.json())
        .then(data => {
          setPromptText(data.systemPrompt);
          setSystemPrompt(data.systemPrompt);
          localStorage.setItem('systemPrompt', data.systemPrompt);
        })
        .catch(error => console.error('Failed to fetch system prompt:', error));
    }
  }, [setSystemPrompt]);

  const handleSave = () => {
    localStorage.setItem('systemPrompt', promptText);
    setSystemPrompt(promptText);
    setIsOpen(false);
  };

  const fetchDefaultPrompt = () => {
    fetch('/system-prompt')
      .then(response => response.json())
      .then(data => {
        setPromptText(data.systemPrompt);
      })
      .catch(error => console.error('Failed to fetch system prompt:', error));
  };

  const handleReset = () => {
    localStorage.removeItem('systemPrompt');
    setSystemPrompt(null);
    fetchDefaultPrompt();
  };

  return (
    <>
      <button
        className="system-prompt-button"
        onClick={() => setIsOpen(true)}
      >
        Edit System Prompt
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              rows={10}
              className="prompt-textarea"
            />
            <div className="modal-buttons">
              <button onClick={() => setIsOpen(false)}>Cancel</button>
              <button onClick={handleReset}>Reset</button>
              <button onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 