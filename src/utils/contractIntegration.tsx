import {
    BrowserProvider,
    JsonRpcProvider,
    Contract,
    type Signer,
    formatUnits,
} from 'ethers';


export const TAP_TO_EARN_ABI = [
    'function register(string referralCode)',
    'function tap()',
    'function claimDailyReward()',
    'function convertPoints(uint256 points)',
    'function requestWithdrawal(uint256 amount)',
    'function getUserStats(address user) view returns (uint256,uint256,uint256,uint256,uint256,uint256,uint256,string)',
    'function getLeaderboard(uint256 limit) view returns (address[],uint256[],uint256[])',
    'function canClaimDailyReward(address user) view returns (bool)',
    'function getTimeUntilNextClaim(address user) view returns (uint256)',
    'event UserRegistered(address indexed user, string referralCode)',
    'event Tapped(address indexed user, uint256 points, uint256 totalTaps)',
    'event DailyRewardClaimed(address indexed user, uint256 points, uint256 streak)',
    'event PointsConverted(address indexed user, uint256 points, uint256 tokens)',
    'event ReferralRegistered(address indexed referrer, address indexed referred, uint256 bonus)',
] as const;

export const TAP_TOKEN_ABI = [
    'function balanceOf(address account) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function transferFrom(address from, address to, uint256 amount) returns (bool)',
] as const;

export interface UserStats {
    points: number;
    tokens: number;
    totalTaps: number;
    referralPoints: number;
    referralsCount: number;
    dailyClaims: number;
    streak: number;
    referralCode: string;
}

export interface LeaderboardEntry {
    address: string;
    points: number;
    taps: number;
}

export interface EventCallbacks {
    UserRegistered?: (...args: unknown[]) => void;
    Tapped?: (...args: unknown[]) => void;
    DailyRewardClaimed?: (...args: unknown[]) => void;
    PointsConverted?: (...args: unknown[]) => void;
    ReferralRegistered?: (...args: unknown[]) => void;
}


class ContractIntegration {
    private contractAddress: string;
    private tokenAddress: string;
    private provider: BrowserProvider | JsonRpcProvider;

    private signer: Signer | null = null;
    private contract: Contract | null = null;
    private tokenContract: Contract | null = null;

    constructor(
        contractAddress: string,
        tokenAddress: string,
        provider: BrowserProvider | JsonRpcProvider
    ) {
        this.contractAddress = contractAddress;
        this.tokenAddress = tokenAddress;
        this.provider = provider;
    }

    async initialize(signer: Signer): Promise<void> {
        this.signer = signer;

        this.contract = new Contract(
            this.contractAddress,
            TAP_TO_EARN_ABI,
            signer
        );

        this.tokenContract = new Contract(
            this.tokenAddress,
            TAP_TOKEN_ABI,
            signer
        );
    }

    async initializeReadOnly(): Promise<void> {
        this.contract = new Contract(
            this.contractAddress,
            TAP_TO_EARN_ABI,
            this.provider
        );

        this.tokenContract = new Contract(
            this.tokenAddress,
            TAP_TOKEN_ABI,
            this.provider
        );
    }


    async register(referralCode = '') {
        if (!this.contract) throw new Error('Wallet not connected');
        const tx = await this.contract.register(referralCode);
        return tx.wait();
    }

    async tap() {
        if (!this.contract) throw new Error('Wallet not connected');
        const tx = await this.contract.tap();
        return tx.wait();
    }

    async claimDailyReward() {
        if (!this.contract) throw new Error('Wallet not connected');
        const tx = await this.contract.claimDailyReward();
        return tx.wait();
    }

    async convertPoints(points: number | bigint) {
        if (!this.contract) throw new Error('Wallet not connected');
        const tx = await this.contract.convertPoints(points);
        return tx.wait();
    }

    async requestWithdrawal(amount: number | bigint) {
        if (!this.contract) throw new Error('Wallet not connected');
        const tx = await this.contract.requestWithdrawal(amount);
        return tx.wait();
    }

    async getUserStats(userAddress: string): Promise<UserStats> {
        if (!this.contract) throw new Error('Contract not initialized');

        const stats = await this.contract.getUserStats(userAddress);

        return {
            points: Number(stats[0]),
            tokens: Number(stats[1]),
            totalTaps: Number(stats[2]),
            referralPoints: Number(stats[3]),
            referralsCount: Number(stats[4]),
            dailyClaims: Number(stats[5]),
            streak: Number(stats[6]),
            referralCode: stats[7],
        };
    }

    async getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
        if (!this.contract) throw new Error('Contract not initialized');

        const [addresses, points, taps]: [
            string[],
            bigint[],
            bigint[]
        ] = await this.contract.getLeaderboard(limit);

        return addresses.map((address, index) => ({
            address,
            points: Number(points[index]),
            taps: Number(taps[index]),
        }));
    }

    async canClaimDailyReward(userAddress: string): Promise<boolean> {
        if (!this.contract) throw new Error('Contract not initialized');
        return this.contract.canClaimDailyReward(userAddress);
    }

    async getTimeUntilNextClaim(userAddress: string): Promise<number> {
        if (!this.contract) throw new Error('Contract not initialized');
        const time: bigint =
            await this.contract.getTimeUntilNextClaim(userAddress);
        return Number(time);
    }

    async getTokenBalance(userAddress: string): Promise<string> {
        if (!this.tokenContract) throw new Error('Token contract not initialized');
        const balance: bigint =
            await this.tokenContract.balanceOf(userAddress);
        return formatUnits(balance, 18);
    }

    listenToEvents(callbacks: EventCallbacks): () => void {
        if (!this.contract) throw new Error('Contract not initialized');

        const events = [
            'UserRegistered',
            'Tapped',
            'DailyRewardClaimed',
            'PointsConverted',
            'ReferralRegistered',
        ] as const;

        events.forEach((event) => {
            const cb = callbacks[event];
            if (cb) {
                this.contract!.on(event, (...args) => cb(...args));
            }
        });

        return () => {
            events.forEach((event) => {
                this.contract?.removeAllListeners(event);
            });
        };
    }
}

export default ContractIntegration;
