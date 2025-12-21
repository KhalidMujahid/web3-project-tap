export interface Withdrawal {
    address: string;
    amount: number;
    timestamp: string;
    txHash: string;
}

export interface GameState {
    points: number;
    tokens: number;
    walletAddress: string;
    isConnected: boolean;
    referralCode: string;
    referredUsers: string[];
    referralPoints: number;
    lastTapTime: number;
    dailyRewardClaimed: boolean;
    lastDailyReward: string | null;
    totalTaps: number;
    withdrawals: Withdrawal[];
}

export interface GameContextType extends GameState {
    connectWallet: (address: string) => boolean;
    disconnectWallet: () => void;
    handleTap: () => void;
    claimDailyReward: () => void;
    convertPointsToTokens: () => void;
    simulateWithdrawal: (address: string, amount: number) => boolean;
    handleReferral: (referralCode: string) => boolean;
    addReferredUser: (userAddress: string) => void;
    resetGame: () => void;
    POINTS_PER_TAP: number;
    CONVERSION_RATE: number;
    DAILY_BONUS_POINTS: number;
}
