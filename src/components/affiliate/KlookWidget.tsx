'use client';

import { useEffect } from 'react';

interface KlookWidgetProps {
  cid: string;
}

export default function KlookWidget({ cid }: KlookWidgetProps) {
  useEffect(() => {
    if (document.querySelector('script[src*="klook.com/widget"]')) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://affiliate.klook.com/widget/fetch-iframe-init.js';
    document.head.appendChild(script);
  }, []);

  if (!cid) return null;

  return (
    <div className="my-8">
      <ins
        className="klk-aff-widget"
        data-adid="1235570"
        data-lang="en-BS"
        data-currency=""
        data-cardH="126"
        data-padding="92"
        data-lgH="470"
        data-edgeValue="655"
        data-cid={cid}
        data-tid="-1"
        data-amount="3"
        data-prod="dynamic_widget"
      >
        <a href="//www.klook.com/" rel="noopener noreferrer nofollow">
          Klook.com
        </a>
      </ins>
    </div>
  );
}
