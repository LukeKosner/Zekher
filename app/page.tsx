"use client";

import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import Image from "next/image";
import {
  MessagesSquare,
  ArrowUpRight,
  Server,
  Mail,
  Info,
  LibraryBig
} from "lucide-react";
import Link from "next/link";
import { FeatureCard } from "./components/FeatureCard";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle
} from "@/components/ui/kibo-ui/announcement";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <div className="flex flex-col gap-20 text-center">
          <div className="flex flex-col items-center justify-center gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Link href="/mcp" className="no-underline">
                <Announcement>
                  <AnnouncementTag className="bg-green-200">
                    v3 Beta
                  </AnnouncementTag>
                  <AnnouncementTitle>
                    Support for MCP
                    <ArrowUpRight className="inline w-4 h-4" />
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
              AI-powered search of{" "}
              <Link
                href="https://www.yadvashem.org/holocaust/resource-center/lexicon.html"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Yad Vashem resources
              </Link>
              <ArrowUpRight className="inline w-4 h-4" /> and{" "}
              <Link
                href="https://voices.library.iit.edu/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                survivor testimonies
              </Link>
              <ArrowUpRight className="inline w-4 h-4" />.
            </motion.p>

            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            >
              <Button asChild>
                <Link href="/chat">
                  Start Chat
                  <MessagesSquare className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link className="no-underline" href="/about">
                  About
                  <Info className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Memorial Image */}
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

          {/* Solution Overview */}
          <motion.div
            className="text-center space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-foreground">
                Tools for Responsible Agents
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
                By integrating authoritative sources directly into AI systems,
                we ensure accurate, verified information reaches users when they
                need it most.
              </p>
            </div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
            >
              <FeatureCard
                title="Chat Experience"
                description="Familiar AI chat powered by Lexicon content with real interview audio snippets as supplements."
                buttonText="Try Chat"
                buttonIcon={<MessagesSquare className="w-4 h-4 ml-2" />}
                buttonLink="/chat"
                buttonVariant="outline"
              />
              <FeatureCard
                title="MCP Server"
                description="Model Context Protocol server for adding Lexicon functionality to Claude, ChatGPT, and other AI clients."
                buttonText="Learn More"
                buttonIcon={<Server className="w-4 h-4 ml-2" />}
                buttonLink="/mcp"
                buttonVariant="outline"
              />
              <FeatureCard
                title="Source Library"
                description="Unified library serving as the landing page for citations from both Chat and MCP integrations."
                buttonText="Browse Sources"
                buttonIcon={<LibraryBig className="w-4 h-4 ml-2" />}
                buttonLink="/sources"
                buttonVariant="outline"
              />
            </motion.div>
          </motion.div>

          {/* Final CTA Section */}
          <motion.div
            className="text-center space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6, ease: "easeOut" }}
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-foreground">
                Get Involved
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
                Zekher is a project in beta. We hope to open-source everything
                soon. If you have any questions, feedback, or want to
                contribute, please reach out.
              </p>
            </div>

            <div className="flex flex-row items-center justify-center gap-4">
              <Button asChild variant="outline" size="lg">
                <Link href="mailto:support@zekher.com">
                  Email Us
                  <Mail className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/about">
                  About <Info className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
