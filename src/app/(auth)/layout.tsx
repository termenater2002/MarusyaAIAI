import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Войти | AI Каталог",
  description: "Страница авторизации и восстановления доступа",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="site-container py-12">
      <div className="mx-auto max-w-xl">{children}</div>
    </div>
  );
}
