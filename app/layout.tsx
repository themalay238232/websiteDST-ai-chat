import type { Metadata } from "next";
import "./globals.css";

const description =
  "DST Group cung cấp dịch vụ Marketing, quảng cáo, TikTok Shop, thiết kế website, sản xuất Media, Branding và xây dựng phòng Marketing cho doanh nghiệp.";

export const metadata: Metadata = {
  title: "DST Group | Marketing, Media và Branding toàn diện",
  description,
  keywords: [
    "DST Group",
    "Marketing",
    "Media",
    "Branding",
    "TikTok Shop",
    "Thiết kế website",
    "Quảng cáo đa nền tảng",
  ],
  metadataBase: new URL("https://dstgroup.vn"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DST Group | Marketing, Media và Branding toàn diện",
    description,
    url: "https://dstgroup.vn",
    siteName: "DST Group Marketing & Media",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "assets/logo-dst-marketing-media.png",
        width: 2048,
        height: 1152,
        alt: "DST Group Marketing & Media",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DST Group | Marketing, Media và Branding toàn diện",
    description,
    images: ["assets/logo-dst-marketing-media.png"],
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness"],
  name: "Công ty Cổ phần Tập Đoàn DST",
  alternateName: "DST Group Marketing & Media",
  url: "https://dstgroup.vn",
  email: "info@dstgroup.vn",
  telephone: "+84328247888",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Hạ Long",
    addressRegion: "Quảng Ninh",
    addressCountry: "VN",
  },
  slogan: "Dịch vụ tận tâm - Nâng tầm thương hiệu",
  sameAs: ["https://dstgroup.vn"],
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
        <link rel="icon" href="favicon.png" type="image/png" sizes="512x512" />
        <link rel="shortcut icon" href="favicon.png" />
        <link rel="apple-touch-icon" href="favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&family=Literata:ital,opsz,wght@0,7..72,500;0,7..72,600;0,7..72,700;0,7..72,800;1,7..72,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </body>
    </html>
  );
}
