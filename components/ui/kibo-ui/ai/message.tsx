import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ComponentProps, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib";
import type {
  AIMessageProps,
  AIMessageContentProps,
  AIMessageAvatarProps
} from "./types";

export const AIMessage = ({ className, from, ...props }: AIMessageProps) => (
  <div
    className={cn(
      "group flex w-full gap-3 py-2",
      from === "user" ? "is-user flex-row-reverse" : "is-assistant flex-row",
      "[&>div]:max-w-full sm:[&>div]:max-w-[80%]",
      className
    )}
    {...props}
  />
);

export const AIMessageContent = ({
  children,
  className,
  ...props
}: AIMessageContentProps) => (
  <div
    className={cn(
      "flex flex-col gap-2 rounded-lg px-4 py-3 text-base",
      "bg-muted text-foreground",
      "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <div className="is-user:dark">{children}</div>
  </div>
);

export const AIMessageAvatar = ({
  src,
  icon,
  name,
  className,
  ...props
}: AIMessageAvatarProps) => (
  <Avatar className={cn("size-8 flex-shrink-0", className)} {...props}>
    {src && <AvatarImage alt="" className="mt-0 mb-0" src={src} />}
    <AvatarFallback>
      {icon ? (
        <div className="flex items-center justify-center w-full h-full">
          {icon}
        </div>
      ) : (
        name?.slice(0, 2) || "ME"
      )}
    </AvatarFallback>
  </Avatar>
);
