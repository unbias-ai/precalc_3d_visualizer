"use client";
import { useRef, useEffect } from "react";
export default function ConsolePanel({ logs, onClear }:{logs:string[]; onClear: ()=>void}) {
  const ref = useRef<HTMLDivElement|null>(null);
  useEffect(()=>{ if(ref.current) ref.current.scrollTop = ref.current.scrollHeight; },[logs]);
  useEffect(()=>{ try{ if(ref.current){ ref.current.style.zIndex='2147483646'; ref.current.style.position='relative'; } }catch(e){} },[]);
  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-neon-cyan font-mono">Console</div>
        <button onClick={onClear} className="btn-soft text-xs" type="button">Clear</button>
      </div>
      <div ref={ref} className="h-[220px] sm:h-[280px] overflow-auto p-3 font-mono text-sm text-cyan-200 bg-[var(--panel)] rounded">
        {logs.length===0? <div className="text-gray-500">Console empty</div> : logs.map((l,i)=>(<div key={i} className="mb-2"><span className="text-cyan-400">›</span> {l}</div>))}
      </div>
    </div>
  )
}
