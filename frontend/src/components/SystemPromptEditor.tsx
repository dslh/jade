import React, { useState, useEffect } from 'react';
import './SystemPromptEditor.css';

interface SystemPromptEditorProps {
  setSystemPrompt: (prompt: string | null) => void;
}

export const SystemPromptEditor: React.FC<SystemPromptEditorProps> = ({ setSystemPrompt }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [promptText, setPromptText] = useState<string | null>(null);
  const [savedText, setSavedText] = useState<string | null>(null);
  const [isModified, setIsModified] = useState<boolean>(false);

  useEffect(() => {
    // Check localStorage first
    const cachedPrompt = localStorage.getItem('systemPrompt');
    if (cachedPrompt) {
      setPromptText(cachedPrompt);
      setSavedText(cachedPrompt);
      setSystemPrompt(cachedPrompt);
      setIsModified(true);
    } else {
      // Fetch from server if no cached value exists
      fetch('/system-prompt')
        .then(response => response.json())
        .then(({ systemPrompt }) => {
          setPromptText(systemPrompt);
          setSavedText(systemPrompt);
        })
        .catch(error => console.error('Failed to fetch system prompt:', error));
    }
  }, [setSystemPrompt]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleCancel = () => {
    setPromptText(savedText);
    setIsOpen(false);
  };

  const handleSave = () => {
    if (promptText)
      localStorage.setItem('systemPrompt', promptText);
    else
      localStorage.removeItem('systemPrompt');
    setSystemPrompt(promptText);
    setSavedText(promptText);
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
    setIsModified(false);
    fetchDefaultPrompt();
    setIsOpen(false);
  };

  return (
    <>
      <button
        className={`system-prompt-button ${isModified ? 'modified' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        Edit System Prompt {isModified && <span className="modified-indicator">•</span>}
      </button>

      {isOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div className="modal-content">
            <textarea
              value={promptText || ''}
              onChange={(e) => setPromptText(e.target.value)}
              rows={10}
              className="prompt-textarea"
            />
            <div className="modal-buttons">
              <button onClick={handleCancel}>Cancel</button>
              <button onClick={handleReset}>Reset</button>
              <button onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 