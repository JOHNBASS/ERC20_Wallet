
var bip39 = require('bip39');
// var wallet = require('ethereumjs-wallet');
const { hdkey } = require('ethereumjs-wallet');
const ethers = require('ethers');

(async function createWallet() {
    const seedPhrase = await bip39.generateMnemonic(128);

    let password = "johntest"
    let seed = await bip39.mnemonicToSeed(seedPhrase, password);
    console.log("seedPhrase: " + seedPhrase);

    const hdwallet = await hdkey.fromMasterSeed(seed);
    // from BIP44, HD derivation path is:
    // m / purpose’ / coin_type’ / account’ / change / address_index
    const path = "m/44'/60'/0' / 0 / 0";
    const wallet = await hdwallet.derivePath(path).getWallet();

    console.log("privateKey:" + wallet.getPrivateKeyString());
    console.log("address: " + wallet.getAddressString());

    (async function inputWallet() {
        ethers.utils.isValidMnemonic(seedPhrase)
        console.log("seedPhrase: " + seedPhrase);
        let seed2 = await bip39.mnemonicToSeed(seedPhrase, password);
        const hdwallet = await hdkey.fromMasterSeed(seed2);
        // from BIP44, HD derivation path is:
        // m / purpose’ / coin_type’ / account’ / change / address_index
        const path = "m/44'/60'/0' / 0 / 0";
        const wallet = await hdwallet.derivePath(path).getWallet();

        console.log("privateKey:" + wallet.getPrivateKeyString());
        console.log("address: " + wallet.getAddressString());
    })();

})();
