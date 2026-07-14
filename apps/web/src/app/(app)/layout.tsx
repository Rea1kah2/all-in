import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex min-w-0 flex-col">
        <AppTopbar />
        <main className="flex-1 px-5 pt-6 pb-24 md:px-8 md:pb-10">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
