"use client";

import { useTransition } from "react";
import { Download, Printer } from "lucide-react";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

import { Button } from "@/components/ui/button";

type ToolExportActionsProps = {
  tool: {
    id: number;
    name: string;
    entityType: string;
    url: string;
    description: string | null;
    longDescription: string | null;
    editorialRating: number | null;
  };
  tags: string[];
  features: string[];
  ratingSummary: {
    averageUserRating: number | null;
    userRatingCount: number;
  };
};

function formatScore(value: number | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toFixed(1);
  }

  return "—";
}

function buildPdfLines({
  tool,
  tags,
  features,
  ratingSummary,
}: ToolExportActionsProps) {
  return [
    `Инструмент: ${tool.name}`,
    `Тип: ${tool.entityType}`,
    `Сайт: ${tool.url}`,
    `Редакционная оценка: ${formatScore(tool.editorialRating)}`,
    `Средняя пользовательская оценка: ${formatScore(ratingSummary.averageUserRating)}`,
    `Количество пользовательских оценок: ${ratingSummary.userRatingCount}`,
    "",
    "Краткое описание:",
    tool.description || "Описание недоступно.",
    "",
    "Подробное описание:",
    tool.longDescription || "Дополнительное описание отсутствует.",
    "",
    "Теги:",
    tags.length > 0 ? tags.join(", ") : "Теги не указаны.",
    "",
    "Ключевые фичи:",
    features.length > 0 ? features.map((feature, index) => `${index + 1}. ${feature}`).join("\n") : "Фичи не указаны.",
  ];
}

type PdfMakeWithVfs = typeof pdfMake & {
  vfs?: Record<string, string>;
};

const pdfMakeWithVfs = pdfMake as PdfMakeWithVfs;
const pdfFontsWithVfs = pdfFonts as { pdfMake?: { vfs?: Record<string, string> }; vfs?: Record<string, string> };

pdfMakeWithVfs.vfs = pdfFontsWithVfs?.pdfMake?.vfs ?? pdfFontsWithVfs?.vfs ?? {};

export function ToolExportActions(props: ToolExportActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    startTransition(() => {
      const lines = buildPdfLines(props);
      const content = lines.flatMap((block) =>
        block === ""
          ? [{ text: " ", margin: [0, 2, 0, 2] }]
          : [{ text: block, margin: [0, 0, 0, 8] }],
      );

      const safeName = props.tool.name
        .toLowerCase()
        .replace(/[^a-z0-9а-яё]+/gi, "-")
        .replace(/^-+|-+$/g, "");

      pdfMakeWithVfs.createPdf({
        pageSize: "A4",
        pageMargins: [40, 48, 40, 48],
        content: [
          {
            text: props.tool.name,
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 18],
          },
          ...content,
        ],
        defaultStyle: {
          font: "Roboto",
          fontSize: 11,
        },
      }).download(`${safeName || `tool-${props.tool.id}`}.pdf`);
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5 text-xs text-muted-foreground">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
        onClick={handleDownloadPdf}
        disabled={isPending}
      >
        <Download className="size-3.5" aria-hidden />
        Скачать PDF
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
        onClick={handlePrint}
        disabled={isPending}
      >
        <Printer className="size-3.5" aria-hidden />
        Печать
      </Button>
    </div>
  );
}
