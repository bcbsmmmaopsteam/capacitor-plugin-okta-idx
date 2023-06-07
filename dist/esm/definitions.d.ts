export interface CapOktaIdxPlugin {
    fetchTokens(data: any): Promise<any>;
    refreshToken(data: any): Promise<any>;
}
