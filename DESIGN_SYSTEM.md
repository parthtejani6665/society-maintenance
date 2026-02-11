# Society Management App - Design System

## 🎨 Design Philosophy

A professional, trustworthy, and accessible design system for a Society/Apartment Management application. The design prioritizes:
- **Clarity**: Easy to understand for non-technical users
- **Consistency**: Unified experience across all screens
- **Accessibility**: High contrast, readable fonts, touch-friendly
- **Responsiveness**: Adapts seamlessly to all screen sizes
- **Professionalism**: Government/fintech-inspired trustworthy appearance

---

## 🎯 Color Palette

### Primary Colors
```
Primary Blue:     #1e40af (blue-800)  - Main actions, headers
Primary Light:    #3b82f6 (blue-500)  - Interactive elements
Primary Dark:     #1e3a8a (blue-900)  - Text, emphasis
```

### Secondary Colors
```
Success Green:    #059669 (green-600) - Success states, paid status
Warning Orange:   #d97706 (amber-600) - Pending, warnings
Error Red:        #dc2626 (red-600)   - Errors, urgent items
Info Blue:        #0284c7 (sky-600)   - Information, notices
```

### Neutral Colors
```
Gray 900:         #111827 - Primary text
Gray 700:         #374151 - Secondary text
Gray 500:         #6b7280 - Tertiary text, icons
Gray 300:         #d1d5db - Borders, dividers
Gray 100:         #f3f4f6 - Backgrounds, cards
Gray 50:          #f9fafb - Page backgrounds
White:            #ffffff - Card backgrounds
```

### Role-Based Colors
```
Admin:            #dc2626 (red-600)   - Admin badge
Staff:            #7c3aed (violet-600) - Staff badge
Resident:         #0284c7 (sky-600)   - Resident badge
```

---

## 📝 Typography

### Font Family
- **Primary**: System default (SF Pro on iOS, Roboto on Android)
- **Fallback**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto

### Font Sizes (Responsive)
```
Heading 1:        text-3xl (30px)  font-bold      - Page titles
Heading 2:        text-2xl (24px)  font-bold      - Section headers
Heading 3:        text-xl (20px)   font-semibold  - Card titles
Body Large:       text-lg (18px)   font-normal    - Important text
Body:             text-base (16px) font-normal    - Default text
Body Small:       text-sm (14px)   font-normal    - Secondary text
Caption:          text-xs (12px)   font-normal    - Labels, metadata
```

### Font Weights
```
Bold:             font-bold (700)      - Headings, emphasis
Semibold:         font-semibold (600)  - Subheadings
Medium:           font-medium (500)    - Buttons, labels
Normal:           font-normal (400)    - Body text
```

---

## 📐 Spacing System

### Padding/Margin Scale
```
xs:   4px   (1 unit)   - Tight spacing
sm:   8px   (2 units)  - Compact spacing
md:   16px  (4 units)  - Default spacing
lg:   24px  (6 units)  - Section spacing
xl:   32px  (8 units)  - Large spacing
2xl:  48px  (12 units) - Extra large spacing
```

### Container Padding
```
Mobile (< 640px):     px-4 (16px)
Tablet (640-1024px):  px-6 (24px)
Desktop (> 1024px):   px-8 (32px)
```

---

## 🔲 Component Patterns

### Cards
```
Background:       bg-white
Border:           border border-gray-200
Radius:           rounded-2xl (16px)
Shadow:           shadow-sm (subtle)
Padding:          p-4 md:p-5 (16-20px responsive)
Margin Bottom:    mb-4 (16px)
```

### Buttons

#### Primary Button
```
Background:       bg-blue-600 active:bg-blue-700
Text:             text-white font-semibold
Padding:          py-3.5 px-6 (14px vertical, 24px horizontal)
Radius:           rounded-xl (12px)
Shadow:           shadow-md
Min Height:       44px (touch-friendly)
```

#### Secondary Button
```
Background:       bg-white border-2 border-blue-600
Text:             text-blue-600 font-semibold
Padding:          py-3.5 px-6
Radius:           rounded-xl
```

#### Danger Button
```
Background:       bg-red-600 active:bg-red-700
Text:             text-white font-semibold
Padding:          py-3.5 px-6
Radius:           rounded-xl
```

### Input Fields
```
Background:       bg-gray-50
Border:           border border-gray-300 focus:border-blue-500
Radius:           rounded-xl (12px)
Padding:          py-3.5 px-4 (14px vertical, 16px horizontal)
Text:             text-base text-gray-900
Min Height:       48px (touch-friendly)
```

### Badges/Tags
```
Padding:          px-3 py-1.5
Radius:           rounded-full
Font:             text-xs font-semibold uppercase
Border:           border-2
```

### Status Badges
```
Success:          bg-green-50 text-green-700 border-green-200
Warning:          bg-amber-50 text-amber-700 border-amber-200
Error:            bg-red-50 text-red-700 border-red-200
Info:             bg-blue-50 text-blue-700 border-blue-200
Neutral:          bg-gray-100 text-gray-700 border-gray-300
```

---

## 📱 Responsive Design Rules

### Breakpoints
```
Mobile:           < 640px   (default)
Tablet:           640-1024px (md:)
Desktop:          > 1024px   (lg:)
```

### Layout Principles
1. **Fluid Containers**: Use percentage-based widths, avoid fixed pixel widths
2. **Flexible Grids**: Use flex-wrap for multi-column layouts
3. **Responsive Typography**: Scale font sizes with screen size
4. **Touch Targets**: Minimum 44x44px for all interactive elements
5. **Adaptive Spacing**: Increase padding/margins on larger screens

### Responsive Patterns
```
Single Column (Mobile):     w-full
Two Columns (Tablet):       md:w-1/2
Three Columns (Desktop):    lg:w-1/3
Grid Auto-fit:              grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

---

## 🎭 Icons

### Icon Library
- **Lucide React Native** (consistent, modern, open-source)

### Icon Sizes
```
Small:            16px - Inline with text
Medium:           20px - Buttons, list items
Large:            24px - Headers, prominent actions
Extra Large:      32px - Empty states, feature icons
```

### Icon Colors
- Match text color for consistency
- Use semantic colors for status (green=success, red=error)
- Icon backgrounds: Use 10% opacity of icon color

---

## 🌓 Dark Mode Support

### Color Adjustments
```
Background:       bg-gray-900 (dark mode)
Cards:            bg-gray-800
Text Primary:     text-gray-100
Text Secondary:   text-gray-400
Borders:          border-gray-700
```

### Implementation
- Use Tailwind's `dark:` prefix
- Maintain contrast ratios (WCAG AA minimum)
- Test all components in both modes

---

## ♿ Accessibility

### Color Contrast
- **Text**: Minimum 4.5:1 ratio (WCAG AA)
- **Large Text**: Minimum 3:1 ratio
- **Interactive Elements**: Minimum 3:1 ratio

### Touch Targets
- **Minimum Size**: 44x44px
- **Spacing**: 8px minimum between targets

### Screen Reader Support
- Use semantic HTML elements
- Provide aria-labels for icons
- Announce state changes

### Font Sizes
- **Minimum Body Text**: 16px (1rem)
- **Scalable**: Support system font scaling

---

## 🎬 Animations & Transitions

### Timing
```
Fast:             150ms - Hover states, small changes
Normal:           300ms - Default transitions
Slow:             500ms - Page transitions, modals
```

### Easing
```
Default:          ease-in-out
Enter:            ease-out
Exit:             ease-in
```

### Common Animations
```
Fade In:          opacity-0 → opacity-100
Slide Up:         translateY(20px) → translateY(0)
Scale:            scale-95 → scale-100
```

---

## 📋 Screen Patterns

### Dashboard Layout
```
- Header with greeting and role badge
- Stats cards in responsive grid (1-2-3 columns)
- Quick action buttons
- Recent activity list
- Bottom navigation (mobile)
```

### List Screen Layout
```
- Search bar (sticky)
- Filter chips (horizontal scroll)
- List items with consistent card pattern
- Empty state with icon and message
- Floating action button (if needed)
```

### Detail Screen Layout
```
- Header with back button and title
- Hero section (image, status, key info)
- Content sections in cards
- Action buttons at bottom (sticky)
```

### Form Screen Layout
```
- Progress indicator (if multi-step)
- Form fields in cards (grouped logically)
- Helper text below fields
- Submit button at bottom (sticky)
- Validation messages inline
```

---

## 🔄 State Patterns

### Loading States
```
- Skeleton loaders for content
- Spinner for actions
- Progress bar for uploads
- Disable buttons during processing
```

### Empty States
```
- Large icon (gray-400)
- Heading: "No [items] yet"
- Description: Helpful message
- Action button (if applicable)
```

### Error States
```
- Red icon
- Clear error message
- Retry button
- Support contact (if critical)
```

### Success States
```
- Green checkmark icon
- Success message
- Next action button
- Auto-dismiss after 3s (for toasts)
```

---

## 🎯 Component Library

### Reusable Components

#### StatCard
```tsx
<View className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
  <View className="flex-row items-center justify-between mb-2">
    <Text className="text-gray-600 text-sm font-medium">{label}</Text>
    <Icon size={20} color="#6b7280" />
  </View>
  <Text className="text-2xl font-bold text-gray-900">{value}</Text>
  {trend && <Text className="text-xs text-green-600 mt-1">{trend}</Text>}
</View>
```

#### ListItem
```tsx
<TouchableOpacity className="bg-white p-4 rounded-2xl border border-gray-200 mb-3 active:bg-gray-50">
  <View className="flex-row items-center">
    <View className="w-12 h-12 bg-blue-100 rounded-xl items-center justify-center mr-3">
      <Icon size={24} color="#3b82f6" />
    </View>
    <View className="flex-1">
      <Text className="text-base font-semibold text-gray-900">{title}</Text>
      <Text className="text-sm text-gray-600 mt-0.5">{subtitle}</Text>
    </View>
    <ChevronRight size={20} color="#9ca3af" />
  </View>
</TouchableOpacity>
```

#### Badge
```tsx
<View className={`px-3 py-1.5 rounded-full border-2 ${statusColors[status]}`}>
  <Text className="text-xs font-semibold uppercase tracking-wide">
    {label}
  </Text>
</View>
```

---

## 📱 Screen-Specific Guidelines

### Login Screen
- Centered layout with logo
- Large input fields (48px height)
- Primary button (full width)
- Minimal distractions
- Professional background (subtle gradient)

### Dashboard
- Personalized greeting
- Role badge prominent
- 2-column stat cards on mobile, 3-4 on tablet
- Quick actions as large buttons
- Recent activity feed

### Complaint List
- Search bar at top (sticky)
- Category filter chips
- Card-based list items
- Status badges visible
- Floating "+" button for new complaint

### Complaint Detail
- Status timeline
- Image gallery (if applicable)
- Comments section
- Action buttons at bottom
- Staff assignment (admin only)

### Forms
- One field per row on mobile
- Group related fields in cards
- Inline validation
- Clear error messages
- Sticky submit button

---

## ✅ Implementation Checklist

- [ ] All screens use consistent color palette
- [ ] Typography scale applied uniformly
- [ ] Spacing system followed (4px grid)
- [ ] All buttons meet 44px minimum height
- [ ] Cards have consistent styling
- [ ] Icons from single library (Lucide)
- [ ] Responsive layouts tested on multiple sizes
- [ ] Dark mode implemented (optional)
- [ ] Loading states for all async actions
- [ ] Empty states for all lists
- [ ] Error handling with clear messages
- [ ] Success feedback for all actions
- [ ] Accessibility labels added
- [ ] Color contrast verified (WCAG AA)

---

## 🚀 Next Steps

1. Apply design system to all existing screens
2. Create reusable component library
3. Test on multiple device sizes
4. Conduct usability testing
5. Iterate based on feedback
6. Document component usage
7. Create design handoff for developers

---

**Design System Version**: 1.0
**Last Updated**: February 2026
**Status**: Production Ready
