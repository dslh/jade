import React, { useState, useEffect } from 'react';
import './SystemPromptEditor.css';

interface SystemPromptEditorProps {
  setSystemPrompt: (prompt: string) => void;
}

export const SystemPromptEditor: React.FC<SystemPromptEditorProps> = ({ setSystemPrompt }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [promptText, setPromptText] = useState('');

  useEffect(() => {
    // Fetch initial system prompt
    fetch('/system-prompt')
      .then(response => response.json())
      .then(data => setPromptText(data.systemPrompt))
      .catch(error => console.error('Failed to fetch system prompt:', error));
  }, []);

  const handleSave = () => {
    setSystemPrompt(promptText);
    setIsOpen(false);
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
              <button onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 