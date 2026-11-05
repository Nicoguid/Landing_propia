# Portfolio Web - Project Directives & Mandatory Skills

This project is a high-performance, custom-coded web developer portfolio (Vanilla HTML5, Tailwind CSS, Spline 3D, Custom CSS/JS) focusing on extreme speed (<0.3s load), distinctive design (zero templates), and WhatsApp conversion.

## Active Skills & Rules Enforced on Every Prompt

In every response and code modification within this project, you MUST strictly adhere to the installed design, UI, and accessibility skills located in `.agents/skills/`:

### 1. Distinctive Frontend Design (`frontend-design`)
- **No Generic AI Slop:** Avoid clichéd AI templates (e.g., standard rounded card kits with the same border-radius, tracked-out ALL-CAPS eyebrows on every section, decorative gradient overlays without purpose, middle-dot meta strings `A · B · C`).
- **Intentional Typography & Contrast:** Maintain deliberate type hierarchy (`Inter` + `Geist Mono`). Adhere to line lengths under 80 characters for readability.
- **Intentional Motion:** Do not scatter generic entrance fade-ins across every card. Reserve animations for purposeful user interactions or a single signature hero element. Keep animations hardware-accelerated (`transform`, `opacity`).

### 2. Web Interface Guidelines (`web-design-guidelines`)
- **Interactive Targets & Ergonomics:** Ensure all clickable elements, links, and buttons have minimum touch targets of 44x44px.
- **Visual Feedback:** All interactive elements must have visible `:hover`, `:focus-visible`, and `:active` states.
- **Zero CLS & Performance:** Prevent layout shifts by sizing media/elements explicitly. Preserve instant-load metrics (<0.3s).

### 3. Baseline UI & UI Polish (`baseline-ui` & `ui-skills`)
- **Spacing & Layout:** Maintain cohesive spacing tokens, avoid arbitrary magic numbers, use dynamic viewport units (`h-dvh` instead of `h-screen`).
- **Safe Areas & Mobile:** Always respect mobile safe area insets (`env(safe-area-inset-*)`).
- **Compositor Animations:** Never animate layout properties (`width`, `height`, `top`, `left`, `margin`, `padding`). Transitions should be swift ($\le 200$ms).

### 4. Accessibility & Inclusive Design (`accessibility-audit`, `accesslint`)
- **WCAG 2.1/2.2 AA Compliance:** High color contrast (minimum 4.5:1 for normal text, 3:1 for large text / UI controls).
- **Semantics & ARIA:** Use semantic HTML elements (`<header>`, `<main>`, `<section>`, `<nav>`, `<button>`, `<a>`). Do not use `div` for interactive controls. All icon-only buttons MUST have meaningful `aria-label`.
- **Keyboard Navigation:** Full keyboard navigation without keyboard traps, visible focus rings with sufficient contrast (`focus-visible:ring-2 focus-visible:ring-[#D4FF00]`).
- **Forms & Inputs:** Real labels, explicit error states, never disable paste in text fields.

### 5. Mobile & Cross-Platform (`react-native-skills`)
- Apply React Native component and performance guidelines whenever native mobile views, modules, or apps are referenced or created.
