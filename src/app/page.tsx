import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="site-container flex flex-col gap-10 py-10">
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

      <section className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Навигация</CardTitle>
            <CardDescription>
              Логотип ведет на главную, кнопки «Войти» и «Избранное» всегда доступны.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Проверяйте кликабельность на ширине 320 px: элементы остаются в зоне видимости без горизонтального скролла.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Тема и футер</CardTitle>
            <CardDescription>
              Переключатель «Светлая/Тёмная» меняет оформление на всей странице.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Ссылки на соцсети и контакты показывают статус «Не указано» или «Не проверено», чтобы не скрывать отсутствующие данные.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
