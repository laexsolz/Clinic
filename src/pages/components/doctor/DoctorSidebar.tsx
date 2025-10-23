// components/Doctor/DoctorSidebar.tsx
import React from 'react';
import {
  Home,
  CalendarCheck,
  User,
  Users,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  X,
  Activity,
  FileText,
  ClipboardList,
} from 'lucide-react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { DoctorView } from './DoctorLayout';


const desktopVariants: Variants = {
  open: { width: 256, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
  closed: { width: 64, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
};

const mobileVariants: Variants = {
  open: { x: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
  closed: { x: '-100%', transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
};

function NavItem({
  icon,
  label,
  active,
  collapsed,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        type="button"
        className={`w-full flex items-center gap-3 text-sm px-3 py-2 rounded-lg transition-colors hover:bg-slate-100 ${active ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' : 'text-slate-700'
          }`}
      >
        <span className="w-5 h-5">{icon}</span>
        {!collapsed && <span className={`truncate ${active ? 'font-medium' : 'font-normal'}`}>{label}</span>}
      </button>

      {collapsed && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block z-50">
          <div className="bg-white border border-slate-200 shadow-md px-3 py-1 rounded-lg text-sm whitespace-nowrap">
            {label}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DoctorSidebar({
  // desktop open (true -> expanded width; false -> collapsed icons)
  isOpen,
  // mobile drawer open (overlay)
  mobileOpen,
  activeView,
  onChangeView,
  onClose,
  onToggleCollapse,
  collapsed,
}: {
  isOpen: boolean;
  mobileOpen: boolean;
  activeView: DoctorView;
  onChangeView: (v: DoctorView) => void;
  onClose: () => void;
  onToggleCollapse: () => void;
  collapsed: boolean;
}) {
  const handleNav = (v: DoctorView) => {
    onChangeView(v);
    if (mobileOpen) onClose();
  };

  return (
    <>
      {/* MOBILE: overlay drawer rendered only when mobileOpen is true */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop: unmounts on exit so it won't block clicks */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onClose()}
              style={{ pointerEvents: mobileOpen ? 'auto' : 'none' }}
            />

            {/* Drawer */}
            <motion.nav
              key="mobile-drawer"
              className="fixed inset-y-0 left-0 z-50 bg-white w-72 shadow-lg border-r border-slate-200 p-4"
              initial="closed"
              animate="open"
              exit="closed"
              variants={mobileVariants}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg text-white">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Doctor Portal</h3>
                </div>

                <button
                  onClick={() => onClose()}
                  className="p-2 rounded-md hover:bg-slate-100 transition"
                  aria-label="Close menu"
                  type="button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-2" aria-label="Mobile Doctor navigation">
                <NavItem icon={<CalendarCheck className="w-5 h-5" />} label="Appointments" active={activeView === 'Appointments'} onClick={() => handleNav('Appointments')} />
                <NavItem icon={<User className="w-5 h-5" />} label="Patients History" active={activeView === 'Patients History'} onClick={() => handleNav('Patients History')} />
                <NavItem icon={<CreditCard className="w-5 h-5" />} label="Prescription" active={activeView === 'Prescription'} onClick={() => handleNav('Prescription')} />
              </nav>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP: collapsible sidebar (pushes layout) */}
      <motion.aside
        className="hidden md:flex bg-white border-r border-slate-200 flex-col px-3 py-4 overflow-visible"
        animate={isOpen ? 'open' : 'closed'}
        initial={false}
        variants={desktopVariants}
        style={{ minWidth: 64 }}
      >
        <div className="flex items-center -ml-1 gap-3 px-2 mb-4">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg text-white">
            <Activity className="w-5 h-5" />
          </div>
          {!collapsed && <h3 className="text-base font-bold text-slate-800">Doctor Portal</h3>}
        </div>

        <nav className="flex-1 space-y-1" aria-label="Desktop Doctor navigation">
          <NavItem
            icon={<CalendarCheck className="w-5 h-5" />}
            label="Appointments"
            active={activeView === 'Appointments'}
            collapsed={collapsed}
            onClick={() => handleNav('Appointments')}
          />
          <NavItem
            icon={<FileText className="w-5 h-5" />}
            label="Patients History"
            active={activeView === 'Patients History'}
            collapsed={collapsed}
            onClick={() => handleNav('Patients History')}
          />
          <NavItem
            icon={<ClipboardList  className="w-5 h-5" />}
            label="Prescription"
            active={activeView === 'Prescription'}
            collapsed={collapsed}
            onClick={() => handleNav('Prescription')}
          />
        </nav>


        {/* Footer: collapse toggle pinned to bottom */}
        <div className="mt-auto px-2 py-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="sr-only">Sidebar state</span>
            <button
              onClick={() => onToggleCollapse()}
              className=" rounded-full hover:bg-slate-100 transition"
              type="button"
              aria-label="Toggle sidebar"
            >
              {collapsed ? <ChevronRight className="w-5 h-5 text-slate-600" /> : <ChevronLeft className="w-5 h-5 text-slate-600" />}
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
