// src/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="text-center py-6 text-xs opacity-70">
      © {new Date().getFullYear()} Next Metal. All rights reserved.
    </footer>
  );
}