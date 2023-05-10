import { registerPlugin } from '@capacitor/core';
const CapOktaIdx = registerPlugin('CapOktaIdx', {
    web: () => import('./web').then(m => new m.CapOktaIdxWeb()),
});
export * from './definitions';
export { CapOktaIdx };
//# sourceMappingURL=index.js.map