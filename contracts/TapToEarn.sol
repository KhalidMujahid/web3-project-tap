// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./TapToken.sol";
import "./Ownable.sol";

contract TapToEarn is Ownable {
    uint256 public constant POINTS_PER_TAP = 1;
    uint256 public constant TAP_COOLDOWN = 100;
    uint256 public constant CONVERSION_RATE = 1000;
    uint256 public constant DAILY_BONUS_POINTS = 1000;
    uint256 public constant REFERRAL_BONUS = 500;
    uint256 public constant CLAIM_COOLDOWN = 24 hours;

    TapToken public rewardToken;

    struct User {
        uint256 points;
        uint256 tokens;
        uint256 lastTapTime;
        uint256 lastClaimTime;
        uint256 totalTaps;
        uint256 referralPoints;
        address referrer;
        uint256 referralsCount;
        uint256 dailyClaims;
        uint256 streak;
        bool exists;
    }
    
    struct DailyReward {
        uint256 lastClaimDay;
        uint256 streak;
        bool claimedToday;
    }

    struct Withdrawal {
        address user;
        uint256 amount;
        uint256 timestamp;
        bool processed;
    }
    
    mapping(address => User) public users;
    mapping(address => DailyReward) public dailyRewards;
    mapping(string => address) public referralCodes;
    mapping(address => string) public userReferralCodes;
    mapping(uint256 => Withdrawal) public withdrawals;

    address[] public allUsers;
    
    uint256 public totalPoints;
    uint256 public totalTaps;
    uint256 public totalReferrals;
    uint256 public totalWithdrawals;
    uint256 private withdrawalNonce;
    
    event UserRegistered(address indexed user, string referralCode);
    event Tapped(address indexed user, uint256 points, uint256 totalTaps);
    event PointsConverted(address indexed user, uint256 points, uint256 tokens);
    event DailyRewardClaimed(address indexed user, uint256 points, uint256 streak);
    event ReferralRegistered(address indexed referrer, address indexed referred, uint256 bonus);
    event WithdrawalRequested(address indexed user, uint256 amount, uint256 requestId);
    event WithdrawalProcessed(uint256 requestId, address indexed user, uint256 amount);
    event GameParametersUpdated(uint256 newConversionRate, uint256 newDailyBonus);
    
    modifier userExists(address user) {
        require(users[user].exists, "User not registered");
        _;
    }
    
    modifier notRegistered() {
        require(!users[msg.sender].exists, "Already registered");
        _;
    }
    
    constructor(address _rewardToken) {
        rewardToken = TapToken(_rewardToken);
    }
    
    function register(string calldata referralCode) external notRegistered {
        users[msg.sender] = User({
            points: 100,
            tokens: 0,
            lastTapTime: 0,
            lastClaimTime: 0,
            totalTaps: 0,
            referralPoints: 0,
            referrer: address(0),
            referralsCount: 0,
            dailyClaims: 0,
            streak: 0,
            exists: true
        });
        
        string memory newUserCode = _generateReferralCode(msg.sender);
        userReferralCodes[msg.sender] = newUserCode;
        referralCodes[newUserCode] = msg.sender;
        
        allUsers.push(msg.sender);

        if (bytes(referralCode).length > 0 && referralCodes[referralCode] != address(0)) {
            address referrer = referralCodes[referralCode];
            require(referrer != msg.sender, "Cannot refer yourself");
            
            users[msg.sender].referrer = referrer;
            users[referrer].referralsCount++;
            totalReferrals++;
            
            users[msg.sender].points += REFERRAL_BONUS;
            users[referrer].points += REFERRAL_BONUS;
            users[referrer].referralPoints += REFERRAL_BONUS;
            
            emit ReferralRegistered(referrer, msg.sender, REFERRAL_BONUS);
        }
        
        emit UserRegistered(msg.sender, newUserCode);
    }

    function tap() external userExists(msg.sender) {
        User storage user = users[msg.sender];
        

        require(
            block.timestamp >= user.lastTapTime + TAP_COOLDOWN,
            "Tap cooldown active"
        );
        

        uint256 points = POINTS_PER_TAP;
        if (_random(100) < 5) {
            points = 10;
        }
 
        user.points += points;
        user.totalTaps++;
        user.lastTapTime = block.timestamp;

        totalPoints += points;
        totalTaps++;
        
        emit Tapped(msg.sender, points, user.totalTaps);
    }
    
    function claimDailyReward() external userExists(msg.sender) {
        DailyReward storage reward = dailyRewards[msg.sender];
        User storage user = users[msg.sender];
        
        uint256 currentDay = block.timestamp / 1 days;
        
        require(!reward.claimedToday || reward.lastClaimDay < currentDay, "Already claimed today");
        
        if (reward.lastClaimDay == currentDay - 1) {
            reward.streak++;
        } else if (reward.lastClaimDay < currentDay - 1) {
            reward.streak = 1;
        }

        uint256 bonusMultiplier = 1;
        if (reward.streak >= 7) {
            bonusMultiplier = 2;
        } else if (reward.streak >= 3) {
            bonusMultiplier = 15; 
        }
        
        uint256 rewardPoints = (DAILY_BONUS_POINTS * bonusMultiplier) / 10;
        
        user.points += rewardPoints;
        user.dailyClaims++;
        user.streak = reward.streak;
        
        reward.lastClaimDay = currentDay;
        reward.claimedToday = true;
        reward.streak = reward.streak;
        
        totalPoints += rewardPoints;
        
        emit DailyRewardClaimed(msg.sender, rewardPoints, reward.streak);
    }
    
    /**
     * @dev Convert points to tokens
     * @param points Amount of points to convert
     */
    function convertPoints(uint256 points) external userExists(msg.sender) {
        User storage user = users[msg.sender];
        
        require(points > 0, "Points must be greater than 0");
        require(user.points >= points, "Insufficient points");
        require(points >= CONVERSION_RATE, "Minimum conversion not met");
        
        uint256 tokens = points / CONVERSION_RATE;
        uint256 pointsUsed = tokens * CONVERSION_RATE;
        
        user.points -= pointsUsed;
        user.tokens += tokens;
        
        rewardToken.mint(msg.sender, tokens);
        
        emit PointsConverted(msg.sender, pointsUsed, tokens);
    }
    
    function requestWithdrawal(uint256 amount) external userExists(msg.sender) {
        User storage user = users[msg.sender];
        
        require(amount > 0, "Amount must be greater than 0");
        require(user.tokens >= amount, "Insufficient tokens");

        user.tokens -= amount;
        rewardToken.burn(msg.sender, amount);
        
        uint256 requestId = withdrawalNonce++;
        withdrawals[requestId] = Withdrawal({
            user: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            processed: false
        });
        
        totalWithdrawals += amount;
        
        emit WithdrawalRequested(msg.sender, amount, requestId);
    }
    

    function processWithdrawal(uint256 requestId) external onlyOwner {
        Withdrawal storage withdrawal = withdrawals[requestId];
        
        require(!withdrawal.processed, "Already processed");
        require(withdrawal.user != address(0), "Invalid request");
        
        rewardToken.mint(withdrawal.user, withdrawal.amount);
        
        withdrawal.processed = true;
        
        emit WithdrawalProcessed(requestId, withdrawal.user, withdrawal.amount);
    }
    
    function getUserStats(address user) external view returns (
        uint256 points,
        uint256 tokens,
        uint256 totalTaps,
        uint256 referralPoints,
        uint256 referralsCount,
        uint256 dailyClaims,
        uint256 streak,
        string memory referralCode
    ) {
        User storage u = users[user];
        require(u.exists, "User not found");
        
        return (
            u.points,
            u.tokens,
            u.totalTaps,
            u.referralPoints,
            u.referralsCount,
            u.dailyClaims,
            u.streak,
            userReferralCodes[user]
        );
    }
    
    function getLeaderboard(uint256 limit) external view returns (
        address[] memory,
        uint256[] memory,
        uint256[] memory
    ) {
        uint256 userCount = allUsers.length;
        uint256 resultCount = limit < userCount ? limit : userCount;
        
        address[] memory topUsers = new address[](resultCount);
        uint256[] memory topPoints = new uint256[](resultCount);
        uint256[] memory topTaps = new uint256[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            address currentUser = allUsers[i];
            uint256 currentPoints = users[currentUser].points;
            
            for (uint256 j = i + 1; j < userCount; j++) {
                address compareUser = allUsers[j];
                uint256 comparePoints = users[compareUser].points;
                
                if (comparePoints > currentPoints) {
                    allUsers[i] = compareUser;
                    allUsers[j] = currentUser;
                    currentUser = compareUser;
                    currentPoints = comparePoints;
                }
            }
            
            topUsers[i] = currentUser;
            topPoints[i] = currentPoints;
            topTaps[i] = users[currentUser].totalTaps;
        }
        
        return (topUsers, topPoints, topTaps);
    }
    

    function getUserWithdrawals(address user) external view returns (
        uint256[] memory,
        uint256[] memory,
        uint256[] memory,
        bool[] memory
    ) {
        uint256 count = 0;

        for (uint256 i = 0; i < withdrawalNonce; i++) {
            if (withdrawals[i].user == user) {
                count++;
            }
        }
        
        uint256[] memory ids = new uint256[](count);
        uint256[] memory amounts = new uint256[](count);
        uint256[] memory timestamps = new uint256[](count);
        bool[] memory processed = new bool[](count);
        
        uint256 index = 0;
        for (uint256 i = 0; i < withdrawalNonce; i++) {
            if (withdrawals[i].user == user) {
                ids[index] = i;
                amounts[index] = withdrawals[i].amount;
                timestamps[index] = withdrawals[i].timestamp;
                processed[index] = withdrawals[i].processed;
                index++;
            }
        }
        
        return (ids, amounts, timestamps, processed);
    }

    function updateGameParameters(uint256 newConversionRate, uint256 newDailyBonus) external onlyOwner {
        require(newConversionRate > 0, "Invalid conversion rate");
        require(newDailyBonus > 0, "Invalid daily bonus");
        
        CONVERSION_RATE = newConversionRate;
        DAILY_BONUS_POINTS = newDailyBonus;
        
        emit GameParametersUpdated(newConversionRate, newDailyBonus);
    }
    

    function _generateReferralCode(address user) internal pure returns (string memory) {
        bytes32 hash = keccak256(abi.encodePacked(user));
        bytes memory codeBytes = new bytes(8);
        
        for (uint256 i = 0; i < 8; i++) {
            uint8 byteValue = uint8(hash[i]);
            codeBytes[i] = byteValue < 26 ? bytes1(byteValue + 65) :
                          byteValue < 52 ? bytes1(byteValue + 71) :
                          bytes1((byteValue % 10) + 48); 
        }
        
        return string(abi.encodePacked("TAP-", string(codeBytes)));
    }
    

    function _random(uint256 max) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % max;
    }
    

    function canClaimDailyReward(address user) external view returns (bool) {
        DailyReward storage reward = dailyRewards[user];
        uint256 currentDay = block.timestamp / 1 days;
        return !reward.claimedToday || reward.lastClaimDay < currentDay;
    }

    function getTimeUntilNextClaim(address user) external view returns (uint256) {
        DailyReward storage reward = dailyRewards[user];
        uint256 currentDay = block.timestamp / 1 days;
        
        if (reward.lastClaimDay < currentDay) {
            return 0;
        }
        
        uint256 nextClaimTime = (reward.lastClaimDay + 1) * 1 days;
        return nextClaimTime > block.timestamp ? nextClaimTime - block.timestamp : 0;
    }
    
    function emergencyPause(bool pause) external onlyOwner {
        if (pause) {
            CONVERSION_RATE = 0;
        } else {
            CONVERSION_RATE = 1000;
        }
    }

    function withdrawExcessTokens(address tokenAddress, uint256 amount) external onlyOwner {
        IERC20 token = IERC20(tokenAddress);
        require(token.transfer(msg.sender, amount), "Transfer failed");
    }
}