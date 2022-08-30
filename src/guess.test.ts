import { isReady, PrivateKey } from 'snarkyjs';
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

/**
 * We need a fixed private key, not a randomly generated one within the test suite.
 * Otherwise the verification key will be different per each private key
 */
const privateKeyJSON = {
  s: '2221840510018593325346886852244642890678926503995097692136933338343303739537',
};

const challanges = [
  // index is the UInt64 challange, value is the verification key's hash for the generated smart contract
  [
    0,
    '5064983065865558617133779932891576210495933649940941922395904402173436883713',
  ],
  // [
  //   1,
  //   '25033518649125078980036501060471930965319729381352132443982863685223670160689',
  // ],
];

// test everything with multiple challanges
describe.each(challanges)('guess', (challange, expectedVerificationKeyHash) => {
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
        challange
      );
      const verificationKeyHash =
        compiledContractToVerificationKeyHash(compiledContract);
      expect(verificationKeyHash).toEqual(expectedVerificationKeyHash);
    });
  });

  describe.only('Guess', () => {
    describe('guess', () => {
      let feePayer: PrivateKey;
      let contractInstance: InstanceType<Guess>;
      let verificationKey: string;

      /**
       * Setup the local Mina blockchain instance in order
       * to be able to access the SnarkyJS transaction proving APIs
       */
      beforeEach(async () => {
        ({ feePayer } = setupLocalMinaBlockchain());

        const { contract, compiledContract } = await challangeToContract(
          zkAppPrivateKey,
          challange
        );

        contractInstance = await deploy(zkAppPrivateKey, feePayer, contract);
        verificationKey = compiledContractToVerificationKey(compiledContract);
      });

      it('should generate a valid proof, if the guess is correct', async () => {
        // guess the correct result to make it pass in this case
        const guess = challange;
        const proof = await proveGuess(contractInstance, feePayer, guess);

        const verified = await verify(proof, verificationKey);

        expect(verified).toBeTruthy();
      });
    });
  });
});
