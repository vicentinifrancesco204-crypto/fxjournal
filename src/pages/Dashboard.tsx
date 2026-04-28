import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrades } from '../context/TradeContext';
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  BarChart, 
  Activity, 
  Calendar,
  AlertCircle,
  PlusCircle,
  ArrowRight
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { trades, stats, settings } = useTrades();
  const navigate = useNavigate();

  // Equity curve data (chronological cumulative P&L)
  const equityData = useMemo(() => {
    const data: { name: string; balance: number }[] = [
      { name: 'Start', balance: settings.initialBalance }
    ];
    
    let currentBal = settings.initialBalance;
    const sortedTrades = [...trades].sort((a, b) => 
      new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
    );

    sortedTrades.forEach((t) => {
      currentBal += t.pnl;
      data.push({
        name: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        balance: parseFloat(currentBal.toFixed(2))
      });
    });

    return data;
  }, [trades, settings.initialBalance]);

  // Distribution data for Pie Chart
  const pieData = useMemo(() => {
    return [
      { name: 'Wins', value: stats.winningTrades, color: '#10b981' },
      { name: 'Losses', value: stats.losingTrades, color: '#f43f5e' },
      { name: 'Breakeven', value: stats.breakevenTrades, color: '#64748b' }
    ].filter(item => item.value > 0);
  }, [stats]);

  // Find best performing asset & strategy
  const performanceInsights = useMemo(() => {
    if (trades.length === 0) return { bestPair: '-', bestStrategy: '-' };

    const pairPnl: { [key: string]: number } = {};
    const strategyPnl: { [key: string]: number } = {};

    trades.forEach((t) => {
      pairPnl[t.pair] = (pairPnl[t.pair] || 0) + t.pnl;
      strategyPnl[t.strategy] = (strategyPnl[t.strategy] || 0) + t.pnl;
    });

    let bestPair = '-';
    let maxPairPnl = -Infinity;
    Object.entries(pairPnl).forEach(([pair, pnl]) => {
      if (pnl > maxPairPnl) {
        maxPairPnl = pnl;
        bestPair = pair;
      }
    });

    let bestStrategy = '-';
    let maxStratPnl = -Infinity;
    Object.entries(strategyPnl).forEach(([strat, pnl]) => {
      if (pnl > maxStratPnl) {
        maxStratPnl = pnl;
        bestStrategy = strat;
      }
    });

    return {
      bestPair: maxPairPnl > 0 ? `${bestPair} (+${settings.currency}${maxPairPnl.toLocaleString()})` : '-',
      bestStrategy: maxStratPnl > 0 ? `${bestStrategy} (+${settings.currency}${maxStratPnl.toLocaleString()})` : '-'
    };
  }, [trades, settings.currency]);

  const recentTrades = useMemo(() => {
    return [...trades]
      .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime())
      .slice(0, 5);
  }, [trades]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-xl text-xs font-mono">
          <p className="text-slate-400 mb-1">{payload[0].payload.name}</p>
          <p className="font-semibold text-white">
            Balance: <span className="text-emerald-400">{settings.currency}{payload[0].value.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <h2 className="text-2xl font-bold text-white">Welcome back, {settings.username}</h2>
          <p className="text-slate-400 text-sm mt-1">
            Your account is up <span className="text-emerald-500 font-semibold">{stats.netReturn}%</span> overall. 
            Keep strictly following your trading rules!
          </p>
        </div>
        <button
          onClick={() => navigate('/add-trade')}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/10 transition-all active:scale-95 cursor-pointer flex-shrink-0 self-start sm:self-center"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          Record Trade
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total PnL */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Total Net Profit</span>
            <span className={`p-2 rounded-lg ${stats.totalPnl >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {stats.totalPnl >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </span>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl font-bold font-mono ${stats.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {stats.totalPnl >= 0 ? '+' : ''}
              {settings.currency}{stats.totalPnl.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Activity className="w-3 h-3" /> Net growth of {stats.netReturn}%
            </p>
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Win Rate</span>
            <span className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Award className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold font-mono text-sky-400">
              {stats.winRate}%
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {stats.winningTrades}W - {stats.losingTrades}L - {stats.breakevenTrades}BE
            </p>
          </div>
        </div>

        {/* Average R:R */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Average R:R</span>
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <BarChart className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold font-mono text-indigo-400">
              1 : {stats.avgRR}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Avg Planned: 1 : {stats.avgPlannedRR}
            </p>
          </div>
        </div>

        {/* Profit Factor */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Profit Factor</span>
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Activity className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl font-bold font-mono ${stats.profitFactor >= 1.5 ? 'text-emerald-400' : stats.profitFactor >= 1 ? 'text-amber-400' : 'text-rose-400'}`}>
              {stats.profitFactor}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {stats.profitFactor >= 1.5 ? 'Excellent' : stats.profitFactor >= 1 ? 'Profitable' : 'Needs Work'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Equity Curve</h3>
              <p className="text-xs text-slate-400">Cumulative account balance including initial funding</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Current Balance</span>
              <span className="text-xl font-bold font-mono text-white">{settings.currency}{stats.currentBalance.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            {trades.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    stroke="#475569" 
                    fontSize={10}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false}
                    domain={['auto', 'auto']}
                    dx={-10}
                    tickFormatter={(val) => `${settings.currency}${val}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorBalance)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                <AlertCircle className="w-8 h-8 text-slate-600" />
                <p className="text-sm">No trades recorded yet. Start journaling!</p>
              </div>
            )}
          </div>
        </div>

        {/* Outcomes Distribution & Performance Insights */}
        <div className="flex flex-col gap-6">
          {/* Outcome Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-[220px]">
            <h3 className="text-sm font-bold text-white mb-2">Trade Outcomes</h3>
            <div className="flex-1 flex items-center">
              {trades.length > 0 ? (
                <>
                  <div className="w-1/2 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 flex flex-col gap-2 pl-4">
                    {pieData.map((entry) => (
                      <div key={entry.name} className="flex items-center text-xs">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
                        <span className="text-slate-400 flex-1">{entry.name}</span>
                        <span className="font-mono font-semibold text-white">
                          {entry.value} ({((entry.value / stats.totalTrades) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="w-full text-center text-slate-500 text-xs">No data available</div>
              )}
            </div>
          </div>

          {/* Quick Insights */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex-1">
            <h3 className="text-sm font-bold text-white mb-4">Quick Insights</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Best Asset</h4>
                  <p className="text-sm font-semibold text-white mt-0.5">{performanceInsights.bestPair}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 mt-0.5">
                  <BarChart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Best Strategy</h4>
                  <p className="text-sm font-semibold text-white mt-0.5 truncate max-w-[200px]">{performanceInsights.bestStrategy}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400 mt-0.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Largest Win</h4>
                  <p className="text-sm font-semibold text-emerald-400 font-mono mt-0.5">+{settings.currency}{stats.largestWin.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Trades Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Recent Trades</h3>
            <p className="text-xs text-slate-400">Your latest logged entries</p>
          </div>
          <button 
            onClick={() => navigate('/journal')}
            className="text-emerald-400 hover:text-emerald-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
          >
            View Full Journal <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          {recentTrades.length > 0 ? (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold bg-slate-950 px-6">
                  <th className="py-4 px-6">Date / Time</th>
                  <th className="py-4 px-4">Asset</th>
                  <th className="py-4 px-4">Type</th>
                  <th className="py-4 px-4">Lot Size</th>
                  <th className="py-4 px-4">Strategy</th>
                  <th className="py-4 px-4">P&L</th>
                  <th className="py-4 px-4">R:R</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm">
                {recentTrades.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-200">{new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" /> {t.time} <span className="bg-slate-800 px-1 py-0.5 rounded text-[10px]">{t.session}</span>
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-300">{t.pair}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-400">{t.lotSize}</td>
                    <td className="py-4 px-4 text-slate-300 font-medium truncate max-w-[140px]">{t.strategy}</td>
                    <td className="py-4 px-4">
                      <span className={`font-mono font-bold ${t.status === 'WIN' ? 'text-emerald-500' : t.status === 'LOSS' ? 'text-rose-500' : 'text-slate-400'}`}>
                        {t.pnl >= 0 ? '+' : ''}{settings.currency}{t.pnl.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${t.status === 'WIN' ? 'bg-emerald-500/10 text-emerald-400' : t.status === 'LOSS' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
                        1:{t.rrRatio}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-500">
              No trades available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
