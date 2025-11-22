import { Search, Bell, User, LogOut, Settings, ChevronDown, Menu } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

type App = {
  name: string;
  icon: string;
  isActive: boolean;
};

type Notification = {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

export function Header({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const apps: App[] = [
    { name: 'Inventory', icon: '📦', isActive: true },
    { name: 'Sales', icon: '💰', isActive: false },
    { name: 'Purchase', icon: '🛒', isActive: false },
    { name: 'Manufacturing', icon: '🏭', isActive: false },
  ];

  const notifications: Notification[] = [
    {
      id: 1,
      title: 'Low Stock Alert',
      message: 'Product "Wireless Mouse" is running low on stock',
      time: '2h ago',
      read: false,
    },
    {
      id: 2,
      title: 'New Order',
      message: 'New order #12345 has been received',
      time: '4h ago',
      read: true,
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    // Handle logout logic here
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-30">
      <div className="flex h-full items-center justify-between px-4">
        {/* Left side - App Switcher and Search */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button 
            onClick={onMenuToggle}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* App Switcher */}
          <div className="hidden md:flex items-center">
            <div className="relative group">
              <button className="flex items-center text-sm font-medium text-gray-700 hover:text-odoo-primary">
                <span className="mr-1">📦</span>
                <span>Inventory</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <div className="hidden group-hover:block absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg py-1">
                {apps.map((app) => (
                  <a
                    key={app.name}
                    href="#"
                    className={`block px-4 py-2 text-sm ${
                      app.isActive
                        ? 'bg-odoo-primary-50 text-odoo-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{app.icon}</span>
                    {app.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:block ml-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-odoo-primary-500 focus:border-odoo-primary-500 sm:text-sm"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* Right side - User menu and notifications */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
                    <button className="text-xs text-odoo-primary hover:text-odoo-primary-700">
                      Mark all as read
                    </button>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-500">{notification.message}</p>
                          <p className="mt-1 text-xs text-gray-400">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">
                      No new notifications
                    </div>
                  )}
                </div>
                <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-center">
                  <a
                    href="#"
                    className="text-sm font-medium text-odoo-primary hover:text-odoo-primary-700"
                  >
                    View all notifications
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative ml-2">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center text-sm rounded-full focus:outline-none"
              id="user-menu"
              aria-haspopup="true"
            >
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-odoo-primary flex items-center justify-center text-white text-sm font-medium">
                JD
              </div>
              <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <div
                className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu"
              >
                <div className="py-1">
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <User className="inline-block h-4 w-4 mr-2 text-gray-400" />
                    My Profile
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <Settings className="inline-block h-4 w-4 mr-2 text-gray-400" />
                    Settings
                  </a>
                  <div className="border-t border-gray-100"></div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    role="menuitem"
                  >
                    <LogOut className="inline-block h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

