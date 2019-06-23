import {State} from './state';

export class Hash {
  private state: State;
  private bufferOffset: number;

  constructor() {
    this.state = new State();
    this.bufferOffset = 0;
  }

  public absorb(data: Uint8Array) {
    const buf = new Uint8Array(this.state.buffer, 0, State.RATE);
    for(let i = 0; i < data.length;) {
      let left = State.RATE - this.bufferOffset;
      if (left === 0) {
        this.state.permute();
        this.bufferOffset = 0;
        left = State.RATE;
      }
      const amountToXOR = Math.min(data.length-i, left);
      for(let j = 0; j < amountToXOR; j++) {
        buf[this.bufferOffset + j] ^= data[i + j];
      }
      this.bufferOffset += amountToXOR;
      i += amountToXOR;
    }
  }

  public squeeze(len: number): Uint8Array {
    const buf = new Uint8Array(this.state.buffer);
    buf[this.bufferOffset] ^= 1;
    buf[buf.length - 1] ^= 1;
    return this.state.squeeze(len);
  }
}

export function hash(arr: Uint8Array, len: number): Uint8Array {
  const h = new Hash();
  h.absorb(arr);
  return h.squeeze(len);
}
