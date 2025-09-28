
import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Aegis — AI Shield Dashboard",
  description: "Multi-agent CCTV intelligence with visualization and compliance"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
