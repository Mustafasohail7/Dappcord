const { expect } = require("chai")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("Dappcord", function () {

  let dappcord
  let deployer,user
  const Name = "Dappcord"
  const Symbol = "DAPP"

  beforeEach( async() => {
    [deployer,user] = await ethers.getSigners()
    const Dappcord = await ethers.getContractFactory("Dappcord")
    dappcord = await Dappcord.deploy(Name,Symbol)

    const transaction = await dappcord.connect(deployer).createChannel("general",tokens(1))
    await transaction.wait()
  } )

  describe("Deployment", function() {
    it("Sets the name", async () => {
      let result = await dappcord.name()
      expect(result).to.equal(Name) 
    })

    it("Sets the Symbol", async () => {
      let result = await dappcord.symbol()
      expect(result).to.equal(Symbol)
    })

    it("Sets the owner", async() => {
      let result = await dappcord.owner()
      expect(result).to.equal(deployer.address)
    })
  })

  describe("Creating Channels", function() {  
    it("Returns total channels", async() =>{
      let result = await dappcord.channelCount()
      expect(result).to.equal(1)
    })

    it("Returns channel attributes", async() => {
      let channel = await dappcord.getChannel(1)
      expect(channel.id).to.equal(1)
      expect(channel.name).to.equal("general")
      expect(channel.cost).to.equal(tokens(1))
    })
  })

  describe("Joining Channels", function() {
    const ID = 1
    const Amount = ethers.utils.parseUnits("1",'ether')

    beforeEach( async() => {
      const transaction = await dappcord.connect(user).mint(ID,{value:Amount})
      await transaction.wait()
    })

    it("Joins the user", async()=>{
      let result = await dappcord.hasJoined(ID,user.address)
      expect(result).to.equal(true)
    })

    it("Increases total supply", async()=>{
      let result = await dappcord.totalSupply()
      expect(result).to.equal(ID)
    })

    it("Updates the contract balance",async()=>{
      let result = await ethers.provider.getBalance(dappcord.address)
      expect(result).to.equal(Amount)
    })

  })

  describe("Withdrawing", function() {
    const ID = 1
    const Amount = ethers.utils.parseUnits("10",'ether')
    let balanceBefore

    beforeEach( async() => {
      balanceBefore = await ethers.provider.getBalance(deployer.address)
      let transaction = await dappcord.connect(user).mint(ID,{value:Amount})
      await transaction.wait()

      transaction = await dappcord.connect(deployer).withdraw()
      await transaction.wait()
    })

    it("Updates the owner balanace", async() => {
      let balanceAfter = await ethers.provider.getBalance(deployer.address)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })

    it("Updates the contract balance", async() =>{
      let result = await ethers.provider.getBalance(dappcord.address)
      expect(result).to.equal(0)
    })

  })

})
