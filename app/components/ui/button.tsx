import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { Slot } from "@radix-ui/react-slot";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center",
    "max-w-full rounded-full text-center leading-tight",
    "font-semibold",
    "transition-all duration-200",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-[#A6EB53]",
    "focus-visible:ring-offset-2",
    "disabled:pointer-events-none",
    "disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        // Variant 1
        default: [
          "bg-[#ee9e9e]",
          "text-[#0E0E0F]",
          "hover:bg-[#ffc1bb]",
          "active:bg-[#ee9e9e]",
        ],

        // Variant 2
        outline: [
    
        ],

        // Variant 3
        dark: [
       
        ],

        secondary: ["bg-[#96D44B]", "text-[#0E0E0F]", "hover:bg-[#A6EB53]"],

        ghost: ["bg-transparent", "text-[#A6EB53]", "hover:bg-[#A6EB53]/10"],

        link: [
          "text-[#A6EB53]",
          "underline-offset-4",
          "hover:text-[#96D44B]",
          "hover:underline",
        ],

        destructive: "bg-red-600 text-white hover:bg-red-700",
      },

      size: {
        default: "h-11 px-4 text-sm sm:h-12 sm:px-6 sm:text-base",
        sm: "h-9 px-3 text-xs sm:h-10 sm:px-5 sm:text-sm",
        lg: "h-12 px-5 text-base sm:h-14 sm:px-8 sm:text-lg",
        icon: "h-11 w-11 p-0 sm:h-12 sm:w-12",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(
          buttonVariants({
            variant,
            size,
            className,
          }),
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
