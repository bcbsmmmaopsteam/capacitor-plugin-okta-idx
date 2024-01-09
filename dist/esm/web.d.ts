import { WebPlugin } from '@capacitor/core';
import { OktaAuth } from '@okta/okta-auth-js';
import type { CapOktaIdxPlugin } from './definitions';
export declare class CapOktaIdxWeb extends WebPlugin implements CapOktaIdxPlugin {
    private authClient;
    initializeOkta(data: any): void;
    fetchTokens(data: any): Promise<any>;
    proceed(authToken: any, authClient: OktaAuth, data: any, resolve: any, reject: any): Promise<void>;
    refreshToken(data: any): Promise<any>;
    selectAuthenticator(data: any): Promise<any>;
    verifyOtp(data: any): Promise<any>;
    resendOtp(): Promise<any>;
    selectAlternateAuthenticator(data: any): Promise<any>;
}
