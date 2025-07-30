import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ChatErrorProps {
  error: Error;
}

export function ChatError({ error }: ChatErrorProps) {
  const getErrorMessage = () => {
    // Check for specific error patterns and provide user-friendly messages
    if (error.message.toLowerCase().includes("network")) {
      return "Connection error. Please check your internet and try again.";
    }
    
    if (error.message.toLowerCase().includes("timeout")) {
      return "Request timed out. Please try again.";
    }
    
    if (error.message.includes("filtered") || error.message.includes("content has been filtered")) {
      return "There was an error processing your request or your content has been filtered. Please try rephrasing your question.";
    }
    
    // Use the error message if it's user-friendly, otherwise show generic message
    if (error.message && error.message.length > 0 && !error.message.includes("fetch")) {
      return error.message;
    }
    
    // Generic fallback
    return "Something went wrong. Please try again.";
  };

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        <p className="text-sm">{getErrorMessage()}</p>
      </AlertDescription>
    </Alert>
  );
}
