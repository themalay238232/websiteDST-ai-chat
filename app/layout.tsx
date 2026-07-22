import type { Metadata } from "next";
import "./globals.css";

const description =
  "DST Group cung cấp giải pháp Marketing, Media, Branding và thiết kế website theo nhu cầu thực tế của doanh nghiệp.";

export const metadata: Metadata = {
  title: {
    default: "DST Group | Marketing, Media & Branding",
    template: "%s | DST Group",
  },
  description,
  metadataBase: new URL("https://theluc205.github.io/websiteDST-ai-chat/"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DST Group | Marketing, Media & Branding",
    description,
    url: "https://theluc205.github.io/websiteDST-ai-chat/",
    siteName: "DST Group Marketing & Media",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "DST Group Marketing, Media & Branding",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DST Group | Marketing, Media & Branding",
    description,
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="512x512" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@600;700;800&family=Source+Sans+3:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
