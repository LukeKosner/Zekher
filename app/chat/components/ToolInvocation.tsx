import { AIMessage } from "@/components/ui/kibo-ui/ai/message";
import {
  AITool,
  AIToolHeader,
  AIToolContent,
  AIToolParameters
} from "@/components/ui/kibo-ui/ai/tool";
import { LexiconCarousel } from "./LexiconCarousel";
import { TestimonyCarousel } from "./TestimonyCarousel";
import { AudioPlayer } from "./AudioPlayer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BookOpenCheck, Users, History, AudioWaveform } from "lucide-react";

export function ToolInvocation({ part, messageId, partIndex }: any) {
  const isToolPart =
    typeof part.type === "string" && part.type.startsWith("tool-");
  if (!isToolPart) return null;

  const toolName = part.type.replace("tool-", "");
  const toolInvocation = {
    toolCallId: part.toolCallId,
    state:
      part.state === "output-available" ? "result" : part.state || "call",
    args: part.input || {},
    result: part.output
  };

  const getToolDisplay = (toolName: string) => {
    switch (toolName) {
      case "lexiconTool":
        return {
          icon: <History size={18} />,
          displayName: "Holocaust Lexicon"
        };
      case "testimonyTool":
        return {
          icon: <Users size={18} />,
          displayName: "Survivor Testimonies"
        };
      case "showUsersAudio":
        return {
          icon: <AudioWaveform size={18} />,
          displayName: "Audio Selections"
        };
      default:
        return { icon: <BookOpenCheck size={18} />, displayName: toolName };
    }
  };

  const hasAudioSegments = (result: any) => {
    return (
      result &&
      typeof result === "object" &&
      (result.type === "audio_segments" || Array.isArray(result.segments))
    );
  };

  const renderToolResult = (toolInvocation: any): React.ReactNode => {
    if (toolInvocation.state !== "result") return null;

    const resultData = toolInvocation.result;
    const isLexiconResult = resultData?.entries?.some(
      (e: any) => e.title && !e.survivorName
    );
    const isTestimonyResult = resultData?.entries?.some(
      (e: any) => e.survivorName
    );

    return (
      <AIToolContent>
        <AIToolParameters parameters={toolInvocation.args || {}} />
        <div className="space-y-2">
          <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Results
          </h4>
          <div className="rounded-md bg-muted/50 p-3">
            {isLexiconResult && (
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs font-medium">
                  Found{" "}
                  {toolInvocation.result.totalResults ||
                    toolInvocation.result.entries.length}{" "}
                  lexicon entries:
                </div>
                {toolInvocation.result.entries.map(
                  (entry: any, idx: number) => (
                    <div
                      key={idx}
                      className="text-xs bg-background rounded p-2 border"
                    >
                      <div className="font-medium text-foreground">
                        <a
                          href={generateSourceUrl({
                            pageType: "lexicon",
                            filename: entry.id || entry.filename
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {entry.title}
                        </a>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {isTestimonyResult && (
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs font-medium">
                  Found {resultData.totalResults} testimonies:
                </div>
                {resultData.entries.map((testimony: any, idx: number) => (
                  <div
                    key={idx}
                    className="text-xs bg-background rounded p-2 border"
                  >
                    <div className="font-medium text-foreground">
                      <a
                        href={generateSourceUrl({
                          pageType: "testimony",
                          filename: testimony.id || testimony.filename
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {testimony.survivorName}
                      </a>
                    </div>
                    <div className="text-muted-foreground mt-1">
                      {testimony.location && `${testimony.location}`}
                      {testimony.location && testimony.timeReference && ` • `}
                      {testimony.timeReference && `${testimony.timeReference}`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLexiconResult && !isTestimonyResult && (
              <div className="text-xs text-muted-foreground">
                {typeof resultData === "string"
                  ? resultData
                  : "Tool executed successfully"}
              </div>
            )}
          </div>
        </div>
      </AIToolContent>
    );
  };

  const toolDisplay = getToolDisplay(toolName);

  // Handle audio segments specially
  if (
    toolName === "showUsersAudio" &&
    (toolInvocation.state === "result" ||
      part.state === "output-available" ||
      part.output) &&
    hasAudioSegments(toolInvocation.result || part.output)
  ) {
    const resultData = toolInvocation.result || part.output;
    const audioData = {
      type: resultData.type || "audio_segments",
      segments: resultData.segments || resultData
    };

    return (
      <AIMessage from="assistant" key={`${messageId}-tool-${partIndex}`}>
        <AITool status="completed" defaultOpen={true}>
          <AIToolHeader
            name={toolDisplay.displayName}
            status="completed"
            icon={
              <span className="size-4 text-muted-foreground">
                {toolDisplay.icon}
              </span>
            }
          />
          <AIToolContent>
            <div className="space-y-4">
              {audioData.segments.map((segment: any, segIdx: number) => (
                <ErrorBoundary
                  key={`audio-${segIdx}`}
                  componentName="AudioPlayer"
                  fallback={
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        Audio player unavailable.
                        <br />
                        <span className="font-medium">Transcript:</span>{" "}
                        {segment.transcriptExcerpt}
                        <br />
                        <span className="font-medium">Audio File:</span>{" "}
                        {segment.audioFile}
                      </p>
                    </div>
                  }
                >
                  <AudioPlayer segment={segment} />
                </ErrorBoundary>
              ))}
            </div>
          </AIToolContent>
        </AITool>
      </AIMessage>
    );
  }

  // Handle lexicon and testimony tools with carousels
  if (toolName === "lexiconTool") {
    return (
      <AIMessage from="assistant" key={`${messageId}-tool-${partIndex}`}>
        <LexiconCarousel
          status={toolInvocation.state}
          name={toolDisplay.displayName}
          sources={toolInvocation.result?.entries || []}
        />
      </AIMessage>
    );
  }

  if (toolName === "testimonyTool") {
    return (
      <AIMessage from="assistant" key={`${messageId}-tool-${partIndex}`}>
        <TestimonyCarousel
          status={toolInvocation.state}
          name={toolDisplay.displayName}
          sources={toolInvocation.result?.entries || []}
        />
      </AIMessage>
    );
  }

  // Handle other tools with standard UI
  if (toolName === "showUsersAudio" && toolInvocation.state !== "result") {
    const isRunning =
      toolInvocation.state === "call" ||
      toolInvocation.state === "partial-call" ||
      (!toolInvocation.state && !toolInvocation.result);

    return (
      <AIMessage from="assistant" key={`${messageId}-tool-${partIndex}`}>
        <AITool
          status={
            isRunning
              ? "running"
              : toolInvocation.state === "result"
                ? "completed"
                : "pending"
          }
          defaultOpen={true}
        >
          <AIToolHeader
            name={toolDisplay.displayName}
            status={
              isRunning
                ? "running"
                : toolInvocation.state === "result"
                  ? "completed"
                  : "pending"
            }
            icon={
              <span className="size-4 text-muted-foreground">
                {toolDisplay.icon}
              </span>
            }
          />
          <AIToolContent>
            {isRunning ? (
              Object.keys(toolInvocation.args || {}).length > 0 ? (
                <AIToolParameters parameters={toolInvocation.args || {}} />
              ) : (
                <div className="text-xs text-muted-foreground animate-pulse">
                  Selecting relevant audio segments...
                </div>
              )
            ) : toolInvocation.state === "result" ? (
              renderToolResult(toolInvocation)
            ) : (
              <div className="text-xs text-muted-foreground">
                Tool in unknown state: {toolInvocation.state || "undefined"}
              </div>
            )}
          </AIToolContent>
        </AITool>
      </AIMessage>
    );
  }

  // Handle showUsersAudio tool that completed but doesn't have audio segments
  if (toolName === "showUsersAudio" && toolInvocation.state === "result") {
    return (
      <AIMessage from="assistant" key={`${messageId}-tool-${partIndex}`}>
        <AITool status="completed" defaultOpen={true}>
          <AIToolHeader
            name={toolDisplay.displayName}
            status="completed"
            icon={
              <span className="size-4 text-muted-foreground">
                {toolDisplay.icon}
              </span>
            }
          />
          <AIToolContent>{renderToolResult(toolInvocation)}</AIToolContent>
        </AITool>
      </AIMessage>
    );
  }

  return null;
}