"use client";
import { useEffect, useState } from "react";

function isBig(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  if (r.width <= 1 || r.height <= 1) return false;
  const area = r.width * r.height;
  const vArea = window.innerWidth * window.innerHeight;
  return area >= vArea * 0.25; // covers >=25% of viewport
}

function describe(el: HTMLElement) {
  let s = el.tagName.toLowerCase();
  if (el.id) s += `#${el.id}`;
  const cls = (el.className || "").toString().split(/\s+/).filter(Boolean).slice(0,3);
  if (cls.length) s += `.${cls.join('.')}`;
  return s;
}

export default function UiFixer() {
  const [blocks, setBlocks] = useState<{el: HTMLElement; desc: string; z: string}[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function scan() {
      const els = Array.from(document.body.querySelectorAll("*")).filter((x): x is HTMLElement => x instanceof HTMLElement);
      const found = els.filter(el => {
        try {
          const style = getComputedStyle(el);
          if (style.display === "none" || style.visibility === "hidden" || style.pointerEvents === "none") return false;
          if (el === document.body || el === document.documentElement) return false;
          return isBig(el);
        } catch (e) { return false; }
      }).map(el => ({ el, desc: describe(el), z: getComputedStyle(el).zIndex || "auto" }));
      setBlocks(found);
    }
    scan();
    const id = setInterval(scan, 800);
    return () => clearInterval(id);
  }, []);

  function neutralizeOne(index: number) {
    const b = blocks[index];
    if (!b) return;
    try {
      b.el.dataset._prevPointer = b.el.style.pointerEvents || "";
      b.el.dataset._prevZ = b.el.style.zIndex || "";
      b.el.style.pointerEvents = "none";
      b.el.style.zIndex = "0";
    } catch (e) {}
    setTimeout(()=> {
      // re-run scan
      const els = Array.from(document.body.querySelectorAll("*")).filter((x): x is HTMLElement => x instanceof HTMLElement);
      const found = els.filter(el => {
        try {
          const style = getComputedStyle(el);
          if (style.display === "none" || style.visibility === "hidden" || style.pointerEvents === "none") return false;
          if (el === document.body || el === document.documentElement) return false;
          return isBig(el);
        } catch (e) { return false; }
      }).map(el => ({ el, desc: describe(el), z: getComputedStyle(el).zIndex || "auto" }));
      setBlocks(found);
    }, 120);
  }

  function neutralizeAll() {
    blocks.forEach(b => {
      try {
        b.el.dataset._prevPointer = b.el.style.pointerEvents || "";
        b.el.dataset._prevZ = b.el.style.zIndex || "";
        b.el.style.pointerEvents = "none";
        b.el.style.zIndex = "0";
      } catch (e) {}
    });
    setTimeout(()=> setBlocks([]), 120);
  }

  function restoreAll() {
    try {
      const all = Array.from(document.querySelectorAll("[data-_prev-pointer]"));
      all.forEach((el:any) => {
        if (el.dataset && "_prevPointer" in el.dataset) el.style.pointerEvents = el.dataset._prevPointer || "";
        if (el.dataset && "_prevZ" in el.dataset) el.style.zIndex = el.dataset._prevZ || "";
        delete el.dataset._prevPointer;
        delete el.dataset._prevZ;
      });
      setTimeout(()=> {
        const els = Array.from(document.body.querySelectorAll("*")).filter((x): x is HTMLElement => x instanceof HTMLElement);
        const found = els.filter(el => {
          try {
            const style = getComputedStyle(el);
            if (style.display === "none" || style.visibility === "hidden" || style.pointerEvents === "none") return false;
            if (el === document.body || el === document.documentElement) return false;
            return isBig(el);
          } catch (e) { return false; }
        }).map(el => ({ el, desc: describe(el), z: getComputedStyle(el).zIndex || "auto" }));
        setBlocks(found);
      }, 120);
    } catch (e) {}
  }

  // ensure console & settings get top z
  useEffect(()=> {
    try {
      const ensureTop = () => {
        const sEls = Array.from(document.querySelectorAll(".panel, .fixed, #__next, #root, [role='dialog']"));
        sEls.forEach((el:any) => {
          if (el && el.style) {
            el.style.zIndex = "2147483647";
          }
        });
      };
      ensureTop();
    } catch (e) {}
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={()=> setOpen(o=>!o)}
        className="fixed right-4 bottom-16 z-[2147483647] bg-[var(--accent)] text-black font-bold px-3 py-2 rounded panel"
        style={{pointerEvents:"auto"}}
        aria-label="Unlock UI"
      >
        Unlock UI
      </button>

      {open && (
        <div className="fixed right-4 bottom-28 z-[2147483647] w-[92vw] max-w-sm panel p-3" style={{pointerEvents:"auto"}}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-mono text-[var(--accent)]">UI Unlocker</div>
            <div className="flex gap-2">
              <button type="button" onClick={neutralizeAll} className="btn-soft text-xs">Disable All</button>
              <button type="button" onClick={restoreAll} className="btn-soft text-xs">Restore</button>
            </div>
          </div>

          <div className="text-xs text-gray-300 font-mono mb-2">Detected blocking elements (covers large area)</div>
          <div style={{maxHeight: "36vh", overflow: "auto"}} className="space-y-2">
            {blocks.length === 0 ? <div className="text-gray-500 text-xs font-mono">No large blocking elements detected</div> : blocks.map((b, i) => (
              <div key={i} className="flex items-center justify-between bg-[rgba(255,255,255,0.02)] p-2 rounded">
                <div className="text-xs font-mono break-words" style={{maxWidth:"65%"}}>{b.desc} <span className="text-gray-400">z:{b.z}</span></div>
                <div className="flex gap-2">
                  <button type="button" onClick={()=> neutralizeOne(i)} className="btn-soft text-xs">Disable</button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-gray-400 font-mono mt-3">Use Disable All to regain interactivity. Restore will revert.</div>
        </div>
      )}
    </>
  );
}
