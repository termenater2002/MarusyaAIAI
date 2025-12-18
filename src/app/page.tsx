import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="site-container flex flex-col gap-12 py-10">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          AI Каталог
        </p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Подборка AI-инструментов с понятными шагами доступа.
        </h1>
        <p className="max-w-3xl text-lg text-muted-foreground">
          Сохраняем прозрачность: отмечаем требования по VPN, оплате и языку интерфейса. Хедер и футер уже адаптированы под мобильные устройства.
        </p>
      </header>

      <section
        id="catalog"
        aria-labelledby="catalog-heading"
        className="grid gap-6 sm:grid-cols-2"
      >
        <Card>
          <CardHeader>
            <CardTitle id="catalog-heading">Каталог инструментов</CardTitle>
            <CardDescription>
              Список AI-сервисов с фильтрацией по типу задачи и условиям использования.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Отслеживаем требования к VPN, способам оплаты и доступности русского языка. Раздел обновляется ежедневно.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Обновления коллекции</CardTitle>
            <CardDescription>
              Сохраняем прозрачность: отмечаем появление новых AI-агентов и статус верификации ссылок.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Проверяйте кликабельность на ширине 320 px: элементы остаются в зоне видимости без горизонтального скролла.
          </CardContent>
        </Card>
      </section>

      <section
        id="guides"
        aria-labelledby="guides-heading"
        className="space-y-6"
      >
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Пошаговые инструкции
          </p>
          <h2 id="guides-heading" className="text-2xl font-semibold">
            Как начать работу с AI-инструментами
          </h2>
          <p className="max-w-2xl text-base text-muted-foreground">
            Выбирайте инструкцию по потребности: регистрация, подключение оплаты, настройка VPN или локальных аналогов.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Регистрация с ограничениями</CardTitle>
              <CardDescription>
                Подробно разбираем требования платформ и предлагаем обходные варианты для РФ.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Чек-листы по подтверждению личности, банковским картам и настройке безопасности. Размечаем каждый шаг уровнем риска.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Локальные альтернативы</CardTitle>
              <CardDescription>
                Когда зарубежный сервис недоступен, подскажем сопоставимые решения на русском рынке.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Собираем сравнение по ключевым параметрам: цена, язык, интеграции, поддержка API.
            </CardContent>
          </Card>
        </div>
      </section>

      <section
        id="updates"
        aria-labelledby="updates-heading"
        className="space-y-4"
      >
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Новое за неделю
          </p>
          <h2 id="updates-heading" className="text-2xl font-semibold">
            Обновления каталога и статусы проверок
          </h2>
        </div>

        <ul className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
          <li className="rounded-lg border border-border/60 bg-card/50 p-4">
            <h3 className="text-base font-semibold text-foreground">+5 AI-редакторов для видео</h3>
            <p className="mt-2">
              Добавили сервисы с поддержкой автоматического перевода субтитров и поддержкой VPN-friendly тарифов.
            </p>
          </li>
          <li className="rounded-lg border border-border/60 bg-card/50 p-4">
            <h3 className="text-base font-semibold text-foreground">Проверка ссылок завершена на 80%</h3>
            <p className="mt-2">
              Неактивные ссылки помечаем как «Не указано», чтобы избежать битых переходов.
            </p>
          </li>
          <li className="rounded-lg border border-border/60 bg-card/50 p-4">
            <h3 className="text-base font-semibold text-foreground">Обновили FAQ по оплате</h3>
            <p className="mt-2">
              Добавлены инструкции для карт «Мир» и денежных переводов через партнёров.
            </p>
          </li>
          <li className="rounded-lg border border-border/60 bg-card/50 p-4">
            <h3 className="text-base font-semibold text-foreground">Расширили фильтры каталога</h3>
            <p className="mt-2">
              Теперь можно скрывать инструменты без русскоязычного интерфейса одним кликом.
            </p>
          </li>
        </ul>
      </section>

      <section
        id="feedback"
        aria-labelledby="feedback-heading"
        className="space-y-6 rounded-xl border border-border/60 bg-card/50 p-6"
      >
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Обратная связь
          </p>
          <h2 id="feedback-heading" className="text-2xl font-semibold">
            Помогите сделать каталог полезнее
          </h2>
          <p className="max-w-2xl text-base text-muted-foreground">
            Сообщите о неактуальной информации или предложите новый инструмент. Мы оперативно обновим карточки и инструкции.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="mailto:contact@ai-catalog.local?subject=AI%20Каталог:%20предложение"
            className="inline-flex items-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            Написать на почту
          </Link>
          <Link
            href="#catalog"
            className="inline-flex items-center rounded-md border border-border px-5 py-2 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            Вернуться к каталогу
          </Link>
        </div>
      </section>
    </div>
  );
}
