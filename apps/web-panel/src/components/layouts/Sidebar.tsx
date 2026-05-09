import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItem {
  label: string;
  href: string;
  icon?: string;
  roles?: string[];
}

const sidebarItems: SidebarItem[] = [
  { label: 'الرئيسية', href: '/dashboard', icon: '🏠' },
  { label: 'الحجوزات', href: '/bookings', icon: '📅' },
  { label: 'العملاء', href: '/customers', icon: '👥' },
  { label: 'السيارات', href: '/vehicles', icon: '🚗' },
  { label: 'الميكانيكيين', href: '/mechanics', icon: '🔧' },
  { label: 'الفواتير', href: '/invoices', icon: '💰' },
  { label: 'المخزون', href: '/inventory', icon: '📦' },
  { label: 'الإعدادات', href: '/settings', icon: '⚙️' },
];

export const Sidebar: React.FC<{ userRole?: string }> = ({ userRole }) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredItems = sidebarItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(userRole || '');
  });

  return (
    <div className={`bg-gray-900 text-white min-h-screen transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-4 border-b border-gray-800">
        <h1 className={`font-bold text-xl ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? '🚗' : 'نظام الكراج'}
        </h1>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {filteredItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center space-x-3 space-x-reverse px-4 py-2 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                {item.icon && <span>{item.icon}</span>}
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute bottom-4 right-4 text-gray-400 hover:text-white"
      >
        {isCollapsed ? '→' : '←'}
      </button>
    </div>
  );
};
