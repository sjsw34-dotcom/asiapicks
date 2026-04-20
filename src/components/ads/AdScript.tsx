import Script from "next/script";

export const ADSENSE_CLIENT_ID = "ca-pub-7581203537914853";

export default function AdScript() {
  return (
    <Script
      id="adsbygoogle-init"
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
    />
  );
}
