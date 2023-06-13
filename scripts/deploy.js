const hre = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {

  const [deployer] = await ethers.getSigners()
  const Name = "Dappcord"
  const Symbol = "Dapp"

  const Dappcord = await ethers.getContractFactory("Dappcord")
  const dappcord = await Dappcord.deploy(Name,Symbol)
  await dappcord.deployed()

  console.log(`Deployed Dappcord contract at: ${dappcord.address}\n`)

  const channel_names = ["general","intro","job"]
  const costs = [tokens(1),tokens(0),tokens(0.25)]

  for (var i=0;i<3;i++){
    let transaction = await dappcord.connect(deployer).createChannel(channel_names[i],costs[i])
    await transaction.wait()

    console.log(`Created text channel #${channel_names[i]}\n`)
  }

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});