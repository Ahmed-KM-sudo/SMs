import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { X, UploadCloud, CheckCircle, Plus } from 'lucide-react';
import { useCreateContact } from '../../hooks/useContacts';
import toast from 'react-hot-toast';

interface ContactImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ContactData {
  prenom: string;
  nom: string;
  numero_telephone: string;
  email?: string;
  type_client?: string;
  zone_geographique?: string;
  [key: string]: any;
}

const ContactImportWizard: React.FC<ContactImportWizardProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<number>>(new Set());
  const [isImporting, setIsImporting] = useState(false);

  const createContactMutation = useCreateContact();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      
      // Parse the entire file
      Papa.parse(uploadedFile, {
        header: true,
        complete: (results: Papa.ParseResult<any>) => {
          const contactData = results.data
            .filter((row: any) => row.prenom || row.nom || row.numero_telephone) // Filter out empty rows
            .map((row: any, index: number) => ({
              id: index,
              prenom: row.prenom || row['First Name'] || row['first_name'] || '',
              nom: row.nom || row['Last Name'] || row['last_name'] || '',
              numero_telephone: row.numero_telephone || row['Phone'] || row['phone'] || row['Phone Number'] || '',
              email: row.email || row['Email'] || row['email_address'] || '',
              type_client: row.type_client || row['Type'] || row['Client Type'] || 'individual',
              zone_geographique: row.zone_geographique || row['Zone'] || row['Geographic Zone'] || '',
              ...row // Keep all original data
            }));
          
          setContacts(contactData);
          setStep(2); // Move to contact selection
        },
        error: (error: Papa.ParseError) => {
          toast.error(`Error parsing file: ${error.message}`);
        }
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
  });

  const toggleContactSelection = (index: number) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedContacts(newSelected);
  };

  const selectAllContacts = () => {
    const validContacts = contacts
      .map((_, index) => index)
      .filter(index => {
        const contact = contacts[index];
        return contact.prenom && contact.nom && contact.numero_telephone;
      });
    setSelectedContacts(new Set(validContacts));
  };

  const deselectAllContacts = () => {
    setSelectedContacts(new Set());
  };

  const handleImport = async () => {
    const contactsToImport = Array.from(selectedContacts).map(index => contacts[index]);
    
    if (contactsToImport.length === 0) {
      toast.error('Please select at least one contact to import.');
      return;
    }

    setIsImporting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const contact of contactsToImport) {
      try {
        await createContactMutation.mutateAsync({
          prenom: contact.prenom,
          nom: contact.nom,
          numero_telephone: contact.numero_telephone,
          email: contact.email || '',
          type_client: contact.type_client || 'individual',
          zone_geographique: contact.zone_geographique || '',
        });
        successCount++;
      } catch (error) {
        errorCount++;
        console.error('Error importing contact:', contact, error);
      }
    }

    setIsImporting(false);
    
    if (successCount > 0) {
      toast.success(`Successfully imported ${successCount} contact(s)`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to import ${errorCount} contact(s)`);
    }

    if (successCount > 0) {
      onSuccess?.();
      onClose();
    }
  };

  const resetWizard = () => {
    setStep(1);
    setFile(null);
    setContacts([]);
    setSelectedContacts(new Set());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Import Contacts</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-4">Upload File</h3>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
              >
                <input {...getInputProps()} />
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drag & drop a CSV or Excel file here, or click to select a file
                </p>
                <p className="text-sm text-gray-500">
                  Supported formats: .csv, .xls, .xlsx
                </p>
              </div>
            </div>

            {file && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-green-700">File uploaded: {file.name}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Select Contacts to Import</h3>
              <div className="space-x-2">
                <button
                  onClick={selectAllContacts}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Select All Valid
                </button>
                <button
                  onClick={deselectAllContacts}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-4">
              Found {contacts.length} contacts in the file. Select the ones you want to import:
            </div>

            <div className="max-h-96 overflow-y-auto border rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="w-12 px-4 py-2 text-left">
                      <input
                        type="checkbox"
                        onChange={(e) => e.target.checked ? selectAllContacts() : deselectAllContacts()}
                        checked={selectedContacts.size > 0 && selectedContacts.size === contacts.filter((_, i) => {
                          const contact = contacts[i];
                          return contact.prenom && contact.nom && contact.numero_telephone;
                        }).length}
                      />
                    </th>
                    <th className="px-4 py-2 text-left">First Name</th>
                    <th className="px-4 py-2 text-left">Last Name</th>
                    <th className="px-4 py-2 text-left">Phone</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Zone</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact, index) => {
                    const isValid = contact.prenom && contact.nom && contact.numero_telephone;
                    return (
                      <tr key={index} className={`border-t ${!isValid ? 'bg-red-50' : ''}`}>
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={selectedContacts.has(index)}
                            onChange={() => toggleContactSelection(index)}
                            disabled={!isValid}
                          />
                        </td>
                        <td className="px-4 py-2">{contact.prenom || '-'}</td>
                        <td className="px-4 py-2">{contact.nom || '-'}</td>
                        <td className="px-4 py-2">{contact.numero_telephone || '-'}</td>
                        <td className="px-4 py-2">{contact.email || '-'}</td>
                        <td className="px-4 py-2">{contact.type_client || 'individual'}</td>
                        <td className="px-4 py-2">{contact.zone_geographique || '-'}</td>
                        <td className="px-4 py-2">
                          {isValid ? (
                            <span className="text-green-600 text-sm">✓ Valid</span>
                          ) : (
                            <span className="text-red-600 text-sm">✗ Missing required fields</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={resetWizard}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Upload Different File
              </button>
              <div className="space-x-3">
                <span className="text-sm text-gray-600">
                  {selectedContacts.size} contact(s) selected
                </span>
                <button
                  onClick={handleImport}
                  disabled={selectedContacts.size === 0 || isImporting}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  {isImporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <Plus size={16} className="mr-2" />
                      Import Selected Contacts
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactImportWizard;
