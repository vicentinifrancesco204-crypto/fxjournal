import React, { useState } from 'react';
import { useTrades } from '../context/TradeContext';
import { 
  User, 
  Settings as SettingsIcon, 
  Wallet, 
  Target, 
  Download, 
  Upload, 
  RefreshCw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const avatars = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
];

const Settings: React.FC = () => {
  const { settings, updateSettings, exportData, importData, resetData, stats } = useTrades();

  const [username, setUsername] = useState(settings.username);
  const [avatar, setAvatar] = useState(settings.avatar);
  const [initialBalance, setInitialBalance] = useState(settings.initialBalance.toString());
  const [accountBalance, setAccountBalance] = useState(settings.accountBalance.toString());
  const [currency, setCurrency] = useState(settings.currency);

  const [monthlyPnlGoal, setMonthlyPnlGoal] = useState(settings.goals.monthlyPnlGoal.toString());
  const [weeklyTradesGoal, setWeeklyTradesGoal] = useState(settings.goals.weeklyTradesGoal.toString());
  const [maxDailyLoss, setMaxDailyLoss] = useState(settings.goals.maxDailyLoss.toString());
  const [maxDrawdown, setMaxDrawdown] = useState(settings.goals.maxDrawdown.toString());

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    const initialBalNum = parseFloat(initialBalance) || settings.initialBalance;
    const accountBalNum = parseFloat(accountBalance) || settings.accountBalance;

    updateSettings({
      username: username.trim() || settings.username,
      avatar,
      initialBalance: initialBalNum,
      accountBalance: accountBalNum,
      currency: currency.trim() || settings.currency
    });

    triggerSuccess();
  };

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();

    updateSettings({
      goals: {
        monthlyPnlGoal: parseFloat(monthlyPnlGoal) || settings.goals.monthlyPnlGoal,
        weeklyTradesGoal: parseInt(weeklyTradesGoal) || settings.goals.weeklyTradesGoal,
        maxDailyLoss: parseFloat(maxDailyLoss) || settings.goals.maxDailyLoss,
        maxDrawdown: parseFloat(maxDrawdown) || settings.goals.maxDrawdown
      }
    });

    triggerSuccess();
  };

  const triggerSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportData = () => {
    const dataStr = exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fxjournal_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const success = importData(event.target?.result as string);
        if (success) {
          alert('Database restored successfully! All journal records and settings have been imported.');
          window.location.reload(); // Reload to refresh everything
        } else {
          alert('Failed to import file. Make sure it is a valid FXJournal backup file (.json).');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetData = () => {
    if (window.confirm('WARNING: Are you sure you want to reset all journal data? This will wipe all recorded trades and settings, and restore factory mock data. This action CANNOT be undone!')) {
      resetData();
      alert('Application has been reset to factory state.');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-emerald-400 flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Settings saved successfully! Your dashboard and journal have been updated.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Left Column - Profile & Account */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-2 text-white font-bold border-b border-slate-800 pb-3">
              <User className="w-4 h-4 text-emerald-400" />
              <h3>User Profile & Account Capital</h3>
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Choose Avatar</label>
              <div className="flex gap-3 flex-wrap">
                {avatars.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setAvatar(url)}
                    className={`w-12 h-12 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${
                      avatar === url ? 'border-emerald-500 ring-2 ring-emerald-500/20 scale-105' : 'border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <img src={url} alt="Avatar option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Username */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Traders Name</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white"
                  placeholder="Trader"
                  required
                />
              </div>

              {/* Currency Symbol */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Currency Symbol</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white font-mono"
                  placeholder="$"
                  maxLength={3}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Initial Balance */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Wallet className="w-3 h-3" /> Initial Funded Balance
                </label>
                <input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white font-mono"
                  placeholder="10000"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1">Starting capital for net return % calculation</span>
              </div>

              {/* Base Deposits/Additions */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Wallet className="w-3 h-3" /> Deposits / Adjustments
                </label>
                <input
                  type="number"
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white font-mono"
                  placeholder="10000"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1">Current base funds (Current balance = Deposits + P&L)</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-emerald-500/5 active:scale-95"
              >
                Save Profile
              </button>
            </div>
          </form>

          {/* Risk Goals Form */}
          <form onSubmit={handleSaveGoals} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-white font-bold border-b border-slate-800 pb-3">
              <Target className="w-4 h-4 text-sky-400" />
              <h3>Trading Goals & Risk Rules</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Monthly P&L Goal ({currency})</label>
                <input
                  type="number"
                  value={monthlyPnlGoal}
                  onChange={(e) => setMonthlyPnlGoal(e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white font-mono"
                  placeholder="1000"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Trades / Week Goal</label>
                <input
                  type="number"
                  value={weeklyTradesGoal}
                  onChange={(e) => setWeeklyTradesGoal(e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white font-mono"
                  placeholder="10"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Max Daily Loss Limit ({currency})</label>
                <input
                  type="number"
                  value={maxDailyLoss}
                  onChange={(e) => setMaxDailyLoss(e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-rose-400 font-mono border-rose-950/10"
                  placeholder="200"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Max Account Drawdown ({currency})</label>
                <input
                  type="number"
                  value={maxDrawdown}
                  onChange={(e) => setMaxDrawdown(e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-rose-400 font-mono border-rose-950/10"
                  placeholder="500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="submit"
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm transition-all cursor-pointer active:scale-95 shadow-lg shadow-sky-500/5"
              >
                Save Goals
              </button>
            </div>
          </form>

        </div>

        {/* Right Column - Critical Operations */}
        <div className="space-y-6">
          
          {/* Data Management File Ops */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center gap-2 text-white font-bold border-b border-slate-800 pb-3 mb-4">
              <SettingsIcon className="w-4 h-4 text-slate-400" />
              <h3>Data & Backups</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Your journal data is stored locally in your browser cache. For safety, export your data to a physical file regularly as a hard backup.
            </p>

            <div className="space-y-3">
              {/* Export Button */}
              <button
                onClick={handleExportData}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                Export Journal (.json)
              </button>

              {/* Import Button */}
              <label className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer text-center">
                <Upload className="w-4 h-4 text-sky-400" />
                Import Backup File
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset Application */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col border-rose-950/20">
            <div className="flex items-center gap-2 text-rose-400 font-bold border-b border-slate-800 pb-3 mb-4">
              <AlertTriangle className="w-4 h-4" />
              <h3>Factory Reset</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Wipes all customized data, trades, and configurations completely. Re-seeds the system with simulated trades to start fresh or run demos.
            </p>

            <button
              onClick={handleResetData}
              className="w-full bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-slate-950 border border-rose-500/20 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Reset All Journal Data
            </button>
          </div>

          {/* Mini Statistics Review */}
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 shadow-inner flex flex-col gap-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Gross Wins</span>
              <span className="text-emerald-500 font-bold">+{currency}{(stats.avgWin * stats.winningTrades).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Gross Losses</span>
              <span className="text-rose-500 font-bold">-{currency}{(stats.avgLoss * stats.losingTrades).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-slate-900 pt-1.5 font-sans font-bold">
              <span className="text-slate-400">Streak (Max)</span>
              <span className="text-white">{stats.consecutiveWins}W / {stats.consecutiveLosses}L</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Settings;
