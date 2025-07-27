import * as React from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib";

const Banner = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mb-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-md inline-block",
      className
    )}
    {...props}
  />
));
Banner.displayName = "Banner";

const BannerIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    icon: LucideIcon;
  }
>(({ className, icon: Icon, ...props }, ref) => (
  <div ref={ref} className={cn("flex-shrink-0", className)} {...props}>
    <Icon className="w-3 h-3 text-amber-800 dark:text-amber-200" />
  </div>
));
BannerIcon.displayName = "BannerIcon";

const BannerTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-xs text-amber-800 dark:text-amber-200 font-medium",
      className
    )}
    {...props}
  />
));
BannerTitle.displayName = "BannerTitle";

const BannerAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "text-xs text-amber-800 dark:text-amber-200 underline hover:no-underline",
      className
    )}
    {...props}
  />
));
BannerAction.displayName = "BannerAction";

const BannerClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "text-xs text-amber-800 dark:text-amber-200 hover:text-amber-900 dark:hover:text-amber-100",
      className
    )}
    {...props}
  />
));
BannerClose.displayName = "BannerClose";

export { Banner, BannerIcon, BannerTitle, BannerAction, BannerClose };