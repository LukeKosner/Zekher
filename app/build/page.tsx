import { BuildPageClient } from "./BuildPageClient";

export default function BuildPage() {
  const version = process.env.VERCEL_GIT_COMMIT_SHA || "Not available";

  return (
    <BuildPageClient version={version} />
  );
}
