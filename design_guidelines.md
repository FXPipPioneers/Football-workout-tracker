# Football Training Tracker - Design Guidelines

## Design Approach: Athletic Productivity System

**Selected Framework:** Design System Approach inspired by Apple Fitness, Linear's precision, and Strava's athletic aesthetic

**Core Philosophy:** Create a performance-focused, athletic interface that feels both professional and motivating. The design should mirror the precision and discipline of athletic training while remaining effortless to use on mobile.

---

## Color Palette

### Dark Mode Primary (Default)
- **Background Base:** 220 15% 8% (deep charcoal)
- **Background Elevated:** 220 15% 12% (card surfaces)
- **Background Interactive:** 220 15% 16% (hover states)
- **Primary Brand:** 142 76% 45% (vibrant athletic green - energy, growth, progress)
- **Secondary Accent:** 220 90% 60% (electric blue - data, metrics, completion)
- **Success/Complete:** 142 70% 50% (bright green)
- **Warning/Rest Day:** 38 92% 60% (amber)
- **Error/Missed:** 0 84% 60% (athletic red)

### Text Hierarchy
- **Primary Text:** 220 15% 95%
- **Secondary Text:** 220 10% 65%
- **Tertiary/Muted:** 220 8% 45%

### Light Mode (Optional Toggle)
- **Background Base:** 220 20% 98%
- **Background Elevated:** 0 0% 100%
- **Primary Brand:** 142 76% 38% (deeper green for contrast)
- **Text Primary:** 220 15% 15%

---

## Typography

**Primary Font Family:** 'Inter' (Google Fonts) - Modern, athletic precision
**Accent Font:** 'Manrope' (Google Fonts) - For numbers/metrics (slightly geometric)

### Scale & Usage
- **Hero Numbers (Metrics):** text-5xl font-bold (Manrope)
- **Section Headers:** text-2xl font-semibold (Inter)
- **Workout Titles:** text-xl font-medium (Inter)
- **Body/Exercise Names:** text-base font-normal (Inter)
- **Small Labels/Captions:** text-sm font-medium (Inter)
- **Micro Data:** text-xs font-normal tracking-wide uppercase (Manrope)

---

## Layout System

**Tailwind Spacing Units:** Consistently use 4, 6, 8, 12, 16, 20, 24
- **Mobile Container:** px-4 py-6
- **Desktop Container:** max-w-5xl mx-auto px-6
- **Card Padding:** p-6 mobile, p-8 desktop
- **Section Spacing:** mb-8 to mb-16
- **Component Gaps:** gap-4 to gap-6

**Grid Structure:**
- Mobile: Single column stack
- Tablet/Desktop: 2-column for stats, 1-column for forms
- Dashboard: Hybrid with featured workout full-width, stats in 2×2 grid

---

## Component Library

### Navigation
- **Bottom Tab Bar (Mobile):** Fixed bottom navigation with 5 icons
  - Today | Schedule | Log | Progress | Profile
  - Active tab: primary green with subtle glow effect
  - Icons: Large (h-6 w-6), always visible labels
  - Background: Elevated dark with subtle top border

### Cards & Containers
- **Workout Cards:** Elevated background, rounded-2xl, subtle border (border-white/5)
- **Interactive Cards:** Add hover state with slight scale (hover:scale-[1.02])
- **Stat Cards:** Compact, rounded-xl, gradient from primary/10 to transparent
- **Collapsible Sections:** Use chevron icons, smooth expand/collapse animations

### Forms & Input
- **Primary Inputs:** Large touch targets (min-h-12), rounded-xl borders
- **Quick Input Buttons:** Pill-shaped (rounded-full), arranged in horizontal scrollable rows
- **Sliders:** Custom styled with primary green fill, large thumb for easy touch
- **Toggle Switches:** iOS-style with primary green active state
- **Number Steppers:** +/- buttons flanking centered number display

### Data Visualization
- **Progress Charts:** Line charts with gradient fill (primary color fading to transparent)
- **Metric Rings:** Circular progress indicators (similar to Apple Fitness rings)
- **Comparison Bars:** Horizontal bars for L vs R foot comparison (green vs blue)
- **History Timeline:** Vertical timeline with completion checkmarks

### Buttons & CTAs
- **Primary Action:** Solid primary green, rounded-xl, py-4 px-8, font-semibold
- **Secondary Action:** Outline with primary border, transparent background
- **Destructive:** Red background for delete/remove actions
- **Floating Action (FAB):** Fixed bottom-right (when not using tab bar), circular, primary green with shadow

### Status Indicators
- **Completion Badge:** Small circular indicator (complete: green, partial: amber, missed: red)
- **Rest Period Timer:** Circular countdown with animated stroke
- **Set Progress:** Inline checkmarks that fill as sets are completed

---

## Workout Display Patterns

### Daily Workout View
- **Header:** Day of week (large), workout type subtitle, duration estimate
- **Exercise Blocks:** Collapsible accordions per category (Warm-up, Passing, Gym, etc.)
- **Exercise Row:** Exercise name, sets×reps display, rest timer, quick log button
- **Completion State:** Visual checkmark animation when marked complete

### Quick Log Interface
- **Modal/Sheet:** Slide-up bottom sheet with exercise details
- **Input Grid:** 2×2 grid for weight, reps, RPE, notes (if applicable)
- **Save Confirmation:** Haptic feedback + brief success message

### Schedule Toggle
- **Prominent Switch:** Top of screen, "Solo" ⟷ "Friend" toggle
- **Visual Difference:** Slight badge or color shift when viewing Friend schedule

---

## Progress & Check-in Screens

### Dashboard Overview
- **Hero Metric:** Current week completion percentage (large circular progress)
- **Quick Stats Grid:** 2×2 cards showing L/R balance, total workouts, streak
- **Upcoming Session:** Featured card with primary CTA "Start Workout"

### Check-in Form (Bi-weekly)
- **Section Wizard:** Multi-step form with progress indicator at top
- **L vs R Comparison:** Side-by-side input fields with visual balance indicator
- **Subjective Scales:** Star ratings or 1-10 slider for confidence/energy
- **Summary Screen:** Review all entries before submission

### History View
- **Filter Tabs:** Week / Month / Custom range (sticky at top)
- **Timeline Cards:** Chronological list with workout type, completion %, date
- **Chart Toggle:** Switch between chart view and list view
- **Export Button:** Secondary button in header for CSV download

---

## Athletic Design Details

### Iconography
Use Lucide React icons via CDN (or Heroicons) - select athletic, precise icons:
- Dumbbell, Target, Calendar, TrendingUp, Clock, CheckCircle
- Maintain consistent stroke width (2px)

### Micro-interactions
- **Completion Celebrations:** Subtle confetti or checkmark animation
- **Rest Timer:** Pulsing dot during active countdown
- **Input Validation:** Immediate visual feedback (green border on valid entry)
- **Pull-to-refresh:** Athletic spring animation

### Loading States
- **Skeleton Screens:** Match card/list structure with subtle shimmer
- **Progress Indicators:** Linear progress bar in primary green (not spinners)

---

## Mobile Optimization

- **Touch Targets:** Minimum 44×44px for all interactive elements
- **Thumb Zone:** Place primary actions in easy-reach bottom 2/3 of screen
- **Swipe Gestures:** Swipe right on timeline cards to mark complete
- **Haptic Feedback:** Use on button taps, completion marks, slider adjustments
- **Safe Areas:** Account for iPhone notch/home indicator with appropriate padding

---

## Accessibility & Performance

- **Contrast Ratios:** Maintain WCAG AA compliance (4.5:1 for text)
- **Form Inputs:** All inputs maintain dark background with light borders (no white backgrounds)
- **Focus States:** Clear focus rings on all interactive elements
- **Animations:** Respect prefers-reduced-motion settings
- **Font Scaling:** Support dynamic type/text resize

---

## Images

**Hero/Promotional Use:** None required for utility app
**Optional Enhancements:**
- Empty states: Minimal line illustrations of football/training (SVG)
- Profile placeholder: Simple avatar with initials on gradient
- Achievement badges: Custom SVG icons for milestones (purely decorative)