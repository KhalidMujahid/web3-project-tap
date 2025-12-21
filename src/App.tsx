import React from 'react';
import { GameProvider } from './contexts/GameContext';
import Landing from './components/Landing';
import TapGame from './components/TapGame';
import Dashboard from './components/Dashboard';
import DailyReward from './components/DailyReward';
import Referral from './components/Referral';
import Leaderboard from './components/Leaderboard';

function App() {
  const [currentView, setCurrentView] = React.useState('landing');

  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'landing';
      setCurrentView(hash);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <Landing />;
      case 'game':
        return <TapGame />;
      case 'dashboard':
        return <Dashboard />;
      case 'daily':
        return <DailyReward />;
      case 'referral':
        return <Referral />;
      case 'leaderboard':
        return <Leaderboard />;
      default:
        return <Landing />;
    }
  };

  // Bottom Navigation (for mobile)
  const Navigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 
                  flex justify-around p-2 z-50 md:hidden">
      <a
        href="#game"
        className={`flex flex-col items-center p-2 ${currentView === 'game' ? 'text-cyan-400' : 'text-gray-400'}`}
      >
        <div className="text-2xl">👆</div>
        <div className="text-xs mt-1">Tap</div>
      </a>
      <a
        href="#dashboard"
        className={`flex flex-col items-center p-2 ${currentView === 'dashboard' ? 'text-cyan-400' : 'text-gray-400'}`}
      >
        <div className="text-2xl">📊</div>
        <div className="text-xs mt-1">Dashboard</div>
      </a>
      <a
        href="#daily"
        className={`flex flex-col items-center p-2 ${currentView === 'daily' ? 'text-cyan-400' : 'text-gray-400'}`}
      >
        <div className="text-2xl">🎁</div>
        <div className="text-xs mt-1">Daily</div>
      </a>
      <a
        href="#referral"
        className={`flex flex-col items-center p-2 ${currentView === 'referral' ? 'text-cyan-400' : 'text-gray-400'}`}
      >
        <div className="text-2xl">👥</div>
        <div className="text-xs mt-1">Referral</div>
      </a>
      <a
        href="#leaderboard"
        className={`flex flex-col items-center p-2 ${currentView === 'leaderboard' ? 'text-cyan-400' : 'text-gray-400'}`}
      >
        <div className="text-2xl">🏆</div>
        <div className="text-xs mt-1">Top</div>
      </a>
    </div>
  );

  return (
    <GameProvider>
      <div className="min-h-screen bg-gray-900">
        {renderView()}
        <Navigation />
      </div>
    </GameProvider>
  );
}

export default App;