import {
  Mina,
  Party,
  PrivateKey,
  Proof,
  SmartContract,
  UInt64,
  ZkappPublicInput,
  verify as snarkyVerify,
} from 'snarkyjs';
import { guessFactory } from './guess.js';
import type { Guess } from './guess.js';

// TODO: extract this type from snarkyjs directly
export type CompiledContract = Awaited<
  ReturnType<typeof SmartContract['compile']>
>;

/**
 * Compile a contract from the provided challange. This will
 * include a verification key - which is why we're compiling it
 * in the first place.
 * @param challange
 */
export const challangeToContract = async (
  zkAppPrivateKey: PrivateKey,
  challange: string | number
): Promise<{
  compiledContract: CompiledContract;
  contract: Guess;
}> => {
  const { Guess: contract } = guessFactory(new UInt64(challange));
  console.log('compiling');
  const compiledContract = await contract.compile(
    zkAppPrivateKey.toPublicKey()
  );
  return {
    contract,
    compiledContract,
  };
};

/**
 * Extract the verificationKeyHash from the compiled contract
 * @param param0
 */
export const compiledContractToVerificationKeyHash = ({
  verificationKey: { hash: verificationKeyHash },
}: CompiledContract): string => verificationKeyHash;

/**
 * Extract the verificationKey from the compiled contract
 * @param param0
 */
export const compiledContractToVerificationKey = ({
  verificationKey: { data: verificationKeyHash },
}: CompiledContract): string => verificationKeyHash;

/**
 * Deploy the provided contract to the local instance of Mina blockchain.
 * Fund a deployment account before deploying the contract as well.
 * @param feePayer
 * @param contract
 */
export const deploy = async (
  zkAppPrivateKey: PrivateKey,
  feePayer: PrivateKey,
  contract: Awaited<ReturnType<typeof challangeToContract>>['contract']
): Promise<InstanceType<Guess>> => {
  const contractInstance = new contract(zkAppPrivateKey.toPublicKey());

  console.log('deploying');
  const tx = await Mina.transaction(feePayer, () => {
    // TODO: extract funding to beforeEach
    Party.fundNewAccount(feePayer);
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
export const proveGuess = async (
  contractInstance: Awaited<ReturnType<typeof deploy>>,
  feePayer: PrivateKey,
  guess: string | number
): Promise<Proof<ZkappPublicInput>> => {
  const tx = await Mina.transaction(feePayer, () => {
    contractInstance.guess(new UInt64(guess));
  });

  console.log('proving');
  // TODO: figure out why is there an array?
  const proof = (await tx.prove())[0];
  if (!proof) throw new Error('No proof found');

  return proof;
};

export const setupLocalMinaBlockchain = () => {
  console.log('setting up local blockchain');
  const localInstance = Mina.LocalBlockchain();
  Mina.setActiveInstance(localInstance);
  const feePayer = localInstance.testAccounts[0].privateKey;
  return { feePayer };
};

export const verify = (
  proof: Proof<any>,
  verificationKey: string
): Promise<boolean> => {
  console.log('verifying');
  return snarkyVerify(proof, verificationKey);
};
