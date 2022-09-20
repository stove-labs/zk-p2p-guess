import {
  Field,
  isReady,
  PrivateKey,
  Proof,
  UInt64,
  ZkappPublicInput,
} from 'snarkyjs';
import { Guess } from './guess';
import {
  proveGuess,
  challangeToContract,
  compiledContractToVerificationKeyHash,
  setupLocalMinaBlockchain,
  deploy,
  compiledContractToVerificationKey,
  verify,
} from './helpers';

export type JsonProof = {
  publicInput: string[];
  maxProofsVerified: 0 | 1 | 2;
  proof: string;
};

export type Provable = {
  proof: JsonProof;
  verificationKey: string;
};

/**
 * We need a fixed private key, not a randomly generated one within the test suite.
 * Otherwise the verification key will be different per each private key
 */
const privateKeyJSON = {
  s: '2221840510018593325346886852244642890678926503995097692136933338343303739537',
};

const challenges = [
  // index is the UInt64 challange, value is the verification key's hash for the generated smart contract
  {
    challenge: 99999,
    verificationKey: {
      hash: '15222166407348745997273130127832025587862262899730353976308997754264327652671',
    },
  },
];

class TestProof extends Proof<ZkappPublicInput> {}

TestProof.publicInputType = ZkappPublicInput;

// test everything with multiple challenges
describe.each(challenges)('guess', (challenge) => {
  let zkAppPrivateKey: PrivateKey;

  beforeAll(async () => {
    await isReady;
    console.log('snarkyjs is ready');
    zkAppPrivateKey = PrivateKey.fromJSON(privateKeyJSON)!;
  });

  describe('guessFactory', () => {
    it('should construct a guess smart contract (verification key) based on the provided challange', async () => {
      const { compiledContract } = await challangeToContract(
        zkAppPrivateKey,
        challenge.challenge
      );
      const verificationKeyHash =
        compiledContractToVerificationKeyHash(compiledContract);
      expect(verificationKeyHash).toEqual(challenge.verificationKey.hash);
    });
  });

  describe('Guess', () => {
    describe('guess', () => {
      let feePayer: PrivateKey;
      let contractInstance: Guess;
      let verificationKey: string;

      /**
       * Setup the local Mina blockchain instance in order
       * to be able to access the SnarkyJS transaction proving APIs
       */
      beforeEach(async () => {
        ({ feePayer } = setupLocalMinaBlockchain());
      });

      describe('with compilation', () => {
        beforeEach(async () => {
          const { contract, compiledContract } = await challangeToContract(
            zkAppPrivateKey,
            challenge.challenge
          );
          contractInstance = await deploy(zkAppPrivateKey, feePayer, contract);
          verificationKey = compiledContractToVerificationKey(compiledContract);
        });

        it('should generate a valid proof, if the guess is correct', async () => {
          // guess the correct result to make it pass in this case
          const guess = challenge.challenge;
          const proof = await proveGuess(contractInstance, feePayer, guess);

          const verified = await verify(proof, verificationKey);

          expect(verified).toBeTruthy();
        });
      });
    });
  });
});
