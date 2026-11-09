/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#0062FF",
        "primary-dark": "#004cca",
        "primary-container": "#0062ff",
        "on-primary": "#ffffff",
        "primary-fixed": "#dbe1ff",
        "primary-fixed-dim": "#b4c5ff",

        secondary: "#006688",
        "secondary-container": "#00c1fd",
        "on-secondary-container": "#004b65",

        tertiary: "#415976",
        "tertiary-container": "#5a7190",

        "telemetry-cyan": "#00C2FF",

        "status-online": "#10B981",
        "status-online-glow": "#34D399",
        "status-online-surface": "#ECFDF5",

        "status-offline": "#EF4444",
        "status-offline-glow": "#F87171",
        "status-offline-surface": "#FEF2F2",

        "status-unreachable": "#F59E0B",
        "status-unreachable-surface": "#FFFBEB",

        "status-maintenance": "#6366F1",
        "status-maintenance-surface": "#EEF2FF",

        "surface-canvas": "#F4F7FB",
        "surface-card": "#FFFFFF",
        "surface-card-subtle": "#F8FAFC",
        "surface-container-low": "#eff4ff",
        "surface-container": "#e5eeff",
        "surface-container-high": "#dce9ff",

        "border-subtle": "#E2E8F0",
        "border-strong": "#CBD5E1",

        "text-primary": "#0F172A",
        "text-secondary": "#475569",
        "text-muted": "#94A3B8",
        "on-surface": "#0b1c30",
        error: "#ba1a1a",
        "on-error": "#ffffff",
      },
      fontFamily: {
        headline: ["'Space Grotesk'", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        glow: "0 0 12px rgba(0, 194, 255, 0.35)",
        "online-glow": "0 0 10px rgba(16, 185, 129, 0.45)",
        "offline-glow": "0 0 12px rgba(239, 68, 68, 0.5)",
      },
    },
  },
  plugins: [],
};

