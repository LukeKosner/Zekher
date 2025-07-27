"use client";

import { motion } from "motion/react";
import { GitCommit, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface BuildPageClientProps {
  version: string;
}

export function BuildPageClient({ version }: BuildPageClientProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(version);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-semibold">Build Information</h1>
        </div>

        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCommit className="w-5 h-5" />
              Version Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">SHA:</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono">
                  {version}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="h-8 w-8 p-0"
                  title="Copy build ID"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {version === "Not available" && (
              <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                <p>
                  Build information is not available. This typically means the
                  app is running in development mode or outside of a Vercel
                  deployment environment.
                </p>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                This identifier is sourced from the VERCEL_GIT_COMMIT_SHA
                environment variable, which is automatically set by Vercel
                during deployment.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
