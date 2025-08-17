import React from 'react'
import { render, screen } from '@testing-library/react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator 
} from '../Select'

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronDown: ({ className }: { className?: string }) => (
    <div data-testid="chevron-down" className={className}>▼</div>
  ),
  ChevronUp: ({ className }: { className?: string }) => (
    <div data-testid="chevron-up" className={className}>▲</div>
  ),
  Check: ({ className }: { className?: string }) => (
    <div data-testid="check-icon" className={className}>✓</div>
  ),
}))

// Test component wrapper
const TestSelect = ({ 
  variant = 'default', 
  size = 'default',
  contentVariant = 'default',
  itemVariant = 'default',
  onValueChange = jest.fn(),
  ...props 
}: {
  variant?: 'default' | 'pam' | 'pam-secondary' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  contentVariant?: 'default' | 'pam' | 'pam-secondary'
  itemVariant?: 'default' | 'pam' | 'pam-secondary'
  onValueChange?: (value: string) => void
  [key: string]: any
}) => (
  <Select onValueChange={onValueChange} {...props}>
    <SelectTrigger variant={variant} size={size} data-testid="select-trigger">
      <SelectValue placeholder="Select an option" />
    </SelectTrigger>
    <SelectContent variant={contentVariant} data-testid="select-content">
      <SelectGroup>
        <SelectLabel>Fruits</SelectLabel>
        <SelectItem variant={itemVariant} value="apple" data-testid="select-item-apple">
          Apple
        </SelectItem>
        <SelectItem variant={itemVariant} value="banana" data-testid="select-item-banana">
          Banana
        </SelectItem>
        <SelectSeparator />
        <SelectItem variant={itemVariant} value="orange" data-testid="select-item-orange">
          Orange
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
)

describe('Select Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders trigger with placeholder text', () => {
      render(<TestSelect />)
      
      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toBeInTheDocument()
      expect(screen.getByText('Select an option')).toBeInTheDocument()
    })

    it('renders chevron down icon', () => {
      render(<TestSelect />)
      
      expect(screen.getByTestId('chevron-down')).toBeInTheDocument()
    })

    it('renders all compound components', () => {
      render(<TestSelect />)
      
      expect(screen.getByTestId('select-trigger')).toBeInTheDocument()
      // Content is rendered in a Portal, so it may not be in DOM initially
    })
  })

  describe('CSS Classes and Variants', () => {
    it('applies default variant classes to trigger', () => {
      render(<TestSelect />)
      
      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveClass(
        'flex', 
        'h-11', 
        'min-h-[44px]', 
        'w-full', 
        'items-center', 
        'justify-between',
        'border-input',
        'hover:border-ring'
      )
    })

    it('applies PAM variant classes to trigger', () => {
      render(<TestSelect variant="pam" />)
      
      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveClass(
        'border-pam-red/20',
        'hover:border-pam-red',
        'focus:ring-pam-red/20',
        'focus:border-pam-red'
      )
    })

    it('applies PAM secondary variant classes', () => {
      render(<TestSelect variant="pam-secondary" />)
      
      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveClass(
        'border-pam-pink',
        'hover:border-pam-pink/80',
        'focus:ring-pam-pink/20',
        'focus:border-pam-pink'
      )
    })

    it('applies outline variant classes', () => {      
      render(<TestSelect variant="outline" />)
      
      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveClass(
        'border-2',
        'border-pam-red',
        'text-pam-red',
        'hover:bg-pam-red/5',
        'focus:ring-pam-red/20'
      )
    })

    it('applies size variants correctly', () => {
      const { rerender } = render(<TestSelect size="sm" />)
      let trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveClass('h-9', 'min-h-[36px]', 'px-2', 'py-1', 'text-sm')

      rerender(<TestSelect size="lg" />)
      trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveClass('h-12', 'min-h-[48px]', 'px-4', 'py-3', 'text-base')

      rerender(<TestSelect />)
      trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveClass('h-11', 'min-h-[44px]', 'px-3', 'py-2')
    })
  })

  describe('Mobile Touch Targets', () => {
    it('has minimum 44px touch target height by default', () => {
      render(<TestSelect />)
      
      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveClass('min-h-[44px]')
    })

    it('maintains accessible touch targets for small variant', () => {
      render(<TestSelect size="sm" />)
      
      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveClass('min-h-[36px]') // Still reasonable for touch
    })

    it('has larger touch targets for large variant', () => {
      render(<TestSelect size="lg" />)
      
      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveClass('min-h-[48px]')
    })
  })

  describe('Animations and Transitions', () => {
    it('has transition classes for smooth animations on trigger', () => {
      render(<TestSelect />)
      
      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveClass('transition-all', 'duration-200')
    })

    it('has chevron rotation animation class', () => {
      render(<TestSelect />)
      
      const chevron = screen.getByTestId('chevron-down')
      expect(chevron).toHaveClass('transition-transform', 'duration-200')
    })
  })

  describe('Accessibility Features', () => {
    it('has proper ARIA attributes on trigger', () => {
      render(<TestSelect />)
      
      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveAttribute('role', 'combobox')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('has proper focus styles', () => {
      render(<TestSelect />)
      
      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveClass(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-ring',
        'focus:ring-offset-2'
      )
    })

    it('has proper disabled styles', () => {
      render(<TestSelect disabled />)
      
      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toBeDisabled()
      expect(trigger).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
    })
  })

  describe('Custom Props and Classes', () => {
    it('forwards custom props to trigger', () => {
      render(
        <Select>
          <SelectTrigger data-custom="test" data-testid="select-trigger">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveAttribute('data-custom', 'test')
    })

    it('supports custom className on trigger', () => {
      render(
        <Select>
          <SelectTrigger className="custom-class" data-testid="select-trigger">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveClass('custom-class')
    })

    it('merges classes correctly with cn utility', () => {
      render(
        <Select>
          <SelectTrigger variant="pam" className="custom-border" data-testid="select-trigger">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveClass('border-pam-red/20', 'custom-border')
    })
  })

  describe('TypeScript Integration', () => {
    it('supports all variant prop types', () => {
      // These should compile without TypeScript errors
      render(<TestSelect variant="default" />)
      render(<TestSelect variant="pam" />)
      render(<TestSelect variant="pam-secondary" />)
      render(<TestSelect variant="outline" />)
    })

    it('supports all size prop types', () => {
      // These should compile without TypeScript errors
      render(<TestSelect size="default" />)
      render(<TestSelect size="sm" />)
      render(<TestSelect size="lg" />)
    })
  })

  describe('PAM Design System Colors', () => {
    it('uses correct PAM brand colors in variants', () => {
      render(<TestSelect variant="pam" />)
      
      const trigger = screen.getByTestId('select-trigger')
      // Check that PAM colors are applied (classes containing pam-red, pam-pink, pam-cream)
      const classes = trigger.className
      expect(classes).toContain('pam-red')
    })

    it('applies PAM secondary colors correctly', () => {
      render(<TestSelect variant="pam-secondary" />)
      
      const trigger = screen.getByTestId('select-trigger')
      const classes = trigger.className
      expect(classes).toContain('pam-pink')
    })
  })

  describe('Component Structure', () => {
    it('renders with proper component structure', () => {
      render(<TestSelect />)
      
      // Verify the main components are present
      expect(screen.getByTestId('select-trigger')).toBeInTheDocument()
      expect(screen.getByText('Select an option')).toBeInTheDocument()
      expect(screen.getByTestId('chevron-down')).toBeInTheDocument()
    })

    it('has proper element hierarchy', () => {
      render(<TestSelect />)
      
      const trigger = screen.getByTestId('select-trigger')
      const placeholder = screen.getByText('Select an option')
      const chevron = screen.getByTestId('chevron-down')
      
      expect(trigger).toContainElement(placeholder)
      expect(trigger).toContainElement(chevron)
    })
  })

  describe('Default Values and Props', () => {
    it('uses default variant when none specified', () => {
      render(<TestSelect />)
      
      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveClass('border-input')
    })

    it('uses default size when none specified', () => {
      render(<TestSelect />)
      
      const trigger = screen.getByTestId('select-trigger')
      expect(trigger).toHaveClass('h-11', 'min-h-[44px]')
    })
  })
})