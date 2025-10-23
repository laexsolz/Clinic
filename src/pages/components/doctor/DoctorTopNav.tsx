// components/Doctor/DoctorTopNav.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Menu,
  LogOut,
  MessageCircleQuestion,
  X,
  Stethoscope,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { AnimatePresence, motion, Variants } from "framer-motion";

export default function DoctorTopNav({ onToggle }: { onToggle: () => void }) {
  const { profile, signOut } = useAuth();
  const [helpOpen, setHelpOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  // prevent background scroll while modal is open
  useEffect(() => {
    if (helpOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => closeBtnRef.current?.focus(), 80);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [helpOpen]);

  // NOTE:
  // framer-motion has sometimes-strict types for `transition.ease`.
  // We'll keep the nice custom bezier curve but cast `ease` to `any`
  // so TypeScript won't complain while runtime behavior remains unchanged.
  const panelVariants: Variants = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as any },
    },
    exit: {
      opacity: 0,
      y: -8,
      scale: 0.99,
      transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as any },
    },
  };

  return (
    <>
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
            <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />
            <span className="text-sm sm:text-lg font-semibold text-slate-800">
              Doctor Portal Demo
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

          {/* Help / Info button (question mark) */}
          <button
            onClick={() => setHelpOpen(true)}
            aria-label="About this demo"
            className="text-[11px] sm:text-sm px-2 sm:px-3 py-1 sm:py-2 bg-slate-100 rounded-md sm:rounded-lg hover:bg-slate-200 flex items-center gap-1 sm:gap-2"
            title="About this demo"
          >
            <MessageCircleQuestion className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline text-[11px] sm:text-sm">About</span>
          </button>

          <button
            onClick={() => signOut()}
            className="text-[11px] sm:text-sm px-2 sm:px-3 py-1 sm:py-2 bg-slate-100 rounded-md sm:rounded-lg hover:bg-slate-200 flex items-center gap-1 sm:gap-2"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className=" xs:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Modal */}
      <AnimatePresence>
        {helpOpen && (
          <motion.div
            key="help-backdrop"
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.18 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            aria-hidden={!helpOpen}
          >
            {/* backdrop */}
            <div
              onClick={() => setHelpOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* modal panel */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="About this demo application"
              className="
          relative z-10
          w-full max-w-full sm:max-w-2xl
          mx-auto
          rounded-2xl bg-white shadow-2xl border border-slate-100
          p-4 sm:p-8
          my-6 sm:my-0
          max-h-[90vh] overflow-y-auto
        "
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <MessageCircleQuestion className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                      About this demo application
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Overview and purpose of the clinic demo — quick read.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <button
                    ref={closeBtnRef}
                    onClick={() => setHelpOpen(false)}
                    aria-label="Close about dialog"
                    className="rounded-md p-2 hover:bg-slate-100 transition"
                  >
                    <X className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* body content: structured for readability */}
              <div className="mt-6 text-slate-700">
                <section className="mb-5">
                  <h4 className="text-sm font-semibold text-slate-900">What this demo does</h4>
                  <p className="mt-2 text-sm text-slate-600">
                    A <b>customizable</b> clinic demo that demonstrates typical daily workflows:
                  </p>
                  <ul className="mt-3 ml-5 list-disc text-sm text-slate-600 space-y-1">
                    <li>Manage appointments and schedules</li>
                    <li>View and edit patient & doctor records</li>
                    <li>Create and preview invoices</li>
                    <li>Simple dashboards and insights for quick monitoring</li>
                  </ul>
                </section>

                <section className="mb-5">
                  <h4 className="text-sm font-semibold text-slate-900">Demo vs. production</h4>
                  <p className="mt-2 text-sm text-slate-600">
                    This demo uses static/sample data to showcase UI and flows, <strong>but it is
                      built as a full-stack capable app - made with React</strong>. It can be integrated with cloud databases
                    and backends (for example, Supabase or Firebase) to become a production-ready system.
                  </p>
                </section>

                <section className="mb-5">
                  <h4 className="text-sm font-semibold text-slate-900">Key implementation notes</h4>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
                    <div>
                      <p className="font-medium text-slate-800 mb-1">Authentication</p>
                      <p className="text-xs">Local demo auth is used for convenience. In production, replace with secure auth (JWTs, OAuth, or Supabase auth).</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 mb-1">Data</p>
                      <p className="text-xs">Currently static/sample data — swap in API endpoints or a cloud DB for dynamic content and persistence.</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 mb-1">Authorization</p>
                      <p className="text-xs">Roles (admin / doctor / patient) are demonstrated; enforce role checks server-side when integrating real backends.</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 mb-1">Extensibility</p>
                      <p className="text-xs">Designed so components can be wired to REST/GraphQL endpoints or Supabase tables with minimal changes.</p>
                    </div>
                  </div>
                </section>

                <section className="mb-5">
                  <h4 className="text-sm font-semibold text-slate-900">Recommended Next Steps</h4>
                  <ol className="mt-3 ml-5 list-decimal text-sm text-slate-600 space-y-1">
                    <li>
                      Integrate a cloud database (Supabase / Firebase / custom API) for real data persistence.

                    </li>
                    <li>
                      Add server-side authorization, secure sessions, and input validation —
                      <span className="text-slate-500"> implemented but hidden for demo simplicity.</span>
                    </li>
                    <li>
                      Implement password reset, email verification, and user management —
                      <span className="text-slate-500"> already built but not displayed.</span>
                    </li>
                    <li>
                      Include detailed analytics and reporting for deeper insights.
                    </li>
                  </ol>
                </section>

                <section>
                  <h4 className="text-sm font-semibold text-slate-900">Want Help?</h4>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    Most functionality is already in place. Need a production-ready, secure, and fast version?
                    Reach out and share your vision — I can help turn this demo into a full-scale, cloud-integrated app.
                  </p>
                </section>


              </div>

              {/* footer */}
              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                <button
                  onClick={() => setHelpOpen(false)}
                  className="w-full sm:w-auto px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-sm font-medium"
                >
                  Close
                </button>


              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
