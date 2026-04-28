import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTrades } from '../context/TradeContext';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  PlusCircle, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Settings, 
  LogOut,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calculator
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { stats, settings } = useTrades();
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Trade Journal', icon: BookOpen, path: '/journal' },
    { name: 'Add Trade', icon: PlusCircle, path: '/add-trade' },
    { name: 'Lot Calculator', icon: Calculator, path: '/lot-calculator' },
    { name: 'Calendar', icon: CalendarIcon, path: '/calendar' },
    { name: 'Analytics', icon: BarChart3, path: '/analytics' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0 z-20 text-slate-300">
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2 font-bold text-xl text-emerald-400">
        <TrendingUp className="w-6 h-6 stroke-[2.5]" />
        <span>FX<span className="text-white font-normal">Journal</span></span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`
              }
            >
              <Icon className="w-5 h-5 mr-3 group-hover:scale-105 transition-transform" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Account Overview */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <Wallet className="w-3.5 h-3.5 text-slate-400" />
            <span>Account Status</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Balance</span>
              <span className="font-mono text-sm font-semibold text-white">
                {settings.currency}{stats.currentBalance.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Net P&L</span>
              <span className={`font-mono text-sm font-semibold flex items-center gap-1 ${stats.totalPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stats.totalPnl >= 0 ? '+' : ''}
                {settings.currency}{stats.totalPnl.toLocaleString()}
                {stats.totalPnl >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">Win Rate</span>
              <span className="font-mono text-sm font-semibold text-sky-400">
                {stats.winRate}%
              </span>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between mt-4 px-1">
          <div className="flex items-center gap-3">
            <img 
              src={settings.avatar} 
              alt={settings.username} 
              className="w-9 h-9 rounded-full border border-emerald-500/30 object-cover"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-200 truncate max-w-[120px]">{settings.username}</span>
              <span className="text-xs text-slate-500">Live Account</span>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
