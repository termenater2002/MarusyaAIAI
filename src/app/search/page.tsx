import type { Metadata } from "next";

import { SmartSearchClient } from "./smart-search-client";

export const metadata: Metadata = {
  title: "Умный поиск | AI Каталог",
  description: "Подбор инструментов по свободному запросу пользователя",
};

export default function SmartSearchPage() {
  return <SmartSearchClient />;
}
