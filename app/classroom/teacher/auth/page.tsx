import { redirect } from "next/navigation";

export default async function TeacherAuthPage({
  searchParams
}: {
  searchParams?: Promise<{ returnTo?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const returnTo = resolvedSearchParams?.returnTo ?? "/classroom/teacher";
  const encodedReturnTo = encodeURIComponent(returnTo);
  redirect(`/auth?returnTo=${encodedReturnTo}`);
}
