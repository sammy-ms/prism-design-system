# Prism Design System

A design system showcase and tool built with Angular 21, featuring color tokens, icon browser, and AI-powered design assistance.

## Tech Stack

- **Framework:** Angular 21.1.0 (standalone components, signals, SSR)
- **Styling:** SCSS with CSS custom properties (design tokens)
- **Testing:** Vitest (via Angular CLI) — `npm test`
- **Formatting:** Prettier (100 char width, single quotes, Angular HTML parser)
- **AI:** Genkit 1.29.0 with Claude Sonnet 4.5 (@genkit-ai/anthropic)
- **Server:** Express 5 with Angular SSR
- **Package Manager:** npm
- **Deployment:** Vercel

## Commands

- `npm start` — Dev server at localhost:4200
- `npm run build` — Production build with SSR
- `npm run watch` — Dev watch mode
- `npm test` — Run Vitest tests
- `npm run serve:ssr:prism-design-system` — Run SSR server from dist

## Project Structure

```
prism-design-system/
├── src/
│   ├── app/
│   │   ├── layout/          # Sidebar, topbar components
│   │   ├── pages/           # Colors, icons, spacing, typography, placeholder pages
│   │   ├── services/        # ai.service.ts, theme.service.ts
│   │   ├── app.ts           # Root standalone component
│   │   ├── app.routes.ts    # Lazy-loaded route definitions
│   │   └── app.config.ts    # Bootstrap config
│   ├── genkit/flows.ts      # AI flow definitions
│   ├── styles/tokens/       # SCSS color token files
│   └── server.ts            # Express SSR server
└── public/                  # Static assets
```

## Coding Conventions

### Components

- All components are **standalone** (no NgModules)
- Use `inject()` for dependency injection, not constructor injection
- Use `signal()`, `computed()`, `input()`, `output()` — not decorators
- Selector prefix: `app-`
- Separate template and style files (`.html` + `.scss`)

### Naming

- Components: PascalCase class names (e.g., `IconsPage`, `Sidebar`)
- Services: `*.service.ts` with `providedIn: 'root'`
- CSS classes: `ms-*` prefix
- CSS variables: `--semantics-*` (semantic), `--primitives-*` (primitive)

### Formatting

- 2-space indentation
- Single quotes in TypeScript
- Max line width: 100 characters

### Routing

- Lazy-loaded routes with dynamic `import().then()` pattern
- Route data includes `{ title: 'Page Title' }`

### State Management

- Angular signals for all reactive state
- `toSignal()` for RxJS interop
- No external state library (NgRx, etc.)

## Key Architectural Decisions

- SSR enabled with Express — AI routes lazy-loaded to avoid requiring API key at build time
- Icons generated from Figma exports via `.mjs` build scripts, stored as TypeScript data
- Token system: primitive tokens (colors) → semantic tokens (purposes) with light/dark variants
- ANTHROPIC_API_KEY env var required only at runtime for AI features

## Gotchas

- `skipTests: true` is set in angular.json for all schematics — no test files exist yet
- No ESLint configured — Prettier is the only code quality tool
- AI features require `ANTHROPIC_API_KEY` at runtime only; app builds fine without it
- Icon data (`icon-data.ts`) is auto-generated from Figma SVGs — don't edit manually
