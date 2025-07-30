import { motion } from "motion/react";
import { LazyLoadWrapper } from "@/components/LazyLoadWrapper";
import { LexiconCard } from "./LexiconCard";
import { TestimonyCard } from "./TestimonyCard";
import { LexiconCardSkeleton, TestimonyCardSkeleton } from "./skeletons";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

export function PaginatedSourceGrid({
  sources,
  sourceType,
  searchQuery,
  currentPage,
  setCurrentPage,
  totalPaginatedPages,
  noResultsMessage,
  noEntriesMessage
}: any) {
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
    <div className="space-y-6">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        key={`${sourceType}-grid-${searchQuery}-${currentPage}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {sources.length > 0 ? (
          sources.map((source: any, index: number) => (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.15,
                delay: Math.min(index * 0.02, 0.1),
                ease: "easeOut"
              }}
              whileHover={{
                y: -2,
                transition: { duration: 0.1 }
              }}
            >
              <LazyLoadWrapper
                placeholder={
                  sourceType === "lexicon" ? (
                    <LexiconCardSkeleton />
                  ) : (
                    <TestimonyCardSkeleton />
                  )
                }
              >
                {sourceType === "lexicon" ? (
                  <LexiconCard source={source} />
                ) : (
                  <TestimonyCard source={source} />
                )}
              </LazyLoadWrapper>
            </motion.div>
          ))
        ) : (
          <motion.div
            className="col-span-full text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? noResultsMessage : noEntriesMessage}
            </p>
          </motion.div>
        )}
      </motion.div>
      {totalPaginatedPages > 1 && (
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
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {generatePageNumbers(currentPage, totalPaginatedPages).map(
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
                  if (currentPage < totalPaginatedPages)
                    setCurrentPage(currentPage + 1);
                }}
                className={
                  currentPage === totalPaginatedPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
