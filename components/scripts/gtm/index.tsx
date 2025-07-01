import Script from "next/script";

export interface WindowWithGtag extends Window {
  gtag?: any;
}

export default function GtmHead() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      {process.env.NEXT_PUBLIC_GTAG_ID && (
        <>
          <Script
            id="gtag"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GTAG_ID}`}
            strategy="afterInteractive"
          ></Script>
          <Script id="data-layer" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${process.env.NEXT_PUBLIC_GTAG_ID}');
            `}
          </Script>
        </>
      )}
      {/* {process.env.NEXT_PUBLIC_GTM_ID && (
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
      `}
        </Script>
      )} */}
    </>
  );
}

// export function GtmBody() {
//   if (process.env.NODE_ENV !== 'production') return null
//   if (!process.env.NEXT_PUBLIC_GTM_ID) return null

//   return (
//     <noscript>
//       <iframe
//         src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
//         height="0"
//         width="0"
//         className="hidden invisible"
//       ></iframe>
//     </noscript>
//   )
// }

export async function getGoogleAnalyticsFieldValue(fieldName: string) {
  const gtag = (window as WindowWithGtag).gtag;

  if (!gtag) return undefined;
  if (!process.env.NEXT_PUBLIC_GTAG_ID) return undefined;

  return new Promise<string>((resolve) => {
    (window as WindowWithGtag).gtag(
      "get",
      process.env.NEXT_PUBLIC_GTAG_ID,
      fieldName,
      (value: string) => resolve(value)
    );
  });
}
