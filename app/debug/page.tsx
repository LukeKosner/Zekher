"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function DebugPage() {
  const { messages, sendMessage, status } = useChat({
    maxSteps: 5,
    onError: (err) => console.error("Debug chat error:", err)
  });

  const [hasStarted, setHasStarted] = useState(false);

  const startDebugChat = () => {
    if (!hasStarted) {
      setHasStarted(true);
      sendMessage({ text: "What was the Holocaust?" });
    }
  };

  // Format the debug output
  const debugData = {
    status,
    messageCount: messages.length,
    timestamp: new Date().toISOString(),
    messages: messages.map((message, index) => ({
      index,
      id: message.id,
      role: message.role,
      content: (message as any).content,
      parts: (message as any).parts,
      createdAt: (message as any).createdAt
    }))
  };

  return (
    <div className="p-6 font-mono">
      <h1 className="text-2xl font-bold mb-4">Debug Chat Output</h1>
      
      <div className="mb-4 flex items-center gap-4">
        <button
          onClick={startDebugChat}
          disabled={hasStarted || status === "streaming"}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {hasStarted ? "Chat Started" : "Start Debug Chat"}
        </button>
        
        <span className="text-sm text-gray-600">
          Status: <span className="font-semibold">{status}</span>
        </span>
      </div>

      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto text-xs leading-relaxed">
        {JSON.stringify(debugData, null, 2)}
      </pre>
    </div>
  );
}