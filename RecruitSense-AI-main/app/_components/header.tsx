"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAppUser } from "@/hooks/useAppUser";
import { ArrowRight, LayoutDashboard } from "lucide-react";

const Header = () => {
  const { isSignedIn, user } = useAppUser();

  return (
    <nav className="flex w-full items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-3.5 sticky top-0 z-50 shadow-sm font-sans">
      <Link href="/" className="flex items-center gap-3 group">
        <Image
          src="/logo.svg"
          alt="PrepAI Logo"
          width={40}
          height={40}
          className="rounded-xl transition-transform group-hover:scale-105"
        />
        <div className="flex flex-col">
          <span className="text-lg font-extrabold text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
            PrepAI
          </span>
          <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-widest mt-0.5">
            AI Interview Intelligence
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs py-2 px-3.5 rounded-xl hidden sm:flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" />
            <span>Dashboard</span>
          </Button>
        </Link>

        <Link href={isSignedIn ? "/dashboard" : "/sign-in"}>
          <Button className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-sm transition-all hover:shadow-md">
            <span>{isSignedIn ? `Continue as ${user?.firstName || "Candidate"}` : "Sign In"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default Header;