import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Contact } from '../../services/contactApi';

const contactSchema = z.object({
  prenom: z.string().min(1, 'First name is required'),
  nom: z.string().min(1, 'Last name is required'),
  numero_telephone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  type_client: z.string().min(1, 'Contact type is required'),
  zone_geographique: z.string().optional(),
});

export type ContactFormInputs = z.infer<typeof contactSchema>;

interface ContactFormProps {
  onSubmit: SubmitHandler<ContactFormInputs>;
  defaultValues?: Partial<ContactFormInputs>;
  isSubmitting?: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({ onSubmit, defaultValues, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormInputs>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      prenom: defaultValues?.prenom || '',
      nom: defaultValues?.nom || '',
      numero_telephone: defaultValues?.numero_telephone || '',
      email: defaultValues?.email || '',
      type_client: defaultValues?.type_client || '',
      zone_geographique: defaultValues?.zone_geographique || '',
    },
  });

  // Contact type options
  const contactTypes = [
    { value: '', label: 'Select Contact Type' },
    { value: 'individual', label: 'Individual' },
    { value: 'business', label: 'Business' },
    { value: 'lead', label: 'Lead' },
    { value: 'customer', label: 'Customer' },
    { value: 'partner', label: 'Partner' },
    { value: 'vendor', label: 'Vendor' },
  ];

  // Geographic Zone options
  const geographicZones = [
    { value: '', label: 'Select Geographic Zone' },
    { value: 'casablanca', label: 'Casablanca' },
    { value: 'rabat', label: 'Rabat' },
    { value: 'marrakech', label: 'Marrakech' },
    { value: 'fes', label: 'Fes' },
    { value: 'tangier', label: 'Tangier' },
    { value: 'agadir', label: 'Agadir' },
    { value: 'meknes', label: 'Meknes' },
    { value: 'oujda', label: 'Oujda' },
    { value: 'tetouan', label: 'Tetouan' },
    { value: 'sale', label: 'Sale' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input {...register('prenom')} placeholder="First Name" className="w-full p-2 border rounded" />
        <input {...register('nom')} placeholder="Last Name" className="w-full p-2 border rounded" />
      </div>
      {errors.prenom && <p className="text-red-500">{errors.prenom.message}</p>}
      {errors.nom && <p className="text-red-500">{errors.nom.message}</p>}

      <input {...register('numero_telephone')} placeholder="Phone Number" className="w-full p-2 border rounded" />
      {errors.numero_telephone && <p className="text-red-500">{errors.numero_telephone.message}</p>}

      <input {...register('email')} placeholder="Email Address" className="w-full p-2 border rounded" />
      {errors.email && <p className="text-red-500">{errors.email.message}</p>}

      {/* Contact Type */}
      <div>
        <label htmlFor="type_client" className="block text-sm font-medium mb-1">
          Contact Type *
        </label>
        <select 
          {...register('type_client')} 
          id="type_client"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {contactTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.type_client && (
          <p className="text-red-500 text-sm mt-1">{errors.type_client.message}</p>
        )}
      </div>

      {/* Geographic Zone */}
      <div>
        <label htmlFor="zone_geographique" className="block text-sm font-medium mb-1">
          Geographic Zone
        </label>
        <select 
          {...register('zone_geographique')} 
          id="zone_geographique"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {geographicZones.map((zone) => (
            <option key={zone.value} value={zone.value}>
              {zone.label}
            </option>
          ))}
        </select>
        {errors.zone_geographique && (
          <p className="text-red-500 text-sm mt-1">{errors.zone_geographique.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded">
          {isSubmitting ? 'Saving...' : 'Save Contact'}
        </button>
      </div>
    </form>
  );
};

export default ContactForm;
