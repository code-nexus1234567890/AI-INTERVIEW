"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

const MenuOptions = [
  {
    name: "Dashboard",
    path: "/dashboard",
  },
];

function AppHeader() {
  return (
    <nav className="flex w-full items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-3.5 sticky top-0 z-50 shadow-sm">
      <Link href="/dashboard" className="flex items-center gap-3 group">
        <img src="/logo.svg" alt="PrepAI Logo" width={40} height={40} className="rounded-xl transition-transform group-hover:scale-105" />
        <div className="flex flex-col">
          <span className="text-lg font-extrabold text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
            PrepAI
          </span>
          <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-widest mt-0.5">
            AI Interview Intelligence
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-6">
        <ul className="flex gap-4">
          {MenuOptions.map((option, index) => (
            <li key={index}>
              <Link
                href={option.path}
                className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors py-1 px-3 rounded-lg hover:bg-slate-100"
              >
                {option.name}
              </Link>
            </li>
          ))}
        </ul>

        <UserButton />
      </div>
    </nav>
  );
}

export default AppHeader;
