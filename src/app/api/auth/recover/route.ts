import { NextResponse } from "next/server";

const RECOVERY_DELAY_MS = 800;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (typeof email !== "string" || email.trim().length === 0) {
      return NextResponse.json({ message: "Укажите email" }, { status: 400 });
    }

    await new Promise((resolve) => setTimeout(resolve, RECOVERY_DELAY_MS));

    return NextResponse.json(
      {
        message: "Если аккаунт найден, мы отправили инструкции по восстановлению",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("api/auth/recover", error);
    return NextResponse.json(
      { message: "Не удалось отправить письмо. Повторите попытку позже" },
      { status: 500 }
    );
  }
}
