import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { useCreateCampaign, useUpdateCampaign } from '../../hooks/useCampaigns';
import { useCreateMailingList } from '../../hooks/useMailingLists';
import { useTemplates } from '../../hooks/useTemplates';

import CampaignForm, { CampaignFormInputs } from './CampaignForm';
import MailingListForm, { MailingListFormInputs } from '../mailing_lists/MailingListForm';
import CampaignLauncher from './CampaignLauncher';
import TemplateGridSelector from '../templates/TemplateGridSelector';
import { Campaign } from '../../services/campaignApi';

interface CampaignWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

type CampaignWizardState = Partial<Campaign>;

const CampaignWizard: React.FC<CampaignWizardProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [campaignData, setCampaignData] = useState<CampaignWizardState>({});
  const [createdCampaign, setCreatedCampaign] = useState<Campaign | null>(null);
  
  // Use ref to store campaign ID for immediate access
  const campaignIdRef = useRef<number | null>(null);

  const createCampaignMutation = useCreateCampaign();
  const updateCampaignMutation = useUpdateCampaign();
  const createMailingListMutation = useCreateMailingList();

  const { data: templates, isLoading: isLoadingTemplates } = useTemplates();

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCampaignData({});
      setCreatedCampaign(null);
      campaignIdRef.current = null;
    }
  }, [isOpen]);

  // Debug effect to track campaign state
  useEffect(() => {
    const campaignId = campaignData.id_campagne || createdCampaign?.id_campagne;
    console.log('=== Campaign Wizard State Debug ===', {
      step,
      campaignData,
      createdCampaign,
      campaignId,
      hasCampaignId: !!campaignId,
      campaignDataKeys: Object.keys(campaignData),
      createdCampaignKeys: createdCampaign ? Object.keys(createdCampaign) : null
    });
  }, [step, campaignData, createdCampaign]);

  // Watch for step transitions to step 2
  useEffect(() => {
    if (step === 2) {
      const campaignId = campaignData.id_campagne || createdCampaign?.id_campagne;
      console.log('=== Moved to Step 2 ===', {
        campaignId,
        campaignData,
        createdCampaign,
        readyForStep2: !!campaignId
      });
      
      if (!campaignId) {
        console.warn('No campaign ID available in step 2, this will cause the error message to appear');
      }
    }
  }, [step]);

  if (!isOpen) return null;

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const handleStep1Submit = (data: CampaignFormInputs) => {
    const payload = {
      ...data,
      statut: 'draft' as const,
      date_debut: new Date(data.date_debut).toISOString(),
      date_fin: new Date(data.date_fin).toISOString(),
    };
    
    console.log('Creating campaign with payload:', payload);
    
    createCampaignMutation.mutate(payload, {
      onSuccess: (createdCampaign) => {
        console.log('Campaign created successfully:', createdCampaign);
        
        // Ensure we have the campaign ID before proceeding
        if (createdCampaign && createdCampaign.id_campagne) {
          const updatedCampaignData = { ...payload, ...createdCampaign };
          
          console.log('Setting campaign states:', {
            createdCampaign,
            updatedCampaignData
          });
          
          // Store campaign ID in ref for immediate access
          campaignIdRef.current = createdCampaign.id_campagne;
          
          // Update both state variables synchronously
          setCreatedCampaign(createdCampaign);
          setCampaignData(updatedCampaignData);
          
          toast.success("Campaign created successfully!");
          
          // Use setTimeout to ensure state updates have propagated before moving to next step
          setTimeout(() => {
            console.log('Moving to step 2');
            handleNext();
          }, 100);
        } else {
          console.error('Campaign created but missing ID:', createdCampaign);
          toast.error("Failed to create campaign. Please try again.");
        }
      },
      onError: (error) => {
        console.error('Campaign creation failed:', error);
        toast.error("Failed to create campaign. Please try again.");
      }
    });
  };

  const handleStep2Next = () => {
    const campaignId = campaignIdRef.current || campaignData.id_campagne || createdCampaign?.id_campagne;
    const templateId = campaignData.id_modele;
    
    console.log('Step 2 Next - Campaign ID check:', {
      campaignId,
      templateId,
      refId: campaignIdRef.current,
      campaignDataId: campaignData.id_campagne,
      createdCampaignId: createdCampaign?.id_campagne
    });
    
    if (!campaignId) {
      toast.error("Campaign ID not found. Please go back to step 1.");
      setStep(1);
      return;
    }
    
    if (!templateId || templateId === null || templateId === 0) {
      toast.error("Please select a template before proceeding.");
      return;
    }
    
    updateCampaignMutation.mutate(
      { id: campaignId, payload: { id_modele: templateId } },
      { 
        onSuccess: (updatedCampaign) => {
          // Update both state variables with the latest campaign data
          if (updatedCampaign) {
            setCampaignData(prev => ({ ...prev, ...updatedCampaign }));
            setCreatedCampaign(prev => prev ? { ...prev, ...updatedCampaign } : updatedCampaign);
          }
          toast.success("Template assigned successfully!");
          handleNext();
        },
        onError: (error) => {
          toast.error("Failed to assign template. Please try again.");
        }
      }
    );
  };

  const handleStep3Submit = (data: MailingListFormInputs) => {
    const campaignId = campaignIdRef.current || campaignData.id_campagne || createdCampaign?.id_campagne;
    
    if (!campaignId) {
      toast.error("Campaign ID not found. Please go back to step 1.");
      setStep(1);
      return;
    }
    const payload = { ...data, id_campagne: campaignId };
    createMailingListMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Mailing list created successfully!");
        handleNext();
      },
      onError: (error) => {
        toast.error("Failed to create mailing list. Please try again.");
      }
    });
  };

  const isLoading = createCampaignMutation.isLoading || updateCampaignMutation.isLoading || createMailingListMutation.isLoading;

  const getNextButtonText = () => {
    if (isLoading) return "Processing...";
    if (step === 2) return "Assign Template";
    return "Next";
  };

  const isNextButtonDisabled = () => {
    if (isLoading) return true;
    if (step === 2) {
      const campaignId = campaignIdRef.current || campaignData.id_campagne || createdCampaign?.id_campagne;
      return (!campaignData.id_modele || campaignData.id_modele === null || campaignData.id_modele === 0) ||
             (!campaignId);
    }
    return false;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Campaign</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Step {step} of 4 - Set up your SMS campaign
              {(() => {
                const campaignId = campaignIdRef.current || campaignData.id_campagne || createdCampaign?.id_campagne;
                return campaignId ? (
                  <span className="ml-2 text-green-600 dark:text-green-400">
                    (Campaign ID: {campaignId})
                  </span>
                ) : null;
              })()}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">{/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center">
            {[1, 2, 3, 4].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                  ${step >= stepNumber 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }
                `}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`
                    h-1 w-12 mx-2
                    ${step > stepNumber ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}
                  `} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
           
           {step === 1 && <CampaignForm onSubmit={handleStep1Submit} isSubmitting={createCampaignMutation.isLoading} />}
           {step === 2 && (
               <div>
                 {(() => {
                   const campaignId = campaignIdRef.current || campaignData.id_campagne || createdCampaign?.id_campagne;
                   console.log('Step 2 campaign ID check:', {
                     campaignId,
                     refId: campaignIdRef.current,
                     campaignDataId: campaignData.id_campagne,
                     createdCampaignId: createdCampaign?.id_campagne,
                     hasCampaignId: !!campaignId
                   });
                   
                   if (!campaignId) {
                     return (
                       <div className="text-center py-8">
                         <p className="text-red-500 mb-4">Campaign ID not found. Please go back to step 1.</p>
                         <button 
                           onClick={handleBack} 
                           className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                         >
                           Go Back to Step 1
                         </button>
                       </div>
                     );
                   }
                   
                   return (
                     <>
                       <h3 className="font-medium mb-4 text-lg">2. Select a Template</h3>
                       <TemplateGridSelector
                         templates={templates || []}
                         selectedTemplateId={campaignData.id_modele || null}
                         onSelectTemplate={(templateId) => setCampaignData(prev => ({ ...prev, id_modele: Number(templateId) }))}
                         isLoading={isLoadingTemplates}
                       />
                     </>
                   );
                 })()}
               </div>
           )}
           {step === 3 && (
               <div>
                 {(() => {
                   const campaignId = campaignIdRef.current || campaignData.id_campagne || createdCampaign?.id_campagne;
                   if (!campaignId) {
                     return (
                       <div className="text-center py-8">
                         <p className="text-red-500 mb-4">Campaign ID not found. Please go back to step 1.</p>
                         <button 
                           onClick={() => setStep(1)} 
                           className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                         >
                           Go Back to Step 1
                         </button>
                       </div>
                     );
                   }
                   
                   return (
                     <>
                       <h3 className="font-medium mb-4 text-lg">3. Create a Mailing List</h3>
                       <MailingListForm onSubmit={handleStep3Submit} isSubmitting={createMailingListMutation.isLoading} />
                     </>
                   );
                 })()}
               </div>
           )}
           {step === 4 && (
               <div>
                 {(() => {
                   const campaignId = campaignIdRef.current || campaignData.id_campagne || createdCampaign?.id_campagne;
                   if (!campaignId) {
                     return (
                       <div className="text-center py-8">
                         <p className="text-red-500 mb-4">Campaign ID not found. Please go back to step 1.</p>
                         <button 
                           onClick={() => setStep(1)} 
                           className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                         >
                           Go Back to Step 1
                         </button>
                       </div>
                     );
                   }
                   
                   return (
                     <>
                       <h3 className="font-medium mb-4 text-lg">4. Launch Campaign</h3>
                       <CampaignLauncher 
                         campaign={createdCampaign || campaignData} 
                         onLaunch={onClose} 
                       />
                     </>
                   );
                 })()}
               </div>
           )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <button 
            onClick={handleBack} 
            disabled={step === 1 || isLoading} 
            className="flex items-center px-6 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" /> 
            Back
          </button>

          {step < 4 && (
            <>
              {step !== 3 && (
                 <button 
                   onClick={step === 2 ? handleStep2Next : handleNext} 
                   disabled={isNextButtonDisabled()} 
                   className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                 >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {getNextButtonText()}
                      </>
                    ) : (
                      <>
                        {getNextButtonText()}
                        <ArrowRight size={16} className="ml-2" />
                      </>
                    )}
                 </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignWizard;
