import {State} from '../src/state';


test("permute", () => {
  // test vector from gimli-20170627
  const state = new State();
  for(let i = 0; i < 12; i++) {
    state[i] = i * i * i + (i * 0x9e3779b9) >>> 0;
  }
  // check the input is correct
  expect(state).toEqual(State.of(
    0x00000000, 0x9e3779ba, 0x3c6ef37a, 0xdaa66d46,
    0x78dde724, 0x1715611a, 0xb54cdb2e, 0x53845566,
    0xf1bbcfc8, 0x8ff34a5a, 0x2e2ac522, 0xcc624026,
  ));
  state.permute();
  // check the output is correct
  expect(state).toEqual(State.of(
    0xba11c85a, 0x91bad119, 0x380ce880, 0xd24c2c68,
    0x3eceffea, 0x277a921c, 0x4f73a0bd, 0xda5a9cd8,
    0x84b673f0, 0x34e52ff7, 0x9e2bef49, 0xf41bb8d6,
  ));
});
