# PAM Select Component

A fully accessible, mobile-first select component built with Radix UI primitives and designed for the PAM (Parenting Assistance Mobile) application.

## Features

- ✅ **Radix UI Foundation**: Built on `@radix-ui/react-select` for robust accessibility
- ✅ **TypeScript Support**: Full type safety with strict mode compliance
- ✅ **PAM Design System**: Integrated with PAM brand colors (pam-red #7D0820, pam-pink #F9B1BC, pam-cream #FFFBF8)
- ✅ **Mobile-First**: 44px minimum touch targets for mobile accessibility
- ✅ **Class Variance Authority**: Flexible variant system using CVA
- ✅ **Smooth Animations**: 200ms transitions throughout
- ✅ **Full Accessibility**: WCAG AA compliant with proper ARIA attributes
- ✅ **Comprehensive Testing**: 92.85% test coverage

## Installation

The component is already installed with the required dependencies:

```bash
npm install @radix-ui/react-select class-variance-authority
```

## Basic Usage

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'

function MyComponent() {
  return (
    <Select>
      <SelectTrigger className="w-full max-w-sm">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  )
}
```

## PAM-Themed Usage

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from '@/components/ui/Select'

function PAMSelect() {
  return (
    <Select>
      <SelectTrigger variant="pam" className="w-full max-w-sm">
        <SelectValue placeholder="Select your child's milestone" />
      </SelectTrigger>
      <SelectContent variant="pam">
        <SelectGroup>
          <SelectLabel>Physical Development</SelectLabel>
          <SelectItem variant="pam" value="sitting">First time sitting</SelectItem>
          <SelectItem variant="pam" value="crawling">Started crawling</SelectItem>
          <SelectSeparator />
          <SelectLabel>Social Development</SelectLabel>
          <SelectItem variant="pam" value="smiling">First smile</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
```

## Component API

### Select (Root)

The root select component that provides context to all child components.

```tsx
<Select 
  value={string}
  onValueChange={(value: string) => void}
  disabled={boolean}
  // ... other Radix Select props
>
  {children}
</Select>
```

### SelectTrigger

The trigger button that opens the select dropdown.

**Props:**
- `variant`: `'default' | 'pam' | 'pam-secondary' | 'outline'` (default: `'default'`)
- `size`: `'default' | 'sm' | 'lg'` (default: `'default'`)
- All standard button props

**Variants:**
- `default`: Standard input styling with neutral colors
- `pam`: PAM red theme with brand colors
- `pam-secondary`: PAM pink theme for secondary actions
- `outline`: PAM red outline style for emphasis

**Sizes:**
- `sm`: 36px min-height (compact)
- `default`: 44px min-height (mobile-optimized)
- `lg`: 48px min-height (enhanced touch)

```tsx
<SelectTrigger variant="pam" size="lg">
  <SelectValue placeholder="Choose option" />
</SelectTrigger>
```

### SelectContent

The dropdown content container.

**Props:**
- `variant`: `'default' | 'pam' | 'pam-secondary'` (default: `'default'`)
- `position`: `'popper' | 'item-aligned'` (default: `'popper'`)

```tsx
<SelectContent variant="pam">
  {children}
</SelectContent>
```

### SelectItem

Individual selectable items within the dropdown.

**Props:**
- `variant`: `'default' | 'pam' | 'pam-secondary'` (default: `'default'`)
- `value`: string (required)
- All standard option props

```tsx
<SelectItem variant="pam" value="option1">
  Option Label
</SelectItem>
```

### SelectGroup

Groups related items together.

```tsx
<SelectGroup>
  <SelectLabel>Group Title</SelectLabel>
  <SelectItem value="item1">Item 1</SelectItem>
  <SelectItem value="item2">Item 2</SelectItem>
</SelectGroup>
```

### SelectLabel

Labels for groups of items.

```tsx
<SelectLabel>Category Name</SelectLabel>
```

### SelectSeparator

Visual separator between items or groups.

```tsx
<SelectSeparator />
```

### SelectValue

Displays the selected value in the trigger.

```tsx
<SelectValue placeholder="Choose an option" />
```

## Design System Integration

### PAM Colors

The component uses the official PAM color palette:

- **pam-red**: `#7D0820` - Primary brand color
- **pam-pink**: `#F9B1BC` - Secondary brand color  
- **pam-cream**: `#FFFBF8` - Background/accent color

### Mobile-First Design

- **Default touch targets**: 44px minimum height (WCAG AA compliant)
- **Responsive behavior**: Adapts to mobile and desktop contexts
- **Touch-friendly spacing**: Adequate padding for finger interaction

### Animations

- **Smooth transitions**: 200ms duration for all state changes
- **Hover effects**: Subtle color transitions
- **Focus states**: Clear visual feedback
- **Open/close**: Fade and slide animations

## Accessibility Features

### Keyboard Navigation
- **Tab**: Focus the trigger
- **Enter/Space**: Open dropdown
- **Arrow Keys**: Navigate options
- **Enter**: Select option
- **Escape**: Close dropdown

### Screen Reader Support
- Proper ARIA roles and attributes
- Semantic HTML structure
- Clear labeling and descriptions
- State announcements

### Mobile Accessibility
- Minimum 44px touch targets
- High contrast ratios
- Readable text sizes
- Accessible color combinations

## Examples

See `Select.examples.tsx` for comprehensive usage examples including:

- Basic select usage
- PAM-themed variants
- Size demonstrations
- Real-world PAM app integrations
- Accessibility features
- Mobile-optimized layouts

## Testing

The component includes comprehensive tests with 92.85% coverage:

```bash
npm test -- src/components/ui/__tests__/Select.test.tsx
```

Test areas include:
- Component rendering
- Variant applications
- Size variations
- Mobile touch targets
- Accessibility features
- PAM design system integration
- Custom props and classes
- TypeScript integration

## Performance Considerations

- **Tree-shakable**: Import only the components you need
- **Lightweight**: Minimal bundle impact
- **Optimized**: Efficient re-renders with React.forwardRef
- **Accessible**: No compromise on accessibility for performance

## Browser Support

Compatible with all modern browsers that support:
- ES2017+ features
- CSS Grid and Flexbox
- Modern event handling

## Contributing

When extending this component:

1. Maintain accessibility standards
2. Follow PAM design system guidelines
3. Add comprehensive tests for new features
4. Update documentation and examples
5. Ensure mobile-first approach

## Migration from Other Select Components

If migrating from other select implementations:

1. Replace component imports
2. Update variant prop names
3. Adjust styling classes if needed
4. Test keyboard navigation
5. Verify mobile behavior

## Related Components

- `Button` - For trigger-like interactions
- `Input` - For text input alternatives
- `Card` - For grouping select components

## Changelog

### v1.0.0
- Initial implementation with Radix UI
- PAM design system integration
- Mobile-first responsive design
- Comprehensive test suite
- Full accessibility support
- CVA variant system