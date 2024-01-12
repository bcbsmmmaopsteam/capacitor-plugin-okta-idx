export interface CapOktaIdxPlugin {
  fetchTokens(data: any): Promise<any> ;
  refreshToken(data: any): Promise<any> ;
  selectAuthenticator(data: any): Promise<any> ;
  verifyOtp(data: any): Promise<any> ;
  resendOtp(): Promise<any> ;
  selectAlternateAuthenticator(data: any): Promise<any> ;
}
