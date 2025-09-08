import React from 'react';
import { FileText, Clock, User } from 'lucide-react';

interface Template {
  id_modele: number;
  nom_modele: string;
  contenu_modele: string;
  date_creation?: string;
  nom_agent?: string;
}

interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onClick: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, isSelected, onClick }) => {
  const previewText = template.contenu_modele.length > 100 
    ? template.contenu_modele.substring(0, 100) + '...' 
    : template.contenu_modele;

  return (
    <div 
      onClick={onClick}
      className={`
        cursor-pointer border-2 rounded-lg p-4 transition-all duration-200 hover:shadow-md
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md' 
          : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
        }
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <FileText size={20} className={`${isSelected ? 'text-blue-600' : 'text-gray-500'} mr-2`} />
          <h4 className={`font-semibold ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'}`}>
            {template.nom_modele}
          </h4>
        </div>
        {isSelected && (
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
      </div>
      
      <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 mb-3">
        <p className="text-sm text-gray-700 dark:text-gray-300 font-mono leading-relaxed">
          {previewText}
        </p>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        {template.date_creation && (
          <div className="flex items-center">
            <Clock size={12} className="mr-1" />
            {new Date(template.date_creation).toLocaleDateString()}
          </div>
        )}
        {template.nom_agent && (
          <div className="flex items-center">
            <User size={12} className="mr-1" />
            {template.nom_agent}
          </div>
        )}
      </div>
    </div>
  );
};

interface TemplateGridSelectorProps {
  templates: Template[];
  selectedTemplateId: number | null;
  onSelectTemplate: (templateId: number) => void;
  isLoading?: boolean;
}

const TemplateGridSelector: React.FC<TemplateGridSelectorProps> = ({ 
  templates, 
  selectedTemplateId, 
  onSelectTemplate,
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading templates...</span>
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No templates found</h3>
        <p className="text-gray-500 dark:text-gray-400">Create your first template to get started.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Choose a Template</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select a template for your campaign. You can preview the content before selecting.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {templates.map((template) => (
          <TemplateCard
            key={template.id_modele}
            template={template}
            isSelected={selectedTemplateId !== null && Number(selectedTemplateId) === Number(template.id_modele)}
            onClick={() => onSelectTemplate(Number(template.id_modele))}
          />
        ))}
      </div>
      
      {selectedTemplateId && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200 font-medium">
            ✓ Template selected successfully! You can proceed to the next step.
          </p>
        </div>
      )}
    </div>
  );
};

export default TemplateGridSelector;
