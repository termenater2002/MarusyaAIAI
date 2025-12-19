const guides = [
  {
    title: "Как пользоваться каталогом",
    description:
      "Шаги для поиска и выбора AI-инструментов, переход к деталям и внешним ссылкам.",
  },
  {
    title: "Советы по доступу из РФ",
    description:
      "VPN, способы оплаты и заметки по доступности сервисов, чтобы избежать блокировок.",
  },
  {
    title: "Как предлагать обновления",
    description:
      "Расскажите, если данные устарели или появилось новое поведение инструмента.",
  },
];

const updates = [
  {
    title: "Новая авторизация",
    description: "Добавили страницу входа и восстановления доступа.",
  },
  {
    title: "Детали инструментов",
    description: "Внутренние страницы AI-инструментов и пагинация каталога.",
  },
  {
    title: "Навигация",
    description: "Планируем интерактивный navbar и мобильный бургер-меню.",
  },
];

const feedbackChannels = [
  {
    title: "Обратная связь",
    description: "Пишите на contact@ai-catalog.local с замечаниями и предложениями.",
  },
  {
    title: "Сообщить об ошибке",
    description: "Опишите шаги воспроизведения и скриншот, если есть.",
  },
  {
    title: "Идеи по навигации",
    description: "Расскажите, какие разделы хотите видеть в шапке или бургер-меню.",
  },
];

export default function GuidesPage() {
  return (
    <div className="site-container space-y-10 py-10">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Гайды и обновления
        </p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Как мы развиваем AI Каталог
        </h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Здесь собрали подсказки по использованию, свежие обновления и каналы обратной связи. Делитесь идеями, чтобы навигация и каталог были полезнее.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Гайды</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <article
              key={guide.title}
              className="rounded-lg border border-border/60 bg-card p-4 shadow-sm"
            >
              <h3 className="text-lg font-semibold">{guide.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {guide.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Обновления</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {updates.map((update) => (
            <article
              key={update.title}
              className="rounded-lg border border-border/60 bg-card p-4 shadow-sm"
            >
              <h3 className="text-lg font-semibold">{update.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {update.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Обратная связь</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {feedbackChannels.map((item) => (
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
    </div>
  );
}
