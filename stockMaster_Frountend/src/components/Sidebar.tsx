import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  Users, 
  MapPin, 
  History,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: LayoutDashboard,
    exact: true
  },
  { 
    name: 'Inventory', 
    href: '/inventory', 
    icon: Package,
    children: [
      { name: 'Products', href: '/inventory/products' },
      { name: 'Categories', href: '/inventory/categories' },
    ]
  },
  { 
    name: 'Stock', 
    href: '/stock', 
    icon: Warehouse,
    children: [
      { name: 'On Hand', href: '/stock/on-hand' },
      { name: 'Transfers', href: '/stock/transfers' },
      { name: 'Adjustments', href: '/stock/adjustments' },
    ]
  },
  { 
    name: 'Vendors', 
    href: '/vendors', 
    icon: Users,
    children: [
      { name: 'All Vendors', href: '/vendors' },
      { name: 'Add Vendor', href: '/vendors/new' },
    ]
  },
  { 
    name: 'Branches', 
    href: '/branches', 
    icon: MapPin,
    children: [
      { name: 'All Branches', href: '/branches' },
      { name: 'Add Branch', href: '/branches/new' },
    ]
  },
  { 
    name: 'History', 
    href: '/history', 
    icon: History,
    exact: true
  },
];

type NavItem = {
  name: string;
  href: string;
  icon: any;
  children?: Array<{ name: string; href: string }>;
  exact?: boolean;
};

const NavItem = ({ item }: { item: NavItem }) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isActive = item.exact 
    ? location.pathname === item.href
    : location.pathname.startsWith(item.href);

  const hasChildren = item.children && item.children.length > 0;
  
  return (
    <div className="space-y-1">
      <NavLink
        to={item.href}
        className={cn(
          'group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-md',
          isActive 
            ? 'bg-odoo-primary-50 text-odoo-primary-700 border-r-4 border-odoo-primary-500'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
        )}
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="flex items-center">
          <item.icon
            className={cn(
              'mr-3 h-5 w-5 flex-shrink-0',
              isActive ? 'text-odoo-primary-600' : 'text-gray-400 group-hover:text-gray-500'
            )}
            aria-hidden="true"
          />
          {item.name}
        </div>
        {hasChildren && (
          <ChevronDown
            className={cn(
              'ml-2 h-4 w-4 transform transition-transform',
              isExpanded ? 'rotate-180' : 'rotate-0'
            )}
          />
        )}
      </NavLink>
      
      {hasChildren && isExpanded && (
        <div className="pl-4 space-y-1">
          {item.children?.map((child) => {
            const isChildActive = location.pathname === child.href;
            return (
              <NavLink
                key={child.href}
                to={child.href}
                className={cn(
                  'group flex items-center px-4 py-2 text-sm font-medium rounded-md',
                  isChildActive
                    ? 'text-odoo-primary-600 bg-odoo-primary-50'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <span className="ml-6">{child.name}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
};

export function Sidebar() {
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
        {/* Logo */}
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-odoo-primary">
          <h1 className="text-xl font-bold text-white">StockMaster</h1>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-2">
            {navigation.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
