"use client";

import Link from "next/link";
import { ConnectKitButton } from "connectkit";
import { useState } from "react";

const navLinks = [
  { href: "/mint", label: "Mint" },
  { href: "/arena", label: "Arena" },
  { href: "/profile", label: "Profile" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#F8FAFC]/10 bg-[#000000]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <span className="font-['Orbitron'] text-2xl font-bold tracking-widest uppercase">
            <span className="text-[#FFFFFF]" style={{ textShadow: "0 0 10px rgba(255,255,255,0.3)" }}>Agent</span>{" "}
            <span className="text-[#FFFFFF]" style={{ textShadow: "0 0 10px rgba(255,255,255,0.3)" }}>Royale</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="cursor-pointer text-sm font-semibold uppercase tracking-wider text-[#F8FAFC]/60 transition-colors duration-200 hover:text-[#FFFFFF] focus:outline-none focus:text-[#FFFFFF]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <ConnectKitButton />
          </div>

          <button
            type="button"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-[#F8FAFC]/20 text-[#F8FAFC]/60 transition-all duration-200 hover:border-[#FFFFFF] hover:text-[#FFFFFF] focus:outline-none focus:border-[#FFFFFF] md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#F8FAFC]/10 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="cursor-pointer text-sm font-semibold uppercase tracking-wider text-[#F8FAFC]/60 transition-colors duration-200 hover:text-[#FFFFFF]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4">
            <ConnectKitButton />
          </div>
        </div>
      )}
    </header>
  );
}
