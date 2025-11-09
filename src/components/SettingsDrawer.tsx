"use client";
import { useState } from "react";
import { useTheme } from "@/lib/theme";

export default function SettingsDrawer({
  arrowsEnabled,
  onToggleArrows,
  gridDensity,
  onChangeGrid,
  arrowScale,
  onChangeArrowScale,
}: {
  arrowsEnabled: boolean;
  onToggleArrows: (v:boolean)=>void;
  gridDensity: number;
  onChangeGrid: (v:number)=>void;
  arrowScale: number;
  onChangeArrowScale: (v:number)=>void;
}) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme, presets } = useTheme();
  const [tab, setTab] = useState<"appearance"|"vector"|"advanced">("appearance");

  return (
    <>
      <button
        type="button"
        aria-label="Settings"
        onClick={() => setOpen(true)}
        className="fixed left-4 bottom-16 z-[99999] bg-[var(--panel)] border border-[rgba(0,215,255,0.14)] rounded-full px-3 py-2 flex items-center gap-2 shadow-glow"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[var(--accent)]" aria-hidden>
          <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-xs font-mono text-[var(--accent)]">UI</span>
      </button>

      {open && (
        <div className="fixed left-4 bottom-28 z-[99999] w-[92vw] max-w-sm bg-[var(--panel)] border border-[rgba(0,215,255,0.12)] rounded-lg p-3 shadow-glow panel">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-[var(--accent)] font-mono">Settings</div>
            <button type="button" onClick={()=>setOpen(false)} className="text-sm text-gray-300 font-mono">Close</button>
          </div>

          <div className="flex gap-2 mb-3">
            <button type="button" onClick={()=>setTab("appearance")} className={`flex-1 text-xs font-mono py-2 rounded ${tab==="appearance" ? "bg-[rgba(0,215,255,0.06)] border border-[rgba(0,215,255,0.08)]" : "bg-transparent"}`}>Appearance</button>
            <button type="button" onClick={()=>setTab("vector")} className={`flex-1 text-xs font-mono py-2 rounded ${tab==="vector" ? "bg-[rgba(0,215,255,0.06)] border border-[rgba(0,215,255,0.08)]" : "bg-transparent"}`}>Vector Field</button>
            <button type="button" onClick={()=>setTab("advanced")} className={`flex-1 text-xs font-mono py-2 rounded ${tab==="advanced" ? "bg-[rgba(0,215,255,0.06)] border border-[rgba(0,215,255,0.08)]" : "bg-transparent"}`}>Advanced</button>
          </div>

          <div className="space-y-4">
            {tab === "appearance" && (
              <>
                <div className="text-xs text-gray-300 font-mono">Theme Presets</div>
                <div className="flex gap-2">
                  {Object.entries(presets).map(([k,v]:any)=>(
                    <button key={k} type="button" onClick={()=> setTheme(k as any)} className={`flex-1 p-2 rounded border ${theme===k ? "border-[var(--accent)] bg-[rgba(0,215,255,0.04)]" : "border-[rgba(255,255,255,0.03)] bg-[rgba(255,255,255,0.01)]"}`}>
                      <div className="text-xs font-mono">{k}</div>
                      <div className="h-6 mt-2 rounded" style={{background: `linear-gradient(90deg, ${v.accent}, ${v.accent2})`}} />
                    </button>
                  ))}
                </div>
              </>
            )}

            {tab === "vector" && (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-mono text-gray-200">Arrows (vector field)</div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={arrowsEnabled} onChange={e=>onToggleArrows(e.target.checked)} className="sr-only" />
                    <div className={`w-11 h-6 rounded-full transition-colors ${arrowsEnabled ? 'bg-[var(--accent)]' : 'bg-gray-700'}`}></div>
                  </label>
                </div>

                <div>
                  <div className="text-xs text-gray-300 font-mono">Grid density</div>
                  <input aria-label="Grid density" type="range" min="0.2" max="1" step="0.05" value={gridDensity} onChange={e=>onChangeGrid(Number(e.target.value))} className="w-full mt-2" />
                </div>

                <div>
                  <div className="text-xs text-gray-300 font-mono mt-2">Arrow scale</div>
                  <input aria-label="Arrow scale" type="range" min="0.1" max="1.6" step="0.05" value={arrowScale} onChange={e=>onChangeArrowScale(Number(e.target.value))} className="w-full mt-2" />
                </div>
              </>
            )}

            {tab === "advanced" && (
              <>
                <div className="text-xs text-gray-300 font-mono">Export / Import</div>
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={()=>{
                    const s = {
                      theme: (localStorage.getItem("themeName") || "warp"),
                      arrowsEnabled,
                      gridDensity,
                      arrowScale
                    };
                    const blob = new Blob([JSON.stringify(s, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "precalc_settings.json";
                    a.click();
                    URL.revokeObjectURL(url);
                  }} className="btn-soft text-xs">Export</button>

                  <button type="button" onClick={()=>{
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "application/json";
                    input.onchange = async (ev:any) => {
                      const f = ev.target.files?.[0];
                      if(!f) return;
                      const txt = await f.text();
                      try{
                        const parsed = JSON.parse(txt);
                        if(parsed.theme) localStorage.setItem("themeName", parsed.theme);
                        if(typeof parsed.arrowsEnabled === "boolean") onToggleArrows(Boolean(parsed.arrowsEnabled));
                        if(typeof parsed.gridDensity === "number") onChangeGrid(parsed.gridDensity);
                        if(typeof parsed.arrowScale === "number") onChangeArrowScale(parsed.arrowScale);
                        location.reload();
                      }catch(e){}
                    };
                    input.click();
                  }} className="btn-soft text-xs">Import</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
