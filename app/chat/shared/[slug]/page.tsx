import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { notFound } from "next/navigation";
import { SharedChatPageClient } from "./SharedChatPageClient";

export default async function SharedChatPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const share = await fetchQuery(api.shares.getShareBySlug, { slug: params.slug });
  if (!share) {
    notFound();
  }

  return <SharedChatPageClient messages={share.payload} />;
}
