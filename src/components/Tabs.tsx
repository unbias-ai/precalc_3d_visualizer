"use client";
import { useState } from "react";

export default function Tabs({ tabs }: { tabs: { key: string; label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState<string>(tabs[0]?.key ?? "graph");

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-3">
        {tabs.map(t => (
          <button
            type="button"
            key={t.key}
            onClick={() => setActive(t.key)}
            aria-pressed={active === t.key}
            className={`px-3 py-2 rounded font-mono text-sm transition-colors ${active === t.key ? "bg-[var(--panel)] text-neon-cyan border border-cyan-600" : "bg-[#0b0b0b] text-cyan-300/80"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="panel p-2">
        {tabs.map(t => (
          <div key={t.key} style={{ display: t.key === active ? "block" : "none" }}>
            {t.content}
          </div>
        ))}
      </div>
    </div>
  );
}
