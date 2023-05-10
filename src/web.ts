import { WebPlugin } from '@capacitor/core';
import { OktaAuth } from '@okta/okta-auth-js';

import type { CapOktaIdxPlugin } from './definitions';

export class CapOktaIdxWeb extends WebPlugin implements CapOktaIdxPlugin {

  fetchTokens(data: any): Promise<any> {

    return new Promise((resolve, reject) => {
      const authClient = new OktaAuth({
        issuer: data.issuer,
        clientId: data.clientId,
        redirectUri: data.redirectUri,
        scopes: data.scopes
      });
  
      const username: string = data.username;
      const password: string = data.password;
  
      (async () => { 
        const authToken = await authClient.idx.authenticate({
          username,
          password
        })
    
        if (authToken.status === 'SUCCESS') {
          const tokenResponse = {
            access_token: authToken.tokens?.accessToken?.accessToken,
            refresh_token: authToken.tokens?.refreshToken?.refreshToken,
            scope: authToken.tokens?.accessToken?.scopes.join(' '),
            id_token: authToken.tokens?.idToken?.idToken,
            token_type: authToken.tokens?.accessToken?.tokenType,
            expires_in: authToken.tokens?.accessToken?.expiresAt
          }
          resolve(tokenResponse);
        }else {
          reject();
        }
      })().catch(err => {
        reject(err);
      });
    })
  }
}
