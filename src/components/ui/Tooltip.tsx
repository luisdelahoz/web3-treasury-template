import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '../../lib/cn'

interface TooltipProviderProps {
  children: React.ReactNode
}

interface TooltipProps {
  children: React.ReactNode
  content:  React.ReactNode
  side?:    'top' | 'right' | 'bottom' | 'left'
}

export function TooltipProvider({ children }: TooltipProviderProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      {children}
    </TooltipPrimitive.Provider>
  )
}

export function Tooltip({ children, content, side = 'top' }: TooltipProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className={cn(
            'z-50 px-2.5 py-1.5 rounded',
            'bg-surface2 border border-border2',
            'font-mono text-[10px] text-text',
            'shadow-lg animate-fade-up',
          )}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-border2" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
