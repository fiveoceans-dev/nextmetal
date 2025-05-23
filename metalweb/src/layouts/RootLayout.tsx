// src/layouts/RootLayout.tsx

import { PropsWithChildren } from 'react';
import { FocusStyleManager } from '@blueprintjs/core';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Ensure Blueprint focus rings only on keyboard nav
FocusStyleManager.onlyShowFocusOnTabs();

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <>
      {/* Site‑wide header */}
      <Header />

      {/* Page content */}
      <div className="bp5-dark min-h-screen pt-20 pb-12 flex flex-col text-gray-100">
        {children}
      </div>

      {/* Site‑wide footer */}
      <Footer />
    </>
  );
}