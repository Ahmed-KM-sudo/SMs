import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import Layout from '../components/layout/Layout';
import ProtectedRoute from './ProtectedRoute';
import DashboardPage from '../pages/DashboardPage';
import CampaignsPage from '../pages/CampaignsPage';
import CampaignDetailPage from '../pages/CampaignDetailPage';

// Placeholder pages for other routes
const ContactsPage = () => <div>Contacts Page</div>;
const UsersPage = () => <div>Users Page</div>;
const SettingsPage = () => <div>Settings Page</div>;
const TemplatesPage = () => <div>Templates Page</div>; // Adding this one

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'campaigns', element: <CampaignsPage /> },
          { path: 'campaigns/:id', element: <CampaignDetailPage /> },
          { path: 'contacts', element: <ContactsPage /> },
          { path: 'templates', element: <TemplatesPage /> },
          {
            path: 'users',
            element: <ProtectedRoute allowedRoles={['admin']} />,
            children: [ { path: '', element: <UsersPage /> } ],
          },
          { path: 'settings', element: <SettingsPage /> },
          { path: '', element: <Navigate to="/dashboard" replace /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]);
