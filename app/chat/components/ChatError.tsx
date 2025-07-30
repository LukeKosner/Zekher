import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Shield } from "lucide-react";

interface ChatErrorProps {
  error?: Error;
  contentFilterData?: {
    finishReason: string;
    providerMetadata: any;
    timestamp: string;
    message: string;
  };
}

/* ---------- Helpers ---------- */

const highestRiskCategories = (providerMetadata: any): string[] => {
  const ratings = providerMetadata?.google?.safetyRatings ?? [];
  if (ratings.length === 0) return [];

  const order = ["NEGLIGIBLE", "LOW", "MEDIUM", "HIGH"];
  let maxIdx = -1;

  ratings.forEach((r: any) => {
    const idx = order.indexOf(r.probability);
    if (idx > maxIdx) maxIdx = idx;
  });

  if (maxIdx <= 0) return []; // nothing above NEGLIGIBLE

  return ratings
    .filter((r: any) => order.indexOf(r.probability) === maxIdx)
    .map((r: any) => `${r.category}: ${r.probability}`);
};

const formatErrorMessage = (message: string): string[] => {
  // Try to parse as JSON and extract meaningful messages
  try {
    const parsed = JSON.parse(message);
    const bullets: string[] = [];

    if (parsed.message) bullets.push(`message: ${parsed.message}`);
    if (parsed.error) bullets.push(`error: ${parsed.error}`);
    if (parsed.timestamp) bullets.push(`timestamp: ${parsed.timestamp}`);

    // Add any other fields that might be useful
    Object.keys(parsed).forEach((key) => {
      if (!["message", "error", "timestamp"].includes(key) && parsed[key]) {
        bullets.push(`${key}: ${parsed[key]}`);
      }
    });

    return bullets.length > 0
      ? bullets
      : ["Something went wrong – please try again."];
  } catch {
    // Not JSON, return as single bullet
    if (message.includes("{") && message.includes("}")) {
      return ["Something went wrong – please try again."];
    }
    return [message];
  }
};

export function ChatError({ error, contentFilterData }: ChatErrorProps) {
  const isFilter = Boolean(contentFilterData);

  /* Build bullets */
  let bullets: string[] = [];

  if (isFilter && contentFilterData?.providerMetadata) {
    bullets = highestRiskCategories(contentFilterData.providerMetadata);
    if (bullets.length === 0) bullets = ["Unsafe or disallowed content"];
  } else if (error) {
    bullets = formatErrorMessage(error.message);
  } else {
    bullets = ["Something went wrong – please try again."];
  }

  return (
    <Alert variant="destructive" className="mb-4">
      {isFilter ? (
        <Shield className="h-4 w-4" />
      ) : (
        <AlertTriangle className="h-4 w-4" />
      )}

      <AlertTitle>{isFilter ? "Your message was blocked" : "Error"}</AlertTitle>

      <AlertDescription>
        {isFilter &&
          "Zekher rejects unsafe messages to protect Holocaust memory."}
      </AlertDescription>
      <AlertDescription>
        <ul className="list-disc pl-4 text-sm">
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </AlertDescription>

      {isFilter && (
        <AlertDescription className="text-sm">
          <span>
            Learn more about our screening{" "}
            <a
              href="https://ai.google.dev/gemini-api/docs/safety-settings"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              here
            </a>
            . Feel free to{" "}
            <a href="mailto:hey@lukekosner.com" className="underline">
              contact us
            </a>{" "}
            if you have any questions.
          </span>
        </AlertDescription>
      )}
    </Alert>
  );
}
