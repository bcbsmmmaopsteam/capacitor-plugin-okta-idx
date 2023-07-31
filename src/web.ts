import { WebPlugin } from '@capacitor/core';
import type { IdxTransaction } from '@okta/okta-auth-js';
import { OktaAuth } from '@okta/okta-auth-js';

import type { CapOktaIdxPlugin } from './definitions';

export class CapOktaIdxWeb extends WebPlugin implements CapOktaIdxPlugin {

  fetchTokens(data: any): Promise<any> {

    return new Promise((resolve, reject) => {
      const authClient = new OktaAuth({
        issuer: data.issuer,
        clientId: data.clientId,
        redirectUri: data.redirectUri,
        scopes: (data.scopes).split(' '),
      });
  
      const username: string = data.username;
      const password: string = data.password;
  
      (async () => { 
        const authToken: IdxTransaction = await authClient.idx.authenticate({
          username,
          password
        })
    
        if (authToken.status === 'SUCCESS') {
          const expiresAt = authToken.tokens?.accessToken?.expiresAt;
          const tokenResponse = {
            access_token: authToken.tokens?.accessToken?.accessToken,
            refresh_token: authToken.tokens?.refreshToken?.refreshToken,
            scope: authToken.tokens?.accessToken?.scopes.join(' '),
            id_token: authToken.tokens?.idToken?.idToken,
            token_type: authToken.tokens?.accessToken?.tokenType,
            expires_in: (expiresAt ? expiresAt * 1000 : expiresAt)
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

  refreshToken(data: any): Promise<any> {
    return new Promise((resolve) => {
      resolve(data);
    })
  }
}
