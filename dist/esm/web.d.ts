import { WebPlugin } from '@capacitor/core';
import type { CapOktaIdxPlugin } from './definitions';
export declare class CapOktaIdxWeb extends WebPlugin implements CapOktaIdxPlugin {
    fetchTokens(data: any): Promise<any>;
    refreshToken(data: any): Promise<any>;
}
