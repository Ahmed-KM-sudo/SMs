import React, { useState } from 'react';
import TemplateLibrary from '../components/templates/TemplateLibrary';
import TemplateEditor, { TemplateEditorHandles } from '../components/templates/TemplateEditor';
import { useCreateTemplate } from '../hooks/useTemplates';
import { Plus, X } from 'lucide-react';

const TemplatesPage: React.FC = () => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const editorRef = React.useRef<TemplateEditorHandles>(null);
  const createTemplateMutation = useCreateTemplate();

  const handleSave = () => {
    const templateData = editorRef.current?.getTemplateData();
    if (templateData) {
      createTemplateMutation.mutate(templateData, {
        onSuccess: () => setIsEditorOpen(false),
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Template Library</h1>
        <button onClick={() => setIsEditorOpen(true)} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
          <Plus size={20} className="mr-2" />
          Create Template
        </button>
      </div>

      <TemplateLibrary />

      {isEditorOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Template</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Design a reusable SMS template for your campaigns</p>
              </div>
              <button 
                onClick={() => setIsEditorOpen(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-500 dark:text-gray-400"/>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
              <TemplateEditor ref={editorRef} />
            </div>
            
            {/* Footer */}
            <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <button 
                onClick={() => setIsEditorOpen(false)}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={createTemplateMutation.isLoading} 
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center"
              >
                {createTemplateMutation.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Template'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;
