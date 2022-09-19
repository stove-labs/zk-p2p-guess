import { Poseidon, SmartContract, UInt64, method, Field } from 'snarkyjs';

/**
 * Guess the 'challange' by providing a 'guess'. The challange
 * itself is hashed when the contract is generated, therefore it stays secret
 * throughout the lifetime of the contract.
 */
export class Guess extends SmartContract {
  /**
   * TODO: figure out a way to create a class on the fly so that the
   * challangeHash is not 'global' / static
   */
  public static challangeHash: Field;

  /**
   * Method used to generate a proof of solving/guessing the given challange.
   * The guess itself stays secret, since it's only known to the guessing party.
   * @param guess
   */
  @method guess(guess: UInt64): void {
    // hash the guess
    const guessHash = Poseidon.hash(guess.toFields());
    // compare the guess hash and the challange hash for equality
    guessHash.assertEquals(Guess.challangeHash);
  }
}

/**
 * Create a 'Guess' smart contract with the given 'challange'
 * @param challange
 * @returns Guess
 *
 * TODO: get rid of the 'any' return, defining the class inline causes an error otherwise
 */
export const guessFactory = (challange: UInt64): typeof Guess => {
  // hashed challange to be guessed by the challanged party
  const challangeHash = Poseidon.hash(challange.toFields());
  Guess.challangeHash = challangeHash;

  return Guess;
};

/**
 * Create a 'Guess' smart contract with reconstructed 'state'
 * @param challengeHash
 * @returns Guess
 */
export const guessFactoryFromHash = (challengeHash: string): typeof Guess => {
  Guess.challangeHash = new Field(challengeHash);
  console.log('new Guess from', challengeHash, Guess.challangeHash);
  return Guess;
};
