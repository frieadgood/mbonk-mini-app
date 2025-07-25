import { atom } from 'recoil';

export const tokenPriceAtom = atom<number>({
  key: 'tokenPrice',
  default: 0,
});