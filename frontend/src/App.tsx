import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CampaignsPage from './pages/CampaignsPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import ContactsPage from './pages/ContactsPage';
import TemplatesPage from './pages/TemplatesPage';
import AdminPage from './pages/AdminPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MessageLogsPage from './pages/MessageLogsPage';
import MessagesPage from './pages/MessagesPage';
import SmsQueuePage from './pages/SmsQueuePage';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/campaigns"
            element={
              <ProtectedRoute>
                <Layout>
                  <CampaignsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/campaigns/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <CampaignDetailPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/contacts"
            element={
              <ProtectedRoute>
                <Layout>
                  <ContactsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/templates"
            element={
              <ProtectedRoute>
                <Layout>
                  <TemplatesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
           <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Layout>
                  <AnalyticsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/message-logs"
            element={
              <ProtectedRoute>
                <Layout>
                  <MessageLogsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Layout>
                  <MessagesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sms-queue"
            element={
              <ProtectedRoute>
                <Layout>
                  <SmsQueuePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/message-logs"
            element={
              <ProtectedRoute>
                <Layout>
                  <MessageLogsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Layout>
                  <MessagesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sms-queue"
            element={
              <ProtectedRoute>
                <Layout>
                  <SmsQueuePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/message-logs"
            element={
              <ProtectedRoute>
                <Layout>
                  <MessageLogsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Layout>
                  <MessagesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sms-queue"
            element={
              <ProtectedRoute>
                <Layout>
                  <SmsQueuePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* Redirect from root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
