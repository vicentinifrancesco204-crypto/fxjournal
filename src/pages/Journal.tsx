import React, { useState, useMemo } from 'react';
import { useTrades, Trade } from '../context/TradeContext';
import TradeDetailsModal from '../components/TradeDetailsModal';
import { 
  Search, 
  Filter, 
  Calendar, 
  Eye, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight,
  ImageIcon,
  RefreshCw
} from 'lucide-react';

const Journal: React.FC = () => {
  const { trades, settings, deleteTrade } = useTrades();
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  // Filter states
  const [assetFilter, setAssetFilter] = useState('');
  const [strategyFilter, setStrategyFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sessionFilter, setSessionFilter] = useState('ALL');

  // Extract unique values for filters

  const uniqueStrategies = useMemo(() => {
    const strats = trades.map(t => t.strategy);
    return ['ALL', ...Array.from(new Set(strats))].sort();
  }, [trades]);

  // Apply filters
  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      const matchAsset = assetFilter === '' || t.pair.toLowerCase().includes(assetFilter.toLowerCase());
      const matchStrategy = strategyFilter === 'ALL' || t.strategy === strategyFilter;
      const matchType = typeFilter === 'ALL' || t.type === typeFilter;
      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchSession = sessionFilter === 'ALL' || t.session === sessionFilter;

      return matchAsset && matchStrategy && matchType && matchStatus && matchSession;
    });
  }, [trades, assetFilter, strategyFilter, typeFilter, statusFilter, sessionFilter]);

  const handleResetFilters = () => {
    setAssetFilter('');
    setStrategyFilter('ALL');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setSessionFilter('ALL');
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent opening modal
    if (window.confirm('Delete this trade entry? This action cannot be undone.')) {
      deleteTrade(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-slate-400 font-bold text-sm border-b border-slate-800 pb-2">
          <Filter className="w-4 h-4 text-emerald-400" />
          <span>Journal Filters</span>
          {filteredTrades.length !== trades.length && (
            <button 
              onClick={handleResetFilters}
              className="ml-auto text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer bg-slate-800 px-2 py-1 rounded"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Asset Search */}
          <div className="flex flex-col">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Search Asset</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search pair... e.g. EURUSD"
                value={assetFilter}
                onChange={(e) => setAssetFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder-slate-600 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Strategy Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Strategy</label>
            <select
              value={strategyFilter}
              onChange={(e) => setStrategyFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:border-emerald-500 outline-none"
            >
              <option value="ALL">All Strategies</option>
              {uniqueStrategies.filter(s => s !== 'ALL').map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Order Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:border-emerald-500 outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>

          {/* Outcome Status Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Outcome</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:border-emerald-500 outline-none"
            >
              <option value="ALL">All Outcomes</option>
              <option value="WIN">WIN</option>
              <option value="LOSS">LOSS</option>
              <option value="BREAKEVEN">BREAKEVEN</option>
            </select>
          </div>

          {/* Session Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Session</label>
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:border-emerald-500 outline-none"
            >
              <option value="ALL">All Sessions</option>
              <option value="London">London</option>
              <option value="New York">New York</option>
              <option value="Tokyo">Tokyo</option>
              <option value="Sydney">Sydney</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trades Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Showing {filteredTrades.length} of {trades.length} trades recorded
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          {filteredTrades.length > 0 ? (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-xs font-semibold bg-slate-950/80 px-6 font-sans">
                  <th className="py-4 px-6">Date / Time</th>
                  <th className="py-4 px-4">Asset</th>
                  <th className="py-4 px-4">Type</th>
                  <th className="py-4 px-4">Lot Size</th>
                  <th className="py-4 px-4">Strategy / Setup</th>
                  <th className="py-4 px-4">Outcome</th>
                  <th className="py-4 px-4">P&L</th>
                  <th className="py-4 px-4">R:R</th>
                  <th className="py-4 px-4">Media</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-xs font-medium">
                {filteredTrades.map((t) => {
                  const isWin = t.status === 'WIN';
                  const isLoss = t.status === 'LOSS';
                  
                  return (
                    <tr 
                      key={t.id} 
                      onClick={() => setSelectedTrade(t)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Date & Time */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-slate-300 font-bold">{new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" /> {t.time} 
                            <span className="bg-slate-800 px-1 py-0.5 rounded text-[8px] font-sans font-semibold border border-slate-700/50">{t.session}</span>
                          </span>
                        </div>
                      </td>

                      {/* Asset */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-200 text-sm font-mono tracking-tight">{t.pair}</span>
                      </td>

                      {/* Type */}
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                          {t.type}
                        </span>
                      </td>

                      {/* Lot Size */}
                      <td className="py-4 px-4 text-slate-400 font-mono text-xs">{t.lotSize.toFixed(2)}</td>

                      {/* Strategy / Setup */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col max-w-[140px]">
                          <span className="text-slate-300 font-semibold truncate" title={t.strategy}>{t.strategy}</span>
                          <span className="text-[10px] text-slate-500 mt-0.5 truncate">{t.setup}</span>
                        </div>
                      </td>

                      {/* Outcome */}
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isWin 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : isLoss 
                            ? 'bg-rose-500/10 text-rose-400' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {t.status}
                        </span>
                      </td>

                      {/* PnL */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className={`font-mono text-xs font-bold ${isWin ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-slate-400'}`}>
                            {t.pnl >= 0 ? '+' : ''}{settings.currency}{t.pnl.toLocaleString()}
                          </span>
                          {t.pnl !== 0 && (
                            <span className="text-[10px] font-mono text-slate-500 flex items-center gap-0.5">
                              {isWin ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                              {(((t.pnl / settings.initialBalance) * 100)).toFixed(2)}%
                            </span>
                          )}
                        </div>
                      </td>

                      {/* R:R Ratio */}
                      <td className="py-4 px-4 font-mono text-slate-300">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${isWin ? 'bg-emerald-500/10 text-emerald-400' : isLoss ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
                          1:{t.rrRatio}
                        </span>
                      </td>

                      {/* Media */}
                      <td className="py-4 px-4">
                        {t.screenshot ? (
                          <span className="text-emerald-500 bg-emerald-500/10 p-1.5 rounded-lg flex items-center w-max" title="Has Screenshot">
                            <ImageIcon className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="text-slate-600 p-1.5 rounded-lg flex items-center w-max" title="No media">
                            <ImageIcon className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTrade(t);
                            }}
                            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteClick(e, t.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                            title="Delete Trade"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
              <Search className="w-8 h-8 text-slate-600" />
              <p className="font-semibold text-slate-400">No trades match these filters</p>
              <button 
                onClick={handleResetFilters}
                className="text-xs text-emerald-400 hover:underline mt-1 cursor-pointer font-medium"
              >
                Clear all filters and try again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Render Details Modal */}
      {selectedTrade && (
        <TradeDetailsModal
          trade={selectedTrade}
          onClose={() => setSelectedTrade(null)}
        />
      )}
    </div>
  );
};

export default Journal;
