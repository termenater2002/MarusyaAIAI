"use client";

import { Fragment } from "react";
import { useEffect, useState } from "react";
import { ArrowUpDown, SlidersHorizontal } from "lucide-react";

import { AIToolGrid } from "@/app/components/ai-tool-grid";
import { type ApiToolListItem } from "@/app/lib/ai-utils";
import { categoryOptions } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;
const SORT_OPTIONS = [
  { value: "default", label: "По умолчанию" },
  { value: "rating-desc", label: "По рейтингу" },
  { value: "name-asc", label: "По названию" },
] as const;

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const visible = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);

  if (currentPage <= 3) {
    visible.add(2);
    visible.add(3);
    visible.add(4);
  }

  if (currentPage >= totalPages - 2) {
    visible.add(totalPages - 1);
    visible.add(totalPages - 2);
    visible.add(totalPages - 3);
  }

  return [...visible]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);
}

export default function Home() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ApiToolListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState("default");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [freeOnly, setFreeOnly] = useState(false);
  const [worksInRussiaOnly, setWorksInRussiaOnly] = useState(false);
  const [russianMadeOnly, setRussianMadeOnly] = useState(false);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const visiblePages = getVisiblePages(page, totalPages);

  useEffect(() => {
    let cancelled = false;

    const loadTools = async () => {
      setLoading(true);
      setError(null);

      try {
        const offset = (page - 1) * PAGE_SIZE;
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
          offset: String(offset),
          sort,
        });

        if (categoryId !== "all") {
          params.set("categoryId", categoryId);
        }

        if (freeOnly) {
          params.set("freeOnly", "true");
        }

        if (worksInRussiaOnly) {
          params.set("worksInRussiaOnly", "true");
        }

        if (russianMadeOnly) {
          params.set("russianMadeOnly", "true");
        }

        const response = await fetch(`/api/tools?${params.toString()}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Не удалось загрузить каталог.");
        }

        const data = (await response.json()) as {
          items: ApiToolListItem[];
          pagination: {
            total: number;
          };
        };

        if (!cancelled) {
          setItems(data.items);
          setTotal(data.pagination.total);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error ? loadError.message : "Не удалось загрузить каталог.",
          );
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadTools();

    return () => {
      cancelled = true;
    };
  }, [page, sort, categoryId, freeOnly, worksInRussiaOnly, russianMadeOnly]);

  const goToPage = (nextPage: number) => {
    setPage((current) => {
      const clamped = Math.min(
        totalPages,
        Math.max(1, Number.isFinite(nextPage) ? nextPage : current),
      );

      return clamped;
    });
  };

  const handleSortChange = (nextSort: string) => {
    setPage(1);
    setSort(nextSort);
  };

  const handleCategoryChange = (nextCategoryId: string) => {
    setPage(1);
    setCategoryId(nextCategoryId);
  };

  const handleFreeOnlyChange = (checked: boolean) => {
    setPage(1);
    setFreeOnly(checked);
  };

  const handleWorksInRussiaOnlyChange = (checked: boolean) => {
    setPage(1);
    setWorksInRussiaOnly(checked);
  };

  const handleRussianMadeOnlyChange = (checked: boolean) => {
    setPage(1);
    setRussianMadeOnly(checked);
  };

  const resetFilters = () => {
    setPage(1);
    setCategoryId("all");
    setFreeOnly(false);
    setWorksInRussiaOnly(false);
    setRussianMadeOnly(false);
  };

  return (
    <div className="site-container flex flex-col gap-8 py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button type="button" variant="outline" className="gap-2">
                <SlidersHorizontal className="size-4" aria-hidden />
                Фильтры
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Фильтры</SheetTitle>
                <SheetDescription>
                  Отбери инструменты по категории и доступности.
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-col gap-6 px-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="category-filter">Категория</Label>
                  <Select value={categoryId} onValueChange={handleCategoryChange}>
                    <SelectTrigger id="category-filter" className="w-full">
                      <SelectValue placeholder="Все категории" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все категории</SelectItem>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="free-only"
                      checked={freeOnly}
                      onCheckedChange={(checked) => handleFreeOnlyChange(Boolean(checked))}
                    />
                    <Label htmlFor="free-only">Только бесплатные</Label>
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="works-russia-only"
                      checked={worksInRussiaOnly}
                      onCheckedChange={(checked) =>
                        handleWorksInRussiaOnlyChange(Boolean(checked))
                      }
                    />
                    <Label htmlFor="works-russia-only">Работает в России</Label>
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="russian-made-only"
                      checked={russianMadeOnly}
                      onCheckedChange={(checked) =>
                        handleRussianMadeOnlyChange(Boolean(checked))
                      }
                    />
                    <Label htmlFor="russian-made-only">Российского производства</Label>
                  </div>
                </div>
              </div>

              <SheetFooter>
                <Button type="button" variant="outline" onClick={resetFilters}>
                  Сбросить
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {(categoryId !== "all" || freeOnly || worksInRussiaOnly || russianMadeOnly) && (
            <Button type="button" variant="ghost" onClick={resetFilters}>
              Очистить фильтры
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="size-4 text-muted-foreground" aria-hidden />
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="min-w-52">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-border/60 bg-card p-6 text-sm text-muted-foreground">
          Загружаем AI-инструменты...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <AIToolGrid tools={items} />
      )}

      {!loading && !error && totalPages > 1 && (
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

            {visiblePages.map((pageNumber, index) => {
              const previousPage = visiblePages[index - 1];
              const shouldShowEllipsis = previousPage && pageNumber - previousPage > 1;

              return (
                <Fragment key={pageNumber}>
                  {shouldShowEllipsis ? (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : null}
                  <PaginationItem>
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
                </Fragment>
              );
            })}

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
