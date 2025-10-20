import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCampaign, useLaunchCampaign, usePauseCampaign } from '../hooks/useCampaigns';
import { useMailingLists } from '../hooks/useMailingLists';
import CampaignMonitor from '../components/campaigns/CampaignMonitor';
import CampaignAnalytics from '../components/campaigns/CampaignAnalytics';
import EditCampaignModal from '../components/campaigns/EditCampaignModal';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  MessageSquare, 
  Clock, 
  Play, 
  Pause, 
  Edit2,
  Settings,
  BarChart3,
  FileText,
  Mail,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const CampaignDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const campaignId = parseInt(id || '0', 10);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: campaign, isLoading, isError } = useCampaign(campaignId);
  const { data: mailingLists } = useMailingLists();
  const launchCampaignMutation = useLaunchCampaign();
  const pauseCampaignMutation = usePauseCampaign();

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2">Loading campaign details...</span>
    </div>
  );
  
  if (isError || !campaign) return (
    <div className="text-center py-8">
      <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
      <p className="text-red-500 text-lg">Error loading campaign details.</p>
      <button 
        onClick={() => navigate('/campaigns')}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Back to Campaigns
      </button>
    </div>
  );

  // Get campaign mailing lists
  const campaignMailingLists = mailingLists?.filter(list => 
    list.id_campagne === campaign.id_campagne
  ) || [];

  // Calculate total contacts
  const totalContacts = campaignMailingLists.reduce((total, list) => 
    total + (list.contacts?.length || 0), 0
  );

  // Status configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return { icon: FileText, color: 'text-gray-600 bg-gray-100', bgColor: 'bg-gray-50' };
      case 'active':
        return { icon: Play, color: 'text-green-600 bg-green-100', bgColor: 'bg-green-50' };
      case 'paused':
        return { icon: Pause, color: 'text-yellow-600 bg-yellow-100', bgColor: 'bg-yellow-50' };
      case 'finished':
        return { icon: CheckCircle, color: 'text-blue-600 bg-blue-100', bgColor: 'bg-blue-50' };
      case 'scheduled':
        return { icon: Clock, color: 'text-purple-600 bg-purple-100', bgColor: 'bg-purple-50' };
      default:
        return { icon: AlertCircle, color: 'text-gray-600 bg-gray-100', bgColor: 'bg-gray-50' };
    }
  };

  const statusConfig = getStatusConfig(campaign.statut);
  const StatusIcon = statusConfig.icon;

  const handleLaunch = () => {
    if (!campaign) {
      toast.error('Campaign data not available');
      return;
    }
    
    if (campaign.statut !== 'draft') {
      toast.error('Only draft campaigns can be launched');
      return;
    }

    // Check requirements and show warning but allow user to proceed
    const missingRequirements = [];
    if (!campaign.id_modele) {
      missingRequirements.push('Message template');
    }
    if (campaignMailingLists.length === 0) {
      missingRequirements.push('Mailing lists');
    }

    if (missingRequirements.length > 0) {
      const requirements = missingRequirements.join(' and ');
      const confirmMessage = `This campaign is missing: ${requirements}.\n\nDo you want to proceed anyway? The system will validate all requirements and provide specific guidance if needed.`;
      
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }
    
    launchCampaignMutation.mutate(campaign.id_campagne, {
      onSuccess: () => {
        toast.success('Campaign launched successfully!');
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.detail || error.message || 'Failed to launch campaign';

        // Provide specific guidance based on the error
        if (errorMessage.includes('template')) {
          toast.error('❌ Campaign launch failed: Please assign a message template to this campaign before launching.');
        } else if (errorMessage.includes('mailing list')) {
          toast.error('❌ Campaign launch failed: Please assign at least one mailing list to this campaign before launching.');
        } else if (errorMessage.includes('No valid contacts')) {
          toast.error('❌ Campaign launch failed: No valid recipients found. Please check that your mailing lists contain opted-in contacts with valid phone numbers.');
        } else {
          toast.error(`❌ Launch failed: ${errorMessage}`);
        }
      }
    });
  };

  const handlePause = () => {
    if (!campaign) {
      toast.error('Campaign data not available');
      return;
    }
    
    if (campaign.statut !== 'active') {
      toast.error('Only active campaigns can be paused');
      return;
    }
    
    pauseCampaignMutation.mutate(campaign.id_campagne, {
      onSuccess: () => {
        toast.success('Campaign paused successfully!');
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.detail || error.message || 'Failed to pause campaign';
        toast.error(errorMessage);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/campaigns')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {campaign.nom_campagne}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Campaign ID: {campaign.id_campagne}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Action Buttons */}
              {campaign.statut === 'draft' && (
                <>
                  <button
                    onClick={handleLaunch}
                    disabled={launchCampaignMutation.isLoading}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {launchCampaignMutation.isLoading ? 'Launching...' : 'Launch Campaign'}
                  </button>
                  {(!campaign.id_modele || campaignMailingLists.length === 0) && (
                    <span className="text-sm text-amber-600 font-medium">
                      Missing requirements - see details below
                    </span>
                  )}
                </>
              )}
              
              {campaign.statut === 'active' && (
                <button
                  onClick={handlePause}
                  disabled={pauseCampaignMutation.isLoading}
                  className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  {pauseCampaignMutation.isLoading ? 'Pausing...' : 'Pause Campaign'}
                </button>
              )}
              
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* Status and Key Metrics */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Status Card */}
            <div className={`p-4 rounded-lg ${statusConfig.bgColor} border`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${statusConfig.color}`}>
                  <StatusIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                  <p className="text-lg font-semibold capitalize">{campaign.statut}</p>
                </div>
              </div>
            </div>

            {/* Type Card */}
            <div className="p-4 rounded-lg bg-blue-50 border">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Type</p>
                  <p className="text-lg font-semibold capitalize">{campaign.type_campagne.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            {/* Contacts Card */}
            <div className="p-4 rounded-lg bg-purple-50 border">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                  <p className="text-lg font-semibold">{totalContacts.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Mailing Lists Card */}
            <div className="p-4 rounded-lg bg-indigo-50 border">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Mailing Lists</p>
                  <p className="text-lg font-semibold">{campaignMailingLists.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'schedule', label: 'Schedule', icon: Calendar },
              { key: 'lists', label: 'Mailing Lists', icon: Mail },
              { key: 'template', label: 'Template', icon: FileText },
              { key: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Campaign Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Campaign Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium">{format(new Date(campaign.date_debut), 'PPP p')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Date:</span>
                      <span className="font-medium">{format(new Date(campaign.date_fin), 'PPP p')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{format(new Date(campaign.created_at || new Date()), 'PPP')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Template:</span>
                      <span className={`font-medium ${campaign.id_modele ? 'text-green-600' : 'text-red-600'}`}>
                        {campaign.id_modele ? `Template #${campaign.id_modele}` : 'Not assigned'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Launch Requirements Check */}
                  {campaign.statut === 'draft' && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <h4 className="text-sm font-medium text-amber-800 mb-2">Launch Requirements</h4>
                      <ul className="space-y-1 text-sm">
                        <li className={`flex items-center ${campaign.id_modele ? 'text-green-600' : 'text-red-600'}`}>
                          {campaign.id_modele ? (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          ) : (
                            <AlertCircle className="h-4 w-4 mr-2" />
                          )}
                          Message template {campaign.id_modele ? 'assigned' : 'required'}
                        </li>
                        <li className={`flex items-center ${campaignMailingLists.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {campaignMailingLists.length > 0 ? (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          ) : (
                            <AlertCircle className="h-4 w-4 mr-2" />
                          )}
                          Mailing lists {campaignMailingLists.length > 0 ? 'assigned' : 'required'}
                        </li>
                      </ul>
                      {(!campaign.id_modele || campaignMailingLists.length === 0) && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-amber-700">
                            Please assign the missing requirements before launching this campaign.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {!campaign.id_modele && (
                              <button
                                onClick={() => navigate('/templates')}
                                className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                              >
                                Go to Templates
                              </button>
                            )}
                            {campaignMailingLists.length === 0 && (
                              <button
                                onClick={() => navigate('/mailing-lists')}
                                className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                              >
                                Go to Mailing Lists
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Quick Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{totalContacts}</p>
                      <p className="text-sm text-gray-600">Recipients</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{campaignMailingLists.length}</p>
                      <p className="text-sm text-gray-600">Lists</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Campaign Schedule</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">Scheduled Period</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(campaign.date_debut), 'PPP p')} - {format(new Date(campaign.date_fin), 'PPP p')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lists' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Mailing Lists ({campaignMailingLists.length})</h3>
              {campaignMailingLists.length > 0 ? (
                <div className="space-y-3">
                  {campaignMailingLists.map(list => (
                    <div key={list.id_liste} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{list.nom_liste}</h4>
                          <p className="text-sm text-gray-600">{list.contacts?.length || 0} contacts</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          Created: {format(new Date(list.created_at || new Date()), 'PP')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No mailing lists assigned to this campaign</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'template' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Message Template</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {campaign.id_modele ? (
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium">Template ID: {campaign.id_modele}</p>
                      <p className="text-sm text-gray-600">Template assigned and ready</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No template assigned to this campaign</p>
                    <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Assign Template
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Campaign Settings</h3>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">General Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Campaign Type:</span>
                      <span className="capitalize">{campaign.type_campagne.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="capitalize">{campaign.statut}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conditional Components */}
      {campaign.statut === 'active' && <CampaignMonitor campaign={campaign} />}
      {(campaign.statut === 'finished' || campaign.statut === 'archived') && <CampaignAnalytics campaign={campaign} />}

      {/* Edit Campaign Modal */}
      <EditCampaignModal
        campaign={campaign}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
};

export default CampaignDetailPage;
