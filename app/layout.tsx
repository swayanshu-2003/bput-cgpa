import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SideAds } from "@/components/SideAds";
import { BottomAd } from "@/components/BottomAd";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const SITE_URL = "https://bput-grade-calculator.vercel.app";
const SITE_NAME = "BPUT CGPA/SGPA/PERCENTAGE Calculator";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BPUT GRADE Calculator — Free Grade & Percentage Tool",
    template: "%s | BPUT GRADE Calculator",
  },
  description:
    "Free online CGPA and SGPA calculator for BPUT (Biju Patnaik University of Technology) students. Upload semester result PDFs or enter SGPA & credits manually. Instant results, 100% private — all processing happens in your browser.",
  keywords: [
    "BPUT CGPA calculator",
    "BPUT SGPA calculator",
    "BPUT percentage calculator",
    "Biju Patnaik University of Technology",
    "BPUT result calculator",
    "BPUT grade calculator",
    "BPUT B.Tech CGPA",
    "BPUT semester result",
    "CGPA to percentage BPUT",
    "BPUT grading system",
    "BPUT lateral entry CGPA",
    "BPUT marksheet calculator",
    "BPUT online calculator",
    "BPUT grade point average",
    "engineering CGPA calculator Odisha",
  ],
  authors: [{ name: "Swayanshu", url: "https://github.com/swayanshu-2003" }],
  creator: "Swayanshu",
  publisher: SITE_NAME,
  category: "Education",
  applicationName: SITE_NAME,
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "BPUT CGPA Calculator — Free Grade & Percentage Tool",
    description:
      "Calculate your BPUT CGPA and SGPA instantly. Upload semester result PDFs or enter grades manually. Free, private, and instant — no data leaves your browser.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BPUT CGPA Calculator — Free Grade & Percentage Tool",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BPUT CGPA Calculator — Free Grade & Percentage Tool",
    description:
      "Calculate your BPUT CGPA and SGPA instantly. Upload semester PDFs or enter grades manually. 100% private — all in your browser.",
    images: ["/og-image.png"],
    creator: "@swayanshu_2003",
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
  },
  manifest: "/manifest.json",
  verification: {
    google: "",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#webapp`,
      name: SITE_NAME,
      url: SITE_URL,
      description:
        "Free online CGPA and SGPA calculator for BPUT (Biju Patnaik University of Technology) students. Upload semester result PDFs or enter SGPA & credits manually.",
      applicationCategory: "EducationalApplication",
      operatingSystem: "All",
      browserRequirements: "Requires JavaScript",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
      },
      featureList: [
        "CGPA calculation from semester SGPAs",
        "SGPA calculation from subject-level grades",
        "PDF result upload with OCR extraction",
        "PDF report download",
        "Calculation history",
        "Dark mode",
        "100% client-side processing",
      ],
      audience: {
        "@type": "EducationalAudience",
        educationalRole: "student",
      },
      provider: {
        "@type": "Organization",
        name: "BPUT CGPA Calculator",
        url: SITE_URL,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: "Free CGPA and SGPA calculator for BPUT students",
      publisher: { "@id": `${SITE_URL}/#webapp` },
      inLanguage: "en-IN",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "CGPA Calculator",
          item: `${SITE_URL}/cgpa`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "SGPA Calculator",
          item: `${SITE_URL}/sgpa`,
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.className} min-h-screen w-full bg-slate-100 dark:bg-[#060d1f] text-slate-900 dark:text-slate-200 leading-relaxed antialiased transition-colors duration-200`}
      >
        {/* Sets .dark on <html> before first paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
        <ScrollToTop />
        <SideAds />
        <Navbar />
        {children}
        <BottomAd />
        <Footer />
      </body>
    </html>
  );
}
