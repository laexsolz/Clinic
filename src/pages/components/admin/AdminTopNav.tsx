// components/admin/AdminTopNav.tsx
import React from "react";
import { Menu, Shield, LogOut } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";

export default function AdminTopNav({ onToggle }: { onToggle: () => void }) {
  const { profile, signOut } = useAuth();

  return (
    <header className="h-12 sm:h-16 bg-white border-b border-slate-200 shadow-sm flex items-center px-2 sm:px-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggle}
          aria-label="Toggle sidebar"
          className="p-1 sm:p-2 rounded-md hover:bg-slate-100 transition"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />
          <span className="text-sm sm:text-lg font-semibold text-slate-800">
            Admin Portal Demo
          </span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <div className="text-right hidden xs:block">
          <div className="text-xs sm:text-sm font-medium text-slate-800">
            {profile?.full_name}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 capitalize">
            {profile?.role}
          </div>
        </div>

        <button
          onClick={() => signOut()}
          className="text-[11px] sm:text-sm px-2 sm:px-3 py-1 sm:py-2 bg-slate-100 rounded-md sm:rounded-lg hover:bg-slate-200 flex items-center gap-1 sm:gap-2"
        >
          <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className=" xs:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
