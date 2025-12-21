export const validateAddress = (address: any) => {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
};

export const generateReferralCode = (walletAddress: any) => {
    const hash = walletAddress.slice(2, 10) + walletAddress.slice(-8);
    return `REF-${hash.toUpperCase()}`;
};

export const formatAddress = (address: any) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const mockTransaction = (from: any, to: any, amount: any) => {
    return {
        txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
        from,
        to,
        amount,
        timestamp: new Date().toISOString(),
        status: 'success',
        gasUsed: Math.floor(Math.random() * 100000) + 21000,
    };
};