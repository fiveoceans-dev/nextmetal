// src/App.tsx
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';
import HomePage from '@/pages/HomePage';

export default function App() {
  return (
    <Routes>
      {/* Wrap every page in RootLayout (Header + Footer) */}
      <Route element={<RootLayout><Outlet /></RootLayout>}>
        <Route index element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
