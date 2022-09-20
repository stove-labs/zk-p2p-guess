import { PrivateKey, Proof, SmartContract, ZkappPublicInput } from 'snarkyjs';
import { Guess } from './guess';
export declare type CompiledContract = Awaited<ReturnType<typeof SmartContract['compile']>>;
/**
 * Compile a contract from the provided challange. This will
 * include a verification key - which is why we're compiling it
 * in the first place.
 * @param challange
 */
export declare const challangeToContract: (zkAppPrivateKey: PrivateKey, challange: string | number) => Promise<{
    compiledContract: CompiledContract;
    contract: typeof Guess;
}>;
/**
 * Extract the verificationKeyHash from the compiled contract
 * @param param0
 */
export declare const compiledContractToVerificationKeyHash: ({ verificationKey: { hash: verificationKeyHash }, }: CompiledContract) => string;
/**
 * Extract the verificationKey from the compiled contract
 * @param param0
 */
export declare const compiledContractToVerificationKey: ({ verificationKey: { data: verificationKeyHash }, }: CompiledContract) => string;
/**
 * Deploy the provided contract to the local instance of Mina blockchain.
 * Fund a deployment account before deploying the contract as well.
 * @param feePayer
 * @param contract
 */
export declare const deploy: (zkAppPrivateKey: PrivateKey, feePayer: PrivateKey, contract: Awaited<ReturnType<typeof challangeToContract>>['contract']) => Promise<Guess>;
/**
 * Forge a guess transaction to our smart contract that can be proven.
 * @param contractInstance
 * @param feePayer
 * @param guess
 */
export declare const proveGuess: (contractInstance: Awaited<ReturnType<typeof deploy>>, feePayer: PrivateKey, guess: string | number) => Promise<Proof<ZkappPublicInput>>;
export declare const setupLocalMinaBlockchain: () => {
    feePayer: PrivateKey;
};
export declare const verify: (proof: Proof<any>, verificationKey: string) => Promise<boolean>;
