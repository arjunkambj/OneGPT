import type React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex h-dvh items-center justify-center bg-background p-6">
      {children}
    </div>
  );
}
