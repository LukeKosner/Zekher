"use client";

import { LazyLoadWrapper } from "@/components/LazyLoadWrapper";
import { LexiconCardSkeleton, TestimonyCardSkeleton } from "./skeletons";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { LexiconCard } from "@/app/sources/components/LexiconCard";
import { TestimonyCard } from "@/app/sources/components/TestimonyCard";
import { sourcesPageConstants } from "@/app/sources/constants";
import { LexiconSource, TestimonySource } from "@/app/sources/types";
import { ErrorBoundary } from "@/components/ErrorBoundary";

/**
 * @file This file defines the client-side content for the sources page.
 * It includes the source library, search functionality, and pagination.
 * It is wrapped in an ErrorBoundary to catch and handle any client-side errors.
 */

interface SourceLibraryProps {
  lexiconSources: LexiconSource[];
  testimonySources: TestimonySource[];
}

function SourceLibrary({
  lexiconSources,
  testimonySources
}: SourceLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"lexicon" | "testimony">(
    "lexicon"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const filteredLexiconSources = useMemo(
    () =>
      lexiconSources.filter((source) => {
        if (!searchQuery.trim()) return true;
        const queryLower = searchQuery.toLowerCase();
        return (
          source.title?.toLowerCase().includes(queryLower) ||
          source.description?.toLowerCase().includes(queryLower) ||
          source.tags?.some((tag) => tag.toLowerCase().includes(queryLower))
        );
      }),
    [lexiconSources, searchQuery]
  );

  const filteredTestimonySources = useMemo(
    () =>
      testimonySources.filter((source) => {
        if (!searchQuery.trim()) return true;
        const queryLower = searchQuery.toLowerCase();
        return (
          source.title?.toLowerCase().includes(queryLower) ||
          source.description?.toLowerCase().includes(queryLower) ||
          source.survivor_name?.toLowerCase().includes(queryLower) ||
          source.tags?.some((tag) => tag.toLowerCase().includes(queryLower))
        );
      }),
    [testimonySources, searchQuery]
  );

  const totalLexiconPages = Math.ceil(
    filteredLexiconSources.length / itemsPerPage
  );
  const paginatedLexiconSources = filteredLexiconSources.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalTestimonyPages = Math.ceil(
    filteredTestimonySources.length / itemsPerPage
  );
  const paginatedTestimonySources = filteredTestimonySources.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const generatePageNumbers = (
    currentPage: number,
    totalPages: number
  ): (number | string)[] => {
    if (totalPages <= 1) return [];
    const delta = 2;
    const rangeWithDots: (number | string)[] = [];
    if (totalPages > 1) rangeWithDots.push(1);
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);
    if (start > 2) rangeWithDots.push("...");
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) rangeWithDots.push(i);
    }
    if (end < totalPages - 1) rangeWithDots.push("...");
    if (totalPages > 1) rangeWithDots.push(totalPages);
    const result: (number | string)[] = [];
    for (const item of rangeWithDots) {
      if (result[result.length - 1] !== item) result.push(item);
    }
    return result;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {sourcesPageConstants.pageContent.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {sourcesPageConstants.pageContent.description}
        </p>
      </div>

      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder={sourcesPageConstants.pageContent.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <Tabs
        defaultValue="lexicon"
        className="w-full mx-auto mb-16"
        onValueChange={(value) => {
          setActiveTab(value as "lexicon" | "testimony");
          setCurrentPage(1);
        }}
      >
        <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50">
          <TabsTrigger
            value="lexicon"
            className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
          >
            {sourcesPageConstants.tabs.lexicon} ({filteredLexiconSources.length}
            )
          </TabsTrigger>
          <TabsTrigger
            value="testimony"
            className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
          >
            {sourcesPageConstants.tabs.testimony} (
            {filteredTestimonySources.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="lexicon" className="mt-6">
          <div className="space-y-6">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence mode="wait">
                {paginatedLexiconSources.length > 0 ? (
                  paginatedLexiconSources.map((source, index) => (
                    <motion.div
                      key={source.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
                        ease: "easeOut"
                      }}
                      whileHover={{
                        y: -2,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <LazyLoadWrapper placeholder={<LexiconCardSkeleton />}>
                        <LexiconCard source={source} />
                      </LazyLoadWrapper>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    className="col-span-full text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-gray-600 dark:text-gray-400">
                      {searchQuery
                        ? sourcesPageConstants.pageContent.noSearchResults
                            .lexicon
                        : sourcesPageConstants.pageContent.noLexiconEntries}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            {totalLexiconPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                  {generatePageNumbers(currentPage, totalLexiconPages).map(
                    (page, index) => (
                      <PaginationItem key={index}>
                        {page === "..." ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page as number);
                            }}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalLexiconPages)
                          setCurrentPage(currentPage + 1);
                      }}
                      className={
                        currentPage === totalLexiconPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </TabsContent>
        <TabsContent value="testimony" className="mt-6">
          <div className="space-y-6">
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence mode="wait">
                {paginatedTestimonySources.length > 0 ? (
                  paginatedTestimonySources.map((source, index) => (
                    <motion.div
                      key={source.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
                        ease: "easeOut"
                      }}
                      whileHover={{
                        y: -2,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <LazyLoadWrapper placeholder={<TestimonyCardSkeleton />}>
                        <TestimonyCard source={source} />
                      </LazyLoadWrapper>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    className="col-span-full text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-gray-600 dark:text-gray-400">
                      {searchQuery
                        ? sourcesPageConstants.pageContent.noSearchResults
                            .testimony
                        : sourcesPageConstants.pageContent.noTestimonies}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            {totalTestimonyPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                  {generatePageNumbers(currentPage, totalTestimonyPages).map(
                    (page, index) => (
                      <PaginationItem key={index}>
                        {page === "..." ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page as number);
                            }}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalTestimonyPages)
                          setCurrentPage(currentPage + 1);
                      }}
                      className={
                        currentPage === totalTestimonyPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function SourcesPageContent({
  lexiconSources,
  testimonySources
}: SourceLibraryProps) {
  return (
    <ErrorBoundary componentName="Sources Page">
      <SourceLibrary
        lexiconSources={lexiconSources}
        testimonySources={testimonySources}
      />
    </ErrorBoundary>
  );
}
