import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { AuthProvider } from '@/components/auth/AuthProvider';
import IntroSplashScreen from '@/components/ui/IntroSplashScreen';

export const metadata: Metadata = {
  title: 'Symphosium | National College Examination & Coding Platform',
  description: 'Enterprise college symposium examination engine featuring MCQ, Code Debugging, Crash & Fix challenges, real-time proctoring, and instant Supabase evaluation.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* DNS Preconnects */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet" />

        {/* High-Priority Hero & Logo Image Preloads */}
        <link rel="preload" as="image" href="/images/college_logo.png" fetchPriority="high" />
        <link rel="preload" as="image" href="/images/campus_building.png" fetchPriority="high" />
        <link rel="preload" as="image" href="/images/campus_facade.png" fetchPriority="high" />
      </head>
      <body className="bg-[#090d16] text-slate-100 min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
