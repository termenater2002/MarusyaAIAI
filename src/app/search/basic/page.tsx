import type { Metadata } from "next";

import { BasicSearchClient } from "./basic-search-client";

export const metadata: Metadata = {
  title: "Поиск | AI Каталог",
  description: "Обычный поиск по каталогу инструментов",
};

export default function BasicSearchPage() {
  return <BasicSearchClient />;
}
