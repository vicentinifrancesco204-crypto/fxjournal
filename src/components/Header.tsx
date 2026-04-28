import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Clock, Globe, ShieldCheck } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard Overview';
      case '/journal':
        return 'Trade Journal';
      case '/add-trade':
        return 'Record New Trade';
      case '/lot-calculator':
        return 'Position Size Calculator';
      case '/calendar':
        return 'Trading Calendar';
      case '/analytics':
        return 'Strategy & Performance Analytics';
      case '/settings':
        return 'Account & Settings';
      default:
        return 'FXJournal';
    }
  };

  // Simple calculation for market sessions in UTC
  const getSessionStatus = () => {
    const utcHour = time.getUTCHours();
    
    // Sydney: 22:00 - 07:00 UTC
    const sydneyOpen = utcHour >= 22 || utcHour < 7;
    // Tokyo: 00:00 - 09:00 UTC
    const tokyoOpen = utcHour >= 0 && utcHour < 9;
    // London: 08:00 - 17:00 UTC
    const londonOpen = utcHour >= 8 && utcHour < 17;
    // New York: 13:00 - 22:00 UTC
    const newYorkOpen = utcHour >= 13 && utcHour < 22;

    return {
      Sydney: sydneyOpen,
      Tokyo: tokyoOpen,
      London: londonOpen,
      'New York': newYorkOpen
    };
  };

  const sessions = getSessionStatus();

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 text-slate-300 sticky top-0 z-10 shadow-md">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-white tracking-tight">{getPageTitle()}</h1>
        <span className="hidden md:flex items-center gap-1 bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded border border-slate-700">
          <ShieldCheck className="w-3 h-3 text-emerald-400" /> Secure
        </span>
      </div>

      {/* Market Sessions & Time */}
      <div className="flex items-center gap-6">
        {/* Market Sessions */}
        <div className="hidden lg:flex items-center gap-3 border-r border-slate-800 pr-6">
          <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" /> Sessions (UTC):
          </span>
          {Object.entries(sessions).map(([name, isOpen]) => (
            <div 
              key={name} 
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-colors ${
                isOpen 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-slate-800/40 border-slate-800 text-slate-500'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
              {name}
            </div>
          ))}
        </div>

        {/* Live Clock */}
        <div className="flex items-center gap-4 bg-slate-950 px-4 py-1.5 rounded-lg border border-slate-800 text-sm">
          <div className="flex items-center gap-2 font-mono">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-slate-300 font-semibold">{time.toLocaleTimeString()}</span>
            <span className="text-slate-500 text-xs">LOCAL</span>
          </div>
          <div className="hidden sm:block border-l border-slate-800 h-4"></div>
          <div className="hidden sm:block font-mono text-xs text-slate-400">
            {time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
