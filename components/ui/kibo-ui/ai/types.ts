/**
 * Kibo UI AI component type definitions
 */

import type { ComponentProps, HTMLAttributes } from "react";
import type { Avatar } from "@/components/ui/avatar";
import type {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import type { ScrollArea } from "@/components/ui/scroll-area";
import type { Button } from "@/components/ui/button";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import type { Textarea } from "@/components/ui/textarea";

/**
 * AI Message props
 */
export type AIMessageProps = HTMLAttributes<HTMLDivElement> & {
  from: "user" | "assistant";
};

/**
 * AI Message content props
 */
export type AIMessageContentProps = HTMLAttributes<HTMLDivElement>;

/**
 * AI Message avatar props
 */
export type AIMessageAvatarProps = ComponentProps<typeof Avatar> & {
  src?: string;
  icon?: React.ReactNode;
  name?: string;
};

/**
 * AI Sources props
 */
export type AISourcesProps = ComponentProps<"div">;

/**
 * AI Sources trigger props
 */
export type AISourcesTriggerProps = ComponentProps<
  typeof CollapsibleTrigger
> & {
  children: React.ReactNode;
};

/**
 * AI Sources content props
 */
export type AISourcesContentProps = ComponentProps<typeof CollapsibleContent>;

/**
 * AI Source props
 */
export type AISourceProps = ComponentProps<"a">;

/**
 * AI Tool status type
 */
export type AIToolStatus = "pending" | "running" | "completed" | "error";

/**
 * AI Tool props
 */
export type AIToolProps = ComponentProps<typeof Collapsible> & {
  status: AIToolStatus;
  children: React.ReactNode;
};

/**
 * AI Tool header props
 */
export type AIToolHeaderProps = ComponentProps<typeof CollapsibleTrigger> & {
  status: AIToolStatus;
  children: React.ReactNode;
};

/**
 * AI Tool content props
 */
export type AIToolContentProps = ComponentProps<typeof CollapsibleContent>;

/**
 * AI Tool parameters props
 */
export type AIToolParametersProps = ComponentProps<"div"> & {
  parameters: Record<string, any>;
};

/**
 * AI Tool result props
 */
export type AIToolResultProps = ComponentProps<"div"> & {
  result: any;
};

/**
 * AI Suggestions props
 */
export type AISuggestionsProps = ComponentProps<typeof ScrollArea>;

/**
 * AI Suggestion props
 */
export type AISuggestionProps = Omit<ComponentProps<"button">, "onClick"> & {
  onClick: () => void;
  children: React.ReactNode;
};

/**
 * AI Response props
 */
export type AIResponseProps = HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

/**
 * Citation info interface
 */
export interface CitationInfo {
  id: string;
  title: string;
  url: string;
  type: "lexicon" | "testimony";
}

/**
 * AI Conversation props
 */
export type AIConversationProps = ComponentProps<"div">;

/**
 * AI Conversation content props
 */
export type AIConversationContentProps = ComponentProps<"div">;

/**
 * AI Reasoning props
 */
export type AIReasoningProps = ComponentProps<typeof Collapsible> & {
  children: React.ReactNode;
};

/**
 * AI Reasoning trigger props
 */
export type AIReasoningTriggerProps = ComponentProps<
  typeof CollapsibleTrigger
> & {
  children: React.ReactNode;
};

/**
 * AI Reasoning content props
 */
export type AIReasoningContentProps = ComponentProps<typeof CollapsibleContent>;

/**
 * AI Input props
 */
export type AIInputProps = HTMLAttributes<HTMLFormElement>;

/**
 * AI Input textarea props
 */
export type AIInputTextareaProps = ComponentProps<typeof Textarea> & {
  minHeight?: number;
  maxHeight?: number;
};

/**
 * AI Input toolbar props
 */
export type AIInputToolbarProps = HTMLAttributes<HTMLDivElement>;

/**
 * AI Input tools props
 */
export type AIInputToolsProps = HTMLAttributes<HTMLDivElement>;

/**
 * AI Input button props
 */
export type AIInputButtonProps = ComponentProps<typeof Button>;

/**
 * AI Input submit props
 */
export type AIInputSubmitProps = ComponentProps<typeof Button> & {
  status?: "submitted" | "streaming" | "ready" | "error";
};

/**
 * AI Input model select props
 */
export type AIInputModelSelectProps = ComponentProps<typeof Select>;

/**
 * AI Input model select trigger props
 */
export type AIInputModelSelectTriggerProps = ComponentProps<
  typeof SelectTrigger
>;

/**
 * AI Input model select content props
 */
export type AIInputModelSelectContentProps = ComponentProps<
  typeof SelectContent
>;

/**
 * AI Input model select item props
 */
export type AIInputModelSelectItemProps = ComponentProps<typeof SelectItem>;

/**
 * AI Input model select value props
 */
export type AIInputModelSelectValueProps = ComponentProps<typeof SelectValue>;

/**
 * AI Input field props
 */
export type AIInputFieldProps = React.InputHTMLAttributes<HTMLInputElement>;
