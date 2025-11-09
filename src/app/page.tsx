"use client";
import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Tabs from "@/components/Tabs";
import ConsolePanel from "@/components/ConsolePanel";
import SettingsDrawer from "@/components/SettingsDrawer";
import { ThemeProvider } from "@/lib/theme";
import useDevice from "@/lib/useDevice";
const GraphPanel = dynamic(() => import("@/components/GraphPanel"), { ssr: false });

function forceNeutralizeBlockingElements() {
  try {
    const nodes = Array.from(document.body.querySelectorAll('*')).filter(n => n instanceof HTMLElement) as HTMLElement[];
    for (const el of nodes) {
      try {
        if (el === document.documentElement || el === document.body) continue;
        // keep UI panels and known app elements interactive
        if (el.closest && (el.closest('.panel') || el.closest('.fixed') || el.id === '__ui_blocker_debug' || el.classList.contains('panel') || el.classList.contains('btn-soft'))) {
          // ensure UI elements remain interactive
          el.style.pointerEvents = 'auto';
          el.style.zIndex = el.style.zIndex || '2147483647';
          continue;
        }
        const r = el.getBoundingClientRect();
        if (isNaN(r.width) || isNaN(r.height)) continue;
        const vw = window.innerWidth || document.documentElement.clientWidth;
        const vh = window.innerHeight || document.documentElement.clientHeight;
        // if element covers most of the viewport or is full-size and has pointer-events enabled, neutralize it
        const coversViewport = r.width >= vw * 0.85 && r.height >= vh * 0.85;
        const style = getComputedStyle(el);
        const isVisible = style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        if (coversViewport && isVisible) {
          // prefer to just neutralize pointer-events first
          try { el.style.pointerEvents = 'none'; } catch(e){}
          try { el.style.zIndex = '0'; } catch(e){}
          // also hide if it's still blocking
          if (el.parentElement) {
            try { el.style.visibility = 'hidden'; } catch(e) {}
            try { el.style.display = 'none'; } catch(e) {}
          }
        }
      } catch (e) {}
    }
  } catch (e) {}
}

export default function PageWrapper() {
  return (
    <ThemeProvider>
      <MainPage />
    </ThemeProvider>
  );
}

function MainPage(){
  const device = useDevice();
  const isDesktop = device.type === "desktop";

  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [arrowsEnabled, setArrowsEnabled] = useState(true);
  const [gridDensity, setGridDensity] = useState(0.55);
  const [arrowScale, setArrowScale] = useState(0.5);

  // aggressive auto-run neutralizer: runs on load and repeatedly
  useEffect(() => {
    // initial attempt immediately
    forceNeutralizeBlockingElements();
    // then repeat every 300ms for the next 10s, then every 2s indefinitely (lighter)
    let fast = setInterval(forceNeutralizeBlockingElements, 300);
    const stopFast = setTimeout(() => {
      clearInterval(fast);
      // slower background watchdog
      const slow = setInterval(forceNeutralizeBlockingElements, 2000);
      (window as any).__forceNeutralizeInterval = slow;
    }, 10000);
    (window as any).__forceNeutralizeFast = fast;
    (window as any).__forceNeutralizeStopper = stopFast;

    // expose a global function to force-neutralize on demand and to restore
    (window as any).__forceNeutralize = () => forceNeutralizeBlockingElements();
    (window as any).__restorePointers = () => {
      try {
        const all = Array.from(document.querySelectorAll('*')).filter(n => n instanceof HTMLElement) as HTMLElement[];
        for (const el of all) {
          try {
            // restore common UI selectors to interactive
            if (el.classList && (el.classList.contains('panel') || el.classList.contains('fixed') || el.classList.contains('btn-soft') || el.classList.contains('panel'))) {
              el.style.pointerEvents = 'auto';
              el.style.zIndex = '2147483647';
              el.style.visibility = 'visible';
              el.style.display = '';
            }
          } catch(e){}
        }
      } catch(e){}
    };

    return () => {
      try {
        clearInterval((window as any).__forceNeutralizeFast);
        clearInterval((window as any).__forceNeutralizeInterval);
        clearTimeout((window as any).__forceNeutralizeStopper);
      } catch(e){}
    };
  }, []);

  useEffect(()=> {
    // ensure panels are topmost in case neutralizer hid them previously
    try {
      document.querySelectorAll('.panel, .fixed, .btn-soft').forEach((el:any)=>{
        el.style.zIndex = '2147483647';
        el.style.pointerEvents = 'auto';
        el.style.visibility = 'visible';
        el.style.display = '';
      });
    } catch(e){}
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!input.trim()) return;
    setSubmitted(input.trim());
    setLogs(l => (l[l.length - 1] === `[submit] ${input.trim()}` ? l : [...l, `[submit] ${input.trim()}`]));
    setInput("");
  };

  const onLog = useCallback((line: string) => {
    setLogs(prev => (prev[prev.length-1] === line ? prev : [...prev, line]));
  },[]);

  const clearLogs = useCallback(()=> setLogs([]),[]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-white p-3 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
          <span className="text-neon-cyan font-mono hidden sm:inline">➤</span>
          <input type="text" value={input} onChange={e=>setInput(e.target.value)} placeholder="Type any equation..." className="flex-1 bg-[var(--panel)] text-cyan-300 p-2 rounded font-mono" />
          <button type="submit" className="bg-[var(--accent)] px-4 py-2 rounded text-black font-bold">Enter</button>
        </form>

        {isDesktop ? (
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="panel p-2">
                <GraphPanel expression={submitted} arrowsEnabled={arrowsEnabled} onLog={onLog} gridDensity={gridDensity} arrowScale={arrowScale} />
              </div>
            </div>

            <div className="w-80">
              <div className="panel p-2 h-[min(70vh,900px)] overflow-auto">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-neon-cyan font-mono">Console</div>
                  <button onClick={clearLogs} className="btn-soft text-xs" type="button">Clear</button>
                </div>
                <ConsolePanel logs={logs} onClear={clearLogs} />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-2 w-full">
            <Tabs tabs={[
              { key: "graph", label: "Graph", content: <div className="p-2"><GraphPanel expression={submitted} arrowsEnabled={arrowsEnabled} onLog={onLog} gridDensity={gridDensity} arrowScale={arrowScale} /></div> },
              { key: "console", label: "Console", content: <ConsolePanel logs={logs} onClear={clearLogs} /> },
            ]} />
          </div>
        )}

        <SettingsDrawer arrowsEnabled={arrowsEnabled} onToggleArrows={setArrowsEnabled} gridDensity={gridDensity} onChangeGrid={setGridDensity} arrowScale={arrowScale} onChangeArrowScale={setArrowScale} />
      </div>
    </div>
  );
}
