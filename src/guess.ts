import { Poseidon, SmartContract, UInt64, method } from 'snarkyjs';

/**
 * Create a 'Guess' smart contract with the given 'challange'
 * @param challange
 *
 * TODO: get rid of the 'any' return, defining the class inline causes an error otherwise
 */
export const guessFactory = (challange: UInt64): any => {
  // hashed challange to be guessed by the challanged party
  const challangeHash = Poseidon.hash(challange.toFields());

  /**
   * Guess the 'challange' by providing a 'guess'. The challange
   * itself is hashed when the contract is generated, therefore it stays secret
   * throughout the lifetime of the contract.
   */
  class Guess extends SmartContract {
    /**
     * Method used to generate a proof of solving/guessing the given challange.
     * The guess itself stays secret, since it's only known to the guessing party.
     * @param guess
     */
    @method guess(guess: UInt64): void {
      // hash the guess
      const guessHash = Poseidon.hash(guess.toFields());
      // compare the guess hash and the challange hash for equality
      guessHash.assertEquals(challangeHash);
    }
  }

  return { Guess };
};

export type Guess = ReturnType<typeof guessFactory>['Guess'];
