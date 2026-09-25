"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function Icon({ children }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-shrink-0"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const icons = {
  dashboard: (
    <Icon>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </Icon>
  ),
  itinerary: (
    <Icon>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </Icon>
  ),
  create: (
    <Icon>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </Icon>
  ),
  list: (
    <Icon>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </Icon>
  ),
  settings: (
    <Icon>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Icon>
  ),
};

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  {
    label: "Itinerary",
    href: "/itinerary",
    icon: "itinerary",
    children: [
      { label: "Create", href: "/itinerary/create", icon: "create" },
      { label: "List", href: "/itinerary/list", icon: "list" },
    ],
  },
  { label: "Settings", href: "/settings", icon: "settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const isItineraryActive = pathname?.startsWith("/itinerary");
  const [itineraryOpen, setItineraryOpen] = useState(isItineraryActive);

  useEffect(() => {
    if (isItineraryActive) setItineraryOpen(true);
  }, [isItineraryActive]);

  const isExactActive = (href) => pathname === href;

  return (
    <aside className="sidebar d-flex flex-column flex-shrink-0 p-3 text-bg-dark">
      <Link
        href="/dashboard"
        className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
      >
        <span className="fs-5 fw-semibold">Itinerary System</span>
      </Link>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto gap-1">
        {navItems.map((item) => {
          if (item.children) {
            return (
              <li key={item.label} className="nav-item">
                <button
                  type="button"
                  className="nav-link text-start w-100 d-flex justify-content-between align-items-center border-0 text-white"
                  onClick={() => setItineraryOpen((open) => !open)}
                  aria-expanded={itineraryOpen}
                >
                  <span
                    className={`d-flex align-items-center gap-2 ${
                      isItineraryActive ? "fw-semibold" : ""
                    }`}
                  >
                    {icons[item.icon]}
                    {item.label}
                  </span>
                  <span
                    className="small"
                    style={{
                      transform: itineraryOpen ? "rotate(90deg)" : "none",
                      transition: "transform 0.15s ease",
                      display: "inline-block",
                    }}
                  >
                    ›
                  </span>
                </button>
                {itineraryOpen && (
                  <ul className="nav flex-column ms-3 mt-1 gap-1">
                    {item.children.map((child) => (
                      <li key={child.href} className="nav-item">
                        <Link
                          href={child.href}
                          className={`nav-link py-1 d-flex align-items-center gap-2 ${
                            isExactActive(child.href) ? "active" : "text-white"
                          }`}
                        >
                          {icons[child.icon]}
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          }

          return (
            <li key={item.href} className="nav-item">
              <Link
                href={item.href}
                className={`nav-link d-flex align-items-center gap-2 ${
                  isExactActive(item.href) ? "active" : "text-white"
                }`}
              >
                {icons[item.icon]}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
