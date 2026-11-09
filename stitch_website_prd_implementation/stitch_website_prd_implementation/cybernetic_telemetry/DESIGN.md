---
name: Cybernetic Telemetry
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#424656'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737687'
  outline-variant: '#c2c6d9'
  surface-tint: '#0053da'
  primary: '#004cca'
  on-primary: '#ffffff'
  primary-container: '#0062ff'
  on-primary-container: '#f3f3ff'
  inverse-primary: '#b4c5ff'
  secondary: '#006688'
  on-secondary: '#ffffff'
  secondary-container: '#00c1fd'
  on-secondary-container: '#004b65'
  tertiary: '#415976'
  on-tertiary: '#ffffff'
  tertiary-container: '#5a7190'
  on-tertiary-container: '#f0f4ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#c2e8ff'
  secondary-fixed-dim: '#75d1ff'
  on-secondary-fixed: '#001e2b'
  on-secondary-fixed-variant: '#004d67'
  tertiary-fixed: '#d2e4ff'
  tertiary-fixed-dim: '#b0c8eb'
  on-tertiary-fixed: '#001c37'
  on-tertiary-fixed-variant: '#314865'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  status-online: '#10B981'
  status-online-glow: '#34D399'
  status-online-surface: '#ECFDF5'
  status-offline: '#EF4444'
  status-offline-glow: '#F87171'
  status-offline-surface: '#FEF2F2'
  status-unreachable: '#F59E0B'
  status-unreachable-surface: '#FFFBEB'
  status-maintenance: '#6366F1'
  status-maintenance-surface: '#EEF2FF'
  telemetry-cyan: '#00C2FF'
  surface-canvas: '#F4F7FB'
  surface-card: '#FFFFFF'
  surface-card-subtle: '#F8FAFC'
  border-subtle: '#E2E8F0'
  border-strong: '#CBD5E1'
  text-primary: '#0F172A'
  text-secondary: '#475569'
  text-muted: '#94A3B8'
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  telemetry-data:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: -0.01em
  telemetry-badge:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.05em
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

The design system establishes a high-performance, mission-critical operational atmosphere for modern IT administrators, NOC engineers, and enterprise infrastructure managers. It balances crisp corporate authority with energetic telemetry aesthetics: deep oceanic slates, brilliant cobalt blues, and vivid cyan bioluminescent conduits that communicate real-time connectivity, latency awareness, and zero-latency health.

The style fuses **Corporate Modern** with **Technical Glassmorphism**:
- **High-Density Legibility:** Data-rich dashboards engineered for instant triage, allowing network engineers to differentiate healthy links from failing switches within sub-second visual scanning.
- **Luminescent Telemetry:** Active nodes, live packets, and ping streams leverage radiant cyan accents (`#00C2FF`) against calm slate backgrounds, capturing the aesthetic of dynamic fiber optics and physical enterprise server racks.
- **Diagnostic Triage:** High-visibility semantic signals (emerald online, ruby offline, amber unreachable) calibrated for instant detection across 4K NOC command wall displays and desktop terminals alike.

## Colors

The palette establishes a high-contrast clinical hierarchy built on corporate cobalt, luminescent cyan, and pure diagnostic indicators:

- **Primary (`#0062FF`):** Vibrant enterprise cobalt. Used for active navigation controls, primary actions, selected states, and structural telemetry anchors.
- **Secondary (`#00C2FF`):** Radiant cyan. Represents live pulses, real-time data packets, active WebSocket connections, and real-time focus rings.
- **Tertiary (`#0A2540`):** Deep command navy. Anchors high-level structural layouts, enterprise branding, server rack containers, and high-impact typographic headlines.
- **Neutral (`#64748B`):** Cool slate. Drives metadata labels, border strokes, and contextual secondary details without competing with critical status alerts.

### Status Indicators
- **Online (`#10B981` / Surface `#ECFDF5`):** Signal emerald indicating verified ICMP ping responses, active SNMP ports, and zero packet loss.
- **Offline (`#EF4444` / Surface `#FEF2F2`):** Alert ruby reserved exclusively for confirmed dropped nodes, failed gateways, and critical downlinks.
- **Unreachable (`#F59E0B` / Surface `#FFFBEB`):** Diagnostic amber indicating indirect parent switch failure, eliminating redundant notification storms.
- **Maintenance (`#6366F1` / Surface `#EEF2FF`):** Indigo indicator for muted nodes undergoing scheduled maintenance.

## Typography

The typographic hierarchy is built on a tripartite functional division:

1. **Brand & Section Headings (`Space Grotesk`):** Provides a sharp, technical, geometric presence reminiscent of modern network hardware and enterprise architecture panels.
2. **Body & Interface (`Inter`):** Delivers clean readability across dense device tables, configuration modals, and log entries without visual fatigue.
3. **Data & Telemetry (`JetBrains Mono`):** Dedicated to IP addresses, MAC addresses, latency metrics (`ms`), port identifiers, and timestamp stamps. The monospaced alignment guarantees zero optical shifting during real-time ping updates.

## Layout & Spacing

The system implements a responsive 12-column fluid grid tailored for NOC control rooms, executive monitors, and mobile IT incident responses.

- **Breakpoints:**
  - `Desktop / NOC Display (≥ 1280px)`: 12 columns, 24px gutters, 32px canvas margin. Max content bounding box: 1600px (allows full topological expansion).
  - `Tablet / Laptop (768px – 1279px)`: 8 columns, 16px gutters, 24px margin. Metric cards reflow to a 2x2 grid; table enables horizontal scroll or priority-column folding.
  - `Mobile (≤ 767px)`: 4 columns, 12px gutters, 16px margin. Metrics fold into a compact swipeable bar; device rows convert to diagnostic card tiles prioritizing offline nodes.

- **Rhythm & Density:** Layout elements utilize high-density vertical pacing (`space-sm` for table rows, `space-xs` between IP and hostnames) to display 20+ monitored devices within the first viewport without forcing unnecessary pagination.

## Elevation & Depth

Visual hierarchy uses **Technical Layering & Subtle Luminescent Shading**:

- **Level 0 (Canvas Base):** `#F4F7FB` crisp cool slate canvas simulating a calibrated control station.
- **Level 1 (Card & Module Layer):** `#FFFFFF` with ultra-crisp hairline borders (`1px solid #E2E8F0`) and diffused elevation: `box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04), 0 6px 16px -4px rgba(0, 98, 255, 0.04)`.
- **Level 2 (Telemetry Overlays & Hover):** Lifted surfaces for hover states and sticky toolbars: `box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(0, 98, 255, 0.15)`.
- **Level 3 (Modals & Command Drawers):** `box-shadow: 0 20px 32px -8px rgba(10, 37, 64, 0.2), 0 0 0 1px rgba(226, 232, 240, 0.8)`.
- **Luminescent Halo (Active Telemetry Glow):** Real-time pulse badges use a dual-layer soft glow:
  - Online live beacon: `box-shadow: 0 0 10px rgba(16, 185, 129, 0.45)`.
  - Offline alert beacon: `box-shadow: 0 0 12px rgba(239, 68, 68, 0.5)`.
  - Selected network conduit: `box-shadow: 0 0 16px rgba(0, 194, 255, 0.35)`.

## Shapes

The design system maintains a balanced architectural curvature (Level 2):
- **Base Surfaces & Cards:** `0.75rem` (`12px`) corner radius delivering an approachable yet engineered tech aesthetic.
- **Control Buttons & Inputs:** `0.5rem` (`8px`) for strict tactile precision.
- **Diagnostic Chips & Live Pulsers:** Full pill radius (`9999px`) to emphasize distinct telemetry status indicators from structured data grids.

## Components

### 1. Status Badges & Live Beacons
- **Format:** Monospaced uppercase text accompanied by an animated or static ping dot.
- **Online:** Surface `#ECFDF5`, text `#065F46`, border `#A7F3D0`. Includes a 6px pulsing dot with a glowing ring.
- **Offline:** Surface `#FEF2F2`, text `#991B1B`, border `#FECACA`. Features a high-contrast badge that leads the visual triage.
- **Unreachable:** Surface `#FFFBEB`, text `#92400E`, border `#FDE68A`. Indicates parent node dependency failure.
- **Maintenance:** Surface `#EEF2FF`, text `#3730A3`, border `#C7D2FE`.

### 2. Metric Summary Cards
- White background (`#FFFFFF`) with top border accent: 3px solid strip (Cobalt `#0062FF` for Total, Emerald for Online, Ruby for Offline, Amber for Unreachable).
- Incorporates high-legibility Space Grotesk big numbers (32px) paired with JetBrains Mono delta indicators (`+0.02% uptime`, `2 pending`).

### 3. Telemetry Table & Device Rows
- **Header:** Sticky, uppercase `Space Grotesk` (11px, letter-spacing `0.08em`), background `#F8FAFC`, border bottom `1px solid #CBD5E1`.
- **Row Styling:** Hover transitions to `#F0F7FF`. Devices in `Offline` status pin to the top of the table by default with a subtle left border highlight in `#EF4444`.
- **Latency Cells:** Display numeric value (`14 ms`) alongside a 3-bar miniature signal glyph or inline micro sparkline.

### 4. Interactive Buttons & Controls
- **Primary Button:** `#0062FF` solid background, white text, 8px radius, font weight 600. Hover triggers an elevation lift and subtle cyan glow: `0 4px 14px rgba(0, 98, 255, 0.35)`.
- **Diagnostic Action ("Check Now"):** Slate outline (`1px solid #CBD5E1`), `#0F172A` text, supporting an spinning refresh icon during WebSocket polling execution.
- **Emergency Action:** Ruby fill (`#EF4444`) with white text for isolating subnets or overriding failovers.

### 5. Input Fields & Search Bars
- Background `#FFFFFF` with `#E2E8F0` border.
- **Active Focus State:** Shifts border to `#0062FF` with a cyan outer halo: `box-shadow: 0 0 0 3px rgba(0, 194, 255, 0.25)`.
- Dedicated prefix slot for monospaced subnet masks or IP filters (`192.168.1.0/24`).

### 6. Topology Node Cards (Network Map View)
- Miniature enterprise rack cards containing device avatar (Switch, AP, Router, Server), hostname, IP, and a glowing connection beam connecting to parent switch nodes.
- Disconnected links turn dashed and color-shift to ruby red `#EF4444`.