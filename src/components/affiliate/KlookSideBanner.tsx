"use client";

import { useEffect } from "react";

export default function KlookSideBanner() {
  useEffect(() => {
    // Load Klook widget script once
    if (document.querySelector('script[src*="klook.com/widget/fetch-iframe-init"]')) return;
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.src = "https://affiliate.klook.com/widget/fetch-iframe-init.js";
    document.body.appendChild(s);
  }, []);

  return (
    <aside className="hidden xl:block sticky top-24 h-fit">
      <ins
        className="klk-aff-widget"
        data-wid="115517"
        data-bgtype="Shinkansen"
        data-adid="1247440"
        data-lang="en-BS"
        data-prod="banner"
        data-width="120"
        data-height="600"
      >
        <a
          href="https://www.klook.com/?aid="
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          Klook.com
        </a>
      </ins>
    </aside>
  );
}
