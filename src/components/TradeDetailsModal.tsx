import React from 'react';
import { Trade, useTrades } from '../context/TradeContext';
import { 
  X, 
  Trash2, 
  Calendar, 
  Clock, 
  Tag, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  Maximize2
} from 'lucide-react';

interface TradeDetailsModalProps {
  trade: Trade;
  onClose: () => void;
}

const TradeDetailsModal: React.FC<TradeDetailsModalProps> = ({ trade, onClose }) => {
  const { deleteTrade, settings } = useTrades();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this trade from your journal? This action cannot be undone.')) {
      deleteTrade(trade.id);
      onClose();
    }
  };

  const isWin = trade.status === 'WIN';
  const isLoss = trade.status === 'LOSS';

  // Calculate pips captured/lost
  const pipSize = trade.pair.includes('JPY') ? 0.01 : (trade.pair.includes('USD') && !trade.pair.startsWith('XAU') && !trade.pair.startsWith('BTC') && !trade.pair.startsWith('ETH')) ? 0.0001 : 1;
  const pipDiff = trade.type === 'BUY' ? (trade.exitPrice - trade.entryPrice) / pipSize : (trade.entryPrice - trade.exitPrice) / pipSize;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{trade.pair}</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${trade.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {trade.type}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  isWin 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : isLoss 
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  {trade.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-3 mt-1.5 font-mono">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(trade.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {trade.time}</span>
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300 font-sans">{trade.session} SESSION</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Delete Trade"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Main Financial Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Profit / Loss</span>
              <span className={`text-xl font-bold font-mono block mt-1 ${isWin ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-slate-400'}`}>
                {trade.pnl >= 0 ? '+' : ''}{settings.currency}{trade.pnl.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 font-mono flex items-center gap-0.5 mt-1">
                {isWin ? <ArrowUpRight className="w-3 h-3" /> : isLoss ? <ArrowDownRight className="w-3 h-3" /> : null}
                {pipDiff >= 0 ? '+' : ''}{pipDiff.toFixed(1)} pips
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Lot Size</span>
              <span className="text-xl font-bold font-mono text-slate-300 block mt-1">{trade.lotSize}</span>
              <span className="text-[10px] text-slate-500 mt-1">Standard Lots</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Captured R:R</span>
              <span className={`text-xl font-bold font-mono block mt-1 ${isWin ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-slate-400'}`}>
                1 : {trade.rrRatio}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">Planned: 1 : {trade.plannedRR}</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Strategy</span>
              <span className="text-md font-bold text-sky-400 truncate block mt-2" title={trade.strategy}>
                {trade.strategy}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">Setup: {trade.setup}</span>
            </div>
          </div>

          {/* Execution Prices */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Execution Prices</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-mono">
              <div>
                <span className="text-xs text-slate-500 block">Entry Price</span>
                <span className="text-slate-200 font-semibold">{trade.entryPrice.toFixed(5)}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Exit Price</span>
                <span className="text-slate-200 font-semibold">{trade.exitPrice.toFixed(5)}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Stop Loss</span>
                <span className="text-rose-400/80 font-semibold">{trade.stopLoss.toFixed(5)}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Take Profit</span>
                <span className="text-emerald-400/80 font-semibold">{trade.takeProfit.toFixed(5)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Psychology */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Notes */}
            <div className="md:col-span-2 flex flex-col">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Trade Notes</h4>
              <div className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 whitespace-pre-wrap min-h-[120px]">
                {trade.notes || <em className="text-slate-600">No notes written for this trade entry.</em>}
              </div>
            </div>

            {/* Emotions */}
            <div className="flex flex-col">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Psychology Tags</h4>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex-1 flex flex-wrap gap-1.5 content-start">
                {trade.emotions && trade.emotions.length > 0 ? (
                  trade.emotions.map((emotion) => {
                    const isNegative = ['Anxious', 'Greedy', 'Fearful', 'Impatient', 'FOMO', 'Revenge'].includes(emotion);
                    return (
                      <span
                        key={emotion}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1 ${
                          isNegative
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        <Tag className="w-3 h-3" /> {emotion}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-xs text-slate-600 italic flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> No emotions logged
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Screenshot */}
          {trade.screenshot && (
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chart Screenshot</h4>
                <a 
                  href={trade.screenshot} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1 font-medium"
                >
                  <Maximize2 className="w-3 h-3" /> Open Full Image
                </a>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 overflow-hidden group relative">
                <img 
                  src={trade.screenshot} 
                  alt={`${trade.pair} screenshot`} 
                  className="w-full h-auto max-h-[400px] object-contain rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeDetailsModal;
