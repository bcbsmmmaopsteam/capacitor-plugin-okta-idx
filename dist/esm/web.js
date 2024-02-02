import { WebPlugin } from '@capacitor/core';
import { AuthenticatorKey, IdxStatus, OktaAuth } from '@okta/okta-auth-js';
export class CapOktaIdxWeb extends WebPlugin {
    fetchTokens(data) {
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
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                // authClient.clearStorage();
                // authClient.idx.clearTransactionMeta();
                // authClient.tokenManager.clear();
                // authClient.transactionManager.clear();
                const authToken = await this.authClient.idx.startTransaction();
                if (authToken.status !== IdxStatus.SUCCESS) {
                    await this.proceed(authToken, this.authClient, data, resolve, reject);
                }
                else if (authToken.status === IdxStatus.SUCCESS) {
                    const tokenResponse = {
                        access_token: (_b = (_a = authToken.tokens) === null || _a === void 0 ? void 0 : _a.accessToken) === null || _b === void 0 ? void 0 : _b.accessToken,
                        refresh_token: (_d = (_c = authToken.tokens) === null || _c === void 0 ? void 0 : _c.refreshToken) === null || _d === void 0 ? void 0 : _d.refreshToken,
                        scope: (_f = (_e = authToken.tokens) === null || _e === void 0 ? void 0 : _e.accessToken) === null || _f === void 0 ? void 0 : _f.scopes.join(' '),
                        id_token: (_h = (_g = authToken.tokens) === null || _g === void 0 ? void 0 : _g.idToken) === null || _h === void 0 ? void 0 : _h.idToken,
                        token_type: (_k = (_j = authToken.tokens) === null || _j === void 0 ? void 0 : _j.accessToken) === null || _k === void 0 ? void 0 : _k.tokenType,
                        expires_in: (_m = (_l = authToken.tokens) === null || _l === void 0 ? void 0 : _l.accessToken) === null || _m === void 0 ? void 0 : _m.expiresAt
                    };
                    resolve(tokenResponse);
                }
                else {
                    reject();
                }
            })().catch(err => {
                reject(err);
            });
        });
    }
    async proceed(authToken, authClient, data, resolve, reject) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17;
        const username = data.username;
        const password = data.password;
        const stepData = this.getNextStep(authToken);
        if (((_a = authToken === null || authToken === void 0 ? void 0 : authToken.messages) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            reject({ message: (_b = authToken.messages[0]) === null || _b === void 0 ? void 0 : _b.message, code: (_d = (_c = authToken.messages[0]) === null || _c === void 0 ? void 0 : _c.i18n) === null || _d === void 0 ? void 0 : _d.key });
        }
        else if ((stepData === null || stepData === void 0 ? void 0 : stepData.name) === 'identify' && ((_e = stepData === null || stepData === void 0 ? void 0 : stepData.nextStep) === null || _e === void 0 ? void 0 : _e.inputs) && ((_g = (_f = stepData === null || stepData === void 0 ? void 0 : stepData.nextStep) === null || _f === void 0 ? void 0 : _f.inputs) === null || _g === void 0 ? void 0 : _g.length) > 0) {
            if ((stepData === null || stepData === void 0 ? void 0 : stepData.nextStep.inputs[0].name) === 'username') {
                authToken = await authClient.idx.proceed({ [stepData === null || stepData === void 0 ? void 0 : stepData.nextStep.inputs[0].name]: username, [stepData === null || stepData === void 0 ? void 0 : stepData.nextStep.inputs[1].name]: data.rememberme });
            }
        }
        else if ((stepData === null || stepData === void 0 ? void 0 : stepData.name) === 'challenge-authenticator' && ((_h = stepData === null || stepData === void 0 ? void 0 : stepData.nextStep) === null || _h === void 0 ? void 0 : _h.inputs) && ((_k = (_j = stepData === null || stepData === void 0 ? void 0 : stepData.nextStep) === null || _j === void 0 ? void 0 : _j.inputs) === null || _k === void 0 ? void 0 : _k.length) > 0) {
            // let verificationCode = '1234';
            if ((stepData === null || stepData === void 0 ? void 0 : stepData.nextStep.inputs[0].name) === 'password') {
                authToken = await authClient.idx.proceed({ [stepData === null || stepData === void 0 ? void 0 : stepData.nextStep.inputs[0].name]: password });
            }
            else if ((stepData === null || stepData === void 0 ? void 0 : stepData.nextStep.inputs[0].name) === 'verificationCode') {
                resolve({ remediation: (_l = stepData === null || stepData === void 0 ? void 0 : stepData.nextStep) === null || _l === void 0 ? void 0 : _l.name });
                return;
            }
        }
        else if ((stepData === null || stepData === void 0 ? void 0 : stepData.name) === 'select-authenticator-authenticate' && ((_m = stepData === null || stepData === void 0 ? void 0 : stepData.nextStep) === null || _m === void 0 ? void 0 : _m.inputs) && ((_p = (_o = stepData === null || stepData === void 0 ? void 0 : stepData.nextStep) === null || _o === void 0 ? void 0 : _o.inputs) === null || _p === void 0 ? void 0 : _p.length) > 0) {
            const passwordOption = (_q = stepData === null || stepData === void 0 ? void 0 : stepData.nextStep) === null || _q === void 0 ? void 0 : _q.inputs[0].options.find((res) => res.value === "okta_password");
            if (passwordOption) {
                authToken = await authClient.idx.proceed({ [stepData === null || stepData === void 0 ? void 0 : stepData.nextStep.inputs[0].name]: AuthenticatorKey.OKTA_PASSWORD });
            }
            else {
                resolve({
                    remediation: stepData === null || stepData === void 0 ? void 0 : stepData.name,
                    email: (_u = (_t = (_s = (_r = authToken === null || authToken === void 0 ? void 0 : authToken.context) === null || _r === void 0 ? void 0 : _r.authenticatorEnrollments) === null || _s === void 0 ? void 0 : _s.value[0]) === null || _t === void 0 ? void 0 : _t.profile) === null || _u === void 0 ? void 0 : _u.email,
                    phoneNumber: (_y = (_x = (_w = (_v = authToken === null || authToken === void 0 ? void 0 : authToken.context) === null || _v === void 0 ? void 0 : _v.authenticatorEnrollments) === null || _w === void 0 ? void 0 : _w.value[1]) === null || _x === void 0 ? void 0 : _x.profile) === null || _y === void 0 ? void 0 : _y.phoneNumber
                });
                return;
            }
        }
        else if ((stepData === null || stepData === void 0 ? void 0 : stepData.name) === 'authenticator-verification-data' && ((_z = stepData === null || stepData === void 0 ? void 0 : stepData.nextStep) === null || _z === void 0 ? void 0 : _z.inputs) && ((_1 = (_0 = stepData === null || stepData === void 0 ? void 0 : stepData.nextStep) === null || _0 === void 0 ? void 0 : _0.inputs) === null || _1 === void 0 ? void 0 : _1.length) > 0) {
            resolve({
                remediation: stepData === null || stepData === void 0 ? void 0 : stepData.name,
                email: (_5 = (_4 = (_3 = (_2 = authToken === null || authToken === void 0 ? void 0 : authToken.context) === null || _2 === void 0 ? void 0 : _2.authenticatorEnrollments) === null || _3 === void 0 ? void 0 : _3.value[0]) === null || _4 === void 0 ? void 0 : _4.profile) === null || _5 === void 0 ? void 0 : _5.email,
                phoneNumber: authToken.context.authenticatorEnrollments.value[1].profile.phoneNumber
            });
            return;
        }
        if (authToken.status !== IdxStatus.SUCCESS) {
            await this.proceed(authToken, authClient, data, resolve, reject);
        }
        else if (authToken.status === IdxStatus.SUCCESS) {
            const tokenResponse = {
                access_token: (_7 = (_6 = authToken.tokens) === null || _6 === void 0 ? void 0 : _6.accessToken) === null || _7 === void 0 ? void 0 : _7.accessToken,
                refresh_token: (_9 = (_8 = authToken.tokens) === null || _8 === void 0 ? void 0 : _8.refreshToken) === null || _9 === void 0 ? void 0 : _9.refreshToken,
                scope: (_11 = (_10 = authToken.tokens) === null || _10 === void 0 ? void 0 : _10.accessToken) === null || _11 === void 0 ? void 0 : _11.scopes.join(' '),
                id_token: (_13 = (_12 = authToken.tokens) === null || _12 === void 0 ? void 0 : _12.idToken) === null || _13 === void 0 ? void 0 : _13.idToken,
                token_type: (_15 = (_14 = authToken.tokens) === null || _14 === void 0 ? void 0 : _14.accessToken) === null || _15 === void 0 ? void 0 : _15.tokenType,
                expires_in: (_17 = (_16 = authToken.tokens) === null || _16 === void 0 ? void 0 : _16.accessToken) === null || _17 === void 0 ? void 0 : _17.expiresAt
            };
            resolve(tokenResponse);
        }
    }
    getNextStep(authToken) {
        const stepOrder = ['identify', 'challenge-authenticator', 'select-authenticator-authenticate', 'authenticator-verification-data'];
        for (let i = 0; i < stepOrder.length; i++) {
            const nextStep = authToken === null || authToken === void 0 ? void 0 : authToken.availableSteps.find((step) => (step.name === stepOrder[i]));
            if (nextStep) {
                return {
                    nextStep,
                    name: stepOrder[i]
                };
            }
        }
        return;
    }
    refreshToken(data) {
        return new Promise((resolve) => {
            resolve(data);
        });
    }
    selectAuthenticator(data) {
        return new Promise((resolve, reject) => {
            (async () => {
                let payload;
                let authToken;
                if ((data === null || data === void 0 ? void 0 : data.remediation) === 'authenticator-verification-data') {
                    payload = { methodType: data === null || data === void 0 ? void 0 : data.methodType };
                }
                else {
                    payload = (data === null || data === void 0 ? void 0 : data.type) === 'email' ? { authenticator: AuthenticatorKey.OKTA_EMAIL } : { authenticator: AuthenticatorKey.PHONE_NUMBER };
                }
                authToken = await this.authClient.idx.proceed(payload);
                const nextStep = authToken === null || authToken === void 0 ? void 0 : authToken.availableSteps.find((step) => (step.name === 'authenticator-verification-data'));
                if (nextStep) {
                    authToken = await this.authClient.idx.proceed({ methodType: data === null || data === void 0 ? void 0 : data.methodType });
                }
                await this.proceed(authToken, this.authClient, data, resolve, reject);
            })().catch(err => {
                reject(err);
            });
        });
    }
    verifyOtp(data) {
        return new Promise((resolve, reject) => {
            (async () => {
                const authToken = await this.authClient.idx.proceed({ authenticator: AuthenticatorKey.OKTA_VERIFY, verificationCode: data === null || data === void 0 ? void 0 : data.otp });
                await this.proceed(authToken, this.authClient, data, resolve, reject);
            })().catch(err => {
                reject(err);
            });
        });
    }
    resendOtp() {
        return new Promise((resolve, reject) => {
            (async () => {
                var _a, _b, _c, _d;
                const authToken = await this.authClient.idx.proceed({ resend: true });
                if (((_a = authToken === null || authToken === void 0 ? void 0 : authToken.messages) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                    reject({ message: authToken.messages[0].message, code: (_c = (_b = authToken.messages[0]) === null || _b === void 0 ? void 0 : _b.i18n) === null || _c === void 0 ? void 0 : _c.key });
                }
                else {
                    resolve({
                        remediation: (_d = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _d === void 0 ? void 0 : _d.name
                    });
                }
            })().catch(err => {
                reject(err);
            });
        });
    }
    selectAlternateAuthenticator(data) {
        return new Promise((resolve, reject) => {
            (async () => {
                let authToken;
                if ((data === null || data === void 0 ? void 0 : data.type) === 'email') {
                    authToken = await this.authClient.idx.proceed({ authenticator: AuthenticatorKey.OKTA_EMAIL, methodType: data === null || data === void 0 ? void 0 : data.type });
                }
                else if ((data === null || data === void 0 ? void 0 : data.type) === 'phone') {
                    authToken = await this.authClient.idx.proceed({ authenticator: AuthenticatorKey.PHONE_NUMBER, methodType: data === null || data === void 0 ? void 0 : data.methodType });
                }
                await this.proceed(authToken, this.authClient, data, resolve, reject);
            })().catch(err => {
                reject(err);
            });
        });
    }
}
//# sourceMappingURL=web.js.map