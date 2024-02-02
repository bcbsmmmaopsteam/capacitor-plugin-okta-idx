import { WebPlugin } from '@capacitor/core';
import type { IdxTransaction } from '@okta/okta-auth-js';
import { AuthenticatorKey , IdxStatus , OktaAuth } from '@okta/okta-auth-js';

import type { CapOktaIdxPlugin } from './definitions';

export class CapOktaIdxWeb extends WebPlugin implements CapOktaIdxPlugin {

  private authClient: any;

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
    
        if (authToken.status !== IdxStatus.SUCCESS) {
          await this.proceed(authToken, this.authClient, data, resolve, reject);
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
    const stepData: any = this. getNextStep(authToken);
    if (authToken?.messages?.length > 0) {
      reject({message: authToken.messages[0]?.message, code: authToken.messages[0]?.i18n?.key});
    }else if (stepData?.name === 'identify' && stepData?.nextStep?.inputs && stepData?.nextStep?.inputs?.length > 0) {
      if (stepData?.nextStep.inputs[0].name === 'username') {
        authToken = await authClient.idx.proceed({[stepData?.nextStep.inputs[0].name]: username, [stepData?.nextStep.inputs[1].name]: data.rememberme});
      }
    } else if (stepData?.name === 'challenge-authenticator' && stepData?.nextStep?.inputs && stepData?.nextStep?.inputs?.length > 0) {
      // let verificationCode = '1234';
        if (stepData?.nextStep.inputs[0].name === 'password') {
          authToken = await authClient.idx.proceed({[stepData?.nextStep.inputs[0].name]: password});
        }else if (stepData?.nextStep.inputs[0].name === 'verificationCode') {
          resolve({remediation: stepData?.nextStep?.name });
          return;
        }
    }
    else if (stepData?.name === 'select-authenticator-authenticate' && stepData?.nextStep?.inputs && stepData?.nextStep?.inputs?.length > 0) {
      const passwordOption = stepData?.nextStep?.inputs[0].options.find((res: any) => res.value === "okta_password")
      if (passwordOption) {
        authToken = await authClient.idx.proceed({[stepData?.nextStep.inputs[0].name]: AuthenticatorKey.OKTA_PASSWORD});
      }else {
        resolve({
          remediation: stepData?.name,
          email: authToken?.context?.authenticatorEnrollments?.value[0]?.profile?.email,
          phoneNumber: authToken?.context?.authenticatorEnrollments?.value[1]?.profile?.phoneNumber
        })
        return;
      }
    } else if (stepData?.name === 'authenticator-verification-data' && stepData?.nextStep?.inputs && stepData?.nextStep?.inputs?.length > 0) {
        resolve({
          remediation: stepData?.name,
          email: authToken?.context?.authenticatorEnrollments?.value[0]?.profile?.email,
          phoneNumber: authToken.context.authenticatorEnrollments.value[1].profile.phoneNumber

        })
        return;
    }

    if (authToken.status !== IdxStatus.SUCCESS) {
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

  getNextStep(authToken: any) {
    const stepOrder = ['identify', 'challenge-authenticator', 'select-authenticator-authenticate', 'authenticator-verification-data'];
    for (let i=0; i<stepOrder.length; i++) {
      const nextStep = authToken?.availableSteps.find((step: any) => (step.name === stepOrder[i]) );
      if (nextStep) {
        return {
          nextStep,
          name: stepOrder[i]
        }
      }
    }
    return;
    
  }

  refreshToken(data: any): Promise<any> {
    return new Promise((resolve) => {
      resolve(data);
    })
  }

  selectAuthenticator(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      
      (async () => { 
        let payload;
        let authToken;
        if (data?.remediation === 'authenticator-verification-data') {
          payload = {methodType: data?.methodType}
        }else {
          payload = data?.type === 'email' ? {authenticator: AuthenticatorKey.OKTA_EMAIL} : {authenticator: AuthenticatorKey.PHONE_NUMBER}
        }
        authToken = await this.authClient.idx.proceed(payload);
        const nextStep = authToken?.availableSteps.find((step: any) => (step.name === 'authenticator-verification-data') );
        if (nextStep) {
          authToken = await this.authClient.idx.proceed({methodType: data?.methodType});
        }
        await this.proceed(authToken, this.authClient, data, resolve, reject);

      })().catch(err => {
        reject(err);
      });
    })
  }  

  verifyOtp(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      
      (async () => { 
        const authToken = await this.authClient.idx.proceed({authenticator: AuthenticatorKey.OKTA_VERIFY, verificationCode: data?.otp});

        await this.proceed(authToken, this.authClient, data, resolve, reject);

      })().catch(err => {
        reject(err);
      });
    })
  }

  resendOtp(): Promise<any> {
    return new Promise((resolve, reject) => {
      (async () => { 
          const authToken = await this.authClient.idx.proceed({resend: true});
          if (authToken?.messages?.length > 0) {
            reject({message: authToken.messages[0].message, code : authToken.messages[0]?.i18n?.key});
          }else {
            resolve({
              remediation: authToken?.nextStep?.name
            })
          }

      })().catch(err => {
        reject(err);
      });
    })
  }

  selectAlternateAuthenticator(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      
      (async () => { 
        let authToken;
        if (data?.type === 'email') {
          authToken = await this.authClient.idx.proceed({authenticator: AuthenticatorKey.OKTA_EMAIL, methodType: data?.type});
        }else if (data?.type === 'phone') {
          authToken = await this.authClient.idx.proceed({authenticator: AuthenticatorKey.PHONE_NUMBER, methodType: data?.methodType});
        }
        await this.proceed(authToken, this.authClient, data, resolve, reject);

      })().catch(err => {
        reject(err);
      });
    })
  }
}
