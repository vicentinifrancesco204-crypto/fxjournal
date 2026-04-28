import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrades } from '../context/TradeContext';
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  X, 
  Calculator,
  SmilePlus
} from 'lucide-react';

const continuationConfirmations = [
  'protrend',
  'ext.idm.',
  'smt',
  'metigation',
  'timing',
  'follow trough',
  'int.bos.'
];

const reversalConfirmations = [
  'protrend',
  'med.ind.',
  'metigation',
  'timing',
  'dive',
  'follow trough',
  'int. bos.'
];

const emotionsList = [
  'Calm', 'Confident', 'Anxious', 'Greedy', 'Fearful', 'Impatient', 'FOMO', 'Revenge'
];

const majorPairs = [
  'EURUSD', 'GBPUSD', 'AUDUSD', 'NZDUSD', 'USDJPY', 'USDCAD', 'USDCHF',
  'XAUUSD', 'BTCUSD', 'ETHUSD', 'GBPJPY', 'EURJPY', 'EURGBP'
];

const AddTrade: React.FC = () => {
  const { addTrade, settings } = useTrades();
  const navigate = useNavigate();

  const [pair, setPair] = useState('EURUSD');
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [lotSize, setLotSize] = useState('0.1');
  const [pnl, setPnl] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [session, setSession] = useState<'London' | 'New York' | 'Tokyo' | 'Sydney' | 'Other'>('London');
  
  // Setup state
  const [setupType, setSetupType] = useState<'Continuation' | 'Reversal'>('Continuation');
  const [conferme, setConferme] = useState<string[]>([]);
  
  const [notes, setNotes] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [screenshot, setScreenshot] = useState<string | undefined>(undefined);
  const [isEstimating, setIsEstimating] = useState(false);

  useEffect(() => {
    // Set default date and time to now
    const now = new Date();
    setDate(now.toISOString().split('T')[0]);
    setTime(now.toTimeString().split(' ')[0].substring(0, 5));
    
    // Auto-detect session based on current UTC hour
    const utcHour = now.getUTCHours();
    if (utcHour >= 8 && utcHour < 13) setSession('London');
    else if (utcHour >= 13 && utcHour < 17) setSession('New York');
    else if (utcHour >= 0 && utcHour < 8) setSession('Tokyo');
    else if (utcHour >= 22 || utcHour < 0) setSession('Sydney');
    else setSession('Other');
  }, []);

  const handleEmotionToggle = (emotion: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion) 
        ? prev.filter(e => e !== emotion) 
        : [...prev, emotion]
    );
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size too large! Please upload an image under 2MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshot(undefined);
  };

  const handleEstimatePnl = () => {
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const lots = parseFloat(lotSize);
    
    if (isNaN(entry) || isNaN(exit) || isNaN(lots)) {
      alert('Please enter valid entry price, exit price, and lot size first.');
      return;
    }

    setIsEstimating(true);
    
    // Determine pip size
    const pipSize = pair.includes('JPY') ? 0.01 : (pair.includes('USD') && !pair.startsWith('XAU') && !pair.startsWith('BTC') && !pair.startsWith('ETH')) ? 0.0001 : 1;
    const pipDiff = type === 'BUY' ? (exit - entry) / pipSize : (entry - exit) / pipSize;
    
    // Assume standard $10 per lot per pip for major forex, adjust for crypto/indices
    let lotValue = 10;
    if (pair === 'XAUUSD') lotValue = 1; // Gold is $1 per 0.01 lot per 10c, standard lot is $100 per pip ($1)
    if (pair.startsWith('BTC') || pair.startsWith('ETH')) lotValue = 1;

    let calculatedPnl = pipDiff * lots * lotValue;
    
    // Correct minor rounding issues
    calculatedPnl = parseFloat(calculatedPnl.toFixed(2));
    
    setPnl(calculatedPnl.toString());
    setTimeout(() => setIsEstimating(false), 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const sl = parseFloat(stopLoss);
    const tp = parseFloat(takeProfit);
    const lots = parseFloat(lotSize);
    const pnlVal = pnl === '' ? undefined : parseFloat(pnl);

    if (isNaN(entry) || isNaN(exit) || isNaN(sl) || isNaN(tp) || isNaN(lots)) {
      alert('Please fill out all price fields and lot size with valid numbers.');
      return;
    }

    // Combine setupType and selected confirmations into a single string
    const constructedSetup = `${setupType}: ${conferme.length > 0 ? conferme.join(', ') : 'No confirmations'}`;

    addTrade({
      pair,
      type,
      entryPrice: entry,
      exitPrice: exit,
      stopLoss: sl,
      takeProfit: tp,
      lotSize: lots,
      pnl: pnlVal,
      date,
      time,
      session,
      strategy: setupType === 'Continuation' ? 'ext.idm.' : 'med. ind.',
      setup: constructedSetup,
      notes,
      emotions: selectedEmotions,
      screenshot
    });

    navigate('/journal');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">Record New Trade</h2>
          <p className="text-xs text-slate-400">Add an execution to your trading journal</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Core Trade Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-md font-bold text-white border-b border-slate-800 pb-2">Trade Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Asset/Pair */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Asset / Pair</label>
              <div className="relative">
                <input
                  type="text"
                  list="major-pairs"
                  value={pair}
                  onChange={(e) => setPair(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white font-mono uppercase"
                  placeholder="e.g., EURUSD"
                  required
                />
                <datalist id="major-pairs">
                  {majorPairs.map(p => <option key={p} value={p} />)}
                </datalist>
              </div>
            </div>

            {/* Type: Buy/Sell */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Order Type</label>
              <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setType('BUY')}
                  className={`py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    type === 'BUY'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => setType('SELL')}
                  className={`py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    type === 'SELL'
                      ? 'bg-rose-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  SELL
                </button>
              </div>
            </div>

            {/* Lot Size */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Lot Size</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white font-mono"
                placeholder="0.10"
                required
              />
            </div>

            {/* Net P&L */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Net P&L ({settings.currency})
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={pnl}
                  onChange={(e) => setPnl(e.target.value)}
                  className={`w-full bg-slate-950 border focus:border-emerald-500 rounded-lg px-3 py-2 text-sm font-mono ${
                    pnl !== '' && parseFloat(pnl) > 0 
                      ? 'text-emerald-400 border-emerald-950' 
                      : pnl !== '' && parseFloat(pnl) < 0 
                      ? 'text-rose-400 border-rose-950' 
                      : 'text-white border-slate-800'
                  }`}
                  placeholder="0.00"
                  required
                />
                <button
                  type="button"
                  onClick={handleEstimatePnl}
                  className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Auto-estimate P&L"
                  disabled={isEstimating}
                >
                  <Calculator className={`w-4 h-4 ${isEstimating ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Entry Price */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Entry Price</label>
              <input
                type="number"
                step="0.00001"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white font-mono"
                placeholder="1.00000"
                required
              />
            </div>

            {/* Exit Price */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Exit Price</label>
              <input
                type="number"
                step="0.00001"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white font-mono"
                placeholder="1.01000"
                required
              />
            </div>

            {/* Stop Loss */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Stop Loss</label>
              <input
                type="number"
                step="0.00001"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-rose-400 font-mono border-rose-950/20"
                placeholder="0.99500"
                required
              />
            </div>

            {/* Take Profit */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Take Profit</label>
              <input
                type="number"
                step="0.00001"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-emerald-400 font-mono border-emerald-950/20"
                placeholder="1.02000"
                required
              />
            </div>
          </div>
        </div>

        {/* Row 2: Confluence & Setup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-md font-bold text-white border-b border-slate-800 pb-2">Execution Context</h3>
            
            <div className="flex flex-col border-slate-800">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Setup Type (Strategy)</label>
              
              {/* Setup Type Toggles - Now acting as primary buttons */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-lg mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setSetupType('Continuation');
                    setConferme([]); // Reset confirmations on type change
                  }}
                  className={`py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    setupType === 'Continuation'
                      ? 'bg-sky-500/10 border border-sky-500/30 text-sky-400 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Continuation
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSetupType('Reversal');
                    setConferme([]); // Reset confirmations on type change
                  }}
                  className={`py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    setupType === 'Reversal'
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Reversal
                </button>
              </div>

              {/* Checkboxes panel (pannello a crocette) */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>{setupType} Confirmations:</span>
                  <span className="font-mono text-sky-500">{conferme.length} selected</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {(setupType === 'Continuation' ? continuationConfirmations : reversalConfirmations).map((item) => {
                    const isSelected = conferme.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setConferme(prev =>
                            prev.includes(item)
                              ? prev.filter(c => c !== item)
                              : [...prev, item]
                          );
                        }}
                        className={`flex items-center px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? setupType === 'Continuation'
                              ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                              : 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 border rounded flex items-center justify-center mr-2 transition-all ${
                          isSelected
                            ? setupType === 'Continuation'
                              ? 'border-sky-400 bg-sky-400 text-slate-950'
                              : 'border-amber-400 bg-amber-400 text-slate-950'
                            : 'border-slate-700 bg-slate-950'
                        }`}>
                          {isSelected && <span className="text-[10px] font-bold">✓</span>}
                        </div>
                        <span className="font-mono">{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Time (Local)</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Trading Session</label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="London">London (UTC 8-17)</option>
                <option value="New York">New York (UTC 13-22)</option>
                <option value="Tokyo">Tokyo (UTC 0-9)</option>
                <option value="Sydney">Sydney (UTC 22-7)</option>
                <option value="Other">Other / Off-hours</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-full">
            <h3 className="text-md font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <SmilePlus className="w-4 h-4 text-emerald-400" /> Psychology & Emotions
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">Select the mindsets and emotions present during this trade</p>
            
            <div className="flex-1 flex flex-wrap gap-2 content-start">
              {emotionsList.map((emotion) => {
                const isSelected = selectedEmotions.includes(emotion);
                const isNegative = ['Anxious', 'Greedy', 'Fearful', 'Impatient', 'FOMO', 'Revenge'].includes(emotion);
                return (
                  <button
                    key={emotion}
                    type="button"
                    onClick={() => handleEmotionToggle(emotion)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                      isSelected
                        ? isNegative
                          ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-sm'
                          : 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {emotion}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 3: Notes & Screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl md:col-span-2 flex flex-col">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Trade Notes & Reflections</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex-1 w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-white resize-none min-h-[150px]"
              placeholder="What was your thesis? Why did you enter? How was the execution? What did you learn?..."
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Trade Screenshot</span>
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 rounded-lg border border-dashed border-slate-800 p-4 relative overflow-hidden">
              {screenshot ? (
                <div className="absolute inset-0 group">
                  <img src={screenshot} alt="Screenshot Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <button
                      type="button"
                      onClick={handleRemoveScreenshot}
                      className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full cursor-pointer transition-colors"
                      title="Remove Screenshot"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer text-center p-4 h-full w-full">
                  <ImageIcon className="w-10 h-10 text-slate-600 mb-2" />
                  <span className="text-xs text-slate-400 font-medium">Click to upload chart screenshot</span>
                  <span className="text-[10px] text-slate-600 mt-1">PNG, JPG up to 2MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/10 transition-all cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            Save Trade Entry
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTrade;
