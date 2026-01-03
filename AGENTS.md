# Livvay Workspace Instructions

Read this file before creating or changing anything in this repo.

## Design System (Supabase)

Use the Supabase Design System for layout, typography, color usage, accessibility, icons, and UI patterns.

Reference docs:
- https://supabase-design-system.vercel.app/design-system
- https://supabase-design-system.vercel.app/design-system/docs/accessibility
- https://supabase-design-system.vercel.app/design-system/docs/color-usage
- https://supabase-design-system.vercel.app/design-system/docs/copywriting
- https://supabase-design-system.vercel.app/design-system/docs/icons
- https://supabase-design-system.vercel.app/design-system/docs/tailwind-classes
- https://supabase-design-system.vercel.app/design-system/docs/theming
- https://supabase-design-system.vercel.app/design-system/docs/typography
- https://supabase-design-system.vercel.app/design-system/docs/ui-patterns/layout
- https://supabase-design-system.vercel.app/design-system/docs/ui-patterns/forms
- https://supabase-design-system.vercel.app/design-system/docs/ui-patterns/empty-states
- https://supabase-design-system.vercel.app/design-system/docs/ui-patterns/charts

---

## Supabase Design System - Complete Guidelines

### Architecture Overview

The design system uses a three-tier component architecture:
1. **Atom Components** - Foundational building blocks (Button, Input, Card, Dialog)
2. **Fragment Components** - Assembled from atoms (Modal, Filter Bar, Page Header, Metric Card)
3. **UI Patterns** - Design guidelines for common interface patterns

---

### Accessibility Guidelines

#### Core Principles
Build interfaces for as many people as possible across as many circumstances as possible. Focus on four key affordances:
- Keyboard navigation
- Legible and resizable elements
- Large tap targets
- Clear and simple language

#### Keyboard Navigation & Focus Management

**Essential Requirements:**
- ALL interactive elements MUST be keyboard-reachable
- Add `tabIndex={0}` to buttons, links, and non-text inputs at component level
- Tie `tabIndex` state to the `disabled` property when applicable
- Elements MUST have a `focus-visible` state with consistent styles like `inset-focus`

**Browser Behavior:**
- Chromium and Firefox handle Tab navigation automatically
- Safari requires Option key unless "Keyboard navigation" is enabled in macOS Settings

**Interactive Elements Pattern:**
```tsx
// Interactive table rows require:
// - onClick handler
// - onKeyDown handler supporting Enter/Space keys
// - tabIndex={0} attribute
// - Conditional logic to prevent bubbling from child elements
<tr
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') handleClick()
  }}
  tabIndex={0}
>
```

#### Radio Group Behavior
- Only the first item receives Tab focus
- Arrow keys (up/down/left/right) navigate individual options
- Space activates selections (Enter as secondary)

#### Keyboard Navigation for Large Lists
For content with hundreds/thousands of items:
- Implement search and filtering
- Use pagination or virtualization
- Provide "jump to" shortcuts

#### Screen Reader Support

**Imagery Guidelines:**
- Use descriptive `alt` attributes with objective content descriptions
- Icons use `aria-label` attributes for meaningful labels
- Purely decorative elements use `aria-hidden="true"` (NEVER on focusable elements)

**Scaffolding Elements:**
- Non-visual structural elements need `sr-only` text labels
- Provides context that's visually obvious but unclear to screen reader users

**Code Examples:**
```tsx
// Icon with meaning
<SaveIcon aria-label="Save document" />

// Decorative icon (hidden from screen readers)
<DecorationIcon aria-hidden="true" />

// Screen-reader-only text
<span className="sr-only">Additional context for screen readers</span>
```

---

### Color Usage Guidelines

#### Text Colors

**Primary Text Options:**
| Class | Purpose |
|-------|---------|
| `text-foreground` | Default text color |
| `text-foreground-light` | Softer text variant |
| `text-foreground-lighter` | Even lighter text |
| `text-foreground-muted` | De-emphasized text |
| `text-contrast` | High contrast text |

**Accent Text Colors (USE SPARINGLY):**
| Class | Purpose |
|-------|---------|
| `text-destructive` | Error/danger states |
| `text-warning` | Warning states |
| `text-brand` | Brand emphasis |

#### Background Colors

**Standard Backgrounds:**
| Class | Purpose |
|-------|---------|
| `bg` | Primary application background |
| `bg-200` | Secondary background layer |
| `bg-alternative` | Alternative background for contrast |
| `bg-alternative-200` | Lighter alternative variant |
| `bg-selection` | Selected element backgrounds |
| `bg-control` | Control element backgrounds |

**Surface Layers (for nested depth):**
| Class | Purpose |
|-------|---------|
| `bg-surface-75` | Subtle surface elevation (www/docs only) |
| `bg-surface-100` | Light surface / panel elements |
| `bg-surface-200` | Medium surface / dropdowns |
| `bg-surface-300` | Dark surface / stacked surfaces |
| `bg-surface-400` | Darkest surface |

**Specialized Backgrounds:**
| Class | Purpose |
|-------|---------|
| `bg-overlay` | Modal and overlay backgrounds |
| `bg-overlay-hover` | Hover states on overlays |
| `bg-muted` | Muted content areas |
| `bg-button` | Button backgrounds |
| `bg-dialog` | Dialog backgrounds (uses app bg color) |
| `bg-dash-sidebar` | Dashboard sidebar |
| `bg-dash-canvas` | Dashboard canvas area |
| `bg-studio` | Studio/dashboard backgrounds |

**Data Grid Empty Space:**
Use `bg-alternative` for empty space in data grids to add depth across different themes.

#### Border Colors

| Class | Purpose |
|-------|---------|
| `border` or `border-default` | Standard borders |
| `border-muted` | Subtle borders |
| `border-secondary` | Secondary borders |
| `border-overlay` | Overlay borders |
| `border-control` | Control borders |
| `border-alternative` | Alternative borders |
| `border-strong` | Emphasized/hover borders |
| `border-stronger` | Highly emphasized borders |
| `border-button` | Button borders |
| `border-button-hover` | Button hover borders |

#### Semantic Color Scales

Each semantic color (brand, warning, destructive) supports graduated intensity:
- `200` - Lightest
- `300`
- `400`
- `500` - Default/Primary
- `600` - Darkest

Examples: `bg-destructive-200`, `bg-warning-400`, `bg-brand-600`

#### Key Color Rules

1. **Contrast Requirements:** All utility classes are contrast-checked defaults
2. **Dialog Treatment:** Dialogs MUST use the same app background color as the site
3. **Theme Consistency:** Use `bg-alternative` for colors that work across different themes
4. **Opacity Support:** All colors support Tailwind opacity syntax: `bg-surface-300/90`, `/80`, `/50`

---

### Copywriting Guidelines

#### Voice and Tone Principles

| Principle | Description |
|-----------|-------------|
| **Direct** | Describe what something does, not what it enables |
| **Action-oriented** | Focus on outcomes, not features |
| **Technical without jargon** | Use precise terms with explanations |
| **Pragmatic** | Acknowledge tradeoffs |

#### Button & Action Copy

**Core Rule:** Use action verbs, not nouns.

| Bad | Good |
|-----|------|
| "Remove" | "Delete project" |
| "Change" | "Revoke access" |
| "Configure" | "Enable RLS" |
| "Submit" | "Create table" |
| "Go back" | "Cancel" |

#### Form Labels & Descriptions

**Labels:** Describe the field itself, not the feature.
- Good: "Table name"
- Bad: "Name your table"

**Descriptions:** Focus on constraints and requirements.
- Good: "Must be unique within the schema"
- Bad: "This ensures your table name is unique"
- Use present tense: "Stores connection pool settings" not "Will store..."

#### Error Messages

**Formula:** State the problem, then how to fix it.

| Bad | Good |
|-----|------|
| "An error occurred" | "Table name already exists. Choose a different name." |
| "Invalid input" | "Password must be at least 8 characters" |
| "Connection error" | "Connection failed: timeout after 30 seconds" |

**Avoid:** Apologetic language ("Sorry, we couldn't...") or blame language ("Oops!")

#### Success Messages

Confirm the specific action completed, keep it brief.

| Bad | Good |
|-----|------|
| "Success!" | "Table created successfully" |
| "Done" | "API key revoked" |

#### Tooltips & Help Text

- Explain *why* a feature matters, not *what* it does
- Maximum: One sentence
- Complex features need clearer explanations, not longer tooltips

#### Navigation & Headings

- **ALWAYS use sentence case** (capitalize only first word)
- Good: "Set up authentication"
- Bad: "Set Up Authentication"

#### Empty States

State what's missing, then provide the solution with CTA.
- "No tables yet. Create your first table to get started."
- "No API keys. Generate a key to connect your application."

#### Loading States

Describe what's happening specifically, matching the trigger action verb.
- Good: "Creating table...", "Deleting project..."
- Bad: "Please wait...", "Loading..."

#### Confirmation Dialogs

State consequences clearly in active voice.
- "Delete this project? This action cannot be undone and will permanently delete all data."
- NOT: "Are you sure?"

#### Words to Avoid

- Marketing language: "easily," "simply," "powerful"
- Vague verbs: "manage," "handle," "work with," "process"

#### Formatting Rules

- **Sentence case** for all UI text
- **Inline code** for technical terms: `RLS`, `API key`, `supabase init`
- **No italics** for emphasis
- **Exclamation marks** only for critical/destructive action warnings
- Product names: Capitalize "Database," "Auth," "Storage," "Edge Functions," "Realtime," "Vector"
- Use "Postgres" not "PostgreSQL"

---

### Icons Guidelines

#### Icon Library
Use **Lucide** (`lucide-react`) for all standard UI icons. Create custom icons only when Lucide lacks the necessary icon.

#### Core Principles

1. **Paired Usage:** Icons MUST accompany text - they are not obvious enough alone
2. **Clarity:** Icons must be legible at small sizes and unembellished
3. **Consistency:** Use identical icons for similar actions throughout the application

#### Sizing Rules

- Default: `strokeWidth={2}` and `size={24}`
- Override based on context: `<Icon strokeWidth={1} size={16} />`

#### Color Application

Use Tailwind text classes to tint icons:
```tsx
<BucketAdd className="text-foreground-muted" />
```

**CRITICAL:** NEVER apply `text-destructive` to icons for destructive actions. The confirmation dialog handles destructive styling.

#### Custom Icon Specifications

If creating custom SVG icons:
- Dimensions: 24x24px with `viewBox="0 0 24 24"`
- Use `stroke="currentColor"` (no hardcoded colors)
- `stroke-width="1.5"` as standard
- Use `fill="none"` for transparent fills
- Icon artwork: approximately 18x18px, optically centered
- Remove unnecessary elements (`<clipPath>`, `<defs>`, `<g>` wrappers)
- Use only `<path>` elements

---

### Tailwind Classes Guidelines

#### Core Design Token System

The system uses CSS properties mapped to Tailwind utilities for theming. Six primitive color tokens:

| Token | Purpose |
|-------|---------|
| `background` | Main surfaces and overlays |
| `foreground` | Text and foreground elements |
| `border` | Border styling |
| `brand` | Primary accent color |
| `warning` | Alert/warning states |
| `destructive` | Error/destructive states |

#### Foreground (Text) Classes

| Class | Purpose |
|-------|---------|
| `text-foreground` | Default text color |
| `text-foreground-light` | Softer text variant |
| `text-foreground-lighter` | Even lighter text |
| `text-foreground-muted` | De-emphasized text |

#### Background Classes

| Class | Purpose |
|-------|---------|
| `bg-surface-100` | Panel/surface elements at base level |
| `bg-surface-200` | Overlapping content (dropdowns) |
| `bg-surface-300` | Stacked surfaces above 200 |
| `bg-alternative` | Inverted background option |
| `bg-overlay` | Overlay/popover backgrounds |
| `bg-control` | Input/checkbox/radio backgrounds |
| `bg-button` | Button background |

#### Border Classes

| Class | Purpose |
|-------|---------|
| `border` / `border-default` | Standard borders |
| `border-secondary` | Secondary variant |
| `border-alternative` | Inverted border |
| `border-overlay` | Overlay/popover borders |
| `border-control` | Input control borders |
| `border-strong` | Hover/focus states |
| `border-stronger` | Highlighted borders |

#### Semantic Color Scales

Brand, warning, and destructive tokens support: `200`, `300`, `400`, `500` (default), `600`, and `button` suffixes.

#### Key Features

- **Opacity Support:** `bg-surface-300/90`, `/80`, `/50`
- **Shorthand Utilities:** `text-muted` = `text-foreground-muted`
- **Color Mixing:** Any primitive may be applied to any utility: `border-foreground-light`, `bg-warning-600`

---

### Theming Guidelines

#### Supported Themes

1. **Light** - Standard light color scheme
2. **Dark (Classic Dark)** - Traditional dark theme
3. **Deep Dark** - Enhanced dark variant
4. **System** - Automatically switches based on OS settings

#### CSS Variables

```css
--font-custom: 'customFont', 'customFont Fallback', Circular, custom-font, Helvetica Neue, Helvetica, Arial, sans-serif;
--font-source-code-pro: 'Source Code Pro', Source Code Pro, Office Code Pro, Menlo, monospace;
```

#### Theme Implementation

- Use CSS custom properties for theme-aware colors
- Theme is applied via `data-theme` attribute on document root
- Persist user preference in localStorage
- Support `prefers-color-scheme: dark` media query for system theme

#### Design for Themes

- Use theme-aware color tokens (`text-foreground`, `bg-surface-100`)
- NEVER hardcode color values
- Test all components in light, dark, and deep dark modes

---

### Typography Guidelines

#### Font Families

**Primary Font Stack:**
```
'customFont', 'customFont Fallback', Circular, custom-font, Helvetica Neue, Helvetica, Arial, sans-serif
```

**Code Font Stack:**
```
'Source Code Pro', Source Code Pro, Office Code Pro, Menlo, monospace
```

#### Typography Shorthands

| Class | Purpose |
|-------|---------|
| `text-code-inline` | Apply to `<code>` for inline code styling |
| `text-brand-link` | Supabase green text meeting contrast requirements |

Typography shorthands are composed of core Tailwind utility classes. Reference `typography.scss` for complete list.

---

### Layout Pattern Guidelines

#### Core Layout Components

| Component | Purpose |
|-----------|---------|
| `PageContainer` | Provides consistent max-width and padding based on size variants |
| `PageHeader` | Compound component for headers with breadcrumbs, icons, titles, descriptions, actions |
| `PageSection` | Organizes content into sections with title, description, and action areas |

#### Layout Types

**Settings Pages:**
- Single-column layouts for configuration
- Use `PageHeader` with `size="default"`
- Use `PageContainer` with `size="default"`
- Organize settings into logical groups with `PageSection`

**List Pages:**
- Display collections of objects (tables, triggers, functions)
- Use `PageHeader` with `size="large"`
- Use `PageContainer` with `size="large"`
- Table actions align with filter controls (not sidebar)
- Simple lists without filters: actions in `PageHeaderAside` or `PageSectionAside`

**Full-Page Experiences:**
- Table editors, cron jobs, edge functions
- Use `size="full"` - content spans full viewport width

**Detail Pages:**
- Dense or lengthy content split into multiple sections
- Use `PageHeader` and `PageContainer` with `size="large"`
- Use `PageSection` with `orientation="horizontal"`
- Display summaries alongside content

---

### Forms Pattern Guidelines

#### Form Structure

- Keep consistent patterns across pages and side panels
- Page forms use `PageSection` with Card containers
- Horizontal alignment uses `FormItemLayout` with `layout="flex-row-reverse"`

#### FormItemLayout Component

Use for consistent form field layouts:
- Standard vertical layout for most forms
- `layout="flex-row-reverse"` for horizontal toggle/checkbox layouts

#### Form Validation

- Use `react-hook-form` + `zod` for form handling
- Display validation errors immediately below the input
- Use `text-destructive` for error messages
- Focus the first invalid field on submission

#### Button Placement

- Primary action on the right
- Cancel/secondary action on the left
- Use consistent spacing between buttons

---

### Empty States Guidelines

#### When to Use

1. **Initial State:** No data has been created yet
2. **Zero Results:** Search or filter returns no matches

#### Presentational Empty States

For initial states where users benefit from feature education:

```tsx
<EmptyState>
  <Icon />                    {/* Visual representation */}
  <Title>Create a vector bucket</Title>  {/* Action-oriented */}
  <Description>Store, index, and query your vector embeddings at scale</Description>
  <Button>Create bucket</Button>  {/* Primary CTA */}
</EmptyState>
```

**Rules:**
- Use action-oriented titles ("Create a..." not "No items found")
- Brief description of feature value
- Always include primary call-to-action

#### Table Empty States

For tables with zero results:
- Display a single row spanning all columns
- Mute table header text with `text-foreground-muted`
- Remove hover effects with `[&>td]:hover:bg-inherit`
- Include concise explanatory text

#### Data Grid Empty States

Full-width centered overlays with:
- Relevant icon
- Clear title and description
- Supporting illustration when space permits

#### Missing Route Handling

Use centered Admonition component:
- Clear error message
- Navigation button to valid page

---

### Charts Pattern Guidelines

#### Core Components

| Component | Purpose |
|-----------|---------|
| `<Chart>` | Root context provider managing loading/disabled states |
| `<ChartCard>` | Card wrapper with optional `asChild` for slot-based rendering |
| `<ChartHeader>` | Flex container for headers (alignment: start/center) |
| `<ChartContent>` | Main visualization container with state management |
| `<ChartTitle>` | Supports optional tooltips via help icon |
| `<ChartMetric>` | Labeled values with status indicators (positive/negative/warning) |
| `<ChartActions>` | Action buttons or links in header |
| `<ChartFooter>` | Container for table content below charts |
| `<ChartEmptyState>` | Pre-built empty state with icon, title, description |
| `<ChartLoadingState>` | Pre-built loading state |

#### Chart Types

**ChartLine:**
- Line chart for time-series data
- Default color: `hsl(var(--brand-default))`
- Hover color: `hsl(var(--brand-500))`

**ChartBar:**
- Bar chart for time-series data
- Same color defaults as ChartLine

Both support:
- Date formatting (default: 'MMM D, YYYY, hh:mma')
- Full-height rendering
- Highlight selection with date range callbacks
- Chart synchronization via `syncId`
- Custom Y-axis properties

#### State Management

```tsx
<Chart isLoading={loading} isDisabled={disabled}>
  <ChartContent isEmpty={data.length === 0}>
    <ChartLine data={data} />
  </ChartContent>
</Chart>
```

- `isLoading`: Shows loading state in all children via context
- `isEmpty`: Triggers empty state rendering
- `isDisabled`: Shows disabled state with optional custom component

#### Data Structure

```ts
// Line/Bar Chart Data
interface ChartData {
  timestamp: string;  // Required
  [key: string]: number | string;  // Additional fields matching dataKey
}
```

#### Best Practices

1. Always use default provided chart components first, not raw Recharts
2. Use `useChart` context for loading/disabled state visibility
3. Keep chart abstraction minimal for clarity

---

## Product + Compliance

- "Vida eterna" is a manifesto/ambition, NEVER a literal promise
- **NEVER use:** "garantido", "cura", "reverte idade", "imortalidade comprovada", "milagre"
- Blood panel or estimates must be framed as probabilistic guidance, NOT diagnosis
- Any mention of medical team/prescription needs a short responsibility note

---

## Stack + Conventions

- **Runtime/Package Manager:** Bun (use `bun` instead of `npm`/`yarn`)
- **Framework:** Next.js 16 App Router with TypeScript and React 19
- **Styling:** TailwindCSS 4; use existing tokens in `src/app/globals.css`
- **Components:** Live in `src/components`, keep simple and reusable

### Available Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.1.1 | Framework (App Router) |
| `react` / `react-dom` | 19.2.3 | UI library |
| `tailwindcss` | 4.x | Styling |
| `shadcn/ui` | - | UI component library (built on Radix UI) |
| `@radix-ui/*` | - | Headless UI primitives - USE THIS for accessible components |
| `lucide-react` | 0.562.0 | Icons - USE THIS for all icons |
| `framer-motion` | 12.x | Animations - use sparingly, only when it adds value |
| `react-hook-form` | 7.x | Form handling |
| `@hookform/resolvers` | 5.x | Form validation resolvers |
| `zod` | 4.x | Schema validation |
| `recharts` | - | Charts - USE THIS for all charts (do not use other chart libraries) |

### Usage Rules

- **UI Components:** Use `shadcn/ui` components when available. Add new ones with `bunx shadcn@latest add <component>`.
- **Headless Primitives:** Use `@radix-ui/*` for accessible, unstyled primitives (Dialog, Popover, Accordion, etc.).
- **Icons:** Always use `lucide-react`. Do NOT install other icon libraries.
- **Animations:** Use `framer-motion` only when animation adds meaningful UX value. Avoid gratuitous animations.
- **Forms:** Always use `react-hook-form` + `zod` combination. Do NOT use other form libraries.
- **Charts:** Always use `recharts`. Do NOT install Chart.js, Victory, or other chart libraries.
- **Styling:** Use TailwindCSS classes. Do NOT install styled-components, emotion, or CSS-in-JS libraries.

### shadcn/ui Commands

```bash
bunx shadcn@latest add button      # Add a component
bunx shadcn@latest add dialog      # Add dialog component
bunx shadcn@latest diff            # Check for updates
```

### Bun Commands

```bash
bun install          # Install dependencies
bun dev              # Start dev server
bun run build        # Build for production
bun run lint         # Run ESLint
bun add <package>    # Add a dependency
bun remove <package> # Remove a dependency
```

---

## Lead Capture

- Use `/api/lead` for email capture with `{ email, source, answers? }`
- Persist leads to `data/leads.json` (already implemented)

---

## Content

- Tone: TikTok energy with health-tech credibility
- Short sentences, no jargon
- Add a practical example when introducing a feature
