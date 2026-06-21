import { useState, useEffect } from 'react';
import { useUserStore } from './store/userStore';
import { AppShell } from './components/AppShell';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LibraryPage } from './pages/LibraryPage';
import { ArenaPage } from './pages/ArenaPage';
import { ProfilePage } from './pages/ProfilePage';

function App() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const syncSession = useUserStore((state) => state.syncSession);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  useEffect(() => {
    if (isAuthenticated) {
      syncSession();
    }
  }, [isAuthenticated, syncSession]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-bg-page">
        <LoginPage />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-bg-page">
      <AppShell activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
        {activeTab === 'library' && <LibraryPage />}
        {activeTab === 'arena' && <ArenaPage />}
        {activeTab === 'profile' && <ProfilePage />}
      </AppShell>
    </div>
  );
}

export default App;
