import { atom } from 'recoil';

export const selectedTimeframeAtom = atom<string>({
  key: 'selectedTimeframe',
  default: '1',
});