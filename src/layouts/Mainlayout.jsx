import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useSyncUser } from '../hooks/useSyncUser';

export default function MainLayout() {
  const { isSignedIn, getToken } = useAuth();
  const { mutate: syncUser } = useSyncUser();
  const [synced, setSynced] = useState(() => {
    // Retrieve initial sync state from localStorage
    return localStorage.getItem('user_synced') === 'true';
  });


useEffect(() => {
  const sync = async () => {
    console.log("🔄 useEffect triggered");
      console.log("🔐 Fetching token...");
        const token = await getToken();

        if (!token) {
          console.warn("⚠️ Token is null or undefined");
          return;
        }

        console.log("✅ Token received:", token);

    if (isSignedIn && !synced) {
      console.log("✅ User is signed in and not yet synced");
      

      try {
        console.log("🔐 Fetching token...");
        const token = await getToken();

        if (!token) {
          console.warn("⚠️ Token is null or undefined");
          return;
        }

        console.log("✅ Token received:", token);

        await syncUser(token); // Assuming syncUser accepts the token as an argument
        setSynced(true);
        localStorage.setItem("user_synced", "true");
        console.log("🎉 User synced successfully");
      } catch (err) {
        console.error("❌ Error during sync:", err);
      }
    } else {
      console.log("ℹ️ Skipped sync. isSignedIn:", isSignedIn, " | synced:", synced);
    }
  };

  sync();
}, [isSignedIn, getToken, syncUser, synced]);



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
