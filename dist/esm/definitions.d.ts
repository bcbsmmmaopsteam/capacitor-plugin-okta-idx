export declare enum AuthenticatorType {
    EMAIL = "email",
    PHONE = "phone"
}
export declare enum AuthenticatorMethodType {
    EMAIL = "email",
    VOICE = "voice",
    SMS = "sms"
}
export interface TokenRequestOptions {
    issuer: string;
    clientId: string;
    redirectUri: string;
    scopes: string;
    username?: string;
    password?: string;
    rememberme?: boolean;
    refresh_token?: string;
}
export interface AuthenticatorOptions {
    type: AuthenticatorType;
    methodType: AuthenticatorMethodType;
    remediation?: string;
}
export interface VarifyOptions {
    otp: string;
}
export interface CapOktaIdxPlugin {
    fetchTokens(data: TokenRequestOptions): Promise<any>;
    refreshToken(data: TokenRequestOptions): Promise<any>;
    selectAuthenticator(data: AuthenticatorOptions): Promise<any>;
    verifyOtp(data: VarifyOptions): Promise<any>;
    resendOtp(): Promise<any>;
    selectAlternateAuthenticator(data: AuthenticatorOptions): Promise<any>;
}
