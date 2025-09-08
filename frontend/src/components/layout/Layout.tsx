import React, { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { LogOut, LayoutDashboard, MessageSquare, List, Settings, Users, FileText, Monitor, BarChart2, UserCheck, Sun, Moon, Palette } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const NavItem = ({ to, icon, children }: { to: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center p-2 text-base font-normal rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-white'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
      }`
    }
  >
    {icon}
    <span className="ml-3">{children}</span>
  </NavLink>
);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme, effectiveTheme } = useTheme();

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
        <div className="h-16 flex items-center justify-center font-bold text-xl border-b dark:border-gray-700">
          <span>SMS Platform</span>
        </div>
        <nav className="mt-6 px-4 flex-1">
          <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />}>Dashboard</NavItem>
          <NavItem to="/campaigns" icon={<MessageSquare size={20} />}>Campaigns</NavItem>
          <NavItem to="/analytics" icon={<BarChart2 size={20} />}>Analytics</NavItem>
          <NavItem to="/contacts" icon={<Users size={20} />}>Contacts</NavItem>
          <NavItem to="/contact-lists" icon={<UserCheck size={20} />}>Contact Lists</NavItem>
          <NavItem to="/templates" icon={<FileText size={20} />}>Templates</NavItem>
          <NavItem to="/mailing-lists" icon={<List size={20} />}>Mailing Lists</NavItem>
          {/* Add more navigation items here */}
        </nav>
        <div className="p-4 border-t dark:border-gray-700">
          {user?.role === 'admin' && (
            <NavItem to="/admin" icon={<Monitor size={20} />}>Task Monitor</NavItem>
          )}
           <NavItem to="/settings" icon={<Settings size={20} />}>Settings</NavItem>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between px-6">
          <div>
            {/* This could be dynamic based on the page */}
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={cycleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={`Current theme: ${theme} (click to cycle)`}
            >
              {effectiveTheme === 'dark' ? (
                <Moon size={20} className="text-blue-500" />
              ) : (
                <Sun size={20} className="text-orange-500" />
              )}
            </button>
            {user && (
              <div className="text-right">
                <p className="font-semibold text-sm">{user.nom_agent}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            )}
            <button
              onClick={logout}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
