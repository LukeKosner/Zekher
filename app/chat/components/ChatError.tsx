import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Shield } from "lucide-react";

interface ChatErrorProps {
  error: Error;
}

export function ChatError({ error }: ChatErrorProps) {
  console.log("🎨 Frontend UI Component - ChatError received:", error);
  
  // Check if this is a content filter error with embedded JSON
  const isContentFilter = error.message.startsWith("CONTENT_FILTER:");
  
  const getContentFilterData = () => {
    if (!isContentFilter) return null;
    
    try {
      const jsonStr = error.message.replace("CONTENT_FILTER:", "");
      return JSON.parse(jsonStr);
    } catch {
      return null;
    }
  };

  const getSimplifiedCategories = (metadata: any) => {
    try {
      const safetyRatings = metadata?.google?.safetyRatings || [];

      return safetyRatings
        .filter((rating: any) => rating.probability !== "NEGLIGIBLE")
        .map((rating: any) => {
          const category = rating.category.replace("HARM_CATEGORY_", "");
          // Simplify category names for users
          switch (category) {
            case "HATE_SPEECH":
              return "Hateful content";
            case "DANGEROUS_CONTENT":
              return "Dangerous content";
            case "HARASSMENT":
              return "Harassment";
            case "SEXUALLY_EXPLICIT":
              return "Inappropriate content";
            default:
              return category.toLowerCase().replace("_", " ");
          }
        });
    } catch {
      return [];
    }
  };

  const getErrorMessage = () => {
    if (isContentFilter) {
      const contentFilterData = getContentFilterData();
      const categories = contentFilterData?.providerMetadata 
        ? getSimplifiedCategories(contentFilterData.providerMetadata)
        : [];
      
      const baseMessage = "Your message was filtered for safety reasons.";
      if (categories.length > 0) {
        const categoryList = categories.join(", ");
        return `${baseMessage} Detected: ${categoryList}. Please rephrase your question.`;
      }
      return `${baseMessage} Please rephrase your question.`;
    }
    
    // Simplify generic errors
    if (error.message.toLowerCase().includes("network")) {
      return "Connection error. Please check your internet and try again.";
    }
    
    if (error.message.toLowerCase().includes("timeout")) {
      return "Request timed out. Please try again.";
    }
    
    // Generic fallback
    return "Something went wrong. Please try again.";
  };

  return (
    <Alert variant="destructive" className="mb-4">
      {isContentFilter ? (
        <Shield className="h-4 w-4" />
      ) : (
        <AlertTriangle className="h-4 w-4" />
      )}
      <AlertTitle>
        {isContentFilter ? "Message Filtered" : "Error"}
      </AlertTitle>
      <AlertDescription>
        <p className="text-sm">{getErrorMessage()}</p>
      </AlertDescription>
    </Alert>
  );
}
