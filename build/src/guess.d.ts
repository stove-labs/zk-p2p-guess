import { SmartContract, UInt64, Field } from 'snarkyjs';
/**
 * Guess the 'challange' by providing a 'guess'. The challange
 * itself is hashed when the contract is generated, therefore it stays secret
 * throughout the lifetime of the contract.
 */
export declare class Guess extends SmartContract {
    /**
     * TODO: figure out a way to create a class on the fly so that the
     * challangeHash is not 'global' / static
     */
    static challangeHash: Field;
    /**
     * Method used to generate a proof of solving/guessing the given challange.
     * The guess itself stays secret, since it's only known to the guessing party.
     * @param guess
     */
    guess(guess: UInt64): void;
}
/**
 * Create a 'Guess' smart contract with the given 'challange'
 * @param challange
 *
 * TODO: get rid of the 'any' return, defining the class inline causes an error otherwise
 */
export declare const guessFactory: (challange: UInt64) => typeof Guess;
