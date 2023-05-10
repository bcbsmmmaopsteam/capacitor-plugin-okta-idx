import { WebPlugin } from '@capacitor/core';
import type { CapOktaIdxPlugin } from './definitions';
export declare class CapOktaIdxWeb extends WebPlugin implements CapOktaIdxPlugin {
    echo(options: {
        value: string;
    }): Promise<{
        value: string;
    }>;
    fetchTokens(data: any): Promise<any>;
}
