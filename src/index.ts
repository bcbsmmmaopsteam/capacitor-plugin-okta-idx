import { registerPlugin } from '@capacitor/core';

import type { CapOktaIdxPlugin } from './definitions';

const CapOktaIdx = registerPlugin<CapOktaIdxPlugin>('CapOktaIdx', {
  web: () => import('./web').then(m => new m.CapOktaIdxWeb()),
});

export * from './definitions';
export { CapOktaIdx };
