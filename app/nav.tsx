"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/form", label: "Form" },
  { href: "/result", label: "Result" },
  { href: "/admin", label: "Master Data" },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 sm:gap-2">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className={`rounded-md px-3 py-2 text-sm font-medium sm:px-4 sm:text-base ${
            path.startsWith(i.href) ? "bg-toyota text-white" : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
