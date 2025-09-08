import React, { useState } from 'react';
import { useTemplates, useUpdateTemplate, useDeleteTemplate } from '../../hooks/useTemplates';
import { MessageSquare } from 'lucide-react';
import { Template } from '../../services/templateApi';
import TemplateDropdown from './TemplateDropdown';
import EditTemplateModal from './EditTemplateModal';
import DeleteTemplateModal from './DeleteTemplateModal';

const TemplateLibrary: React.FC = () => {
  const { data: templates, isLoading, isError } = useTemplates();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();

  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setIsEditModalOpen(true);
  };

  const handleDelete = (template: Template) => {
    setDeletingTemplate(template);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEdit = (data: { nom_modele: string; contenu_modele: string }) => {
    if (editingTemplate) {
      updateTemplate.mutate(
        { id: editingTemplate.id_modele, payload: data },
        {
          onSuccess: () => {
            setIsEditModalOpen(false);
            setEditingTemplate(null);
          }
        }
      );
    }
  };

  const handleConfirmDelete = () => {
    if (deletingTemplate) {
      deleteTemplate.mutate(deletingTemplate.id_modele, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setDeletingTemplate(null);
        }
      });
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTemplate(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingTemplate(null);
  };

  if (isLoading) return <p>Loading templates...</p>;
  if (isError) return <p className="text-red-500">Error loading templates.</p>;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates?.map(template => (
          <div key={template.id_modele} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <MessageSquare className="h-8 w-8 text-blue-500" />
                <TemplateDropdown
                  onEdit={() => handleEdit(template)}
                  onDelete={() => handleDelete(template)}
                />
              </div>
              <h3 className="font-bold text-lg mt-2">{template.nom_modele}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-3">
                {template.contenu_modele}
              </p>
            </div>
            <div className="text-xs text-gray-400 mt-4">
              {/* Usage stats will go here */}
              <span>Used in 0 campaigns</span>
            </div>
          </div>
        ))}
      </div>

      <EditTemplateModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        template={editingTemplate}
        onSave={handleSaveEdit}
        isLoading={updateTemplate.isLoading}
      />

      <DeleteTemplateModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        template={deletingTemplate}
        onConfirm={handleConfirmDelete}
        isLoading={deleteTemplate.isLoading}
      />
    </>
  );
};

export default TemplateLibrary;
