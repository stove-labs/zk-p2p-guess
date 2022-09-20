var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Poseidon, SmartContract, UInt64, method, Field } from 'snarkyjs';
/**
 * Guess the 'challange' by providing a 'guess'. The challange
 * itself is hashed when the contract is generated, therefore it stays secret
 * throughout the lifetime of the contract.
 */
export class Guess extends SmartContract {
    /**
     * Method used to generate a proof of solving/guessing the given challange.
     * The guess itself stays secret, since it's only known to the guessing party.
     * @param guess
     */
    guess(guess) {
        // hash the guess
        const guessHash = Poseidon.hash(guess.toFields());
        // compare the guess hash and the challange hash for equality
        guessHash.assertEquals(Guess.challangeHash);
    }
}
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UInt64]),
    __metadata("design:returntype", void 0)
], Guess.prototype, "guess", null);
/**
 * Create a 'Guess' smart contract with the given 'challange'
 * @param challange
 * @returns Guess
 *
 * TODO: get rid of the 'any' return, defining the class inline causes an error otherwise
 */
export const guessFactory = (challange) => {
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
export const guessFactoryFromHash = (challengeHash) => {
    Guess.challangeHash = new Field(challengeHash);
    console.log('new Guess from', challengeHash, Guess.challangeHash);
    return Guess;
};
