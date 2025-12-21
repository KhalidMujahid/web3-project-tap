const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    const TapToken = await hre.ethers.getContractFactory("TapToken");
    const tapToken = await TapToken.deploy(
        hre.ethers.utils.parseUnits("1000000", 18)
    );
    await tapToken.deployed();
    console.log("TapToken deployed to:", tapToken.address);

    const TapToEarn = await hre.ethers.getContractFactory("TapToEarn");
    const tapToEarn = await TapToEarn.deploy(tapToken.address);
    await tapToEarn.deployed();
    console.log("TapToEarn deployed to:", tapToEarn.address);

    await tapToken.setGameContract(tapToEarn.address);
    console.log("Game contract set in TapToken");

    await tapToken.transfer(
        tapToEarn.address,
        hre.ethers.utils.parseUnits("100000", 18)
    );
    console.log("Transferred initial rewards to game contract");

    console.log("TapToken:", tapToken.address);
    console.log("TapToEarn:", tapToEarn.address);

    const deploymentInfo = {
        network: hre.network.name,
        tapToken: tapToken.address,
        tapToEarn: tapToEarn.address,
        deployer: deployer.address,
        timestamp: new Date().toISOString()
    };

    require("fs").writeFileSync(
        `deployment-${hre.network.name}.json`,
        JSON.stringify(deploymentInfo, null, 2)
    );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });