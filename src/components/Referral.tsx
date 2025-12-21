import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import toast from 'react-hot-toast';

const Referral = () => {
  const { 
    referralCode, 
    referredUsers, 
    referralPoints, 
    handleReferral,
    addReferredUser,
    isConnected 
  } = useGame();
  
  const [inputReferralCode, setInputReferralCode] = useState('');
  const [newUserAddress, setNewUserAddress] = useState('');

  const copyToClipboard = (text: any) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleSubmitReferral = () => {
    if (handleReferral(inputReferralCode)) {
      setInputReferralCode('');
    }
  };

  const handleAddReferredUser = () => {
    if (newUserAddress) {
      addReferredUser(newUserAddress);
      setNewUserAddress('');
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4 
                    flex items-center justify-center">
        <div className="card text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-4">Wallet Not Connected</h2>
          <p className="text-gray-400 mb-6">
            Connect your wallet to access the referral system
          </p>
          <a href="#" className="btn-primary">
            Connect Wallet
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Referral Program</h1>
          <a href="#game" className="btn-primary">Back to Tapping</a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card text-center">
            <div className="text-4xl mb-4">👥</div>
            <div className="text-3xl font-bold">{referredUsers.length}</div>
            <div className="text-gray-400">Referred Users</div>
          </div>
          
          <div className="card text-center">
            <div className="text-4xl mb-4">💰</div>
            <div className="text-3xl font-bold">{referralPoints}</div>
            <div className="text-gray-400">Referral Points</div>
          </div>
          
          <div className="card text-center">
            <div className="text-4xl mb-4">🎯</div>
            <div className="text-3xl font-bold">500</div>
            <div className="text-gray-400">Points per Referral</div>
          </div>
        </div>

        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">Your Referral Code</h2>
          
          <div className="p-4 bg-gray-900/50 rounded-xl mb-4">
            <div className="text-center mb-2">
              <div className="text-3xl font-bold text-cyan-400">{referralCode}</div>
              <p className="text-gray-400 text-sm mt-2">
                Share this code with friends to earn bonuses
              </p>
            </div>
          </div>
          
          <button
            onClick={() => copyToClipboard(referralCode)}
            className="btn-primary w-full"
          >
            📋 Copy Referral Code
          </button>
          
          <div className="mt-4 text-sm text-gray-400">
            <p>✨ You earn 500 points when someone uses your code</p>
            <p>✨ Your friend also gets 500 bonus points</p>
            <p>✨ Track all your referrals below</p>
          </div>
        </div>

        {/* Use Referral Code */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">Use a Referral Code</h2>
          
          <div className="space-y-4">
            <input
              type="text"
              value={inputReferralCode}
              onChange={(e) => setInputReferralCode(e.target.value)}
              placeholder="Enter referral code (e.g., REF-ABC123)"
              className="input-field w-full"
            />
            
            <button
              onClick={handleSubmitReferral}
              disabled={!inputReferralCode}
              className="btn-primary w-full"
            >
              Apply Referral Code
            </button>
          </div>
          
          <div className="mt-4 p-4 bg-gray-900/30 rounded-xl">
            <div className="flex items-center">
              <div className="text-green-400 mr-3">✅</div>
              <div>
                <div className="font-bold">Bonus Rewards</div>
                <div className="text-gray-400 text-sm">
                  Get 500 bonus points when using a referral code
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Your Referrals</h2>
          
          {referredUsers.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {referredUsers.map((user, index) => (
                <div key={index} className="p-4 bg-gray-900/50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 
                                  flex items-center justify-center mr-4">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-bold">{user.slice(0, 8)}...{user.slice(-6)}</div>
                      <div className="text-sm text-gray-400">Referred User</div>
                    </div>
                  </div>
                  <div className="text-green-400 font-bold">+500 pts</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📭</div>
              <h3 className="text-xl font-bold mb-2">No Referrals Yet</h3>
              <p className="text-gray-400">
                Share your referral code to start earning bonuses!
              </p>
            </div>
          )}
          
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="font-bold mb-4">Add Test Referral (Demo)</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newUserAddress}
                onChange={(e) => setNewUserAddress(e.target.value)}
                placeholder="Enter test wallet address"
                className="input-field flex-1"
              />
              <button
                onClick={handleAddReferredUser}
                className="px-4 py-3 bg-gray-700 rounded-xl hover:bg-gray-600 transition"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="card mt-8">
          <h2 className="text-2xl font-bold mb-6">Share & Earn More</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                const text = `Join me on TapCoin! Use my referral code: ${referralCode}`;
                copyToClipboard(text);
              }}
              className="p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition text-center"
            >
              <div className="text-2xl mb-2">📱</div>
              <div className="font-bold">Copy Message</div>
            </button>
            
            <button
              onClick={() => {
                const url = `${window.location.origin}?ref=${referralCode}`;
                copyToClipboard(url);
              }}
              className="p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition text-center"
            >
              <div className="text-2xl mb-2">🔗</div>
              <div className="font-bold">Copy Link</div>
            </button>
          </div>
          
          <div className="mt-6 text-sm text-gray-400">
            <p>📢 Share on social media for even more visibility</p>
            <p>👥 The more friends you refer, the more you earn!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referral;