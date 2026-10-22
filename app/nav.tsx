"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/form", label: "Form" },
  { href: "/result", label: "Result" },
  { href: "/admin", label: "Master Data" },
];

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="rounded-md p-2 text-slate-700 hover:bg-slate-100 sm:hidden"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      <nav className={`${open ? "flex" : "hidden"} w-full flex-col gap-1 sm:flex sm:w-auto sm:flex-row sm:gap-2`}>
        {items.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            onClick={() => setOpen(false)}
            className={`rounded-md px-4 py-2 text-base font-medium ${
              path.startsWith(i.href) ? "bg-toyota text-white" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {i.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
