import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';

const DailyReward = () => {
  const { 
    claimDailyReward, 
    dailyRewardClaimed, 
    lastDailyReward,
    DAILY_BONUS_POINTS 
  } = useGame();
  
  const [timeUntilNextDay, setTimeUntilNextDay] = useState('');
  const [streak, setStreak] = useState(1);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = Number(tomorrow) - Number(now);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeUntilNextDay(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (lastDailyReward) {
      const lastClaim = new Date(lastDailyReward);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastClaim.toDateString() === yesterday.toDateString()) {
        setStreak((prev: any) => prev + 1);
      } else if (lastClaim.toDateString() !== today.toDateString()) {
        setStreak(1);
      }
    }
  }, [lastDailyReward]);

  const getBonusMultiplier = () => {
    if (streak >= 7) return 2.0;
    if (streak >= 3) return 1.5;
    return 1.0;
  };

  const bonusPoints = Math.floor(DAILY_BONUS_POINTS * getBonusMultiplier());

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Daily Rewards</h1>
          <a href="#game" className="btn-primary">Back to Tapping</a>
        </div>

        {/* Main Reward Card */}
        <div className={`card mb-8 text-center ${
          dailyRewardClaimed ? 'opacity-75' : ''
        }`}>
          <div className="text-6xl mb-6">🎁</div>
          
          <h2 className="text-2xl font-bold mb-4">
            {dailyRewardClaimed ? 'Reward Claimed!' : 'Daily Reward Available!'}
          </h2>
          
          <div className="text-4xl font-bold text-yellow-400 mb-2">
            +{bonusPoints} Points
          </div>
          
          <div className="text-gray-400 mb-6">
            {getBonusMultiplier() > 1 && `🔥 ${getBonusMultiplier()}x Streak Bonus!`}
          </div>

          <button
            onClick={claimDailyReward}
            disabled={dailyRewardClaimed}
            className={`btn-primary w-full ${
              dailyRewardClaimed ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {dailyRewardClaimed ? 'Already Claimed Today' : 'Claim Daily Reward'}
          </button>
        </div>

        {/* Countdown Timer */}
        <div className="card mb-8">
          <h3 className="text-xl font-bold mb-4">Next Reward In</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">
              {timeUntilNextDay}
            </div>
            <p className="text-gray-400">Until next daily reward</p>
          </div>
        </div>

        {/* Streak Information */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">🔥 Daily Streak</h3>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-3xl font-bold">{streak} Days</div>
              <div className="text-gray-400">Current Streak</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">x{getBonusMultiplier()}</div>
              <div className="text-gray-400">Bonus Multiplier</div>
            </div>
          </div>

          {/* Streak Calendar */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-gray-400 mb-1">{day}</div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                  index < streak 
                    ? 'bg-green-900/50 border border-green-700' 
                    : 'bg-gray-800'
                }`}>
                  {index < streak ? '✓' : ''}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">1-2 Days</span>
              <span className="font-bold">1x Multiplier</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">3-6 Days</span>
              <span className="font-bold text-yellow-400">1.5x Multiplier</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">7+ Days</span>
              <span className="font-bold text-green-400">2.0x Multiplier</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-400">
          <p>💡 Come back every day to increase your streak and earn bigger rewards!</p>
        </div>
      </div>
    </div>
  );
};

export default DailyReward;