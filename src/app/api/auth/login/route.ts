import { NextResponse } from "next/server";

const DEMO_EMAIL = "demo@ai-catalog.local";
const DEMO_PASSWORD = "DemoPass123!";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ message: "Некорректные данные" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === DEMO_EMAIL && password === DEMO_PASSWORD) {
      return NextResponse.json(
        {
          redirectTo: "/dashboard",
          message: "Авторизация выполнена",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Неверные учетные данные" },
      { status: 401 }
    );
  } catch (error) {
    console.error("api/auth/login", error);
    return NextResponse.json(
      { message: "Не удалось выполнить вход. Повторите попытку позже" },
      { status: 500 }
    );
  }
}
