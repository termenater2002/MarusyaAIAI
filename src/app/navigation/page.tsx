const guides = [
  {
    title: "Как пользоваться каталогом",
    description:
      "Разберитесь с карточками и деталями AI-инструментов, прежде чем переходить по внешним ссылкам.",
  },
  {
    title: "Навигация и доступ",
    description:
      "Одна кнопка в хедере ведет на эту страницу; используйте внутренние маршруты без перезагрузки.",
  },
  {
    title: "Обновления функционала",
    description:
      "Следите за новыми страницами каталога, деталями инструментов и улучшениями навигации.",
  },
];

const updates = [
  {
    title: "Каталог + детали",
    description: "Внутренние страницы инструментов и пагинация на 15 элементов.",
  },
  {
    title: "Авторизация",
    description: "Страница входа и восстановления доступа с внутренними маршрутами.",
  },
  {
    title: "Навигация",
    description: "Единая кнопка в хедере на страницу гайдов и обновлений.",
  },
];

const feedback = [
  {
    title: "Обратная связь",
    description: "Пишите на contact@ai-catalog.local с предложениями или ошибками.",
  },
  {
    title: "Обновить данные",
    description: "Сообщите, если информация об инструментах устарела или недоступна.",
  },
  {
    title: "Идеи по навигации",
    description: "Расскажите, какие разделы или подсказки вы хотите видеть на этой странице.",
  },
];

export default function NavigationPage() {
  return (
    <div className="site-container space-y-10 py-10">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Навигация и гайды
        </p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Гайды, обновления и обратная связь
        </h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Быстрые подсказки по использованию каталога, внутренние обновления и способы сообщить о проблеме или предложить улучшения.
        </p>
      </header>

      <Section title="Гайды" items={guides} />
      <Section title="Обновления" items={updates} />
      <Section title="Обратная связь" items={feedback} />
    </div>
  );
}

type SectionItem = {
  title: string;
  description: string;
};

type SectionProps = {
  title: string;
  items: SectionItem[];
};

function Section({ title, items }: SectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.title}
            className="rounded-lg border border-border/60 bg-card p-4 shadow-sm"
          >
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
