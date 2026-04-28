import React, { useMemo } from 'react';
import { useTrades } from '../context/TradeContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3, TrendingUp, Compass, Smile, PieChart as PieChartIcon } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#6366f1', '#f43f5e'];

const Analytics: React.FC = () => {
  const { trades, settings } = useTrades();

  // 1. Strategy Analytics
  const strategyData = useMemo(() => {
    const map: { [key: string]: { name: string; pnl: number; wins: number; total: number; be: number } } = {};
    
    trades.forEach((t) => {
      if (!map[t.strategy]) {
        map[t.strategy] = { name: t.strategy, pnl: 0, wins: 0, total: 0, be: 0 };
      }
      const item = map[t.strategy];
      item.pnl += t.pnl;
      item.total++;
      if (t.status === 'WIN') item.wins++;
      if (t.status === 'BREAKEVEN') item.be++;
    });

    return Object.values(map)
      .map((item) => {
        const activeTrades = item.total - item.be;
        const winRate = activeTrades > 0 ? (item.wins / activeTrades) * 100 : 0;
        return {
          ...item,
          pnl: parseFloat(item.pnl.toFixed(2)),
          winRate: parseFloat(winRate.toFixed(1))
        };
      })
      .sort((a, b) => b.pnl - a.pnl);
  }, [trades]);

  // 2. Pair Performance
  const pairData = useMemo(() => {
    const map: { [key: string]: { name: string; pnl: number; total: number } } = {};
    
    trades.forEach((t) => {
      if (!map[t.pair]) {
        map[t.pair] = { name: t.pair, pnl: 0, total: 0 };
      }
      map[t.pair].pnl += t.pnl;
      map[t.pair].total++;
    });

    return Object.values(map)
      .map(item => ({
        ...item,
        pnl: parseFloat(item.pnl.toFixed(2))
      }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [trades]);

  // 3. Trading Session Breakdown
  const sessionData = useMemo(() => {
    const map: { [key: string]: { name: string; pnl: number; total: number } } = {
      'London': { name: 'London', pnl: 0, total: 0 },
      'New York': { name: 'New York', pnl: 0, total: 0 },
      'Tokyo': { name: 'Tokyo', pnl: 0, total: 0 },
      'Sydney': { name: 'Sydney', pnl: 0, total: 0 },
      'Other': { name: 'Other', pnl: 0, total: 0 }
    };
    
    trades.forEach((t) => {
      if (map[t.session]) {
        map[t.session].pnl += t.pnl;
        map[t.session].total++;
      }
    });

    return Object.values(map)
      .map(item => ({
        ...item,
        pnl: parseFloat(item.pnl.toFixed(2))
      }))
      .filter(item => item.total > 0);
  }, [trades]);

  // 4. Emotional Analytics
  const emotionData = useMemo(() => {
    const map: { [key: string]: { name: string; pnl: number; count: number } } = {};
    
    trades.forEach((t) => {
      if (!t.emotions) return;
      t.emotions.forEach((emotion) => {
        if (!map[emotion]) {
          map[emotion] = { name: emotion, pnl: 0, count: 0 };
        }
        map[emotion].pnl += t.pnl;
        map[emotion].count++;
      });
    });

    return Object.values(map)
      .map(item => ({
        ...item,
        pnl: parseFloat(item.pnl.toFixed(2))
      }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [trades]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const isPnl = typeof payload[0].value === 'number' && payload[0].dataKey === 'pnl';
      const valueStr = isPnl 
        ? `${settings.currency}${payload[0].value.toLocaleString()}`
        : `${payload[0].value}${payload[0].dataKey === 'winRate' ? '%' : ''}`;
        
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-xl text-xs font-mono">
          <p className="text-slate-400 mb-1">{label || payload[0].payload.name}</p>
          <p className={`font-bold ${isPnl && payload[0].value < 0 ? 'text-rose-400' : isPnl ? 'text-emerald-400' : 'text-sky-400'}`}>
            {payload[0].name}: {valueStr}
          </p>
          {payload[0].payload.total && (
            <p className="text-[10px] text-slate-500 mt-0.5">Total Trades: {payload[0].payload.total}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Row 1: Strategy Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Strategy PnL Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Strategy Profitability</h3>
          </div>
          <div className="h-[250px]">
            {strategyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={strategyData} margin={{ left: -15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} tickFormatter={(val) => `${settings.currency}${val}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="pnl" name="P&L" fill="#10b981">
                    {strategyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">No data available</div>
            )}
          </div>
        </div>

        {/* Strategy Win Rate Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Strategy Win Rates</h3>
          </div>
          <div className="h-[250px]">
            {strategyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={strategyData} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} tickFormatter={(val) => `${val}%`} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="winRate" name="Win Rate" fill="#0ea5e9">
                    {strategyData.map((entry, index) => {
                      const color = entry.winRate >= 60 ? '#10b981' : entry.winRate >= 40 ? '#0ea5e9' : '#f43f5e';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">No data available</div>
            )}
          </div>
        </div>

      </div>

      {/* Row 2: Asset & Session Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pair Performance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Compass className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Performance by Asset</h3>
          </div>
          <div className="h-[250px]">
            {pairData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pairData} margin={{ left: -15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#475569" fontSize={9} fontWeight="bold" tickLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} tickFormatter={(val) => `${settings.currency}${val}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="pnl" name="P&L">
                    {pairData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">No data available</div>
            )}
          </div>
        </div>

        {/* Session PnL Pie */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">P&L by Session</h3>
          </div>
          <div className="h-[200px] flex items-center justify-center relative">
            {sessionData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sessionData}
                      dataKey="pnl"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={40}
                      paddingAngle={3}
                    >
                      {sessionData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.pnl >= 0 ? COLORS[index % COLORS.length] : '#f43f5e'} 
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">No data available</div>
            )}
          </div>
          
          {/* Custom Legend for Sessions */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-2 text-[10px] font-medium font-mono">
            {sessionData.map((item, index) => (
              <div key={item.name} className="flex items-center">
                <span className="w-2.5 h-2.5 rounded mr-1.5" style={{ backgroundColor: item.pnl >= 0 ? COLORS[index % COLORS.length] : '#f43f5e' }}></span>
                <span className="text-slate-400">{item.name}</span>
                <span className={`ml-1 font-bold ${item.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ({item.pnl >= 0 ? '+' : ''}{settings.currency}{Math.round(item.pnl)})
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 3: Psychological Correlation Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Smile className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Psychology & Emotion Correlation</h3>
          </div>
          <p className="text-[10px] text-slate-400 max-w-sm text-right hidden md:block">
            Tracks total P&L accumulated during specific mindsets. Helps identify if emotions like FOMO or Impatience hurt your performance.
          </p>
        </div>

        <div className="h-[280px]">
          {emotionData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={emotionData}
                layout="vertical"
                margin={{ left: 40, right: 10, top: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#475569" fontSize={9} tickLine={false} tickFormatter={(val) => `${settings.currency}${val}`} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} fontWeight="bold" tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="pnl" name="Total P&L">
                  {emotionData.map((entry, index) => {
                    let color = '#3b82f6'; // default
                    if (entry.pnl > 0) color = '#10b981'; // green for profitable emotions
                    if (entry.pnl < 0) color = '#f43f5e'; // red for unprofitable emotions
                    
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No emotional data logged. Tag emotions when creating trades to unlock this chart!
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Analytics;
