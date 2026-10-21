"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { useAppUser } from "@/hooks/useAppUser";
import { UserCheck, Sparkles, LogOut } from "lucide-react";

const MenuOptions = [
  {
    name: "Dashboard",
    path: "/dashboard",
  },
];

function AppHeader() {
  const { user, isClerk, signOut } = useAppUser();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="flex w-full items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-3.5 sticky top-0 z-50 shadow-sm">
      <Link href="/dashboard" className="flex items-center gap-3 group">
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

        {isClerk ? (
          <UserButton />
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 transition-colors text-xs font-semibold text-indigo-900 shadow-sm"
              title="Candidate Profile"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                {user?.fullName?.charAt(0) || "A"}
              </div>
              <span className="max-w-[120px] truncate">{user?.fullName || "Candidate"}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 space-y-2 font-sans animate-in fade-in slide-in-from-top-2">
                <div className="px-2 py-1.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <UserCheck className="w-3 h-3" /> Candidate Active
                  </span>
                </div>

                <Link
                  href="/dashboard"
                  onClick={() => setShowDropdown(false)}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>My Interviews</span>
                </Link>

                <button
                  onClick={() => {
                    setShowDropdown(false);
                    signOut();
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Reset / Switch Candidate</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default AppHeader;
