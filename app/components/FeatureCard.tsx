import { Button } from "@/components/ui/button";
import Link from "next/link";

export function FeatureCard({ title, description, buttonText, buttonIcon, buttonLink, buttonVariant }: any) {
  return (
    <div className="border rounded-lg p-6 bg-card text-card-foreground text-center flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 flex-grow">
        {description}
      </p>
      <Button asChild size="sm" variant={buttonVariant} className="mt-auto">
        <Link href={buttonLink}>
          {buttonText}
          {buttonIcon}
        </Link>
      </Button>
    </div>
  );
}