import { Mina, AccountUpdate, UInt64, verify as snarkyVerify, } from 'snarkyjs';
import { guessFactory, guessFactoryFromHash } from './guess';
/**
 * Compile a contract from the provided challange. This will
 * include a verification key - which is why we're compiling it
 * in the first place.
 * @param challange
 */
export const challangeToContract = async (zkAppPrivateKey, challange) => {
    const contract = guessFactory(new UInt64(challange));
    console.log('compiling');
    const compiledContract = await contract.compile();
    return {
        contract,
        compiledContract,
    };
};
export const challangeHashToContract = async (zkAppPrivateKey, challangeHash) => {
    const contract = guessFactoryFromHash(challangeHash);
    console.log('compiling');
    const compiledContract = await contract.compile();
    return {
        contract,
        compiledContract,
    };
};
/**
 * Extract the verificationKeyHash from the compiled contract
 * @param param0
 */
export const compiledContractToVerificationKeyHash = ({ verificationKey: { hash: verificationKeyHash }, }) => verificationKeyHash;
/**
 * Extract the verificationKey from the compiled contract
 * @param param0
 */
export const compiledContractToVerificationKey = ({ verificationKey: { data: verificationKeyHash }, }) => verificationKeyHash;
/**
 * Deploy the provided contract to the local instance of Mina blockchain.
 * Fund a deployment account before deploying the contract as well.
 * @param feePayer
 * @param contract
 */
export const deploy = async (zkAppPrivateKey, feePayer, contract) => {
    const contractInstance = new contract(zkAppPrivateKey.toPublicKey());
    console.log('deploying');
    const tx = await Mina.transaction(feePayer, () => {
        // TODO: extract funding to beforeEach
        AccountUpdate.fundNewAccount(feePayer);
        contractInstance.deploy({ zkappKey: zkAppPrivateKey });
    });
    tx.send();
    return contractInstance;
};
/**
 * Forge a guess transaction to our smart contract that can be proven.
 * @param contractInstance
 * @param feePayer
 * @param guess
 */
export const proveGuess = async (contractInstance, feePayer, guess) => {
    const tx = await Mina.transaction(feePayer, () => {
        contractInstance.guess(new UInt64(guess));
    });
    // TODO: figure out why is there an array?
    const proof = (await tx.prove())[0];
    if (!proof)
        throw new Error('No proof found');
    return proof;
};
export const setupLocalMinaBlockchain = () => {
    console.log('setting up local blockchain');
    const localInstance = Mina.LocalBlockchain();
    Mina.setActiveInstance(localInstance);
    const feePayer = localInstance.testAccounts[0].privateKey;
    return { feePayer };
};
export const verify = (proof, verificationKey) => {
    console.log('verifying');
    return snarkyVerify(proof, verificationKey);
};
