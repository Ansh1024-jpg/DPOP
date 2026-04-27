---
name: Policy Onboarding Design System
colors:
  surface: '#faf9fc'
  surface-dim: '#dad9dd'
  surface-bright: '#faf9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f7'
  surface-container: '#eeedf1'
  surface-container-high: '#e9e7eb'
  surface-container-highest: '#e3e2e6'
  on-surface: '#1a1c1e'
  on-surface-variant: '#43474e'
  inverse-surface: '#2f3033'
  inverse-on-surface: '#f1f0f4'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#455f87'
  primary: '#022448'
  on-primary: '#ffffff'
  primary-container: '#1e3a5f'
  on-primary-container: '#8aa4cf'
  inverse-primary: '#adc8f5'
  secondary: '#30628d'
  on-secondary: '#ffffff'
  secondary-container: '#9fceff'
  on-secondary-container: '#245882'
  tertiary: '#341f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#503300'
  on-tertiary-container: '#c69b5f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#adc8f5'
  on-primary-fixed: '#001c3b'
  on-primary-fixed-variant: '#2d486d'
  secondary-fixed: '#cfe5ff'
  secondary-fixed-dim: '#9ccbfc'
  on-secondary-fixed: '#001d33'
  on-secondary-fixed-variant: '#104a74'
  tertiary-fixed: '#ffddb2'
  tertiary-fixed-dim: '#edbf7f'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#60410c'
  background: '#faf9fc'
  on-background: '#1a1c1e'
  surface-variant: '#e3e2e6'
  accent: '#0EA5E9'
  grey-50: '#F8FAFC'
  grey-100: '#F1F5F9'
  grey-200: '#E2E8F0'
  grey-300: '#CBD5E1'
  grey-400: '#94A3B8'
  grey-600: '#475569'
  grey-800: '#1E293B'
  grey-900: '#0F172A'
  success-bg: '#F0FDF4'
  success-border: '#86EFAC'
  success-text: '#166534'
  warning-bg: '#FFFBEB'
  warning-border: '#FCD34D'
  warning-text: '#92400E'
  danger-bg: '#FEF2F2'
  danger-border: '#FCA5A5'
  danger-text: '#991B1B'
  info-bg: '#EFF6FF'
  info-border: '#93C5FD'
  info-text: '#1E40AF'
  escalated-bg: '#FAF5FF'
  escalated-border: '#C4B5FD'
  escalated-text: '#6B21A8'
  orange-bg: '#FFF7ED'
  orange-border: '#FDBA74'
  orange-text: '#9A3412'
typography:
  display-title:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.25'
  section-heading:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.3'
  card-heading:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: '1.4'
  body-regular:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
  body-small:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
  label-overline:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.06em
  mono-data:
    fontFamily: monospace
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  2xl: 24px
  3xl: 32px
  4xl: 48px
---

# Design Spec — Life Insurance Policy Onboarding Platform

## Overview

A web application for reviewing and approving life insurance applications. Three types of users: Applicants (upload and correct their application), Policy Managers (review and action all submitted applications), and Managers (review escalated applications and make final decisions). The visual tone should feel trustworthy, institutional, and clean — like a modern fintech or enterprise SaaS product. Think Stripe Dashboard or Linear, not a consumer app.

---

## Design Principles

- **Trust over flair.** This handles sensitive personal and financial data. No gradients, no playful illustrations, no loud colours. Clean whites, neutral greys, and one controlled accent colour.
- **Data density with breathing room.** Managers and Policy Managers deal with tables and long forms. Information must be scannable — good typographic hierarchy, clear row separation, generous padding.
- **Status is always visible.** Every screen involving an application must show its current status clearly. Colour coding for statuses and severity levels is the primary communication tool.
- **Progressive disclosure.** The AI summary is long. Collapse sections by default, expand on demand. Don't dump everything on screen at once.

---

## Colour System

### Brand Colours
```
Primary Blue      #1E3A5F    Used for headers, primary buttons, active nav items
Primary Blue Light #2D5F8A   Hover state for primary blue
Accent            #0EA5E9    Used sparingly — links, focus rings, interactive highlights
```

### Neutral Palette
```
White             #FFFFFF    Page backgrounds, card backgrounds
Grey 50           #F8FAFC    Subtle section backgrounds, table row stripes
Grey 100          #F1F5F9    Input backgrounds, disabled states
Grey 200          #E2E8F0    Borders, dividers
Grey 300          #CBD5E1    Secondary borders
Grey 400          #94A3B8    Placeholder text, muted icons
Grey 600          #475569    Secondary text
Grey 800          #1E293B    Primary text
Grey 900          #0F172A    Headings
```

### Semantic / Status Colours

These are used for status badges, flag severity, risk levels, and alert banners.

```
Success Green     Background #F0FDF4   Border #86EFAC   Text #166534
Warning Amber     Background #FFFBEB   Border #FCD34D   Text #92400E
Danger Red        Background #FEF2F2   Border #FCA5A5   Text #991B1B
Info Blue         Background #EFF6FF   Border #93C5FD   Text #1E40AF
Neutral Grey      Background #F8FAFC   Border #CBD5E1   Text #475569
```

### Application Status → Colour Mapping
```
submitted          → Info Blue (neutral, just entered)
under_ai_review    → Info Blue + animated pulse dot
flagged            → Danger Red (action required)
corrections_made   → Warning Amber (in progress)
pending_review     → Warning Amber (waiting)
escalated          → Purple: Background #FAF5FF  Border #C4B5FD  Text #6B21A8
approved           → Success Green
rejected           → Danger Red (muted — #FEF2F2 bg, no urgency framing)
```

### Flag Severity → Colour Mapping
```
critical    → Danger Red  (#991B1B text, #FEF2F2 bg, #FCA5A5 border)
high        → Orange: Background #FFF7ED  Border #FDBA74  Text #9A3412
medium      → Warning Amber (#92400E text, #FFFBEB bg, #FCD34D border)
low         → Neutral Grey (#475569 text, #F8FAFC bg, #CBD5E1 border)
```

### AI Risk Level → Colour Mapping
```
low         → Success Green
medium      → Warning Amber
high        → Orange (same as High severity above)
critical    → Danger Red
```

---

## Typography

Font family: **Inter** (Google Fonts). Fall back to system-ui, sans-serif.

```
Display / Page Title    32px   700   Grey 900   Line height 1.25
Section Heading         20px   600   Grey 900   Line height 1.3
Card Heading            16px   600   Grey 800   Line height 1.4
Body Regular            14px   400   Grey 800   Line height 1.6
Body Small              13px   400   Grey 600   Line height 1.5
Label / Overline        11px   500   Grey 600   Uppercase, letter-spacing 0.06em
Monospace (PAN, Aadhaar, IDs)  13px  400  Grey 800  font-family: 'JetBrains Mono', monospace
```

---

## Spacing System

Base unit: 4px

```
4px    xs    Tight internal padding (badge padding)
8px    sm    Icon spacing, compact list items
12px   md    Card internal padding (vertical)
16px   lg    Standard gap, form field spacing
20px   xl    Section spacing within a card
24px   2xl   Card padding
32px   3xl   Section gap between cards
48px   4xl   Page section gap
```

---

## Elevation / Shadow

Only two levels of elevation used. No decorative shadows.

```
Card shadow     box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)
Modal shadow    box-shadow: 0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)
```

---

## Border Radius

```
Small     4px    Badges, tags, small chips
Medium    8px    Inputs, buttons, small cards
Large     12px   Main content cards
XL        16px   Modal dialog, large panel cards
```

---

## Components

### Buttons

**Primary Button**
- Background: #1E3A5F   Text: #FFFFFF   Border: none
- Padding: 10px 20px   Font: 14px 500   Border radius: 8px
- Hover: Background #2D5F8A
- Disabled: Background #E2E8F0   Text #94A3B8   Cursor not-allowed

**Secondary Button**
- Background: #FFFFFF   Text: #1E3A5F   Border: 1.5px solid #1E3A5F
- Padding: 10px 20px   Font: 14px 500   Border radius: 8px
- Hover: Background #EFF6FF

**Danger Button** (Reject actions)
- Background: #FFFFFF   Text: #991B1B   Border: 1.5px solid #FCA5A5
- Hover: Background #FEF2F2

**Success Button** (Approve actions)
- Background: #FFFFFF   Text: #166534   Border: 1.5px solid #86EFAC
- Hover: Background #F0FDF4

**Ghost Button** (Cancel, back actions)
- Background: transparent   Text: #475569   Border: none
- Hover: Background #F1F5F9

**Icon Button** (table row actions, compact areas)
- 32px × 32px   Border radius: 6px   Background: transparent
- Hover: Background #F1F5F9

---

### Status Badge

A small pill-shaped badge used in tables and page headers.

- Height: 22px   Padding: 0 10px   Border radius: 100px (full pill)
- Font: 12px 500
- Left dot: 6px circle, same colour as text, margin-right 6px
- Uses the status colour mapping defined above
- Text is the status label in human-readable form:
  - `submitted` → "Submitted"
  - `under_ai_review` → "AI Review"
  - `flagged` → "Flagged"
  - `corrections_made` → "Correcting"
  - `pending_review` → "Pending Review"
  - `escalated` → "Escalated"
  - `approved` → "Approved"
  - `rejected` → "Rejected"

---

### Severity Badge

Same pill shape as Status Badge but used for flag severity in the AI summary.

- critical: Red pill
- high: Orange pill
- medium: Amber pill
- low: Grey pill

---

### Form Input

- Height: 40px   Padding: 0 12px   Border radius: 8px
- Background: #FFFFFF   Border: 1px solid #E2E8F0   Font: 14px
- Focus: Border colour #0EA5E9, box-shadow 0 0 0 3px rgba(14,165,233,0.15)
- Error state: Border colour #FCA5A5, light red background #FEF2F2
- Placeholder: Grey 400 (#94A3B8)
- Label above input: 13px 500 Grey 800, margin-bottom 6px

**Flagged field input (applicant correction view)**
- Same as error state input, with a small red flag icon inside right side of input
- Below input: the flag issue text in 12px Danger Red

---

### Select / Dropdown

- Same height and styling as Form Input
- Right-side chevron icon in Grey 400
- Options dropdown: white background, 1px border Grey 200, border radius 8px, shadow level 1
- Option hover: Grey 50 background

---

### Table

Used in both dashboards.

**Header row**
- Background: Grey 50 (#F8FAFC)
- Font: 12px 500 Grey 600 uppercase, letter-spacing 0.06em
- Height: 44px   Padding: 0 16px
- Bottom border: 1px solid Grey 200
- Sortable columns: show up/down chevron icon, highlight column header in Accent blue when sorted

**Data rows**
- Height: 56px   Padding: 0 16px
- Font: 14px Grey 800
- Border-bottom: 1px solid Grey 100
- Hover: Background Grey 50
- Alternating rows: no zebra striping — clean white rows with hover effect only

**Column widths (dashboards):**
```
#                  48px    fixed
Applicant Name     200px   flex-grow
Submission Date    160px   fixed
Status             160px   fixed
AI Risk Level      130px   fixed
Actions            80px    fixed
```

---

### Card

Used to contain sections of content throughout the app.

- Background: #FFFFFF
- Border: 1px solid #E2E8F0
- Border radius: 12px
- Padding: 24px
- Shadow: Card shadow level

**Card with a section heading inside:**
- Heading at top: 16px 600 Grey 900, padding-bottom 16px, border-bottom 1px solid Grey 100
- Content below heading: padding-top 16px

**Collapsible card** (used in AI Summary sections):
- Heading row is clickable: shows chevron icon right-aligned
- Chevron rotates 180° when expanded
- Collapsed: only heading visible
- Expanded: content slides/fades in below heading

---

### Sidebar Navigation

Used on Policy Manager and Manager screens (persistent left sidebar).

- Width: 240px   Fixed position
- Background: #1E3A5F (Primary Blue)
- Top: Logo / App name in white — "Policy Onboarding" — 16px 600
- Nav items: 44px height, 16px horizontal padding, 14px 400 white with 0.8 opacity
- Active item: white background with 10% opacity, text full white opacity, left accent bar 3px #0EA5E9
- Hover: white background 5% opacity
- Bottom: User name + role in small white text + logout button

---

### Top Bar (Applicant screens)

Since applicants only have 2 screens, use a simple top navigation bar instead of a sidebar.

- Height: 64px   Background: #1E3A5F
- Left: App name "Policy Onboarding" in white 16px 600
- Right: User's full name in 13px white, and a logout link

---

### Modal

- Overlay: rgba(0,0,0,0.4) full-screen backdrop
- Modal box: white, border-radius 16px, shadow level 2, max-width 520px, centered
- Padding: 28px
- Heading: 18px 600 Grey 900
- Close button (×): top-right corner, Ghost button style
- Footer: right-aligned buttons with 12px gap, separated from content by a 1px Grey 200 top border with 20px padding-top

---

### Alert / Banner

Used to show flagged status, success confirmations, and informational messages.

- Full-width within its container   Border radius: 8px   Padding: 12px 16px
- Left accent border: 4px solid, same colour as the semantic colour's border
- Icon: left-most, 16px, semantic colour
- Text: 14px, semantic colour text value
- Dismiss button: right side, × icon, Ghost style

---

### Tooltip

- Background: Grey 900   Text: white   Font: 12px
- Border radius: 6px   Padding: 6px 10px
- Max width: 200px   Word wrap
- Arrow: 6px pointing to trigger element

---

## Page Layouts

### Layout 1 — Auth Layout (Login screen)
```
Full-page centre-aligned
Background: Grey 50 (#F8FAFC)
A single card in the centre: max-width 420px
Above card: App name + small tagline
Card contains: login form
Below card: small grey text "PoC — Internal Use Only"
```

### Layout 2 — Applicant Layout (Upload + Review screens)
```
Top bar (64px, Primary Blue) across full width
Content area below: max-width 1200px, centred, padding 32px
No sidebar
```

### Layout 3 — Manager Layout (Policy Manager + Manager dashboards and detail screens)
```
Left sidebar (240px, fixed)
Main content area to the right of sidebar
Main content: padding 32px, background Grey 50
Max content width: unconstrained (fills remaining space)
```

---

## Screen Designs

---

### Screen 1 — Login

**Layout:** Auth Layout (centred card on grey background)

**Elements:**
- App logo / icon: a simple shield icon in Primary Blue, 40px, above the card
- Card heading: "Welcome back" — 24px 600
- Card subheading: "Sign in to continue" — 14px Grey 600
- Username input (label: "Username")
- Password input (label: "Password", with show/hide toggle)
- "Sign In" Primary Button — full width
- Below button: 13px Grey 400 "Use your assigned credentials to access the platform"

**States:**
- Loading: button shows spinner, disabled
- Error: red alert banner above inputs "Invalid username or password"

---

### Screen 2 — Applicant: Upload

**Layout:** Applicant Layout

**Page title:** "Submit Your Application" — 24px 600 Grey 900

**Subheading:** "Upload your completed life insurance application form as a PDF file." — 14px Grey 600

**Upload area (main element):**
- Large dashed-border rectangle: border 2px dashed Grey 300, border-radius 12px, background Grey 50
- Height: ~200px
- Centred content inside: upload cloud icon (32px, Grey 400), text "Drag and drop your PDF here" (16px Grey 600), text "or" (13px Grey 400), "Browse Files" Secondary Button
- Accepted types label: "Accepted format: PDF only" — 12px Grey 400

**After file is selected (pre-submit state):**
- Dashed border changes to Success Green border
- Inside the box: file icon, file name, file size
- A "Remove" link (Danger text, no button style) appears beside the file name
- "Submit Application" Primary Button appears below the upload area, full-width on mobile or fixed 240px on desktop

**Processing state (after submit, waiting for AI):**
- Replace upload area with an animated state card
- Spinner icon (animated, Primary Blue)
- Heading: "Reviewing your application" — 16px 600
- Subtext: "Our AI is extracting and validating your application details. This may take a few seconds." — 14px Grey 600
- Do not show a progress bar — just the spinner

---

### Screen 3 — Applicant: Review & Correct

**Layout:** Applicant Layout, two-column

**Left column (40% width):** PDF Viewer
- Card container
- Heading: "Your Submitted Form" — 16px 600
- PDF embedded below heading in an iframe or react-pdf viewer
- Fixed height with scroll within the card (height: calc(100vh - 160px))

**Right column (60% width):** Extracted Data + Corrections

**Top of right column — Status Banner:**
- Alert banner using the application's current status colour
- If `flagged`: Red banner — "Action Required: X issues found. Please correct the highlighted fields below."
- If `corrections_made`: Amber banner — "Re-validating your corrections..."
- If `pending_review`: Success banner — "Application submitted. Your application is under review by our team."

**Below status banner — Section Cards (one per section):**
Each section card has:
- Card heading: section name (e.g. "Personal Details") + a summary badge on the right ("2 issues" in red, or "Complete" in green)
- Card is collapsed by default, expanded if it has unresolved flags
- Inside the card: a list of field rows

**Field row (normal, no flag):**
```
[Label — 13px Grey 600, 160px wide]    [Value — 14px Grey 800]
```
Two-column layout, label left, value right, separated by subtle dotted line or just spacing. 40px row height.

**Field row (flagged):**
```
[Label — 13px Grey 600]                [Value — editable input, red border]
                                        [Issue text — 12px Danger Red, below input]
                                        [Severity badge — inline with issue text]
```
Clicking the value (or it being in error state) shows an inline text input pre-filled with the extracted (wrong) value. The flag issue is shown below. On change, value is updated locally. On blur, correction is saved to backend.

**Sticky bottom bar (right column):**
- Fixed at bottom of the right column
- Background: white, top border 1px Grey 200, padding 16px 24px
- Left side: "X critical/high issues remaining" in Danger Red (or "All issues resolved" in Success Green)
- Right side: "Submit Application" Primary Button
- Button is visually greyed out (disabled state) when issues > 0
- Button becomes active (Primary Blue) when issues = 0
- After successful submit: replace button with a success message "Submitted successfully"

---

### Screen 4 — Policy Manager: Dashboard

**Layout:** Manager Layout (sidebar + main content)

**Page heading:** "Applications" — 28px 600

**Stats row (4 metric cards, full width, above the table):**
- "Total" — total application count
- "Pending Review" — count in pending_review status
- "Escalated" — count in escalated status
- "Decided Today" — approved + rejected today count

Each metric card:
- White background, card border, border-radius 8px, padding 20px
- Label: 12px 500 Grey 600 uppercase
- Number: 28px 600 Grey 900
- Small coloured dot or accent line at top matching semantic colour

**Filter bar (above table):**
- Left side: filter chips for Status (All | Pending Review | Escalated | Approved | Rejected) — pill-shaped toggle buttons, active chip is Primary Blue bg white text
- Right side: filter chips for Risk Level (All | Low | Medium | High | Critical) — same style, active uses risk-level colour

**Table:**
Standard table as defined in Components section. Columns: #, Applicant Name, Submission Date, Status, AI Risk Level, Actions.

Actions column: "View" Ghost button (or text link in Accent blue).

**Empty state (no applications matching filter):**
- Centre-aligned inside table area
- Grey folder icon (48px)
- "No applications found" — 16px Grey 600
- "Try adjusting your filters" — 13px Grey 400

---

### Screen 5 — Policy Manager: Application Detail

**Layout:** Manager Layout, three-panel within main content

**Breadcrumb at top:** "Applications > Rajesh Kumar — #APP-0012" — 13px Grey 600, with clickable "Applications" link

**Page heading row:**
- Left: Applicant name (24px 600) + Application ID (14px Grey 400) below
- Right: Status badge (large, 26px pill) + AI Risk Level badge side by side

---

**Three-panel layout below heading:**

**Panel A — PDF Viewer (left, 35% width)**
- Card container, no padding, just border and border-radius
- Heading row inside card: "Submitted Form" 14px 600, right side: "Download PDF" link with download icon
- PDF viewer fills remaining card height

**Panel B — Extracted Data + AI Summary (middle, 40% width)**
- Scrollable, fixed height (calc(100vh - 200px) with overflow-y: auto)
- Three collapsible cards stacked:

**Card 1 — "Extracted Details"**
- Collapsed by default
- Inside: five sub-sections (Personal, Occupation, Health, Insurance, Nominee)
- Each sub-section has a small grey sub-heading and field rows (label + value, same as applicant view but read-only)
- No editing possible here

**Card 2 — "Flag Breakdown"**
- Expanded by default if any flags exist
- Inside: a compact table
  - Columns: Severity (badge), Section, Field, Issue, Recommendation
  - Rows sorted by severity (critical first)
  - Severity column: just the badge
  - Issue and Recommendation: 13px, wraps if long
- If no flags: "No validation issues found" success message

**Card 3 — "Narrative Analysis"**
- Expanded by default
- Inside: labelled sections rendered as cards-within-card or simple sections:
  - **Completeness** — 1–2 sentence paragraph, 14px
  - **Risk Factors** — bulleted list, each bullet 14px, red dot for high-risk bullets
  - **Income & Cover Assessment** — paragraph
  - **Health Summary** — paragraph
  - **Nominee Assessment** — paragraph
  - **Overall Risk Profile** — a standalone callout box at the bottom of this card
    - Border-radius 8px, coloured background based on risk level (uses AI Risk Level colour)
    - Bold label: "Overall Risk Profile"
    - Value: the one-line summary text
    - Larger padding: 16px

**Panel C — Actions (right, 25% width)**
- Sticky card, stays in view while middle panel scrolls
- Heading: "Review Decision" 16px 600

- Applicant info summary (compact):
  - Name, Age, Sum Assured, Annual Income — each as a label + value row, small text

- Divider

- Three action buttons stacked vertically, full width, 12px gap:
  - "Approve" Success Button
  - "Reject" Danger Button  
  - "Escalate to Manager" — Secondary Button with amber/purple tones (use escalated status colour)

- Below buttons: 13px Grey 400 "Decisions are final and will notify the applicant by email." — Approve and Reject only. Escalation is reversible.

---

**Escalate Modal** (triggered by Escalate button):
- Heading: "Escalate to Manager"
- Body text: "Please provide a reason and remarks. The Manager will see these alongside the application." — 14px Grey 600
- Dropdown: "Escalation Reason" — options listed in handoff doc
- Textarea: "Remarks" — placeholder "Describe why this application requires senior review..." — min 3 rows
- Footer: "Cancel" Ghost button + "Confirm Escalation" Primary Button

**Reject Modal** (triggered by Reject button):
- Heading: "Reject Application"
- Body text: "Please confirm rejection. The applicant will be notified by email." — 14px Grey 600
- Textarea: "Rejection Remarks (internal only)" — placeholder "Reason for rejection..." — optional for Policy Manager
- Footer: "Cancel" Ghost button + "Confirm Rejection" Danger Button

---

### Screen 6 — Manager: Dashboard

**Layout:** Identical to Policy Manager Dashboard

**Difference from Policy Manager Dashboard:**
- Page heading: "Escalated Applications"
- The filter chips for Status only show: "Escalated | Approved | Rejected" — no "Pending Review"
- Stats row only shows: "Escalated", "Approved", "Rejected", "Pending" counts
- Table is otherwise identical

---

### Screen 7 — Manager: Application Detail

**Layout:** Identical to Policy Manager Application Detail

**Differences:**

1. **Policy Manager's Remarks Panel** — appears as a full-width card ABOVE the three-panel layout, below the heading row:
   - Background: Escalated/Purple colour scheme (#FAF5FF background, #C4B5FD border)
   - Left side: small user avatar circle (initials, purple background) + Policy Manager name + "Policy Manager" label below
   - Right of avatar: vertical divider
   - Escalation reason: shown as a badge
   - Remarks: full text in 14px, italic, Grey 800
   - This panel is visually distinct and prominent — the Manager should see it immediately

2. **Action bar (Panel C)** — same layout but:
   - Shows "Approve" and "Reject" buttons only
   - No "Escalate to Manager" button
   - Label reads: "This is a final decision. The applicant will be notified by email."

---

## Responsive Behaviour

This is a desktop-first application (enterprise/B2B). Mobile is not a priority for the PoC but the following minimum behaviour is expected:

- Below 1024px: three-panel layout on Application Detail collapses to single-column vertical stack (Panel A → Panel C → Panel B)
- Below 768px: sidebar collapses to a hamburger menu
- Table on dashboards: horizontal scroll wrapper
- Minimum supported width: 768px

---

## Iconography

Use **Lucide Icons** (lucide.dev). Consistent 16px size for inline/table icons, 20px for sidebar nav icons, 24px for empty state illustrations.

```
Upload / Submit        Upload, FileUp
PDF / Document         FileText, File
Application Status     ClockIcon (pending), CheckCircle (approved), XCircle (rejected), AlertTriangle (flagged), ArrowUpCircle (escalated)
Flag / Issue           Flag, AlertCircle
Expand / Collapse      ChevronDown, ChevronUp
Sort                   ArrowUpDown, ArrowUp, ArrowDown
Filter                 Filter
User / Profile         User, UserCheck
Navigation             LayoutDashboard, LogOut
Actions                Eye (view), Check, X, Send
Risk                   ShieldAlert, ShieldCheck
```

---

## Motion & Interaction

Keep animation minimal and functional.

```
Button hover            background transition 150ms ease
Modal open/close        fade-in + slight scale-up (0.97 → 1.0) 200ms ease
Collapsible expand      height transition 200ms ease + chevron rotation 200ms
Status pulse (AI Review) opacity pulse 1.5s infinite (the dot in the badge)
Alert banner appear     slide-down 200ms ease from top
Page transitions        none — instant navigation is fine for a PoC
```

---

## Accessibility Notes

- All interactive elements must have visible focus rings (3px #0EA5E9 ring with 2px offset)
- Colour is never the sole indicator of meaning — badges always include text
- All form inputs must have associated `<label>` elements
- Table headers must use `<th scope="col">`
- Modal must trap focus while open
- Error messages must be associated with their input via `aria-describedby`

---

## Screen Inventory Summary

| Screen | Route | Role |
|---|---|---|
| Login | /login | All |
| Upload | /applicant/upload | Applicant |
| Review & Correct | /applicant/review | Applicant |
| Policy Manager Dashboard | /policy-manager/dashboard | Policy Manager |
| Policy Manager Application Detail | /policy-manager/application/:id | Policy Manager |
| Manager Dashboard | /manager/dashboard | Manager |
| Manager Application Detail | /manager/application/:id | Manager |

**Total: 7 screens, 2 modals (Escalate, Reject)**

---

*This spec is written for Claude Design. Generate all 7 screens plus the 2 modal states. Use the colour system, typography, component specs, and layout definitions exactly as described. The tone is professional fintech — no illustrations, no decorative elements, clean and data-forward.*
