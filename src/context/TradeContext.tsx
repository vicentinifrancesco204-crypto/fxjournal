import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Trade {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit: number;
  lotSize: number;
  pnl: number;
  rrRatio: number;
  plannedRR: number;
  date: string;
  time: string;
  session: 'London' | 'New York' | 'Tokyo' | 'Sydney' | 'Other';
  strategy: string;
  setup: string;
  emotions: string[];
  notes: string;
  screenshot?: string;
  status: 'WIN' | 'LOSS' | 'BREAKEVEN';
}

export interface TradingGoal {
  monthlyPnlGoal: number;
  weeklyTradesGoal: number;
  maxDailyLoss: number;
  maxDrawdown: number;
}

export interface UserSettings {
  username: string;
  avatar: string;
  accountBalance: number;
  initialBalance: number;
  currency: string;
  goals: TradingGoal;
}

interface TradeContextType {
  trades: Trade[];
  settings: UserSettings;
  addTrade: (trade: Omit<Trade, 'id' | 'pnl' | 'rrRatio' | 'plannedRR' | 'status'> & { pnl?: number; screenshot?: string }) => void;
  updateTrade: (id: string, trade: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  exportData: () => string;
  importData: (jsonData: string) => boolean;
  resetData: () => void;
  stats: {
    totalPnl: number;
    winRate: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    breakevenTrades: number;
    avgRR: number;
    avgPlannedRR: number;
    profitFactor: number;
    netReturn: number;
    largestWin: number;
    largestLoss: number;
    avgWin: number;
    avgLoss: number;
    consecutiveWins: number;
    consecutiveLosses: number;
    currentBalance: number;
  };
}

const defaultSettings: UserSettings = {
  username: 'TradersEdge',
  avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
  accountBalance: 10000,
  initialBalance: 10000,
  currency: '$',
  goals: {
    monthlyPnlGoal: 1000,
    weeklyTradesGoal: 10,
    maxDailyLoss: 200,
    maxDrawdown: 500
  }
};

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export const TradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const savedTrades = localStorage.getItem('fx_trades');
    const savedSettings = localStorage.getItem('fx_settings');

    if (savedTrades) {
      setTrades(JSON.parse(savedTrades));
    } else {
      setTrades([]);
      localStorage.setItem('fx_trades', JSON.stringify([]));
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    } else {
      localStorage.setItem('fx_settings', JSON.stringify(defaultSettings));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('fx_trades', JSON.stringify(trades));
    }
  }, [trades, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('fx_settings', JSON.stringify(settings));
    }
  }, [settings, isLoaded]);

  const addTrade = (tradeInput: Omit<Trade, 'id' | 'pnl' | 'rrRatio' | 'plannedRR' | 'status'> & { pnl?: number; screenshot?: string }) => {
    const { entryPrice, exitPrice, stopLoss, takeProfit, pair, type } = tradeInput;
    
    let status: 'WIN' | 'LOSS' | 'BREAKEVEN' = 'BREAKEVEN';
    let pnl = tradeInput.pnl !== undefined ? tradeInput.pnl : 0;
    
    const pipSize = pair.includes('JPY') ? 0.01 : (pair.includes('USD') && !pair.startsWith('XAU') && !pair.startsWith('BTC') && !pair.startsWith('ETH')) ? 0.0001 : 1;
    const slDiff = Math.abs(entryPrice - stopLoss) / pipSize;
    const tpDiff = Math.abs(takeProfit - entryPrice) / pipSize;
    const plannedRR = parseFloat((tpDiff / slDiff).toFixed(2)) || 0;
    
    const actualExitDiff = Math.abs(exitPrice - entryPrice) / pipSize;
    let rrRatio = parseFloat((actualExitDiff / slDiff).toFixed(2)) || 0;

    if (pnl > 0) {
      status = 'WIN';
    } else if (pnl < 0) {
      status = 'LOSS';
      rrRatio = -1; // Loss RR is usually just risk amount (-1R)
    } else {
      // If pnl is exactly zero, check prices
      const priceDiff = type === 'BUY' ? exitPrice - entryPrice : entryPrice - exitPrice;
      if (priceDiff > 0) {
        status = 'WIN';
      } else if (priceDiff < 0) {
        status = 'LOSS';
        rrRatio = -1;
      } else {
        status = 'BREAKEVEN';
        rrRatio = 0;
      }
    }

    const newTrade: Trade = {
      ...tradeInput,
      id: `trade_${Date.now()}`,
      pnl: pnl,
      rrRatio: isNaN(rrRatio) ? 0 : rrRatio,
      plannedRR: isNaN(plannedRR) ? 0 : plannedRR,
      status,
      emotions: tradeInput.emotions || [],
      notes: tradeInput.notes || ''
    };

    setTrades((prev) => [newTrade, ...prev]);
  };

  const updateTrade = (id: string, updatedFields: Partial<Trade>) => {
    setTrades((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        
        const merged = { ...t, ...updatedFields };
        const { entryPrice, exitPrice, stopLoss, takeProfit, pair, pnl, type } = merged;
        
        // Recalculate status and RR ratios
        let status: 'WIN' | 'LOSS' | 'BREAKEVEN' = 'BREAKEVEN';
        const pipSize = pair.includes('JPY') ? 0.01 : (pair.includes('USD') && !pair.startsWith('XAU') && !pair.startsWith('BTC') && !pair.startsWith('ETH')) ? 0.0001 : 1;
        
        const slDiff = Math.abs(entryPrice - stopLoss) / pipSize;
        const tpDiff = Math.abs(takeProfit - entryPrice) / pipSize;
        const plannedRR = parseFloat((tpDiff / slDiff).toFixed(2)) || 0;
        
        const actualExitDiff = Math.abs(exitPrice - entryPrice) / pipSize;
        let rrRatio = parseFloat((actualExitDiff / slDiff).toFixed(2)) || 0;

        if (pnl > 0) {
          status = 'WIN';
        } else if (pnl < 0) {
          status = 'LOSS';
          rrRatio = -1;
        } else {
          const priceDiff = type === 'BUY' ? exitPrice - entryPrice : entryPrice - exitPrice;
          if (priceDiff > 0) {
            status = 'WIN';
          } else if (priceDiff < 0) {
            status = 'LOSS';
            rrRatio = -1;
          } else {
            status = 'BREAKEVEN';
            rrRatio = 0;
          }
        }

        return {
          ...merged,
          status,
          plannedRR,
          rrRatio: isNaN(rrRatio) ? 0 : rrRatio
        };
      })
    );
  };

  const deleteTrade = (id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id));
  };

  const updateSettings = (updatedSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      // Deep merge for goals
      if (updatedSettings.goals) {
        return {
          ...prev,
          ...updatedSettings,
          goals: { ...prev.goals, ...updatedSettings.goals }
        };
      }
      return { ...prev, ...updatedSettings };
    });
  };

  const exportData = () => {
    const data = {
      trades,
      settings,
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  };

  const importData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.trades && Array.isArray(parsed.trades) && parsed.settings) {
        setTrades(parsed.trades);
        setSettings(parsed.settings);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to import data:', e);
      return false;
    }
  };

  const resetData = () => {
    setTrades([]);
    setSettings(defaultSettings);
    localStorage.setItem('fx_trades', JSON.stringify([]));
    localStorage.setItem('fx_settings', JSON.stringify(defaultSettings));
  };

  // Compute stats
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const totalTrades = trades.length;
  const winningTrades = trades.filter((t) => t.status === 'WIN').length;
  const losingTrades = trades.filter((t) => t.status === 'LOSS').length;
  const breakevenTrades = trades.filter((t) => t.status === 'BREAKEVEN').length;
  
  const winRate = totalTrades > 0 ? (winningTrades / (totalTrades - breakevenTrades || totalTrades)) * 100 : 0;
  
  const winningTradesList = trades.filter((t) => t.status === 'WIN');
  const losingTradesList = trades.filter((t) => t.status === 'LOSS');

  const totalWinPnl = winningTradesList.reduce((sum, t) => sum + t.pnl, 0);
  const totalLossPnl = Math.abs(losingTradesList.reduce((sum, t) => sum + t.pnl, 0));

  const avgWin = winningTrades > 0 ? totalWinPnl / winningTrades : 0;
  const avgLoss = losingTrades > 0 ? totalLossPnl / losingTrades : 0;
  const profitFactor = totalLossPnl > 0 ? totalWinPnl / totalLossPnl : totalWinPnl > 0 ? 99.9 : 0;

  const validRRTrades = trades.filter(t => t.status !== 'BREAKEVEN' && t.rrRatio !== 0);
  const avgRR = validRRTrades.length > 0
    ? validRRTrades.reduce((sum, t) => sum + (t.status === 'LOSS' ? -1 : t.rrRatio), 0) / validRRTrades.length
    : 0;

  const avgPlannedRR = trades.length > 0
    ? trades.reduce((sum, t) => sum + t.plannedRR, 0) / trades.length
    : 0;

  const netReturn = settings.initialBalance > 0 ? (totalPnl / settings.initialBalance) * 100 : 0;
  
  let largestWin = 0;
  let largestLoss = 0;
  trades.forEach(t => {
    if (t.pnl > largestWin) largestWin = t.pnl;
    if (t.pnl < largestLoss) largestLoss = t.pnl;
  });

  // Streaks
  let maxWinStreak = 0;
  let maxLossStreak = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;

  // Chronological order for streaks (oldest to newest)
  const chronoTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  chronoTrades.forEach(t => {
    if (t.status === 'WIN') {
      currentWinStreak++;
      currentLossStreak = 0;
      if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
    } else if (t.status === 'LOSS') {
      currentLossStreak++;
      currentWinStreak = 0;
      if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
    } else {
      // breakeven doesn't break streaks generally in some definitions, but let's reset or just let it be neutral. Let's make it neutral
    }
  });

  const currentBalance = settings.accountBalance + totalPnl;

  const stats = {
    totalPnl,
    winRate: parseFloat(winRate.toFixed(1)),
    totalTrades,
    winningTrades,
    losingTrades,
    breakevenTrades,
    avgRR: parseFloat(avgRR.toFixed(2)),
    avgPlannedRR: parseFloat(avgPlannedRR.toFixed(2)),
    profitFactor: parseFloat(profitFactor.toFixed(2)),
    netReturn: parseFloat(netReturn.toFixed(1)),
    largestWin: parseFloat(largestWin.toFixed(2)),
    largestLoss: parseFloat(largestLoss.toFixed(2)),
    avgWin: parseFloat(avgWin.toFixed(2)),
    avgLoss: parseFloat(avgLoss.toFixed(2)),
    consecutiveWins: maxWinStreak,
    consecutiveLosses: maxLossStreak,
    currentBalance: parseFloat(currentBalance.toFixed(2))
  };

  return (
    <TradeContext.Provider
      value={{
        trades,
        settings,
        addTrade,
        updateTrade,
        deleteTrade,
        updateSettings,
        exportData,
        importData,
        resetData,
        stats
      }}
    >
      {children}
    </TradeContext.Provider>
  );
};

export const useTrades = () => {
  const context = useContext(TradeContext);
  if (context === undefined) {
    throw new Error('useTrades must be used within a TradeProvider');
  }
  return context;
};
