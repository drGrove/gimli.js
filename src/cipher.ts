import * as assert from 'assert';
import * as crypto from 'crypto';
import { State } from './state';

/**
 * Class for AEAD (Authenticated Encryption with Associated Data)
 */
export class AEAD {
  /**
   * Initialize gimli state
   * @param ad - Associated Data
   * @param npub - Public nonce
   * @param k - private key
   */
  public static init(ad: Uint8Array, npub: Uint8Array, k: Uint8Array): State {
    let state = new State();
    const buf = state.toSlice();
    // Gimli-Cipher initializes a 48-byte Gimli state to a 16-byte nonce
    // followed by a 32-byte key
    assert(npub.length + k.length == State.BLOCKBYTES);
    buf.set(npub, 0);
    buf.set(k, npub.length);

    // It then applies the Gimli permutation.
    state.permute();

    {
      // Gimli-Cipher then handles each block of associated data, including
      // exactly one final non-full block, in the same way as Gimli-Hash.
      let data = ad;

      for(; data.length >= State.RATE; data = data.subarray(State.RATE)) {
        for(let i = 0; i < State.RATE; i++) {
          buf[i] ^= data[i];
        }
        state.permute();
      }

      for(let i = 0; i < data.length; i++) {
        buf[i] ^= data[i];
      }

      // XOR 1 into the next bye of the state
      buf[data.length] ^= 1;

      // XOR 1 into the last byte of the state, position 47.
      buf[buf.length - 1] ^= 1;

      state.permute();
    }

    return state;
  }

  /**
   * Encrypt message
   * @param c ciphertext: output buffer should be of size m.len
   * @param tag authentication tag: output MAC
   * @param m message
   * @param ad Associated Data
   * @param npub public nonce
   * @param k private key
   */
  public static encrypt(c: Uint8Array, tag: Uint8Array, m: Uint8Array, ad: Uint8Array, npub: Uint8Array, k: Uint8Array): void {
    console.assert(c.length == m.length);

    var state = AEAD.init(ad, npub, k);
    const buf = state.toSlice();

    // Gimli-Cipher then handles each block of plaintext, including exactly one
    // final non-full block, in the same way as Gimli-Hash. Whenever a plantext
    // byte is XORed into a state byte, the new state byte is output as
    // ciphertext.
    let input = m;
    let out = c;
    for(; input.length >= State.RATE; input = input.subarray(State.RATE), out = out.subarray(State.RATE)) {
      for(let i = 0; i < State.RATE; i++) {
        buf[i] ^= input[i];
      }
      out.set(buf.subarray(0, State.RATE), 0);
      state.permute()
    }
    for(let i = 0; i < input.length; i++) {
      buf[i] ^= input[i];
      out[i] = buf[i];
    }

    // XOR 1 into the next byte of the state
    buf[input.length] ^= 1;

    // XOR 1 into the last byte of the state, position 47.
    buf[buf.length - 1] ^= 1;

    state.permute();

    // After the final non-full block of plaintext, the first 16 bytes of the
    // state are output as an authentication tag.
    tag.set(buf.subarray(0, State.RATE), 0);
  }

  /**
   * Decrypt Message
   * @param m message: output buffer should be the size of c.length
   * @param c ciphertext
   * @param tag authentication tag
   * @param npub public nonce
   * @param k private key
   */
  public static decrypt(m: Uint8Array, c: Uint8Array, tag: Uint8Array, ad: Uint8Array, npub: Uint8Array, k: Uint8Array) {
    console.assert(c.length == m.length);

    let state = AEAD.init(ad, npub, k);
    const buf = state.toSlice();

    let input = c;
    let output = m;

    for(; input.length >= State.RATE; input = input.subarray(State.RATE), output = output.subarray(State.RATE)) {
      for(let i = 0; i < State.RATE; i++) {
        output[i] = buf[i] ^ input[i];
      }
      buf.set(input.subarray(0, State.RATE), 0);
      state.permute();
    }
    for(let i = 0; i < input.length; i++) {
      const d = input[i];
      output[i] = buf[i] ^ d;
      buf[i] = d;
    }

    // XOR 1 into the next byte of the state
    buf[input.length] ^= 1;

    // XOR 1 into the last byte of the state, position 47.
    buf[buf.length - 1] ^= 1;

    state.permute();

    // After the final non-full block of plaintext, the first 16 bytes of the
    // state are the authentication tag.
    if (!crypto.timingSafeEqual(buf.subarray(0, State.RATE), tag)) {
      throw new Error('Invalid message');
    }
  }
}
