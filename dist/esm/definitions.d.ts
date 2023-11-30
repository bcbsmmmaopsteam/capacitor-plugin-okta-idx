export interface CapOktaIdxPlugin {
    initializeOkta(data: any): void;
    fetchTokens(data: any): Promise<any>;
    refreshToken(data: any): Promise<any>;
    selectAuthenticator(data: any): Promise<any>;
    verifyOtp(data: any): Promise<any>;
    resendOtp(): Promise<any>;
}
