import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '@clerk/clerk-react';

export default function MainLayout() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-800 text-white">
      {/* Top Navigation */}
      <Navbar />

      {/* Page Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
