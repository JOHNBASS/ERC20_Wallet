
var bip39 = require('bip39');
// var wallet = require('ethereumjs-wallet');
const { hdkey } = require('ethereumjs-wallet');
const ethers = require('ethers');

(async function createWallet() {
    let seedPhrase = await bip39.generateMnemonic(128);

    let password = "johntest"
    let seed = await bip39.mnemonicToSeed(seedPhrase, password);
    console.log("seedPhrase: " + seedPhrase);

    const hdwallet = await hdkey.fromMasterSeed(seed);
    // from BIP44, HD derivation path is:
    // m / purpose’ / coin_type’ / account’ / change / address_index
    const path = "m/44'/60'/0'/0/0";
    const wallet = await hdwallet.derivePath(path).getWallet();

    console.log("privateKey:" + wallet.getPrivateKeyString());
    console.log("address: " + wallet.getAddressString());

    (async function inputWallet() {
        seedPhrase = "suit resource embrace grass often decline oven prefer monster fly bean burger"
        ethers.utils.isValidMnemonic(seedPhrase)
        console.log("seedPhrase: " + seedPhrase);
        let seed2 = await bip39.mnemonicToSeed(seedPhrase);
        const hdwallet = await hdkey.fromMasterSeed(seed2);
        // from BIP44, HD derivation path is:
        // m / purpose’ / coin_type’ / account’ / change / address_index
        const path = "m/44'/60'/0'/0/0";
        const wallet = await hdwallet.derivePath(path).getWallet();

        console.log("privateKey:" + wallet.getPrivateKeyString());
        console.log("address: " + wallet.getAddressString());
    })();

    //send ETH
    let sendWallet = ethers.Wallet.fromMnemonic(seedPhrase);

    const connection = new ethers.providers.JsonRpcProvider("https://rinkeby.infura.io/v3/b493b4c5bc6f4ef1b5da0fcc6dc2dcb7")
    const gasPrice = connection.getGasPrice();

    const signer = sendWallet.connect(connection);
    const recipientAddress = "0x6702455b91aC1698F3327e7bD452215dB4831DaF";

    const tx = {
        from: sendWallet.address,
        to: recipientAddress,
        value: ethers.utils.parseUnits("0.0002", "ether"),
        gasPrice: gasPrice,
        gasLimit: ethers.utils.hexlify(100000),// 100gwi
        nonce: connection.getTransactionCount(sendWallet.address, 'latest')
    };

    //send eth
    // const transaction = await signer.sendTransaction(tx);
    // console.log("transaction", transaction);

    //send token
    let contractAddress = "0x01BE23585060835E02B77ef475b0Cc51aA1e0709"; //LINK Token

    var erc20_abi = require('./erc20_abi.json');
    let contractAbi = erc20_abi.abi;

    const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
    );

    let sendTokenAmount = "1";
    let tokenDecimal = await contract.decimals();
    console.log("token_decimal:", tokenDecimal);
    let tokenAmount = await ethers.utils.parseUnits(sendTokenAmount, tokenDecimal);
    console.log("token_amount:", tokenAmount);

    // Send tokens transfer時合約不會收到通知，即合約沒辦法知道代幣轉到它身上
    // await contract.transfer(recipientAddress, tokenAmount).then((transferResult) => {
    //     console.dir(transferResult);
    //     console.log("sent token");
    // })

    //transferFrom及approve兩個函式為一個組合 notyet
    let token = await contract.approve(recipientAddress, ethers.utils.parseUnits("5", tokenDecimal));

    let token_tx = await token.wait();
    console.log("get pproved!", token_tx);

    let data = {
        gasLimit: 750000
    }
    await contract.transferFrom(sendWallet.address, recipientAddress, tokenAmount, data).then((transferResult) => {
        console.dir(transferResult);
        console.log("sent token");
    })

    //讀取 Token
    let balance = await contract.balanceOf(sendWallet.address)
    const balanceInEth = ethers.utils.formatEther(balance)
    console.log("LINK Token balance:", balanceInEth)

})();
