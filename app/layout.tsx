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
        url: "/assets/logo-dst-marketing-media.png",
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
    images: ["/assets/logo-dst-marketing-media.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
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
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </body>
    </html>
  );
}
