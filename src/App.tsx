import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Heart, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Zap,
  RefreshCw,
  Clock
} from 'lucide-react';
import { HealthChart } from './components/HealthChart';
import { ScannerOverlay } from './components/ScannerOverlay';
import { HealthDataPoint, HealthBaseline, InferenceResult } from './types';
import { getHealthInference, generateMockBaseline } from './services/healthInference';
import { cn } from './lib/utils';

export default function App() {
  const [history, setHistory] = useState<HealthDataPoint[]>([]);
  const [baseline] = useState<HealthBaseline>(generateMockBaseline());
  const [inference, setInference] = useState<InferenceResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Simulate real-time data stream
  useEffect(() => {
    const interval = setInterval(() => {
      const lastPoint = history[history.length - 1];
      const newPoint: HealthDataPoint = {
        timestamp: Date.now(),
        heartRate: 70 + Math.random() * 10,
        hrv: 40 + Math.random() * 15,
        stressLevel: 20 + Math.random() * 10,
      };

      setHistory(prev => [...prev.slice(-30), newPoint]);
    }, 2000);

    return () => clearInterval(interval);
  }, [history]);

  const currentVitals = useMemo(() => history[history.length - 1], [history]);

  const handleInference = async () => {
    if (!currentVitals) return;
    setIsAnalyzing(true);
    const result = await getHealthInference(currentVitals, baseline);
    setInference(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e4e3e0] font-sans selection:bg-emerald-500/30">
      {/* Top Navigation / Status Bar */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight uppercase">VitalsSentry</h1>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Health Variance Inference Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-6 font-mono text-[10px] text-white/40">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            SYSTEM_ONLINE
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Scanner & Real-time Stats */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] font-mono uppercase tracking-wider">Live_rPPG_Feed</span>
              </div>
              <span className="text-[10px] font-mono text-white/30 italic">Direct Camera Inference</span>
            </div>
            <div className="p-4">
              <ScannerOverlay />
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Heart Rate Card */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-400">
                  <Heart className="w-4 h-4" />
                  <span className="text-[11px] font-mono uppercase">Heart_Rate</span>
                </div>
                <span className="text-[10px] font-mono text-white/30">BPM</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold tracking-tighter italic">
                  {currentVitals?.heartRate.toFixed(0) || '--'}
                </span>
                <span className="text-xs text-white/40 font-mono">AVG: {baseline.meanHR}</span>
              </div>
              <HealthChart data={history} type="hr" color="#fb7185" />
            </div>

            {/* HRV Card */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Zap className="w-4 h-4" />
                  <span className="text-[11px] font-mono uppercase">HRV_RMSSD</span>
                </div>
                <span className="text-[10px] font-mono text-white/30">ms</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold tracking-tighter italic">
                  {currentVitals?.hrv.toFixed(0) || '--'}
                </span>
                <span className="text-xs text-white/40 font-mono">SEM: ±{baseline.semHRV}</span>
              </div>
              <HealthChart data={history} type="hrv" color="#34d399" />
            </div>
          </div>
        </div>

        {/* Right Column: Inference & Baseline */}
        <div className="lg:col-span-5 space-y-6">
          {/* Inference Engine Panel */}
          <section className="bg-white text-black rounded-2xl p-8 space-y-6 shadow-2xl shadow-emerald-500/10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold italic tracking-tight">Inference Engine</h2>
              <button 
                onClick={handleInference}
                disabled={isAnalyzing}
                className="bg-black text-white px-4 py-2 rounded-full text-[11px] font-mono uppercase tracking-widest hover:bg-zinc-800 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isAnalyzing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                Run_Analysis
              </button>
            </div>

            <div className="h-px bg-black/10" />

            <AnimatePresence mode="wait">
              {inference ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-xl",
                      inference.status === 'normal' ? "bg-emerald-100 text-emerald-700" :
                      inference.status === 'warning' ? "bg-amber-100 text-amber-700" :
                      "bg-rose-100 text-rose-700"
                    )}>
                      {inference.status === 'normal' ? <CheckCircle2 className="w-6 h-6" /> :
                       inference.status === 'warning' ? <AlertTriangle className="w-6 h-6" /> :
                       <Zap className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg uppercase tracking-tight">{inference.status} STATE</h3>
                      <p className="text-sm text-black/70 leading-relaxed font-medium">{inference.message}</p>
                    </div>
                  </div>

                  <div className="bg-black/5 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase text-black/40">
                      <span>Variance_Score</span>
                      <span>Threshold: 3.0</span>
                    </div>
                    <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(inference.varianceScore * 20, 100)}%` }}
                        className={cn(
                          "h-full",
                          inference.varianceScore > 3 ? "bg-rose-500" :
                          inference.varianceScore > 1.5 ? "bg-amber-500" :
                          "bg-emerald-500"
                        )}
                      />
                    </div>
                    <div className="text-right text-[10px] font-mono font-bold">
                      {inference.varianceScore.toFixed(2)} σ
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-black/40">
                      <Info className="w-3 h-3" />
                      Recommendation
                    </div>
                    <p className="text-sm italic font-serif leading-relaxed">
                      "{inference.recommendation}"
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="py-12 text-center space-y-4">
                  <div className="w-12 h-12 border-2 border-dashed border-black/20 rounded-full mx-auto flex items-center justify-center">
                    <Activity className="w-6 h-6 text-black/20" />
                  </div>
                  <p className="text-xs font-mono text-black/40 uppercase tracking-widest">Awaiting Data Input</p>
                </div>
              )}
            </AnimatePresence>
          </section>

          {/* Baseline Stats Panel */}
          <section className="bg-[#111] border border-white/5 rounded-2xl p-6 space-y-6">
            <h2 className="text-[11px] font-mono uppercase tracking-widest text-white/40">Population_Baseline (30D)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-white/30 uppercase">Mean_HRV</div>
                <div className="text-xl font-bold">{baseline.meanHRV} ms</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-white/30 uppercase">Std_Dev</div>
                <div className="text-xl font-bold">±{baseline.stdDevHRV} ms</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-white/30 uppercase">SEM_Error</div>
                <div className="text-xl font-bold text-emerald-400">{baseline.semHRV} ms</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-white/30 uppercase">Confidence</div>
                <div className="text-xl font-bold">95.4%</div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer / System Logs */}
      <footer className="max-w-7xl mx-auto p-6 border-t border-white/5 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4 text-[10px] font-mono text-white/20 uppercase tracking-widest">
            <span>VitalsSentry v1.0.4</span>
            <span>•</span>
            <span>Engine: Gemini-3-Flash</span>
            <span>•</span>
            <span>rPPG: Active</span>
          </div>
          <div className="text-[10px] font-mono text-white/20 italic">
            "Predicting health events through mathematical variance."
          </div>
        </div>
      </footer>
    </div>
  );
}
