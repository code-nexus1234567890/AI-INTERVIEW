"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <nav className="flex w-full items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-3.5 sticky top-0 z-50 shadow-sm">
      <Link href="/" className="flex items-center gap-3 group">
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

      <Link href="/sign-in">
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-sm">
          Sign In
        </Button>
      </Link>
    </nav>
  );
};

export default Header;