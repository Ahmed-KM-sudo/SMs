import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Template } from '../../services/templateApi';

interface EditTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template | null;
  onSave: (data: { nom_modele: string; contenu_modele: string }) => void;
  isLoading?: boolean;
}

const EditTemplateModal: React.FC<EditTemplateModalProps> = ({
  isOpen,
  onClose,
  template,
  onSave,
  isLoading = false
}) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (template) {
      setName(template.nom_modele);
      setContent(template.contenu_modele);
    }
  }, [template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      return;
    }
    onSave({
      nom_modele: name.trim(),
      contenu_modele: content.trim()
    });
  };

  const handleClose = () => {
    setName('');
    setContent('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Template
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="template-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Template Name
            </label>
            <input
              id="template-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter template name"
              required
            />
          </div>

          <div>
            <label htmlFor="template-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Template Content
            </label>
            <textarea
              id="template-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              placeholder="Enter your message template here..."
              required
            />
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Characters: {content.length}/160
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim() || !content.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTemplateModal;
