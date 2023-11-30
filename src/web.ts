import { WebPlugin } from '@capacitor/core';
import type { IdxTransaction } from '@okta/okta-auth-js';
import { AuthenticatorKey , IdxStatus , OktaAuth } from '@okta/okta-auth-js';

import type { CapOktaIdxPlugin } from './definitions';

export class CapOktaIdxWeb extends WebPlugin implements CapOktaIdxPlugin {

  private authClient: any;

  initializeOkta(data: any): void {
    this.authClient = new OktaAuth({
        issuer: data.issuer,
        clientId: data.clientId,
        redirectUri: data.redirectUri,
        scopes: (data.scopes).split(' '),
      });
  }

  fetchTokens(data: any): Promise<any> {

    // window.sessionStorage.clear();
    // window.localStorage.clear();

    return new Promise((resolve, reject) => {
      this.authClient = new OktaAuth({
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
        const authToken: IdxTransaction = await this.authClient.idx.startTransaction();
    
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
          await this.proceed(authToken, this.authClient, data, resolve, reject);
        } else {
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
      // let verificationCode = '1234';
        if (authToken.nextStep.inputs[0].name === 'password') {
          authToken = await authClient.idx.proceed({[authToken.nextStep.inputs[0].name]: password});
        }else if (authToken.nextStep.inputs[0].name === 'verificationCode') {
          // authToken = await authClient.idx.proceed({[authToken.nextStep.inputs[0].name]: verificationCode});
          resolve({remediation: authToken.nextStep.inputs[0].name});
          return;
        }
    }
    else if (authToken?.nextStep?.name == 'select-authenticator-authenticate' && authToken?.nextStep?.inputs && authToken?.nextStep?.inputs?.length > 0) {
      const passwordOption = authToken?.nextStep?.inputs[0].options.find((res: any) => res.value === "okta_password")
      if (passwordOption) {
        authToken = await authClient.idx.proceed({[authToken.nextStep.inputs[0].name]: AuthenticatorKey.OKTA_PASSWORD});
      }else {
        resolve({
          remediation: authToken?.nextStep?.name,
          options: authToken?.nextStep?.inputs[0].options
        })
        return;
      }
      // else {
      //   resolve({'remediation': authToken?.nextStep?.name});
      // }
      // if (authToken.nextStep.inputs[0].name === 'authenticator') {
      //     authToken = await authClient.idx.proceed({[authToken.nextStep.inputs[0].name]: AuthenticatorKey.OKTA_EMAIL});
      //   }
    }
    else if (authToken?.nextStep?.name == 'authenticator-verification-data' && authToken?.nextStep?.inputs && authToken?.nextStep?.inputs?.length > 0) {
      if (authToken.nextStep.inputs[0].name === 'methodType') {
        if (data?.type === 'email') {
          authToken = await authClient.idx.proceed({[authToken.nextStep.inputs[0].name]: authToken.nextStep.inputs[0]?.options[0]?.value});
        }else if (data?.type === 'phone') {
          authToken = await authClient.idx.proceed({[authToken.nextStep.inputs[0].name]: authToken.nextStep.inputs[0]?.options[0]?.value});
        }
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

  selectAuthenticator(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const authClient = new OktaAuth({
        issuer: data.issuer,
        clientId: data.clientId,
        redirectUri: data.redirectUri,
        scopes: (data.scopes).split(' '),
      });
      
      (async () => { 
        let authToken;
        if (data?.type === 'email') {
          authToken = await authClient.idx.proceed({authenticator: AuthenticatorKey.OKTA_EMAIL});
        }else if (data?.type === 'phone') {
          authToken = await authClient.idx.proceed({authenticator: AuthenticatorKey.PHONE_NUMBER});
        }
        await this.proceed(authToken, authClient, data, resolve, reject);

      })().catch(err => {
        reject(err);
      });
    })
  }

  verifyOtp(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const authClient = new OktaAuth({
        issuer: data.issuer,
        clientId: data.clientId,
        redirectUri: data.redirectUri,
        scopes: (data.scopes).split(' '),
      });
      
      (async () => { 
        const authToken = await authClient.idx.proceed({verificationCode: data?.otp});

        await this.proceed(authToken, authClient, data, resolve, reject);

      })().catch(err => {
        reject(err);
      });
    })
  }

  resendOtp(): Promise<any> {
    return new Promise((resolve, reject) => {
      (async () => { 
          const authToken = await this.authClient.idx.proceed({resend: true});
          console.log(authToken);
          resolve({
            remediation: authToken?.nextStep?.name
          })

      })().catch(err => {
        reject(err);
      });
    })
  }
}
