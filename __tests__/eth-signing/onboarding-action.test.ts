import Web3 from 'web3';

import { SignOnboardingAction } from '../../src/eth-signing';
import { SigningMethod } from '../../src/types';

let localSigner: SignOnboardingAction;
let localAccountAddress: string;
let remoteSigner: SignOnboardingAction;
let remoteAccountAddress: string;

describe('SignOnboardingAction', () => {

  describe('without a web3 provider', () => {

    beforeAll(() => {
      const web3 = new Web3();
      localSigner = new SignOnboardingAction(web3, 1);
      localAccountAddress = web3.eth.accounts.wallet.create(1)[0].address;
    });

    it('signs and verifies using SigningMethod.Hash', async () => {
      const signature = await localSigner.sign(
        localAccountAddress,
        SigningMethod.Hash,
      );
      expect(
        localSigner.verify(
          signature,
          localAccountAddress,
        ),
      ).toBe(true);
    });

    it('rejects an invalid signature', async () => {
      const signature = await localSigner.sign(
        localAccountAddress,
        SigningMethod.Hash,
      );

      // Change the last character.
      const lastChar = signature.charAt(signature.length - 1);
      const newLastChar = lastChar === '0' ? '1' : '0';
      const invalidSignature = `${signature.slice(0, signature.length - 1)}${newLastChar}`;

      expect(
        localSigner.verify(
          invalidSignature,
          localAccountAddress,
        ),
      ).toBe(false);
    });
  });

  describe('with a web3 provider', () => {

    beforeAll(async () => {
      const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
      remoteSigner = new SignOnboardingAction(web3, 1);
      remoteAccountAddress = (await web3.eth.getAccounts())[0];
    });

    it('signs and verifies using SigningMethod.Hash', async () => {
      const signature = await localSigner.sign(
        localAccountAddress,
        SigningMethod.Hash,
      );
      expect(
        localSigner.verify(
          signature,
          localAccountAddress,
        ),
      ).toBe(true);
    });

    it('signs and verifies using SigningMethod.TypedData', async () => {
      const signature = await remoteSigner.sign(
        remoteAccountAddress,
        SigningMethod.TypedData,
      );
      expect(
        remoteSigner.verify(
          signature,
          remoteAccountAddress,
        ),
      ).toBe(true);
    });
  });
});
