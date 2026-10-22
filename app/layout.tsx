import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import { Nav } from "./nav";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Die Maintenance Abnormal Finding",
  description: "Pencatatan temuan abnormal die - TMMIN Casting Division",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={geist.variable}>
      <body className="min-h-screen">
        <header className="border-t-[14px] border-b-[14px] border-toyota bg-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
            <div className="flex items-center gap-4">
              <Image src="/logo.png" alt="Toyota" width={2878} height={820} priority className="h-12 w-auto" />
              <div className="leading-tight">
                <div className="text-[11px] uppercase tracking-wide text-slate-500">Sistem Informasi</div>
                <div className="text-sm font-bold">Die Maintenance Abnormal Finding</div>
              </div>
            </div>
            <Nav />
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
