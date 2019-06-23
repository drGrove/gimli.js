import {rotl32} from './rotl';

export class State extends Uint32Array {
  public static readonly BLOCKBYTES = 48;
  public static readonly RATE = 16;

  constructor() {
    super(State.BLOCKBYTES/4);
  }

  public permute() {
    for (let round = 24; round > 0; round--) {
      for(let column = 0; column < 4; column++) {
        const x: number = rotl32(this[column], 24);
        const y: number = rotl32(this[4 + column], 9);
        const z: number = this[8 + column];
        this[8 + column] = ((x ^ (z << 1)) ^ ((y & z) << 2)) >>> 0;
        this[4 + column] = ((y ^ x) ^ ((x | z) << 1)) >>> 0;
        this[column] = ((z ^ y) ^ ((x & y) << 3)) >>> 0;

      }
      switch(round & 3) {
        case 0: {
          const temp1 = this[0];
          this[0] = this[1];
          this[1] = temp1;
          const temp2 = this[2];
          this[2] = this[3];
          this[3] = temp2;
          this[0] ^= round | 0x9e377900;
          break;
        }
        case 2: {
          const temp1 = this[0];
          this[0] = this[2];
          this[2] = temp1;
          const temp2 = this[1];
          this[1] = this[3];
          this[3] = temp2;
          break;
        }
      }
    }
  }

  public squeeze(len: number): Uint8Array {
    let out = new Uint8Array(len);
    const buf = new Uint8Array(this.buffer, 0, State.RATE);
    let i = 0;
    for(;i < (len-State.RATE); i+=State.RATE) {
      this.permute();
      out.set(buf,i);
    }
    const left = len - i;
    if (left !== 0) {
      this.permute();
      out.set(buf.subarray(0,left),i)
    }
    return out;
  }
}
