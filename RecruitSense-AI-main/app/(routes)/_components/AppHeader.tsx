"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { useAppUser } from "@/hooks/useAppUser";
import { useRouter } from "next/navigation";
import {
  UserCheck,
  Sparkles,
  LogOut,
  ChevronDown,
  Check,
  Plus,
  Users,
  Briefcase,
  LogIn,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { MockUser } from "@/lib/authHelper";

const MenuOptions = [
  {
    name: "Dashboard",
    path: "/dashboard",
  },
];

function AppHeader() {
  const router = useRouter();
  const { user, users, isClerk, signOut, switchUser, createUser } = useAppUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newCandidateName, setNewCandidateName] = useState("");
  const [newCandidateRole, setNewCandidateRole] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setIsAddingUser(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleSwitch = (candidate: MockUser) => {
    if (candidate.id === user?.id) {
      setShowDropdown(false);
      return;
    }
    switchUser(candidate.id);
    setShowDropdown(false);
    toast.success(`Switched candidate to ${candidate.fullName}`, {
      description: `${candidate.role || candidate.title || "Candidate"} profile active.`,
    });
  };

  const handleCreateNewCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidateName.trim()) return;

    const created = createUser({
      fullName: newCandidateName.trim(),
      role: newCandidateRole.trim() || "Software Engineer Candidate",
    });

    setNewCandidateName("");
    setNewCandidateRole("");
    setIsAddingUser(false);
    setShowDropdown(false);

    toast.success(`Created candidate ${created.fullName}`, {
      description: "Profile created and set as active.",
    });
  };

  const handleSignOut = () => {
    signOut();
    setShowDropdown(false);
    toast.info("Signed out of candidate profile.");
    router.push("/sign-in");
  };

  return (
    <nav className="flex w-full items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 py-3 sticky top-0 z-50 shadow-sm font-sans">
      {/* Brand Logo */}
      <Link href="/dashboard" className="flex items-center gap-3 group">
        <Image
          src="/logo.svg"
          alt="PrepAI Logo"
          width={38}
          height={38}
          className="rounded-xl transition-transform group-hover:scale-105 shadow-sm"
        />
        <div className="flex flex-col">
          <span className="text-lg font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
            PrepAI
          </span>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">
            AI Interview Intelligence
          </span>
        </div>
      </Link>

      {/* Nav Actions */}
      <div className="flex items-center gap-5">
        <ul className="flex items-center gap-2">
          {MenuOptions.map((option, index) => (
            <li key={index}>
              <Link
                href={option.path}
                className="text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors py-1.5 px-3 rounded-lg"
              >
                {option.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* User / Candidate Switcher */}
        {isClerk ? (
          <div className="flex items-center gap-3">
            <UserButton />
          </div>
        ) : user ? (
          <div className="relative" ref={dropdownRef}>
            {/* Active Candidate Trigger Button */}
            <button
              onClick={() => {
                setShowDropdown(!showDropdown);
                setIsAddingUser(false);
              }}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 transition-all text-xs font-semibold text-indigo-950 shadow-sm hover:shadow"
              title="Click to switch candidate profile"
            >
              {user.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={user.fullName || "Candidate"}
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-indigo-400"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {user.fullName?.charAt(0) || "C"}
                </div>
              )}
              <div className="flex flex-col text-left leading-tight">
                <span className="max-w-[120px] sm:max-w-[140px] truncate text-slate-900 font-bold text-xs">
                  {user.fullName || "Candidate"}
                </span>
                {(user as any)?.role && (
                  <span className="max-w-[110px] truncate text-[9px] text-indigo-600 font-medium">
                    {(user as any).role}
                  </span>
                )}
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3.5 z-50 space-y-3 font-sans animate-in fade-in slide-in-from-top-2">
                {/* Active User Card */}
                <div className="p-3 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 rounded-xl border border-indigo-100 flex items-center gap-3">
                  {user.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt={user.fullName || "Candidate"}
                      width={42}
                      height={42}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500 shadow-sm"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                      {user.fullName?.charAt(0) || "C"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-extrabold text-slate-900 truncate">
                        {user.fullName || "Candidate"}
                      </p>
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded-full">
                        <UserCheck className="w-2.5 h-2.5" /> Active
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-700 font-medium truncate mt-0.5">
                      {(user as any)?.role || (user as any)?.title || "Mock Candidate"}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {user.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </div>

                {/* Candidate Switcher Header */}
                <div className="flex items-center justify-between px-1 pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Switch Candidate</span>
                  </div>
                  <button
                    onClick={() => setIsAddingUser(!isAddingUser)}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                  >
                    {isAddingUser ? (
                      <>
                        <X className="w-3 h-3" /> Cancel
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" /> New Profile
                      </>
                    )}
                  </button>
                </div>

                {/* Inline Add User Form */}
                {isAddingUser && (
                  <form
                    onSubmit={handleCreateNewCandidate}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-in fade-in"
                  >
                    <p className="text-[11px] font-bold text-slate-800">Create New Candidate</p>
                    <input
                      type="text"
                      placeholder="Candidate Full Name (e.g. Alex Rivera)"
                      value={newCandidateName}
                      onChange={(e) => setNewCandidateName(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      required
                      autoFocus
                    />
                    <input
                      type="text"
                      placeholder="Target Role (e.g. Senior Frontend Engineer)"
                      value={newCandidateRole}
                      onChange={(e) => setNewCandidateRole(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                    >
                      Save & Switch
                    </button>
                  </form>
                )}

                {/* Candidate Profiles List */}
                <div className="max-h-52 overflow-y-auto space-y-1 pr-0.5">
                  {users.map((c) => {
                    const isActive = c.id === user.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleSwitch(c)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                          isActive
                            ? "bg-indigo-50 border border-indigo-200 text-indigo-950 font-semibold"
                            : "hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {c.imageUrl ? (
                            <Image
                              src={c.imageUrl}
                              alt={c.fullName}
                              width={28}
                              height={28}
                              className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {c.fullName?.charAt(0) || "U"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate leading-tight">
                              {c.fullName}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">
                              {c.role || c.title || "Candidate"}
                            </p>
                          </div>
                        </div>

                        {isActive ? (
                          <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Check className="w-3 h-3" />
                          </div>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400 group-hover:text-indigo-600">
                            Switch
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 pt-2 space-y-1">
                  <Link
                    href="/dashboard"
                    onClick={() => setShowDropdown(false)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>My Interview Analytics</span>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out / Change Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/sign-in"
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition-all"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Select Candidate / Sign In</span>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default AppHeader;

