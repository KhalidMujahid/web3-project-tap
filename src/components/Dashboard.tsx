import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { formatAddress } from '../utils/walletUtils';

const Dashboard = () => {
  const { 
    points, 
    tokens, 
    walletAddress, 
    convertPointsToTokens, 
    simulateWithdrawal,
    CONVERSION_RATE,
    withdrawals,
    resetGame
  } = useGame();
  
  const [withdrawAddress, setWithdrawAddress] = useState(walletAddress);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const handleWithdraw = (e: any) => {
    e.preventDefault();
    if (withdrawAddress && withdrawAmount) {
      const amount = parseFloat(withdrawAmount);
      if (!isNaN(amount)) {
        simulateWithdrawal(withdrawAddress, amount);
        setWithdrawAmount('');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <a href="#game" className="btn-primary">Back to Tapping</a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-cyan-900/30 to-cyan-900/10">
            <div className="text-cyan-400 text-4xl mb-4">💰</div>
            <div className="text-2xl font-bold">{points.toLocaleString()}</div>
            <div className="text-gray-400">Points</div>
          </div>
          
          <div className="card bg-gradient-to-br from-green-900/30 to-green-900/10">
            <div className="text-green-400 text-4xl mb-4">🪙</div>
            <div className="text-2xl font-bold">{tokens.toFixed(4)}</div>
            <div className="text-gray-400">Tokens</div>
          </div>
          
          <div className="card bg-gradient-to-br from-purple-900/30 to-purple-900/10">
            <div className="text-purple-400 text-4xl mb-4">👛</div>
            <div className="text-xl font-bold truncate">{formatAddress(walletAddress)}</div>
            <div className="text-gray-400">Wallet</div>
          </div>
          
          <div className="card bg-gradient-to-br from-yellow-900/30 to-yellow-900/10">
            <div className="text-yellow-400 text-4xl mb-4">📈</div>
            <div className="text-2xl font-bold">{CONVERSION_RATE}</div>
            <div className="text-gray-400">Points per Token</div>
          </div>
        </div>

        {/* Conversion Section */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">Convert Points to Tokens</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl">
              <div>
                <div className="text-gray-400">Available Points</div>
                <div className="text-2xl font-bold">{points.toLocaleString()}</div>
              </div>
              <div className="text-4xl">→</div>
              <div>
                <div className="text-gray-400">Convertible Tokens</div>
                <div className="text-2xl font-bold">{(points / CONVERSION_RATE).toFixed(2)}</div>
              </div>
            </div>
            
            <button
              onClick={convertPointsToTokens}
              disabled={points < CONVERSION_RATE}
              className="btn-primary w-full"
            >
              Convert {CONVERSION_RATE} Points to 1 Token
            </button>
            
            <p className="text-gray-400 text-sm text-center">
              Conversion rate: 1 Token = {CONVERSION_RATE} Points
            </p>
          </div>
        </div>

        {/* Withdrawal Section */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">Withdraw Tokens</h2>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Withdrawal Address</label>
              <input
                type="text"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                placeholder="0x..."
                className="input-field w-full"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-400 mb-2">Amount (Tokens)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.0"
                min="0.001"
                step="0.001"
                className="input-field w-full"
                required
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl">
              <div className="text-gray-400">Available Tokens</div>
              <div className="text-xl font-bold">{tokens.toFixed(4)}</div>
            </div>
            
            <button
              type="submit"
              disabled={!withdrawAmount || parseFloat(withdrawAmount) > tokens}
              className="btn-primary w-full"
            >
              Simulate Withdrawal
            </button>
          </form>
          
          <div className="mt-6 text-sm text-gray-400">
            <p>⚠️ This is a simulated withdrawal for MVP demonstration.</p>
            <p>In production, this would connect to a real smart contract.</p>
          </div>
        </div>

        {withdrawals.length > 0 && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Withdrawal History</h2>
            <div className="space-y-3">
              {withdrawals.slice().reverse().map((withdrawal, index) => (
                <div key={index} className="p-4 bg-gray-900/50 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold">To: {formatAddress(withdrawal.address)}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(withdrawal.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-green-400 font-bold">-{withdrawal.amount} TKN</div>
                  </div>
                  <div className="text-sm text-gray-400 break-all">
                    TX: {withdrawal.txHash}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card mt-8 border border-red-900/50">
          <h2 className="text-xl font-bold text-red-400 mb-4">⚠️ Danger Zone</h2>
          <button
            onClick={() => {
              if (window.confirm('Are you sure? This will reset all game data.')) {
                resetGame();
              }
            }}
            className="w-full px-4 py-3 bg-red-900/30 border border-red-700 
                     rounded-xl hover:bg-red-900/50 transition"
          >
            Reset Game Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;