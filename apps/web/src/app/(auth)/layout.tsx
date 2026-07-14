import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5">
      <Link href="/" className="flex items-center gap-2.5">
        <span className="size-2 rounded-full bg-brass" />
        <span className="text-sm text-ink">Stock AI</span>
      </Link>

      <div className="mt-8 w-full max-w-sm rounded-card border border-line bg-surface p-7">
        {children}
      </div>
    </div>
  );
}
