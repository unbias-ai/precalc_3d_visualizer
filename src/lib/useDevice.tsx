"use client";
import { useEffect, useState } from "react";

export default function useDevice() {
  const [device, setDevice] = useState<{ type: "mobile"|"tablet"|"desktop"; width: number; height: number }>({
    type: "mobile",
    width: typeof window !== "undefined" ? window.innerWidth : 360,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    function detect() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const ua = navigator.userAgent || "";
      let type: "mobile"|"tablet"|"desktop" = "desktop";
      if (w < 760 || /Mobi|Android/i.test(ua)) type = "mobile";
      else if (w >= 760 && w < 1100) type = "tablet";
      else type = "desktop";
      setDevice({ type, width: w, height: h });
    }
    detect();
    window.addEventListener("resize", detect);
    return () => window.removeEventListener("resize", detect);
  }, []);

  return device;
}
