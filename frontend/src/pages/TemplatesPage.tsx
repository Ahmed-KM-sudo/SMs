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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold">Create New Template</h3>
              <button onClick={() => setIsEditorOpen(false)}><X/></button>
            </div>
            <div className="p-6">
              <TemplateEditor ref={editorRef} />
            </div>
            <div className="flex justify-end p-6 border-t">
              <button onClick={handleSave} disabled={createTemplateMutation.isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md">
                {createTemplateMutation.isLoading ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;
