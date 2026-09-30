import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  
  // URL ko tod kar array banao
  // FILTER: 'community' word ko hata do taaki wo breadcrumb me na dikhe
  const pathnames = location.pathname.split('/').filter((x) => x && x !== 'community');

  return (
    <nav className="flex items-center text-sm text-slate-500 mb-2 overflow-x-auto whitespace-nowrap">
      <Link 
        to="/dashboard" 
        className="flex items-center hover:text-indigo-600 transition-colors shrink-0"
      >
        <Home size={16} className="mr-1.5" />
        Dashboard
      </Link>

      {pathnames.map((value, index) => {
        const to = location.pathname.split(value)[0] + value;
        const isLast = index === pathnames.length - 1;
        const displayName = value.replace(/-/g, ' '); 

        return (
          <React.Fragment key={to}>
            <ChevronRight size={14} className="mx-2 text-slate-400 shrink-0" />
            {isLast ? (
              <span className="text-slate-800 font-semibold capitalize cursor-default shrink-0">
                {displayName}
              </span>
            ) : (
              <Link 
                to={to} 
                className="hover:text-indigo-600 transition-colors capitalize font-medium shrink-0"
              >
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;