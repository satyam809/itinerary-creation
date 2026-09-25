"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="d-flex min-vh-100">
      {open ? (
        <button
          type="button"
          className="sidebar-backdrop d-md-none"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="d-flex flex-column flex-grow-1 min-w-0">
        <Header menuOpen={open} onMenuClick={() => setOpen(true)} />
        <div className="flex-grow-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
