import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Smartphone, 
  Palette,
  Save,
  Eye,
  EyeOff,
  Check,
  X,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  campaignAlerts: boolean;
  systemUpdates: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
}

interface GeneralSettings {
  timezone: string;
  language: string;
  dateFormat: string;
}

interface SMSSettings {
  defaultSender: string;
  rateLimiting: number;
  deliveryReports: boolean;
  messageConcatenation: boolean;
}

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Use theme context instead of local state
  const { theme, setTheme } = useTheme();

  // Settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    campaignAlerts: true,
    systemUpdates: true,
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
  });

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    timezone: 'UTC',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
  });

  const [smsSettings, setSmsSettings] = useState<SMSSettings>({
    defaultSender: 'SMS-PLATFORM',
    rateLimiting: 100,
    deliveryReports: true,
    messageConcatenation: true,
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'sms', label: 'SMS Configuration', icon: Smartphone },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const handleSaveSettings = () => {
    // Here you would typically save to backend
    // The theme is automatically saved to localStorage by the ThemeContext
    toast.success('Settings saved successfully!');
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    // Here you would typically update password via API
    toast.success('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Timezone
        </label>
        <select
          value={generalSettings.timezone}
          onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time (ET)</option>
          <option value="America/Chicago">Central Time (CT)</option>
          <option value="America/Denver">Mountain Time (MT)</option>
          <option value="America/Los_Angeles">Pacific Time (PT)</option>
          <option value="Europe/London">London (GMT)</option>
          <option value="Europe/Paris">Paris (CET)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Language
        </label>
        <select
          value={generalSettings.language}
          onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="ar">Arabic</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Date Format
        </label>
        <select
          value={generalSettings.dateFormat}
          onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        >
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
        </select>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Change Password</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              placeholder="Confirm new password"
            />
          </div>

          <button
            onClick={handlePasswordChange}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      {Object.entries(notificationSettings).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between py-2">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {key === 'emailNotifications' && 'Email Notifications'}
              {key === 'smsNotifications' && 'SMS Notifications'}
              {key === 'campaignAlerts' && 'Campaign Alerts'}
              {key === 'systemUpdates' && 'System Updates'}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {key === 'emailNotifications' && 'Receive notifications via email'}
              {key === 'smsNotifications' && 'Receive notifications via SMS'}
              {key === 'campaignAlerts' && 'Get alerts about campaign status'}
              {key === 'systemUpdates' && 'Notifications about system maintenance'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => setNotificationSettings({
                ...notificationSettings,
                [key]: e.target.checked
              })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      ))}
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between py-2">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={securitySettings.twoFactorAuth}
            onChange={(e) => setSecuritySettings({
              ...securitySettings,
              twoFactorAuth: e.target.checked
            })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Session Timeout (minutes)
        </label>
        <input
          type="number"
          value={securitySettings.sessionTimeout}
          onChange={(e) => setSecuritySettings({
            ...securitySettings,
            sessionTimeout: parseInt(e.target.value)
          })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          min="5"
          max="120"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Password Expiry (days)
        </label>
        <input
          type="number"
          value={securitySettings.passwordExpiry}
          onChange={(e) => setSecuritySettings({
            ...securitySettings,
            passwordExpiry: parseInt(e.target.value)
          })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          min="30"
          max="365"
        />
      </div>
    </div>
  );

  const renderSMSSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Default Sender ID
        </label>
        <input
          type="text"
          value={smsSettings.defaultSender}
          onChange={(e) => setSmsSettings({
            ...smsSettings,
            defaultSender: e.target.value
          })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          placeholder="SMS-PLATFORM"
          maxLength={11}
        />
        <p className="text-xs text-gray-500 mt-1">Maximum 11 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Rate Limiting (messages per minute)
        </label>
        <input
          type="number"
          value={smsSettings.rateLimiting}
          onChange={(e) => setSmsSettings({
            ...smsSettings,
            rateLimiting: parseInt(e.target.value)
          })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          min="1"
          max="1000"
        />
      </div>

      <div className="flex items-center justify-between py-2">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">Delivery Reports</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">Receive delivery confirmations</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={smsSettings.deliveryReports}
            onChange={(e) => setSmsSettings({
              ...smsSettings,
              deliveryReports: e.target.checked
            })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="flex items-center justify-between py-2">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">Message Concatenation</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">Automatically split long messages</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={smsSettings.messageConcatenation}
            onChange={(e) => setSmsSettings({
              ...smsSettings,
              messageConcatenation: e.target.checked
            })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Theme
        </label>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'system', label: 'System', icon: Monitor }
          ].map((themeOption) => {
            const Icon = themeOption.icon;
            return (
              <button
                key={themeOption.value}
                onClick={() => {
                  setTheme(themeOption.value as 'light' | 'dark' | 'system');
                  toast.success(`Theme changed to ${themeOption.label}`);
                }}
                className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 hover:scale-105 ${
                  theme === themeOption.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-md'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
                }`}
              >
                <Icon className={`h-6 w-6 ${
                  theme === themeOption.value 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`} />
                <span className={`font-medium ${
                  theme === themeOption.value 
                    ? 'text-blue-700 dark:text-blue-300' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {themeOption.label}
                </span>
                {theme === themeOption.value && (
                  <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                    <Check className="h-3 w-3 mr-1" />
                    Active
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
          Choose how the interface appears. System will use your device's theme preference.
        </p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'account': return renderAccountSettings();
      case 'notifications': return renderNotificationSettings();
      case 'security': return renderSecuritySettings();
      case 'sms': return renderSMSSettings();
      case 'appearance': return renderAppearanceSettings();
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-lg shadow-lg">
        <div className="px-6 py-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-blue-100">Configure your application preferences and security settings.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:w-3/4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h2>
              <button
                onClick={handleSaveSettings}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>

            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
