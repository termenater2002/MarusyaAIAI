import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Правила обработки пользовательских данных | AI Каталог",
  description: "Формальные правила обработки пользовательских данных и использования сервиса.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="site-container space-y-8 py-10">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Документ
        </p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Правила обработки пользовательских данных
        </h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Настоящий документ определяет общий порядок сбора, хранения, использования
          и организационной защиты сведений, передаваемых пользователями при
          использовании сайта-каталога.
        </p>
      </header>

      <div className="space-y-6">
        <section className="space-y-3 rounded-lg border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">1. Общие положения</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Используя настоящий сайт, пользователь подтверждает согласие с тем,
            что отдельные сведения технического и регистрационного характера могут
            обрабатываться в объеме, необходимом для предоставления функциональности
            сервиса, повышения стабильности его работы и обеспечения базовой
            информационной безопасности.
          </p>
        </section>

        <section className="space-y-3 rounded-lg border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">2. Состав обрабатываемых данных</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            В рамках использования сервиса могут обрабатываться адрес электронной
            почты, сведения об авторизации, технические идентификаторы сессии,
            IP-адрес, пользовательский агент браузера, а также иные сведения,
            непосредственно предоставленные пользователем при взаимодействии с
            интерфейсом сайта.
          </p>
        </section>

        <section className="space-y-3 rounded-lg border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">3. Цели обработки</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Обработка данных осуществляется исключительно в целях предоставления
            доступа к функциональности сайта, управления учетной записью,
            сохранения пользовательских предпочтений, улучшения качества сервиса,
            формирования аналитических и технических отчетов, а также исполнения
            требований применимого законодательства.
          </p>
        </section>

        <section className="space-y-3 rounded-lg border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">4. Условия хранения и защиты</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Администрация сервиса принимает разумные организационные и технические
            меры для предотвращения несанкционированного доступа, изменения,
            раскрытия или уничтожения обрабатываемых данных. Срок хранения данных
            определяется целями их обработки, технической необходимостью и
            внутренними регламентами сопровождения сервиса.
          </p>
        </section>

        <section className="space-y-3 rounded-lg border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">5. Заключительные положения</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Администрация сервиса оставляет за собой право вносить изменения в
            настоящий документ без предварительного индивидуального уведомления.
            Актуальная редакция размещается на данной странице и вступает в силу с
            момента публикации, если иное прямо не указано в тексте обновления.
          </p>
        </section>
      </div>
    </div>
  );
}
