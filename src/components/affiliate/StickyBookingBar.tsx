"use client";

import { useEffect, useState } from "react";
import { getAgodaSearchLink, getKlookDestinationLink } from "@/lib/affiliates";

interface StickyBookingBarProps {
  citySlug: string;
  cityName: string;
}

export default function StickyBookingBar({ citySlug, cityName }: StickyBookingBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <div className="bg-white border-b border-border shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
          <span className="hidden sm:block text-sm font-medium text-text-primary truncate">
            {cityName}
          </span>
          <div className="flex items-center gap-3 ml-auto">
            <a
              href={getAgodaSearchLink(citySlug)}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors whitespace-nowrap"
            >
              <span aria-hidden="true">🏨</span> Find Hotels
            </a>
            <a
              href={getKlookDestinationLink(citySlug)}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary-dark text-white text-sm font-medium transition-colors whitespace-nowrap"
            >
              <span aria-hidden="true">🎫</span> Book Activities
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
