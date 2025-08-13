"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { CustomUIMessage } from "@/app/api/chat/types";

export default function ChatDebugPage() {
  const [testMessage, setTestMessage] = useState("Tell me about the Holocaust");
  const [rawResponse, setRawResponse] = useState<string>("");

  const { messages, sendMessage, status, stop, error } =
    useChat<CustomUIMessage>({
      onError: (err) => {
        console.error("Chat error:", err);
        setRawResponse(JSON.stringify(err, null, 2));
      },
      onData: (dataPart) => {
        console.log("Data part received:", dataPart);
        // Capture the data part for display
        setRawResponse(JSON.stringify(dataPart, null, 2));
      }
    });

  const sendTestMessage = async () => {
    if (testMessage.trim()) {
      setRawResponse(""); // Clear previous response
      await sendMessage({ text: testMessage });
    }
  };

  const formatJSON = (obj: any) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  const generateCurlCommand = () => {
    const requestBody = {
      messages: [
        {
          role: "user",
          parts: [
            {
              type: "text",
              text: testMessage
            }
          ],
          id: `test-user-${Date.now()}`
        }
      ]
    };

    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";

    const curlCommand = `curl -X POST ${baseUrl}/api/chat \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -H "User-Agent: curl/7.68.0" \\
  -d '${JSON.stringify(requestBody, null, 2)}' \\
  --verbose`;

    return curlCommand;
  };

  const getWebRequest = () => {
    // Show what the web interface actually sends
    const webRequest = {
      messages: messages.map((msg) => ({
        role: msg.role,
        content: (msg as any).parts?.[0]?.text || (msg as any).content || "",
        id: msg.id,
        createdAt: (msg as any).createdAt
      }))
    };

    return JSON.stringify(webRequest, null, 2);
  };

  const copyCurlCommand = async () => {
    try {
      await navigator.clipboard.writeText(generateCurlCommand());
    } catch (err) {
      console.error("Failed to copy curl command:", err);
    }
  };

  return (
    <div className="h-full w-full flex flex-col p-4 bg-gray-50">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">DEBUG</Badge>
            Chat API JSON Response
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* Test Message Input */}
          <div className="space-y-2 flex-shrink-0">
            <Label htmlFor="test-message">Test Message</Label>
            <div className="flex gap-2">
              <Textarea
                id="test-message"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Enter a test message..."
                rows={2}
                className="flex-1"
              />
              <Button
                onClick={sendTestMessage}
                disabled={status === "streaming"}
                className="self-end"
              >
                {status === "streaming" ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>

          {/* Curl Command */}
          <div className="space-y-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">cURL Command</Label>
              <Button variant="outline" size="sm" onClick={copyCurlCommand}>
                Copy
              </Button>
            </div>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-32 font-mono">
              {generateCurlCommand()}
            </pre>
          </div>

          {/* Web Request Format */}
          {messages.length > 0 && (
            <div className="space-y-2 flex-shrink-0">
              <Label className="font-semibold">Web Request Format</Label>
              <pre className="text-xs bg-blue-50 p-3 rounded overflow-auto max-h-32 font-mono">
                {getWebRequest()}
              </pre>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant={status === "streaming" ? "default" : "secondary"}>
              {status}
            </Badge>
            {status === "streaming" && (
              <Button variant="outline" size="sm" onClick={stop}>
                Stop
              </Button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50 flex-shrink-0">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label className="text-red-700 font-semibold">Error</Label>
                  <pre className="text-sm text-red-600 bg-red-100 p-3 rounded overflow-auto max-h-32">
                    {formatJSON(error)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scrollable Content Area */}
          <div className="flex-1 flex flex-col space-y-4 overflow-auto">
            {/* Raw Response Display */}
            {rawResponse && (
              <Card className="flex-shrink-0">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Label className="font-semibold">JSON Response</Label>
                    <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto max-h-64">
                      {rawResponse}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Messages Display */}
            {messages.length > 0 && (
              <Card className="flex-shrink-0">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Label className="font-semibold">
                      All Messages ({messages.length})
                    </Label>
                    <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto max-h-96">
                      {formatJSON(messages)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
