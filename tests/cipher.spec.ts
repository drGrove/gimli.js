import {AEAD} from '../src/cipher';

describe('ciper', () => {
  var key: Uint8Array;
  var nonce: Uint8Array;

  beforeAll(() => {
    key = Uint8Array.from(Buffer.from('000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F', 'hex'));
    nonce = Uint8Array.from(Buffer.from('000102030405060708090A0B0C0D0E0F', 'hex'));
  });

  test('test vector (1) from NIST KAT submission', () => {
    const ad: Uint8Array = new Uint8Array(0);
    const pt: Uint8Array = new Uint8Array(0);

    var ct: Uint8Array = new Uint8Array();
    var tag: Uint8Array = new Uint8Array(16);
    AEAD.encrypt(ct, tag, pt, ad, nonce, key);
    expect('').toEqual(Buffer.from(ct).toString('hex'));
    expect('14DA9BB7120BF58B985A8E00FDEBA15B').toEqual(Buffer.from(tag).toString('hex').toUpperCase());

    var pt2: Uint8Array = new Uint8Array();
    AEAD.decrypt(pt2, ct, tag, ad, nonce, key);
    expect(pt).toEqual(pt2)
  });

  test('test vector (34) from NIST KAT submission', () => {
    const ad: Uint8Array = new Uint8Array(0);
    const pt: Uint8Array = new Uint8Array(2/2);

    pt.set(Buffer.from('00', 'hex'));

    const ct: Uint8Array = new Uint8Array(pt.length);
    const tag: Uint8Array = new Uint8Array(16);
    AEAD.encrypt(ct, tag, pt, ad, nonce, key);
    expect('7F').toEqual(Buffer.from(ct).toString('hex').toUpperCase());
    expect('80492C317B1CD58A1EDC3A0D3E9876FC').toEqual(Buffer.from(tag).toString('hex').toUpperCase());

    const pt2 = new Uint8Array(pt.length);
    AEAD.decrypt(pt2, ct, tag, ad, nonce, key);
    expect(pt).toEqual(pt2);
  });

  test('test vector (106) from NIST KAT submission', () => {
    const ad: Uint8Array = new Uint8Array(12/2);
    const pt: Uint8Array = new Uint8Array(6/2);

    ad.set(Buffer.from('000102030405', 'hex'));
    pt.set(Buffer.from('000102', 'hex'));

    const ct: Uint8Array = new Uint8Array(pt.length);
    const tag: Uint8Array = new Uint8Array(16);

    AEAD.encrypt(ct, tag, pt, ad, nonce, key);
    expect('484D35').toEqual(Buffer.from(ct).toString('hex').toUpperCase());
    expect('030BBEA23B61C00CED60A923BDCF9147').toEqual(Buffer.from(tag).toString('hex').toUpperCase());

    const pt2 = new Uint8Array(pt.length);
    AEAD.decrypt(pt2, ct, tag, ad, nonce, key);
    expect(pt).toEqual(pt2);
  });

  test('test vector (790) from NIST KAT submission', () => {
    const ad: Uint8Array = new Uint8Array(60/2);
    const pt: Uint8Array = new Uint8Array(46 / 2);
    ad.set(Buffer.from('000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D', 'hex'));
    pt.set(Buffer.from('000102030405060708090A0B0C0D0E0F10111213141516', 'hex'));

    const ct: Uint8Array = new Uint8Array(pt.length);
    const tag: Uint8Array = new Uint8Array(16);

    AEAD.encrypt(ct, tag, pt, ad, nonce, key);
    expect('6815B4A0ECDAD01596EAD87D9E690697475D234C6A13D1').toEqual(Buffer.from(ct).toString('hex').toUpperCase());
    expect('DFE23F1642508290D68245279558B2FB').toEqual(Buffer.from(tag).toString('hex').toUpperCase());

    const pt2 = new Uint8Array(pt.length);
    AEAD.decrypt(pt2, ct, tag, ad, nonce, key);
    expect(pt).toEqual(pt2);
  });

  test('test vector (1057) from NIST KAT submission', () => {
    const ad: Uint8Array = new Uint8Array(0);
    const pt: Uint8Array = new Uint8Array(64 / 2);
    pt.set(Buffer.from('000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F', 'hex'));

    const ct: Uint8Array = new Uint8Array(pt.length);
    const tag: Uint8Array = new Uint8Array(16);

    AEAD.encrypt(ct, tag, pt, ad, nonce, key);
    expect('7F8A2CF4F52AA4D6B2E74105C30A2777B9D0C8AEFDD555DE35861BD3011F652F').toEqual(Buffer.from(ct).toString('hex').toUpperCase());
    expect('7256456FA935AC34BBF55AE135F33257').toEqual(Buffer.from(tag).toString('hex').toUpperCase());

    const pt2 = new Uint8Array(pt.length);
    AEAD.decrypt(pt2, ct, tag, ad, nonce, key);
    expect(pt).toEqual(pt2);
  });
});
