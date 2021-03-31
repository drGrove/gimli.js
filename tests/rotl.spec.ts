import {rotl32} from '../src/rotl';

describe("rotl32", () => {
  test('expect rotl32(1,0) == 1', () => {
    expect(rotl32(1,0)).toBe(1);
  });
  test('expect rotl32(1,33) == 2', () => {
    expect(rotl32(1,33)).toBe(2);
  });
  test('expect rotl32(1,32) == 1', () => {
    expect(rotl32(1,32)).toBe(1);
  });
  test('expect rotl32(1,4) == 16', () => {
    expect(rotl32(1,4)).toBe(16);
  });
  test('expect rotl32(1,-1) == 2147483648', () => {
    expect(rotl32(1,-1)).toBe(2147483648);
  });
});
