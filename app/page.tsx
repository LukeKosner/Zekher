"use client";

import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import Image from "next/image";
import { BookOpenCheckIcon, MessagesSquare, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle
} from "@/components/ui/kibo-ui/announcement";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="flex flex-col gap-16 px-8 py-24 text-center">
        <div className="flex flex-col items-center justify-center gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Link href="#">
              <Announcement>
                <AnnouncementTag className="bg-green-200">
                  v3 Beta
                </AnnouncementTag>
                <AnnouncementTitle>
                  Support for MCP
                  <ArrowUpRight className="inline-block h-4 w-4" />
                </AnnouncementTitle>
              </Announcement>
            </Link>
          </motion.div>
          <motion.h1
            className="mb-0 text-balance font-medium text-6xl md:text-7xl xl:text-[5.25rem]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            Preserving Holocaust memory with AI
          </motion.h1>
          <motion.p
            className="mt-0 mb-0 text-balance text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            Access authoritative Holocaust education materials through
            AI-powered search of Yad Vashem resources and survivor testimonies.
          </motion.p>

          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          >
            <Button asChild>
              <Link href="/chat">
                <MessagesSquare className="w-4 h-4" />
                Start Chat
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link className="no-underline" href="/sources">
                <BookOpenCheckIcon className="w-4 h-4" />
                Browse Sources
              </Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="w-full max-w-lg md:max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
        >
          <AspectRatio ratio={2217 / 1478} className="relative">
            <Image
              src="/giulia-gasperini-8S-D-UodlHU-unsplash.jpg"
              alt="Memorial to the Murdered Jews of Europe"
              className="rounded-lg object-cover"
              fill
            />
            <Badge className="absolute bottom-2 right-2 max-w-[calc(100%-1rem)]">
              <span className="text-[10px] sm:text-xs flex items-center gap-x-1 flex-wrap">
                Photo by{" "}
                <Link
                  className="underline inline-flex items-center gap-0.5 whitespace-nowrap"
                  href="https://unsplash.com/@giuliagasp?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Giulia Gasperini
                  <ArrowUpRight className="w-2.5 h-2.5 flex-shrink-0" />
                </Link>{" "}
                on{" "}
                <Link
                  className="underline inline-flex items-center gap-0.5 whitespace-nowrap"
                  href="https://unsplash.com/photos/cemetery-vault-8S-D-UodlHU?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Unsplash
                  <ArrowUpRight className="w-2.5 h-2.5 flex-shrink-0" />
                </Link>
              </span>
            </Badge>
          </AspectRatio>
        </motion.div>

        <p className="text-center text-muted-foreground text-xs sm:text-sm">
          Made with ♥︎ in New York City, USA
        </p>
      </div>
    </main>
  );
}
