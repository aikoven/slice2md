import { getRelativePath } from "./utils"

test('getRelativePath', () => {
  expect(getRelativePath('::A::B', '::C::D')).toEqual(`../../C/D.md`);
  expect(getRelativePath('::A::B', '::A::C')).toEqual(`../C.md`);
  expect(getRelativePath('::A', '::A::C')).toEqual(`./C.md`);
})
