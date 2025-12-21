import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';

const TapGame = () => {
    const {
        points,
        tokens,
        handleTap,
        totalTaps,
        walletAddress,
        isConnected,
        disconnectWallet
    } = useGame();

    const [tapCount, setTapCount] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [multiplier, setMultiplier] = useState(1);
    const [combo, setCombo] = useState(0);
    const [lastTapTime, setLastTapTime] = useState(0);

    useEffect(() => {
        const now = Date.now();
        if (now - lastTapTime < 1000) {
            setCombo((prev: any) => prev + 1);
            if (combo > 0 && combo % 10 === 0) {
                setMultiplier((prev: any) => Math.min(prev + 0.1, 2));
            }
        } else {
            setCombo(0);
            setMultiplier(1);
        }
        setLastTapTime(now);
    }, [tapCount]);

    const handleTapWithAnimation = () => {
        if (!isConnected) {
            window.location.hash = '';
            return;
        }

        setIsAnimating(true);
        handleTap();
        setTapCount((prev: any) => prev + 1);

        const floatingDiv = document.createElement('div');
        floatingDiv.className = 'absolute text-yellow-400 font-bold text-xl animate-bounce';
        floatingDiv.textContent = `+${multiplier.toFixed(1)}`;
        floatingDiv.style.left = `${Math.random() * 200 + 50}px`;
        floatingDiv.style.top = `${Math.random() * 200 + 50}px`;

        const button = document.getElementById('tap-button');
        button?.appendChild(floatingDiv);

        setTimeout(() => {
            floatingDiv.remove();
            setIsAnimating(false);
        }, 1000);
    };

    const formatNumber = (num: any) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">TapCoin</h1>
                    <p className="text-gray-400 text-sm">
                        {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Not connected'}
                    </p>
                </div>
                <button
                    onClick={disconnectWallet}
                    className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                >
                    Disconnect
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="card text-center">
                    <div className="text-gray-400 text-sm mb-1">Points</div>
                    <div className="text-2xl font-bold text-cyan-400">{formatNumber(points)}</div>
                </div>
                <div className="card text-center">
                    <div className="text-gray-400 text-sm mb-1">Tokens</div>
                    <div className="text-2xl font-bold text-green-400">{tokens.toFixed(2)}</div>
                </div>
                <div className="card text-center">
                    <div className="text-gray-400 text-sm mb-1">Total Taps</div>
                    <div className="text-2xl font-bold text-yellow-400">{formatNumber(totalTaps)}</div>
                </div>
            </div>

            {combo > 0 && (
                <div className="text-center mb-4">
                    <div className="inline-block bg-gradient-to-r from-yellow-500 to-orange-500 
                        text-white px-4 py-2 rounded-full animate-pulse">
                        🔥 {combo}x COMBO! {multiplier.toFixed(1)}x MULTIPLIER
                    </div>
                </div>
            )}

            {/* Main Tap Button */}
            <div className="relative flex justify-center items-center my-12">
                <button
                    id="tap-button"
                    onClick={handleTapWithAnimation}
                    disabled={isAnimating}
                    className={`relative w-64 h-64 rounded-full bg-gradient-to-r 
                    from-yellow-500 via-yellow-400 to-yellow-600 
                    shadow-2xl flex items-center justify-center
                    transition-transform duration-150 
                    ${isAnimating ? 'scale-95' : 'hover:scale-105'}
                    active:scale-95`}
                >

                    <div className="absolute inset-0 rounded-full bg-yellow-500/20 animate-ping"></div>

                    <div className="absolute w-56 h-56 rounded-full bg-gradient-to-r 
                        from-yellow-400 to-yellow-500 flex items-center justify-center">


                        <div className={`w-48 h-48 rounded-full bg-gradient-to-r 
                           from-yellow-300 to-yellow-400 flex items-center justify-center
                           ${isAnimating ? 'animate-coin-spin' : ''}`}>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-yellow-800">💰</div>
                                <div className="text-lg font-bold text-yellow-900 mt-2">TAP!</div>
                                <div className="text-sm text-yellow-800">x{multiplier.toFixed(1)}</div>
                            </div>
                        </div>
                    </div>
                </button>
            </div>

            <div className="text-center text-gray-400 mb-8">
                <p className="mb-2">Tap as fast as you can to earn points!</p>
                <p>Combo multiplier increases with rapid taps</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <a href="#dashboard" className="card text-center hover:bg-gray-700 transition">
                    <div className="text-xl mb-2">📊</div>
                    <div className="font-bold">Dashboard</div>
                </a>
                <a href="#daily" className="card text-center hover:bg-gray-700 transition">
                    <div className="text-xl mb-2">🎁</div>
                    <div className="font-bold">Daily</div>
                </a>
                <a href="#referral" className="card text-center hover:bg-gray-700 transition">
                    <div className="text-xl mb-2">👥</div>
                    <div className="font-bold">Referral</div>
                </a>
            </div>
        </div>
    );
};

export default TapGame;