import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Kalidash",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0d0911] text-white font-sans">
      {children}
    </div>
  );
}
