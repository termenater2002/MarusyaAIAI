"use client";

import { useState } from "react";

import { AIToolGrid } from "@/app/components/ai-tool-grid";
import { aiData } from "@/app/data/ai";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;

export default function Home() {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(aiData.length / PAGE_SIZE));

  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageItems = aiData.slice(start, end);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  const goToPage = (nextPage: number) => {
    setPage((current) => {
      const clamped = Math.min(
        totalPages,
        Math.max(1, Number.isFinite(nextPage) ? nextPage : current),
      );

      return clamped;
    });
  };

  return (
    <div className="site-container flex flex-col gap-8 py-10">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          AI Каталог
        </p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Каталог реальных AI-инструментов из исходных данных.
        </h1>
        <p className="max-w-3xl text-lg text-muted-foreground">
          Показываем название, краткое описание, рейтинг и теги каждого сервиса напрямую из aiData без выдуманных элементов.
        </p>
      </header>

      <AIToolGrid tools={pageItems} />

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={page === 1}
                className={cn({
                  "pointer-events-none opacity-50": page === 1,
                })}
                onClick={(event) => {
                  event.preventDefault();
                  goToPage(page - 1);
                }}
              />
            </PaginationItem>

            {pages.map((pageNumber) => (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  href="#"
                  isActive={pageNumber === page}
                  aria-label={`Перейти на страницу ${pageNumber}`}
                  onClick={(event) => {
                    event.preventDefault();
                    goToPage(pageNumber);
                  }}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                aria-disabled={page === totalPages}
                className={cn({
                  "pointer-events-none opacity-50": page === totalPages,
                })}
                onClick={(event) => {
                  event.preventDefault();
                  goToPage(page + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
