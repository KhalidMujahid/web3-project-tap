import React from "react";
import { useGame } from '../contexts/GameContext';

const Landing = () => {
    const { isConnected, connectWallet } = useGame();
    const [walletAddress, setWalletAddress] = React.useState('');

    const handleConnect = () => {
        if (walletAddress.trim()) {
            connectWallet(walletAddress);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8 text-center">
                <div className="relative">
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 
                        flex items-center justify-center animate-pulse shadow-2xl">
                        <span className="text-4xl font-bold">💰</span>
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 
                        bg-clip-text text-transparent mb-2">
                        TapCoin
                    </h1>
                    <p className="text-gray-400 text-lg">Tap to Earn. Simple. Fun. Web3.</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="card text-center">
                        <div className="text-2xl font-bold text-cyan-400">10M+</div>
                        <div className="text-gray-400 text-sm">Taps</div>
                    </div>
                    <div className="card text-center">
                        <div className="text-2xl font-bold text-green-400">100K+</div>
                        <div className="text-gray-400 text-sm">Users</div>
                    </div>
                    <div className="card text-center">
                        <div className="text-2xl font-bold text-yellow-400">$1M+</div>
                        <div className="text-gray-400 text-sm">Earned</div>
                    </div>
                </div>

                {!isConnected ? (
                    <div className="card mt-8">
                        <h2 className="text-2xl font-bold mb-6">Connect to Start Earning</h2>
                        <p className="text-gray-400 mb-6">
                            Enter your wallet address to start tapping and earning points
                        </p>

                        <div className="space-y-4">
                            <input
                                type="text"
                                value={walletAddress}
                                onChange={(e) => setWalletAddress(e.target.value)}
                                placeholder="0x1234...abcd"
                                className="input-field w-full"
                            />
                            <button
                                onClick={handleConnect}
                                className="btn-primary w-full"
                            >
                                Connect Wallet
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="card mt-8">
                        <div className="text-2xl font-bold text-green-400 mb-4"> Connected!</div>
                        <button
                            onClick={() => window.location.hash = '#game'}
                            className="btn-primary w-full"
                        >
                            Start Tapping!
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="bg-gray-800/50 p-4 rounded-xl">
                        <div className="text-cyan-400 text-xl mb-2">⚡</div>
                        <h3 className="font-bold">Fast Tapping</h3>
                        <p className="text-gray-400 text-sm">Tap and earn instantly</p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-xl">
                        <div className="text-green-400 text-xl mb-2">🎁</div>
                        <h3 className="font-bold">Daily Rewards</h3>
                        <p className="text-gray-400 text-sm">Claim bonus every day</p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-xl">
                        <div className="text-yellow-400 text-xl mb-2">👥</div>
                        <h3 className="font-bold">Refer Friends</h3>
                        <p className="text-gray-400 text-sm">Earn from referrals</p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-xl">
                        <div className="text-purple-400 text-xl mb-2">🏆</div>
                        <h3 className="font-bold">Leaderboard</h3>
                        <p className="text-gray-400 text-sm">Compete with others</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;
