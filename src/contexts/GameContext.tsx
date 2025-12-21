import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from 'react';
import toast from 'react-hot-toast';
import {
    CONVERSION_RATE,
    DAILY_BONUS_POINTS,
    POINTS_PER_TAP,
    TAP_LIMIT_PER_SECOND,
} from '../consts/conts';
import {
    generateReferralCode,
    validateAddress,
} from '../utils/walletUtils';
import type { GameContextType, GameState } from '../interfaces/interface';


const GameContext = createContext<GameContextType | null>(null);

export const GameProvider = ({ children }: { children: any }) => {
    const [gameState, setGameState] = useState<GameState>({
        points: 0,
        tokens: 0,
        walletAddress: '',
        isConnected: false,
        referralCode: '',
        referredUsers: [],
        referralPoints: 0,
        lastTapTime: 0,
        dailyRewardClaimed: false,
        lastDailyReward: null,
        totalTaps: 0,
        withdrawals: [],
    });

    useEffect(() => {
        const savedState = localStorage.getItem('tapToEarnState');
        if (savedState) {
            setGameState((prev) => ({ ...prev, ...JSON.parse(savedState) }));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('tapToEarnState', JSON.stringify(gameState));
    }, [gameState]);

    useEffect(() => {
        if (gameState.walletAddress && !gameState.referralCode) {
            const code = generateReferralCode(gameState.walletAddress);
            setGameState((prev) => ({ ...prev, referralCode: code }));
        }
    }, [gameState.walletAddress, gameState.referralCode]);

    const checkDailyReward = useCallback(() => {
        const today = new Date().toDateString();
        if (gameState.lastDailyReward !== today) {
            setGameState((prev) => ({
                ...prev,
                dailyRewardClaimed: false,
            }));
        }
    }, [gameState.lastDailyReward]);

    useEffect(() => {
        checkDailyReward();
        const interval = setInterval(checkDailyReward, 60000);
        return () => clearInterval(interval);
    }, [checkDailyReward]);


    const connectWallet = (address: string): boolean => {
        if (!validateAddress(address)) {
            toast.error('Invalid wallet address format');
            return false;
        }

        setGameState((prev) => ({
            ...prev,
            walletAddress: address,
            isConnected: true,
        }));

        toast.success('Wallet connected');
        return true;
    };

    const disconnectWallet = () => {
        setGameState((prev) => ({
            ...prev,
            walletAddress: '',
            isConnected: false,
        }));
        toast.success('Wallet disconnected');
    };

    const handleTap = () => {
        const now = Date.now();
        const timeSinceLastTap = now - gameState.lastTapTime;

        if (timeSinceLastTap < 1000 / TAP_LIMIT_PER_SECOND) {
            toast.error('Tap too fast! Slow down.');
            return;
        }

        const tapBonus = Math.random() > 0.95 ? 10 : POINTS_PER_TAP;

        setGameState((prev) => ({
            ...prev,
            points: prev.points + tapBonus,
            totalTaps: prev.totalTaps + 1,
            lastTapTime: now,
        }));

        if (tapBonus > POINTS_PER_TAP) {
            toast.success(`Lucky tap! +${tapBonus} points`);
        }
    };

    const claimDailyReward = () => {
        const today = new Date().toDateString();

        if (gameState.dailyRewardClaimed && gameState.lastDailyReward === today) {
            toast.error('Daily reward already claimed');
            return;
        }

        setGameState((prev) => ({
            ...prev,
            points: prev.points + DAILY_BONUS_POINTS,
            dailyRewardClaimed: true,
            lastDailyReward: today,
        }));

        toast.success(`+${DAILY_BONUS_POINTS} daily bonus`);
    };

    const convertPointsToTokens = () => {
        if (gameState.points < CONVERSION_RATE) {
            toast.error(`Need ${CONVERSION_RATE} points`);
            return;
        }

        const tokens = Math.floor(gameState.points / CONVERSION_RATE);
        const remainder = gameState.points % CONVERSION_RATE;

        setGameState((prev) => ({
            ...prev,
            points: remainder,
            tokens: prev.tokens + tokens,
        }));

        toast.success(`Converted to ${tokens} tokens`);
    };

    const simulateWithdrawal = (
        address: string,
        amount: number
    ): boolean => {
        if (!validateAddress(address)) {
            toast.error('Invalid address');
            return false;
        }

        if (amount <= 0 || amount > gameState.tokens) {
            toast.error('Invalid amount');
            return false;
        }

        setGameState((prev) => ({
            ...prev,
            tokens: prev.tokens - amount,
            withdrawals: [
                ...prev.withdrawals,
                {
                    address,
                    amount,
                    timestamp: new Date().toISOString(),
                    txHash: `0x${crypto.randomUUID().replace(/-/g, '')}`,
                },
            ],
        }));

        toast.success('Withdrawal simulated');
        return true;
    };

    const handleReferral = (referralCode: string): boolean => {
        if (!gameState.isConnected) {
            toast.error('Connect wallet first');
            return false;
        }

        if (referralCode === gameState.referralCode) {
            toast.error("Can't refer yourself");
            return false;
        }

        const bonus = 500;

        setGameState((prev) => ({
            ...prev,
            referralPoints: prev.referralPoints + bonus,
            points: prev.points + bonus,
        }));

        toast.success(`Referral bonus +${bonus}`);
        return true;
    };

    const addReferredUser = (userAddress: string) => {
        if (!gameState.referredUsers.includes(userAddress)) {
            setGameState((prev) => ({
                ...prev,
                referredUsers: [...prev.referredUsers, userAddress],
                points: prev.points + 1000,
            }));
            toast.success('New referral +1000');
        }
    };

    const resetGame = () => {
        localStorage.removeItem('tapToEarnState');
        setGameState({
            points: 0,
            tokens: 0,
            walletAddress: '',
            isConnected: false,
            referralCode: '',
            referredUsers: [],
            referralPoints: 0,
            lastTapTime: 0,
            dailyRewardClaimed: false,
            lastDailyReward: null,
            totalTaps: 0,
            withdrawals: [],
        });
        toast.success('Game reset');
    };

    return (
        <GameContext.Provider
            value={{
                ...gameState,
                connectWallet,
                disconnectWallet,
                handleTap,
                claimDailyReward,
                convertPointsToTokens,
                simulateWithdrawal,
                handleReferral,
                addReferredUser,
                resetGame,
                POINTS_PER_TAP,
                CONVERSION_RATE,
                DAILY_BONUS_POINTS,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};


export const useGame = (): GameContextType => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('use Game must be used within Game Provider');
    }
    return context;
};
