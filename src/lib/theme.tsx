"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type ThemeName = "warp" | "midnight" | "ember" | "skeet";

const presets: Record<ThemeName, any> = {
  warp: { bg: "#070707", panel: "#0f1113", accent: "#00e5ff", accent2: "#ff2dd4", grid: 0.5 },
  midnight: { bg: "#05060a", panel: "#081018", accent: "#7cf47c", accent2: "#00d1ff", grid: 0.6 },
  ember: { bg: "#120308", panel: "#211016", accent: "#ff8a00", accent2: "#ff2dd4", grid: 0.45 },
  skeet: { bg: "#0b0f14", panel: "#0e1014", accent: "#00d7ff", accent2: "#00ff9c", grid: 0.55 },
};

const ThemeContext = createContext<any>(null);

function applyThemeValues(t:any){
  document.documentElement.style.setProperty("--bg", t.bg);
  document.documentElement.style.setProperty("--panel", t.panel);
  document.documentElement.style.setProperty("--accent", t.accent);
  document.documentElement.style.setProperty("--accent2", t.accent2);
  document.documentElement.style.setProperty("--grid-density", String(t.grid));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(() => {
    try {
      const s = localStorage.getItem("themeName");
      if (s && (s as ThemeName) in presets) return s as ThemeName;
    } catch (e) {}
    return "warp";
  });

  useEffect(()=> {
    const t = presets[theme];
    applyThemeValues(t);
    try { localStorage.setItem("themeName", theme); } catch(e) {}
  },[theme]);

  return <ThemeContext.Provider value={{ theme, setTheme, presets }}>{children}</ThemeContext.Provider>;
}

export function useTheme(){ return useContext(ThemeContext); }
