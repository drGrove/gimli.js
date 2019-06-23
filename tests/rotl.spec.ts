import {rotl32} from '../src/rotl';

test("rotl32", () => {
  expect(rotl32(1,0)).toBe(1);
  expect(rotl32(1,33)).toBe(2);
  expect(rotl32(1,32)).toBe(1);
  expect(rotl32(1,4)).toBe(16);
  expect(rotl32(1,-1)).toBe(2147483648);
});
