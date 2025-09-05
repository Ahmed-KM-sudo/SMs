import { useState } from 'react';
import CampaignForm, { CampaignFormValues } from './CampaignForm';
import { useCreateCampaign } from '../../hooks/useCampaigns';
import toast from 'react-hot-toast';

interface CampaignWizardProps {
  onClose: () => void;
}

const CampaignWizard = ({ onClose }: CampaignWizardProps) => {
  const [step, setStep] = useState(1);
  const [campaignData, setCampaignData] = useState<Partial<CampaignFormValues>>({});
  const createCampaignMutation = useCreateCampaign();

  const handleStep1Submit = (data: CampaignFormValues) => {
    const newCampaignData = { ...campaignData, ...data };
    setCampaignData(newCampaignData);

    // For now, we'll just create the campaign as a draft and close the wizard.
    // In the future, this would advance to the next step.
    // setStep(2);

    createCampaignMutation.mutate(
      { ...newCampaignData, status: 'draft' },
      {
        onSuccess: () => {
          toast.success('Campaign draft saved successfully!');
          onClose();
        },
        onError: () => {
          toast.error('Failed to save campaign draft.');
        },
      }
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <CampaignForm
            onSubmit={handleStep1Submit}
            onCancel={onClose}
            defaultValues={campaignData}
          />
        );
      // case 2:
      //   return <Step2Component ... />;
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div>
      {/* We could add a progress indicator here in the future */}
      <h2 className="text-xl font-semibold mb-4">Step {step}: Basic Information</h2>
      {renderStep()}
    </div>
  );
};

export default CampaignWizard;
