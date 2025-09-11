import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Schema for the campaign form based on backend model
const campaignSchema = z.object({
  nom_campagne: z.string().min(3, 'Campaign name must be at least 3 characters'),
  type_campagne: z.enum(['promotional', 'informational', 'follow_up'], {
    errorMap: () => ({ message: 'Please select a valid campaign type' })
  }),
  date_debut: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date' }),
  date_fin: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date' }),
}).refine(data => new Date(data.date_fin) > new Date(data.date_debut), {
  message: "End date must be after start date",
  path: ["date_fin"], // path of error
});

export type CampaignFormInputs = z.infer<typeof campaignSchema>;

interface CampaignFormProps {
  onSubmit: SubmitHandler<CampaignFormInputs>;
  defaultValues?: Partial<CampaignFormInputs>;
  isSubmitting?: boolean;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ onSubmit, defaultValues, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CampaignFormInputs>({
    resolver: zodResolver(campaignSchema),
    defaultValues: defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="nom_campagne" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Campaign Name</label>
        <input
          type="text"
          id="nom_campagne"
          {...register('nom_campagne')}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {errors.nom_campagne && <p className="mt-1 text-sm text-red-500">{errors.nom_campagne.message}</p>}
      </div>

      <div>
        <label htmlFor="type_campagne" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Campaign Type</label>
        <select
          id="type_campagne"
          {...register('type_campagne')}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="">Select campaign type</option>
          <option value="promotional">Promotional</option>
          <option value="informational">Informational</option>
          <option value="follow_up">Follow Up</option>
        </select>
        {errors.type_campagne && <p className="mt-1 text-sm text-red-500">{errors.type_campagne.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date_debut" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
          <input
            type="datetime-local"
            id="date_debut"
            {...register('date_debut')}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.date_debut && <p className="mt-1 text-sm text-red-500">{errors.date_debut.message}</p>}
        </div>
        <div>
          <label htmlFor="date_fin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
          <input
            type="datetime-local"
            id="date_fin"
            {...register('date_fin')}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.date_fin && <p className="mt-1 text-sm text-red-500">{errors.date_fin.message}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save and Continue'}
        </button>
      </div>
    </form>
  );
};

export default CampaignForm;
