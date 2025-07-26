"use client";

import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import Image from "next/image";
import {
  Library,
  MessagesSquare,
  ArrowUpRight,
  Server,
  Mail,
  Info
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle
} from "@/components/ui/kibo-ui/announcement";
import {
  HOMEPAGE_CONTENT,
  EXTERNAL_LINKS,
  ANIMATION_CONFIG,
  IMAGE_CONFIG,
  PAGE_STYLING
} from "./constants";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className={`${PAGE_STYLING.maxWidth} mx-auto ${PAGE_STYLING.padding}`}>
        <div className={`flex flex-col ${PAGE_STYLING.gap} text-center`}>
          <div className="flex flex-col items-center justify-center gap-8">
            <motion.div
              {...ANIMATION_CONFIG.hero.announcement}
            >
              <Link href={HOMEPAGE_CONTENT.announcement.link} className="no-underline">
                <Announcement>
                  <AnnouncementTag className="bg-green-200">
                    {HOMEPAGE_CONTENT.announcement.tag}
                  </AnnouncementTag>
                  <AnnouncementTitle>
                    {HOMEPAGE_CONTENT.announcement.title}
                    <ArrowUpRight className="inline w-4 h-4" />
                  </AnnouncementTitle>
                </Announcement>
              </Link>
            </motion.div>
            <motion.h1
              className={`mb-0 text-balance font-medium ${PAGE_STYLING.heroFontSizes}`}
              {...ANIMATION_CONFIG.hero.heading}
            >
              {HOMEPAGE_CONTENT.hero.mainHeading}
            </motion.h1>
            <motion.p
              className="mt-0 mb-0 text-balance text-lg text-muted-foreground"
              {...ANIMATION_CONFIG.hero.subheading}
            >
              {HOMEPAGE_CONTENT.hero.subheading}{" "}
              <Link
                href={EXTERNAL_LINKS.yadVashem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {EXTERNAL_LINKS.yadVashem.text}
              </Link>
              <ArrowUpRight className="inline w-4 h-4" /> and{" "}
              <Link
                href={EXTERNAL_LINKS.survivorTestimonies.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {EXTERNAL_LINKS.survivorTestimonies.text}
              </Link>
              <ArrowUpRight className="inline w-4 h-4" />.
            </motion.p>

            <motion.div
              className="flex items-center gap-2"
              {...ANIMATION_CONFIG.hero.buttons}
            >
              <Button asChild>
                <Link href={HOMEPAGE_CONTENT.hero.ctaButtons.primary.href}>
                  {HOMEPAGE_CONTENT.hero.ctaButtons.primary.text}
                  <MessagesSquare className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link className="no-underline" href={HOMEPAGE_CONTENT.hero.ctaButtons.secondary.href}>
                  {HOMEPAGE_CONTENT.hero.ctaButtons.secondary.text}
                  <Library className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Memorial Image */}
          <motion.div
            className="w-full max-w-lg md:max-w-2xl mx-auto"
            {...ANIMATION_CONFIG.memorialImage}
          >
            <AspectRatio ratio={IMAGE_CONFIG.memorial.aspectRatio} className="relative">
              <Image
                src={IMAGE_CONFIG.memorial.src}
                alt={IMAGE_CONFIG.memorial.alt}
                className="rounded-lg object-cover"
                fill
              />
              <Badge className="absolute bottom-2 right-2 max-w-[calc(100%-1rem)]">
                <span className="text-[10px] sm:text-xs flex items-center gap-x-1 flex-wrap">
                  Photo by{" "}
                  <Link
                    className="underline inline-flex items-center gap-0.5 whitespace-nowrap"
                    href={EXTERNAL_LINKS.unsplashCredit.photographer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {EXTERNAL_LINKS.unsplashCredit.photographer.name}
                    <ArrowUpRight className="w-2.5 h-2.5 flex-shrink-0" />
                  </Link>{" "}
                  on{" "}
                  <Link
                    className="underline inline-flex items-center gap-0.5 whitespace-nowrap"
                    href={EXTERNAL_LINKS.unsplashCredit.platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {EXTERNAL_LINKS.unsplashCredit.platform.name}
                    <ArrowUpRight className="w-2.5 h-2.5 flex-shrink-0" />
                  </Link>
                </span>
              </Badge>
            </AspectRatio>
          </motion.div>

          {/* Solution Overview */}
          <motion.div
            className={`text-center ${PAGE_STYLING.sectionSpacing}`}
            {...ANIMATION_CONFIG.solutionOverview}
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-foreground">
                {HOMEPAGE_CONTENT.solutionOverview.heading}
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
                {HOMEPAGE_CONTENT.solutionOverview.subheading}
              </p>
            </div>

            <motion.div
              className={`grid ${PAGE_STYLING.gridCols} gap-6 mt-8`}
              {...ANIMATION_CONFIG.featureCards}
            >
              <div className="border rounded-lg p-6 bg-card text-card-foreground text-center flex flex-col h-full">
                <h3 className="text-lg font-semibold mb-4">{HOMEPAGE_CONTENT.solutionOverview.features[0].title}</h3>
                <p className="text-sm text-muted-foreground mb-6 flex-grow">
                  {HOMEPAGE_CONTENT.solutionOverview.features[0].description}
                </p>
                <Button asChild size="sm" className="mt-auto">
                  <Link href={HOMEPAGE_CONTENT.solutionOverview.features[0].cta.href}>
                    {HOMEPAGE_CONTENT.solutionOverview.features[0].cta.text}
                    <MessagesSquare className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              <div className="border rounded-lg p-6 bg-card text-card-foreground text-center flex flex-col h-full">
                <h3 className="text-lg font-semibold mb-4">{HOMEPAGE_CONTENT.solutionOverview.features[1].title}</h3>
                <p className="text-sm text-muted-foreground mb-6 flex-grow">
                  {HOMEPAGE_CONTENT.solutionOverview.features[1].description}
                </p>
                <Button asChild size="sm" variant="outline" className="mt-auto">
                  <Link href={HOMEPAGE_CONTENT.solutionOverview.features[1].cta.href}>
                    {HOMEPAGE_CONTENT.solutionOverview.features[1].cta.text}
                    <Server className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              <div className="border rounded-lg p-6 bg-card text-card-foreground text-center flex flex-col h-full">
                <h3 className="text-lg font-semibold mb-4">{HOMEPAGE_CONTENT.solutionOverview.features[2].title}</h3>
                <p className="text-sm text-muted-foreground mb-6 flex-grow">
                  {HOMEPAGE_CONTENT.solutionOverview.features[2].description}
                </p>
                <Button asChild size="sm" variant="outline" className="mt-auto">
                  <Link href={HOMEPAGE_CONTENT.solutionOverview.features[2].cta.href}>
                    {HOMEPAGE_CONTENT.solutionOverview.features[2].cta.text}
                    <Library className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </motion.div>

          {/* Final CTA Section */}
          <motion.div
            className={`text-center ${PAGE_STYLING.sectionSpacing}`}
            {...ANIMATION_CONFIG.finalCta}
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-foreground">
                {HOMEPAGE_CONTENT.getInvolved.heading}
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
                {HOMEPAGE_CONTENT.getInvolved.subheading}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild variant="outline" size="lg">
                <Link href={HOMEPAGE_CONTENT.getInvolved.ctaButtons.email.href}>
                  {HOMEPAGE_CONTENT.getInvolved.ctaButtons.email.text}
                  <Mail className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={HOMEPAGE_CONTENT.getInvolved.ctaButtons.about.href}>
                  {HOMEPAGE_CONTENT.getInvolved.ctaButtons.about.text} <Info className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
