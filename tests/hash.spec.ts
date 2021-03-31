import {hash} from '../src/hash';

describe('hash', () => {
  test('test vector (30) from NIST KAT submission', () => {
    const msg = Uint8Array.from(Buffer.from('000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C', 'hex'));
    expect(hash(msg, 32)).toEqual(Uint8Array.from(Buffer.from('1C9A03DC6A5DDC5444CFC6F4B154CFF5CF081633B2CEA4D7D0AE7CCFED5AAA44', 'hex')));
  });
})
