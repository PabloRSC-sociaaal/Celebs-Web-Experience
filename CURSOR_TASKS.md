# CURSOR TASKS — Landing Page

> This file is the handoff from Claude Code to Cursor.
> Read this before touching any file. The project has two agents working simultaneously.

---

## Territory

**Cursor owns these files — work freely:**
```
web/src/pages/Landing/             ← all yours
web/src/pages/Landing/sections/    ← all yours
web/src/components/                ← shared UI components
web/src/design/tokens.js           ← design tokens
```

**DO NOT touch these files (Claude Code owns them):**
```
web/src/pages/Analyzing/
web/src/pages/Results/
web/src/pages/Dashboard/
web/src/AnalyzingPage.jsx
web/src/ResultsPage.jsx
web/src/DashboardPage.jsx
web/src/services/
web/src/features/
```

**Coordinate before touching (shared files — do git pull first, commit fast):**
```
web/src/router/index.jsx      → add a comment with what route you're adding
web/src/store/appStore.js     → add your state in a clearly labelled block
web/src/design/tokens.js      → you can edit freely, just don't remove existing keys
```

---

## How to run

```bash
# From project root:
npm run dev          # web on http://localhost:5173
npm run dev:api      # api on http://localhost:3001
npm run dev:all      # both at once
```

---

## Active tasks for the Landing

Work through these with the user in order. Each task is one commit.

### TASK 1 — Hero copy & messaging
- [ ] Review and sharpen the headline in `Hero.jsx`
- [ ] Review the sub-headline and bullet stats ("12M+ users", "4,000+ facial points", etc.)
- [ ] The badge "🔥 #1 ENTERTAINMENT PLATFORM" — confirm wording with user

### TASK 2 — Hero visual polish
- [ ] The hero upload widget (`HeroUpload` component) has 3 phases: idle / validating / ready. Review UX copy in each phase.
- [ ] The upload box is in `web/src/components/HeroUpload/index.jsx` — only touch copy/styles, not the detection logic inside `handleFile`

### TASK 3 — "How it Works" section
- File: `web/src/pages/Landing/sections/HowItWorks.jsx`
- [ ] Review the 3-step flow copy and icons
- [ ] Consider adding a 4th step: "Save & compare in your dashboard"

### TASK 4 — Social proof / Reviews
- File: `web/src/pages/Landing/sections/Reviews.jsx`
- [ ] Review testimonial copy (currently placeholder names/text)
- [ ] Add realistic match percentages to each review card

### TASK 5 — Stats bar
- File: `web/src/pages/Landing/sections/StatsBar.jsx`
- [ ] Numbers: "12M+ users", "50,000+ celebrities", "4,847 facial points" — confirm or update with user
- [ ] Consider animated counters (use `Counter` component from `web/src/components/Counter/`)

### TASK 6 — Final CTA section
- File: `web/src/pages/Landing/sections/FinalCTA.jsx`
- [ ] Review CTA copy and button label
- [ ] Consider adding urgency or social proof element

### TASK 7 — Footer
- Built inside `web/src/pages/Landing/index.jsx` (bottom of the file)
- [ ] Links: Contact, Terms, Privacy, FAQ — confirm if any should be real pages or stay as `href="#"`
- [ ] Social icons: TikTok, IG — add real URLs when available

### TASK 8 — Navbar
- Built inside `web/src/pages/Landing/index.jsx`
- [ ] "How it works" and "Results" anchor links — confirm they scroll to correct `id`s
- [ ] "Get Started" button — currently no action. Should it scroll to hero upload? Or open modal?

### TASK 9 — Mobile responsive pass
- [ ] Test all sections at 375px (iPhone SE), 390px (iPhone 14), 768px (iPad)
- [ ] Hero grid collapses to vertical: left copy on top, upload widget below
- [ ] Nav links hidden on mobile — consider hamburger or simplified nav

### TASK 10 — Performance & meta
- File: `web/index.html`
- [ ] Update `<title>`, `<meta description>`, OG tags
- [ ] Add `<link rel="preconnect">` for Google Fonts

---

## Design system reference

Always import from tokens, never hardcode:
```js
import { colors, fonts, radii, shadows } from "../../design/tokens";

colors.yellow   // #FFE500 — primary CTA
colors.blue     // #2AABE2 — brand primary  
colors.black    // #0A0A0A — background
colors.pink     // #FF3CAC — accent
colors.white    // #FFFFFF

fonts.display   // 'Fredoka', sans-serif  — headings
fonts.body      // 'Oxanium', sans-serif  — UI text
```

## Hover state pattern (no CSS :hover with inline styles)
```jsx
onMouseEnter={e => e.currentTarget.style.color = colors.yellow}
onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.85)"}
```

## Responsive font sizes
```js
fontSize: "clamp(32px, 6vw, 58px)"
```

---

## Commit convention
```
feat(landing): improve hero headline copy
fix(landing): hero section mobile layout at 375px
style(landing): update stats bar numbers
```

After each task: `git add . && git commit -m "..."` so Claude Code can pull cleanly.
