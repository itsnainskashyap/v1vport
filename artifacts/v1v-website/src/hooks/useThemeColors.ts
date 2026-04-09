import { useEffect } from "react";
import { useGetSettings } from "@workspace/api-client-react";

export function useThemeColors() {
  const { data: settings } = useGetSettings();

  useEffect(() => {
    if (!settings?.themeColors) return;
    const root = document.documentElement;
    const { primary, secondary, accent } = settings.themeColors;

    if (primary) {
      root.style.setProperty("--theme-primary", primary);
      const rgb = hexToRgb(primary);
      if (rgb) root.style.setProperty("--primary", `${rgb.r} ${rgb.g} ${rgb.b}`);
    }
    if (secondary) {
      root.style.setProperty("--theme-secondary", secondary);
    }
    if (accent) {
      root.style.setProperty("--theme-accent", accent);
    }
  }, [settings?.themeColors]);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}
