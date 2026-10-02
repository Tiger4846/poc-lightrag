import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Document Platform",
  description: "ระบบจัดการเอกสารและไฟล์",
  icons: {
    icon: '/lightrag-directory/project-logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
