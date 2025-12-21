import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';

type TimeFilter = 'daily' | 'weekly' | 'monthly' | 'all';

interface LeaderboardUser {
  rank: number;
  address: string;
  name: string;
  points: number;
  tokens: string;
  taps: number;
  isYou: boolean;
}

const generateLeaderboard = (): LeaderboardUser[] => {
  const names = [
    'CryptoWhale',
    'TapMaster',
    'CoinKing',
    'BlockchainPro',
    'Web3Wizard',
    'DeFiDegen',
    'NFTGuru',
    'BitcoinBull',
    'EthereumEagle',
    'PolygonPioneer',
  ];

  return Array.from({ length: 20 }, (_, i) => ({
    rank: i + 1,
    address: `0x${Math.random().toString(16).slice(2, 12)}...${Math.random()
      .toString(16)
      .slice(2, 6)}`,
    name: names[i % names.length],
    points: Math.floor(Math.random() * 1_000_000) + 50_000,
    tokens: (Math.random() * 1000).toFixed(2),
    taps: Math.floor(Math.random() * 100_000) + 10_000,
    isYou: i === 5,
  }))
    .sort((a, b) => b.points - a.points)
    .map((user, index) => ({ ...user, rank: index + 1 }));
};

const Leaderboard = () => {
  const { points, tokens, walletAddress, totalTaps } = useGame();

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    const data = generateLeaderboard();
    setLeaderboard(data);

    const userEntry = data.find((entry) => entry.isYou);
    setUserRank(userEntry ? userEntry.rank : Math.floor(Math.random() * 50) + 1);
  }, []);


  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  const getRankBadgeColor = (rank: number): string => {
    switch (rank) {
      case 1:
        return 'from-yellow-500 to-yellow-300';
      case 2:
        return 'from-gray-400 to-gray-300';
      case 3:
        return 'from-amber-700 to-amber-500';
      default:
        return 'from-gray-800 to-gray-700';
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">🏆 Leaderboard</h1>
          <a href="#game" className="btn-primary">
            Back to Tapping
          </a>
        </div>

        <div className="card mb-8 bg-gradient-to-r from-cyan-900/20 to-blue-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`w-16 h-16 rounded-full bg-gradient-to-r ${getRankBadgeColor(
                  userRank ?? 999
                )} flex items-center justify-center text-white font-bold text-xl mr-4`}
              >
                #{userRank ?? '?'}
              </div>
              <div>
                <h2 className="text-xl font-bold">Your Position</h2>
                <p className="text-gray-400">
                  {walletAddress
                    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                    : 'Not connected'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <Stat label="Points" value={formatNumber(points)} color="text-cyan-400" />
              <Stat label="Tokens" value={tokens.toFixed(2)} color="text-green-400" />
              <Stat label="Taps" value={formatNumber(totalTaps)} color="text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {(['daily', 'weekly', 'monthly', 'all'] as TimeFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-6 py-3 rounded-xl font-bold transition ${
                timeFilter === filter
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {leaderboard.slice(0, 3).map((user) => (
            <div
              key={user.rank}
              className={`card text-center ${
                user.rank === 1 ? 'order-2' : user.rank === 2 ? 'order-1' : 'order-3'
              }`}
            >
              <div
                className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r ${getRankBadgeColor(
                  user.rank
                )} flex items-center justify-center text-white font-bold text-2xl`}
              >
                #{user.rank}
              </div>

              {user.rank === 1 && <div className="text-4xl mb-2">👑</div>}
              {user.rank === 2 && <div className="text-4xl mb-2">🥈</div>}
              {user.rank === 3 && <div className="text-4xl mb-2">🥉</div>}

              <div className="font-bold text-lg mb-1 truncate">{user.name}</div>
              <div className="text-gray-400 text-sm mb-2">{user.address}</div>

              <div className="text-2xl font-bold text-yellow-400 mb-2">
                {formatNumber(user.points)}
              </div>
              <div className="text-gray-400">Points</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-4 px-4 text-left text-gray-400">Rank</th>
                  <th className="py-4 px-4 text-left text-gray-400">User</th>
                  <th className="py-4 px-4 text-left text-gray-400">Points</th>
                  <th className="py-4 px-4 text-left text-gray-400">Tokens</th>
                  <th className="py-4 px-4 text-left text-gray-400">Taps</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.slice(3).map((user) => (
                  <tr
                    key={user.rank}
                    className={`border-b border-gray-800/50 hover:bg-gray-800/30 ${
                      user.isYou ? 'bg-cyan-900/20' : ''
                    }`}
                  >
                    <td className="py-4 px-4">{user.rank}</td>
                    <td className="py-4 px-4 font-bold">{user.name}</td>
                    <td className="py-4 px-4">{formatNumber(user.points)}</td>
                    <td className="py-4 px-4 text-green-400">{user.tokens}</td>
                    <td className="py-4 px-4 text-yellow-400">
                      {formatNumber(user.taps)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};


const Stat = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) => (
  <div className="text-center">
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
    <div className="text-gray-400 text-sm">{label}</div>
  </div>
);

export default Leaderboard;
