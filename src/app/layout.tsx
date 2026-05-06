import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STEMFOLIO",
  description: "STEM Project Lifecycle & Student Portfolio System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>
        {children}
      </body>
    </html>
  );
}
