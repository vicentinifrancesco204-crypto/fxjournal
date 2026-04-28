import React, { useState, useMemo } from 'react';
import { useTrades, Trade } from '../context/TradeContext';
import TradeDetailsModal from '../components/TradeDetailsModal';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay,
  isToday
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle,
  Eye
} from 'lucide-react';

const CalendarPage: React.FC = () => {
  const { trades, settings } = useTrades();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Map trades to dates for easy lookup
  const tradesByDate = useMemo(() => {
    const map: { [key: string]: { trades: Trade[]; pnl: number; winCount: number; lossCount: number } } = {};
    
    trades.forEach((t) => {
      if (!map[t.date]) {
        map[t.date] = { trades: [], pnl: 0, winCount: 0, lossCount: 0 };
      }
      map[t.date].trades.push(t);
      map[t.date].pnl += t.pnl;
      if (t.status === 'WIN') map[t.date].winCount++;
      if (t.status === 'LOSS') map[t.date].lossCount++;
    });

    return map;
  }, [trades]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  // Trades for selected day
  const selectedDayTrades = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return tradesByDate[dateStr]?.trades || [];
  }, [selectedDate, tradesByDate]);

  const selectedDayStats = useMemo(() => {
    if (!selectedDate) return { pnl: 0, count: 0 };
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const dayData = tradesByDate[dateStr];
    return {
      pnl: dayData?.pnl || 0,
      count: dayData?.trades.length || 0
    };
  }, [selectedDate, tradesByDate]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar View */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-3 flex flex-col shadow-xl">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white font-sans">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={prevMonth}
                className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-xs font-bold text-slate-500 uppercase tracking-wider py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 flex-1 min-h-[400px]">
            {calendarDays.map((day, index) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayData = tradesByDate[dateStr];
              const hasTrades = !!dayData;
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isCurrentDay = isToday(day);
              
              let bgClass = 'bg-slate-950/40 border-slate-900/50 text-slate-600';
              
              if (isCurrentMonth) {
                bgClass = 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700';
                
                if (hasTrades) {
                  bgClass = dayData.pnl > 0 
                    ? 'bg-emerald-950/10 border-emerald-500/20 text-slate-300 hover:border-emerald-500/40' 
                    : dayData.pnl < 0
                    ? 'bg-rose-950/10 border-rose-500/20 text-slate-300 hover:border-rose-500/40'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600';
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-stretch p-1.5 rounded-xl border transition-all cursor-pointer text-left h-full ${bgClass} ${
                    isSelected ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/10 z-10' : ''
                  } ${isCurrentDay && !isSelected ? 'border-sky-500/50' : ''}`}
                >
                  <span className={`text-xs font-semibold font-mono ${
                    isCurrentDay ? 'bg-sky-500 text-slate-950 w-5 h-5 rounded-full flex items-center justify-center font-bold' : ''
                  } ${!isCurrentMonth ? 'opacity-30' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  
                  {isCurrentMonth && hasTrades && (
                    <div className="mt-auto pt-4 flex flex-col font-mono text-[10px] w-full">
                      <span className={`font-bold truncate ${dayData.pnl > 0 ? 'text-emerald-400' : dayData.pnl < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                        {dayData.pnl > 0 ? '+' : ''}{settings.currency}{Math.round(dayData.pnl)}
                      </span>
                      <div className="flex items-center gap-1 text-[8px] text-slate-500 mt-0.5">
                        <span className="text-emerald-500 font-semibold">{dayData.winCount}W</span>
                        <span>-</span>
                        <span className="text-rose-500 font-semibold">{dayData.lossCount}L</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Day Trades */}
        <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-4 h-full">
          {selectedDate ? (
            <>
              {/* Day Header */}
              <div className="border-b border-slate-800 pb-4 mb-4">
                <h3 className="text-sm font-bold text-white">
                  {format(selectedDate, 'eeee, MMM d')}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedDayStats.count > 0 
                    ? `Recorded ${selectedDayStats.count} trade${selectedDayStats.count > 1 ? 's' : ''}` 
                    : 'No trades recorded on this date'}
                </p>
                
                {selectedDayStats.count > 0 && (
                  <div className="mt-3 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 flex items-center justify-between font-mono">
                    <span className="text-xs text-slate-500">Daily P&L:</span>
                    <span className={`text-sm font-bold flex items-center gap-1 ${selectedDayStats.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {selectedDayStats.pnl >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {selectedDayStats.pnl >= 0 ? '+' : ''}{settings.currency}{selectedDayStats.pnl.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Trades List */}
              <div className="flex-1 overflow-y-auto space-y-2 max-h-[350px] lg:max-h-[500px] pr-1">
                {selectedDayTrades.length > 0 ? (
                  selectedDayTrades.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTrade(t)}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition-all cursor-pointer group flex items-center justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-200 font-mono tracking-tight">{t.pair}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${t.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {t.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 font-mono truncate max-w-[120px]">
                          {t.time} • {t.strategy}
                        </p>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <div className="flex flex-col font-mono text-xs">
                          <span className={`font-bold ${t.status === 'WIN' ? 'text-emerald-400' : t.status === 'LOSS' ? 'text-rose-400' : 'text-slate-400'}`}>
                            {t.pnl >= 0 ? '+' : ''}{settings.currency}{t.pnl.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-slate-500 text-right">1:{t.rrRatio} R:R</span>
                        </div>
                        <span className="text-slate-600 group-hover:text-emerald-400 transition-colors p-1 bg-slate-900 rounded border border-slate-800">
                          <Eye className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-40 flex flex-col items-center justify-center text-center text-slate-500 p-4 border border-dashed border-slate-800 rounded-xl">
                    <CheckCircle className="w-8 h-8 text-slate-700 mb-2 stroke-[1.5]" />
                    <p className="text-xs font-semibold">Trading Break</p>
                    <p className="text-[10px] text-slate-600 mt-1">No executions recorded for this day</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs text-center p-4">
              Select a date on the calendar to view its recorded trades
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedTrade && (
        <TradeDetailsModal
          trade={selectedTrade}
          onClose={() => setSelectedTrade(null)}
        />
      )}
    </div>
  );
};

export default CalendarPage;
