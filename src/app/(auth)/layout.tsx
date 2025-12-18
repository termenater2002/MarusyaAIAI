import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="auth-shell flex w-full justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="auth-card w-full max-w-md space-y-8">
        {children}
      </div>
    </div>
  );
}
