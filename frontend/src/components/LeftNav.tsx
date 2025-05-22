// frontend/src/components/LeftNav.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoImage from '../../assets/theHugoLogo.png';
import homeImage from '../../assets/homeImage.png';

export default function LeftNav() {
  const location = useLocation();
  
  const navItems = [
    { path: '/rooms', label: 'Room list', icon: homeImage }
  ];

  return (
    <nav className="w-64 h-screen bg-gray-800 text-white flex flex-col">
      {/* Hugo Hotel Logo/Brand */}
      <div className="p-6">
        <div className="flex justify-center">
          <img src={logoImage} alt="The Hugo logo" className="h-12 w-auto" />
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-6">
        <ul className="px-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center space-x-3 px-4 py-3 transition-colors duration-200 relative
                    ${isActive 
                      ? 'text-white border-l-4 border-red-600' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <img 
                    src={item.icon} 
                    alt="" 
                    className="w-5 h-5"
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}