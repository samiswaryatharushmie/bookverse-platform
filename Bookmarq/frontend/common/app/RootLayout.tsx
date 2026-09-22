import { Outlet } from 'react-router-dom';
import Navbar from '@/modules/common/components/ui/Navbar';
import Footer from '@/modules/common/components/ui/Footer';
import PromoBanner from '@/modules/common/components/ui/PromoBanner';

/**
 * Root layout shell — wraps all pages with Navbar and Footer.
 * Provides semantic landmarks for accessibility.
 */
export default function RootLayout() {
  return (
    <>
      <PromoBanner />
      <div className="flex min-h-screen flex-col pt-24 mt-8">
        <Navbar />
        <main role="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
    </>
  );
}
