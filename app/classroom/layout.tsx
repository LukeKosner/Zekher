import type { Metadata } from "next";
import { ConvexClientProvider } from "@/components/classroom/ConvexClientProvider";

export const metadata: Metadata = {
  title: "Classroom | Zekher",
  description:
    "Live classroom for guided Holocaust education with real-time teacher monitoring.",
};

export default function ClassroomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexClientProvider>
      <div className="flex h-full min-h-0 w-full flex-col">{children}</div>
    </ConvexClientProvider>
  );
}
