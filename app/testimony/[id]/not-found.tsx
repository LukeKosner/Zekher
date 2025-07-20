/**
 * Not Found Page for Testimony Route
 * 
 * Displays when a testimony with the given ID cannot be found.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileQuestionIcon, ArrowLeftIcon } from "lucide-react";

export default function TestimonyNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 md:p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FileQuestionIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Testimony Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The testimony you're looking for could not be found. It may have been moved or removed.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild variant="default">
              <Link href="/sources">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Sources
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}