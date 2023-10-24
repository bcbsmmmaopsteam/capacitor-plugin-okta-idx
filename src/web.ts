import { WebPlugin } from '@capacitor/core';
import type { IdxTransaction } from '@okta/okta-auth-js';
import { IdxStatus , OktaAuth } from '@okta/okta-auth-js';

import type { CapOktaIdxPlugin } from './definitions';

export class CapOktaIdxWeb extends WebPlugin implements CapOktaIdxPlugin {

  fetchTokens(data: any): Promise<any> {

    // window.sessionStorage.clear();
    // window.localStorage.clear();

    return new Promise((resolve, reject) => {
      const authClient = new OktaAuth({
        issuer: data.issuer,
        clientId: data.clientId,
        redirectUri: data.redirectUri,
        scopes: (data.scopes).split(' '),
      });
  
      (async () => { 
        // authClient.clearStorage();
        // authClient.idx.clearTransactionMeta();
        // authClient.tokenManager.clear();
        // authClient.transactionManager.clear();
        const authToken: IdxTransaction = await authClient.idx.startTransaction();
    
        if (authToken.status === IdxStatus.SUCCESS) {
          const tokenResponse = {
            access_token: authToken.tokens?.accessToken?.accessToken,
            refresh_token: authToken.tokens?.refreshToken?.refreshToken,
            scope: authToken.tokens?.accessToken?.scopes.join(' '),
            id_token: authToken.tokens?.idToken?.idToken,
            token_type: authToken.tokens?.accessToken?.tokenType,
            expires_in: authToken.tokens?.accessToken?.expiresAt
          }
          resolve(tokenResponse);
        }else if (authToken.status === IdxStatus.PENDING) {
          await this.proceed(authToken, authClient, data, resolve, reject);
        } {
          reject();
        }
      })().catch(err => {
        reject(err);
      });
    })
  }

  async proceed(authToken: any, authClient: OktaAuth, data: any, resolve: any, reject: any): Promise<void> {
    const username: string = data.username;
    const password: string = data.password;
    if (authToken?.messages?.length > 0) {
      reject({message: authToken.messages[0].message});
    }else if (authToken?.nextStep?.name == 'identify' && authToken?.nextStep?.inputs && authToken?.nextStep?.inputs?.length > 0) {
      if (authToken.nextStep.inputs[0].name === 'username') {
        authToken = await authClient.idx.proceed({[authToken.nextStep.inputs[0].name]: username});
      }
    } else if (authToken?.nextStep?.name == 'challenge-authenticator' && authToken?.nextStep?.inputs && authToken?.nextStep?.inputs?.length > 0) {
        if (authToken.nextStep.inputs[0].name === 'password') {
          authToken = await authClient.idx.proceed({[authToken.nextStep.inputs[0].name]: password});
        }
    }

    if (authToken.status === IdxStatus.PENDING) {
        await this.proceed(authToken, authClient, data, resolve, reject);
    }else if (authToken.status === IdxStatus.SUCCESS) {
      const tokenResponse = {
        access_token: authToken.tokens?.accessToken?.accessToken,
        refresh_token: authToken.tokens?.refreshToken?.refreshToken,
        scope: authToken.tokens?.accessToken?.scopes.join(' '),
        id_token: authToken.tokens?.idToken?.idToken,
        token_type: authToken.tokens?.accessToken?.tokenType,
        expires_in: authToken.tokens?.accessToken?.expiresAt
      }
      resolve(tokenResponse);
    }
  }

  refreshToken(data: any): Promise<any> {
    return new Promise((resolve) => {
      resolve(data);
    })
  }
}
