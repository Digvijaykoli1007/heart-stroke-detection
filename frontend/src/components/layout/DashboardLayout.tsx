import React from 'react';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-clinical-gray-50">
      <Header />
      <main className="container mx-auto px-6 py-8 max-w-[1440px]">
        {children}
      </main>
    </div>
  );
};
