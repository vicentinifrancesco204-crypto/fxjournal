import React, { useState, useMemo } from 'react';
import {
  Calculator,
  DollarSign,
  Percent,
  Target,
  TrendingUp,
  ShieldAlert,
  Copy,
  CheckCircle2,
  Info,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

interface PairConfig {
  label: string;
  pipValuePerLot: number;
  pipSize: number;
  category: string;
}

const pairConfigs: { [key: string]: PairConfig } = {
  'EURUSD': { label: 'EUR/USD', pipValuePerLot: 10, pipSize: 0.0001, category: 'Major' },
  'GBPUSD': { label: 'GBP/USD', pipValuePerLot: 10, pipSize: 0.0001, category: 'Major' },
  'AUDUSD': { label: 'AUD/USD', pipValuePerLot: 10, pipSize: 0.0001, category: 'Major' },
  'NZDUSD': { label: 'NZD/USD', pipValuePerLot: 10, pipSize: 0.0001, category: 'Major' },
  'USDJPY': { label: 'USD/JPY', pipValuePerLot: 6.50, pipSize: 0.01, category: 'Major' },
  'EURJPY': { label: 'EUR/JPY', pipValuePerLot: 6.50, pipSize: 0.01, category: 'Cross' },
  'GBPJPY': { label: 'GBP/JPY', pipValuePerLot: 6.50, pipSize: 0.01, category: 'Cross' },
  'USDCAD': { label: 'USD/CAD', pipValuePerLot: 7.40, pipSize: 0.0001, category: 'Major' },
  'USDCHF': { label: 'USD/CHF', pipValuePerLot: 11.30, pipSize: 0.0001, category: 'Major' },
  'EURGBP': { label: 'EUR/GBP', pipValuePerLot: 12.70, pipSize: 0.0001, category: 'Cross' },
  'XAUUSD': { label: 'XAU/USD (Gold)', pipValuePerLot: 10, pipSize: 0.10, category: 'Commodity' },
  'BTCUSD': { label: 'BTC/USD', pipValuePerLot: 1, pipSize: 1, category: 'Crypto' },
  'ETHUSD': { label: 'ETH/USD', pipValuePerLot: 0.10, pipSize: 0.01, category: 'Crypto' },
};

const riskPresets = [
  { label: '0.5%', value: 0.5, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  { label: '1%', value: 1.0, color: 'text-sky-400 border-sky-500/30 bg-sky-500/10' },
  { label: '2%', value: 2.0, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  { label: '3%', value: 3.0, color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
];

const LotCalculator: React.FC = () => {
  const [balance, setBalance] = useState('10000');
  const [riskPercent, setRiskPercent] = useState('1');
  const [pair, setPair] = useState('EURUSD');
  const [stopLossPips, setStopLossPips] = useState('');
  const [takeProfitPips, setTakeProfitPips] = useState('');
  const [copied, setCopied] = useState(false);

  const config = pairConfigs[pair];

  const result = useMemo(() => {
    const bal = parseFloat(balance) || 0;
    const risk = parseFloat(riskPercent) || 0;
    const sl = parseFloat(stopLossPips) || 0;
    const tp = parseFloat(takeProfitPips) || 0;

    if (bal <= 0 || risk <= 0 || sl <= 0 || !config) {
      return null;
    }

    const riskAmount = bal * (risk / 100);
    const pipValue = config.pipValuePerLot;
    const lotSize = riskAmount / (sl * pipValue);
    const tpAmount = tp > 0 ? tp * pipValue * lotSize : null;
    const rrRatio = tp > 0 ? tp / sl : null;

    return {
      riskAmount: parseFloat(riskAmount.toFixed(2)),
      lotSize: parseFloat(lotSize.toFixed(2)),
      microLots: parseFloat((lotSize * 100).toFixed(0)),
      miniLots: parseFloat((lotSize * 10).toFixed(1)),
      pipValue: pipValue,
      slCost: parseFloat((sl * pipValue * lotSize).toFixed(2)),
      tpAmount: tpAmount !== null ? parseFloat(tpAmount.toFixed(2)) : null,
      rrRatio: rrRatio !== null ? parseFloat(rrRatio.toFixed(2)) : null,
      riskRewardRatio: rrRatio !== null ? `${1}:${rrRatio.toFixed(1)}` : null,
      // Breakdown
      pipValuePerMicro: parseFloat((pipValue / 100).toFixed(4)),
      pipValuePerMini: parseFloat((pipValue / 10).toFixed(3)),
    };
  }, [balance, riskPercent, pair, stopLossPips, takeProfitPips, config]);

  const handleCopyLot = () => {
    if (result) {
      navigator.clipboard.writeText(result.lotSize.toFixed(2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getRiskLevel = () => {
    const r = parseFloat(riskPercent) || 0;
    if (r <= 0.5) return { label: 'Conservative', color: 'text-emerald-400', bg: 'bg-emerald-500', width: '16%' };
    if (r <= 1) return { label: 'Moderate', color: 'text-sky-400', bg: 'bg-sky-500', width: '33%' };
    if (r <= 2) return { label: 'Standard', color: 'text-amber-400', bg: 'bg-amber-500', width: '60%' };
    if (r <= 3) return { label: 'Aggressive', color: 'text-orange-400', bg: 'bg-orange-500', width: '80%' };
    return { label: 'High Risk', color: 'text-rose-400', bg: 'bg-rose-500', width: '100%' };
  };

  const riskLevel = getRiskLevel();

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Position Size Calculator</h2>
          <p className="text-xs text-slate-400 mt-0.5">Calculate your optimal lot size based on risk management rules</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* LEFT — Input Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" /> Parameters
            </h3>

            {/* Account Balance */}
            <div className="flex flex-col">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> Account Balance (USD)
              </label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-4 py-2.5 text-sm text-white font-mono focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all"
                placeholder="10000"
                min="0"
                step="100"
              />
            </div>

            {/* Risk % */}
            <div className="flex flex-col">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Percent className="w-3 h-3" /> Risk Per Trade (%)
              </label>
              <input
                type="number"
                value={riskPercent}
                onChange={(e) => setRiskPercent(e.target.value)}
                className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-4 py-2.5 text-sm text-white font-mono focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all"
                placeholder="1.0"
                min="0.1"
                max="100"
                step="0.1"
              />
              {/* Quick Presets */}
              <div className="flex gap-2 mt-2">
                {riskPresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setRiskPercent(preset.value.toString())}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border cursor-pointer transition-all ${
                      parseFloat(riskPercent) === preset.value
                        ? preset.color + ' shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              {/* Risk Gauge */}
              <div className="mt-3 bg-slate-950 rounded-lg border border-slate-800 p-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Risk Level</span>
                  <span className={`text-[10px] font-bold uppercase ${riskLevel.color}`}>{riskLevel.label}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${riskLevel.bg}`} style={{ width: riskLevel.width }}></div>
                </div>
              </div>
            </div>

            {/* Currency Pair */}
            <div className="flex flex-col">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Currency Pair</label>
              <select
                value={pair}
                onChange={(e) => setPair(e.target.value)}
                className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-4 py-2.5 text-sm text-white font-mono focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all"
              >
                {Object.entries(pairConfigs).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label} ({cfg.category})
                  </option>
                ))}
              </select>
              {config && (
                <span className="text-[10px] text-slate-500 mt-1 font-mono">
                  Pip Value: ${config.pipValuePerLot}/pip/lot • Category: {config.category}
                </span>
              )}
            </div>

            {/* Stop Loss Pips */}
            <div className="flex flex-col">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-rose-400" /> Stop Loss (pips)
              </label>
              <input
                type="number"
                value={stopLossPips}
                onChange={(e) => setStopLossPips(e.target.value)}
                className="bg-slate-950 border border-rose-950/30 focus:border-rose-500 rounded-lg px-4 py-2.5 text-sm text-white font-mono focus:ring-1 focus:ring-rose-500/30 outline-none transition-all"
                placeholder="e.g. 20"
                min="0"
                step="0.5"
              />
            </div>

            {/* Take Profit Pips (Optional) */}
            <div className="flex flex-col">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" /> Take Profit (pips) — optional
              </label>
              <input
                type="number"
                value={takeProfitPips}
                onChange={(e) => setTakeProfitPips(e.target.value)}
                className="bg-slate-950 border border-emerald-950/30 focus:border-emerald-500 rounded-lg px-4 py-2.5 text-sm text-white font-mono focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all"
                placeholder="e.g. 40"
                min="0"
                step="0.5"
              />
            </div>
          </div>
        </div>

        {/* RIGHT — Results Panel */}
        <div className="lg:col-span-3 space-y-4">

          {/* Primary Result */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 mb-5 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" /> Result
            </h3>

            {result ? (
              <div className="space-y-5">
                {/* Big Lot Size Display */}
                <div className="bg-slate-950 border border-emerald-500/20 rounded-xl p-6 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500"></div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest block mb-1">Recommended Position Size</span>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-5xl font-bold font-mono text-emerald-400 tracking-tight">
                      {result.lotSize.toFixed(2)}
                    </span>
                    <span className="text-sm text-slate-400 font-medium">lots</span>
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-3">
                    <span className="text-xs text-slate-500 font-mono">
                      {result.miniLots} mini lots
                    </span>
                    <span className="text-slate-700">|</span>
                    <span className="text-xs text-slate-500 font-mono">
                      {result.microLots} micro lots
                    </span>
                  </div>
                  <button
                    onClick={handleCopyLot}
                    className="mt-4 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 flex items-center gap-1.5 mx-auto cursor-pointer transition-all"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy Value'}
                  </button>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Risk Amount</span>
                    <span className="text-lg font-bold font-mono text-amber-400 block mt-1">${result.riskAmount.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-600">Max you can lose</span>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Pip Value</span>
                    <span className="text-lg font-bold font-mono text-slate-300 block mt-1">${config?.pipValuePerLot}</span>
                    <span className="text-[10px] text-slate-600">Per standard lot</span>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">SL Cost</span>
                    <span className="text-lg font-bold font-mono text-rose-400 block mt-1">${result.slCost.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-600">If stop hit</span>
                  </div>

                  {result.tpAmount !== null && (
                    <div className="bg-slate-950 border border-emerald-500/10 rounded-xl p-4">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">TP Target</span>
                      <span className="text-lg font-bold font-mono text-emerald-400 block mt-1">+${result.tpAmount.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-600">If target hit</span>
                    </div>
                  )}

                  {result.rrRatio !== null && (
                    <div className="bg-slate-950 border border-sky-500/10 rounded-xl p-4">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">R:R Ratio</span>
                      <span className="text-lg font-bold font-mono text-sky-400 block mt-1">{result.riskRewardRatio}</span>
                      <span className="text-[10px] text-slate-600">Risk to Reward</span>
                    </div>
                  )}

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Per Pip</span>
                    <span className="text-lg font-bold font-mono text-indigo-400 block mt-1">
                      ${(result.lotSize * (config?.pipValuePerLot || 0)).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-600">At this lot size</span>
                  </div>
                </div>

                {/* Calculation Breakdown */}
                <div className="bg-slate-950/50 border border-slate-800/50 rounded-xl p-4">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Info className="w-3 h-3" /> Calculation Breakdown
                  </h4>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="text-slate-600 w-24">Risk $</span>
                      <span>${balance} × {riskPercent}%</span>
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                      <span className="text-amber-400 font-semibold">${result.riskAmount}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="text-slate-600 w-24">Lot Size</span>
                      <span>${result.riskAmount} ÷ ({stopLossPips} pips × ${config?.pipValuePerLot})</span>
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                      <span className="text-emerald-400 font-semibold">{result.lotSize.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                  <Calculator className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-sm font-semibold text-slate-400">Enter your parameters</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Fill in your account balance, risk %, select a pair, and enter your stop loss in pips to calculate your position size.
                </p>
              </div>
            )}
          </div>

          {/* Risk Management Reference */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Risk Management Rules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 text-center">
                <span className="text-2xl font-bold text-emerald-400 font-mono block">1-2%</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-1">Max Risk Per Trade</span>
                <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                  Never risk more than 1-2% of your account on a single trade. This preserves capital during losing streaks.
                </p>
              </div>
              <div className="bg-sky-500/5 border border-sky-500/10 rounded-xl p-4 text-center">
                <span className="text-2xl font-bold text-sky-400 font-mono block">1:2+</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-1">Min R:R Ratio</span>
                <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                  Always aim for at least 1:2 risk-reward. This means your potential profit is double your potential loss.
                </p>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 text-center">
                <span className="text-2xl font-bold text-amber-400 font-mono block">5%</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-1">Max Daily Drawdown</span>
                <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                  Stop trading for the day if you lose 5% of your account. Come back fresh the next session.
                </p>
              </div>
            </div>
          </div>

          {/* Pip Value Reference Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400" /> Pip Value Reference (per Standard Lot)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-2 px-3 text-left">Pair</th>
                    <th className="py-2 px-3 text-left">Category</th>
                    <th className="py-2 px-3 text-right">Pip Size</th>
                    <th className="py-2 px-3 text-right">Pip Value / Lot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 font-mono">
                  {Object.entries(pairConfigs).map(([key, cfg]) => (
                    <tr key={key} className={`hover:bg-slate-800/30 transition-colors ${pair === key ? 'bg-emerald-500/5' : ''}`}>
                      <td className="py-2 px-3 font-semibold text-slate-200">{cfg.label}</td>
                      <td className="py-2 px-3 text-slate-400 font-sans">{cfg.category}</td>
                      <td className="py-2 px-3 text-right text-slate-400">{cfg.pipSize}</td>
                      <td className="py-2 px-3 text-right text-emerald-400 font-semibold">${cfg.pipValuePerLot.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-600 mt-3 italic">
              * Pip values for JPY, CAD, CHF, and cross pairs are approximate and may vary slightly with current exchange rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotCalculator;
