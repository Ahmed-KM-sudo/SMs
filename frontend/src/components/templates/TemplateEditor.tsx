import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import VariableInserter from './VariableInserter';
import TemplatePreview from './TemplatePreview';
import TemplateValidator from './TemplateValidator';

const SMS_LIMIT = 160;
const SMS_LIMIT_UNICODE = 70;

export interface TemplateEditorHandles {
  getTemplateData: () => { nom_modele: string, contenu_modele: string } | null;
}

const TemplateEditor = forwardRef<TemplateEditorHandles>((props, ref) => {
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    getTemplateData: () => {
      if (!name.trim()) {
        alert("Please enter a template name.");
        return null;
      }
      if (!content.trim()) {
        alert("Please enter message content.");
        return null;
      }
      return { nom_modele: name.trim(), contenu_modele: content.trim() };
    }
  }));

  const handleInsertVariable = (variable: string) => {
    const { current: textArea } = textAreaRef;
    if (!textArea) return;

    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const newContent = content.substring(0, start) + variable + content.substring(end);

    setContent(newContent);
    // Focus and move cursor to after the inserted variable
    setTimeout(() => {
      textArea.focus();
      textArea.selectionStart = textArea.selectionEnd = start + variable.length;
    }, 0);
  };

  const charCount = content.length;
  const isUnicode = /[^\x00-\x7F]/.test(content);
  const limit = isUnicode ? SMS_LIMIT_UNICODE : SMS_LIMIT;
  const segments = Math.ceil(charCount / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Template Name Section */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <label htmlFor="template_name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Template Name *
        </label>
        <input
          type="text"
          id="template_name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          placeholder="Enter a descriptive name for your template"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Choose a name that helps you identify this template later</p>
      </div>

      {/* Message Content Section */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Message Content *
        </label>
        
        {/* Variable Inserter */}
        <div className="mb-3">
          <VariableInserter onInsert={handleInsertVariable} />
        </div>
        
        {/* Text Area */}
        <textarea
          ref={textAreaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm dark:bg-gray-800 dark:text-white resize-none"
          placeholder="Type your SMS message here... You can use variables like {nom} for personalization."
          required
        />
        
        {/* Character Count */}
        <div className="flex justify-between items-center mt-2">
          <div className="text-xs text-gray-500">
            Use variables like {"{nom}"}, {"{prenom}"} to personalize messages
          </div>
          <div className={`text-sm font-medium ${charCount > limit ? 'text-red-600' : 'text-gray-600'}`}>
            {charCount} / {limit} characters | {segments} SMS
          </div>
        </div>
      </div>

      {/* Validation */}
      <TemplateValidator content={content} />
      
      {/* Preview */}
      <TemplatePreview templateContent={content} />
    </div>
  );
});

export default TemplateEditor;
