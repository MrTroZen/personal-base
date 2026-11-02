import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Personal Base", template: "%s — Personal Base" },
  description: "A private dashboard for focused personal work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var a=localStorage.getItem('personal-base-appearance');if(a==='light'||a==='dark')document.documentElement.dataset.theme=a;}catch(e){}})()` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
