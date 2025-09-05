import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, Menu, X, LayoutDashboard, MessageSquare, Users, Settings, Phone } from 'lucide-react';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Campaigns', href: '/campaigns', icon: MessageSquare },
  { name: 'Contacts', href: '/contacts', icon: Phone },
  { name: 'Users', href: '/users', icon: Users, roles: ['admin'] },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-30 w-64 transition duration-300 ease-in-out transform bg-gray-800 text-white lg:translate-x-0 lg:static lg:inset-0",
        { 'translate-x-0': sidebarOpen, '-translate-x-full': !sidebarOpen }
      )}>
        <div className="flex items-center justify-center h-16 text-2xl font-bold">
          SMS Platform
        </div>
        <nav className="mt-5">
          {navigation.map((item) =>
            (!item.roles || (user && item.roles.includes(user.role))) && (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center px-4 py-2 mt-2 text-gray-300 hover:bg-gray-700 hover:text-white',
                    { 'bg-gray-900 text-white': isActive }
                  )
                }
              >
                <item.icon className="w-6 h-6" />
                <span className="mx-4">{item.name}</span>
              </NavLink>
            )
          )}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="flex items-center justify-between h-16 bg-white border-b border-gray-200 lg:justify-end">
          <button
            className="p-4 text-gray-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center pr-4">
            <span className="mr-4">Welcome, {user?.full_name}</span>
            <button onClick={logout} className="p-2 text-gray-500 hover:text-gray-700">
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;
