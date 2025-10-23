// components/Doctor/DoctorLayout.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import DoctorTopNav from './DoctorTopNav';
import DoctorSidebar from './DoctorSidebar';

export type DoctorView =
  | 'Appointments'
  | 'Patients History'
  | 'Prescription'


const contentVariants: Variants = {
  expanded: { marginLeft: 2, transition: { duration: 0.24 } },
  collapsed: { marginLeft: 8, transition: { duration: 0.2 } },
  mobile: { marginLeft: 0, transition: { duration: 0.2 } },
};

type Props = {
  children?: React.ReactNode;
  initialView?: DoctorView;
  // optional controlled props:
  view?: DoctorView;
  onViewChange?: (v: DoctorView) => void;
};

export default function DoctorLayout({ children, initialView = 'Appointments', view: controlledView, onViewChange }: Props) {
  // mobile drawer open state
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  // desktop collapsed state (icons-only)
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // internal view state (used only if parent doesn't control view)
  const [internalView, setInternalView] = useState<DoctorView>(initialView);

  // viewport mobile detection
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setMobileOpen(false);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Escape closes mobile
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // TopNav toggle behaviour
  const handleTopNavToggle = () => {
    if (isMobile) setMobileOpen((s) => !s);
    else setCollapsed((s) => !s);
  };

  // derived view: prefer controlled prop if provided
  const view = controlledView ?? internalView;
  const setView = (v: DoctorView) => {
    if (onViewChange) onViewChange(v);
    else setInternalView(v);
  };

  // map view -> content (replace placeholders with your panels)
  const ActiveContent = useMemo(() => {
    switch (view) {
      case 'Appointments':
        return <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">Appointments panel (demo)</div>;
      case 'Patients History':
        return <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">Doctors panel (demo)</div>;
      case 'Prescription':
        return <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">Patients panel (demo)</div>;
     
      default:
        return <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">Appointments (demo)</div>;
    }
  }, [view]);

  const mainVariantKey = isMobile ? 'mobile' : collapsed ? 'collapsed' : 'expanded';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <DoctorTopNav onToggle={handleTopNavToggle} />

      <div className="flex flex-1 overflow-hidden">
        <DoctorSidebar
          isOpen={!collapsed}
          mobileOpen={mobileOpen}
          activeView={view}
          onChangeView={(v) => {
            setView(v);
            if (mobileOpen) setMobileOpen(false);
          }}
          onClose={() => setMobileOpen(false)}
          onToggleCollapse={() => setCollapsed((s) => !s)}
          collapsed={collapsed}
        />

        <motion.main
          className="flex-1 overflow-auto p-6 transition-all"
          initial={false}
          animate={mainVariantKey}
          variants={contentVariants}
          style={{ minHeight: 'calc(100vh - 64px)' }}
        >
         
          <div>{children ?? ActiveContent}</div>
        </motion.main>
      </div>
    </div>
  );
}
