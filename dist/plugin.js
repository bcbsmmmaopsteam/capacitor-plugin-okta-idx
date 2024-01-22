var capacitorCapOktaIdx = (function (exports, core, oktaAuthJs) {
    'use strict';

    const CapOktaIdx = core.registerPlugin('CapOktaIdx', {
        web: () => Promise.resolve().then(function () { return web; }).then(m => new m.CapOktaIdxWeb()),
    });

    class CapOktaIdxWeb extends core.WebPlugin {
        fetchTokens(data) {
            // window.sessionStorage.clear();
            // window.localStorage.clear();
            return new Promise((resolve, reject) => {
                this.authClient = new oktaAuthJs.OktaAuth({
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
                    if (authToken.status !== oktaAuthJs.IdxStatus.SUCCESS) {
                        await this.proceed(authToken, this.authClient, data, resolve, reject);
                    }
                    else if (authToken.status === oktaAuthJs.IdxStatus.SUCCESS) {
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
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24;
            const username = data.username;
            const password = data.password;
            if (((_a = authToken === null || authToken === void 0 ? void 0 : authToken.messages) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                reject({ message: (_b = authToken.messages[0]) === null || _b === void 0 ? void 0 : _b.message, code: (_d = (_c = authToken.messages[0]) === null || _c === void 0 ? void 0 : _c.i18n) === null || _d === void 0 ? void 0 : _d.key });
            }
            else if (((_e = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _e === void 0 ? void 0 : _e.name) == 'identify' && ((_f = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _f === void 0 ? void 0 : _f.inputs) && ((_h = (_g = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _g === void 0 ? void 0 : _g.inputs) === null || _h === void 0 ? void 0 : _h.length) > 0) {
                if (authToken.nextStep.inputs[0].name === 'username') {
                    authToken = await authClient.idx.proceed({ [authToken.nextStep.inputs[0].name]: username, [authToken.nextStep.inputs[1].name]: data.rememberme });
                }
            }
            else if (((_j = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _j === void 0 ? void 0 : _j.name) == 'challenge-authenticator' && ((_k = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _k === void 0 ? void 0 : _k.inputs) && ((_m = (_l = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _l === void 0 ? void 0 : _l.inputs) === null || _m === void 0 ? void 0 : _m.length) > 0) {
                // let verificationCode = '1234';
                if (authToken.nextStep.inputs[0].name === 'password') {
                    authToken = await authClient.idx.proceed({ [authToken.nextStep.inputs[0].name]: password });
                }
                else if (authToken.nextStep.inputs[0].name === 'verificationCode') {
                    resolve({ remediation: (_o = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _o === void 0 ? void 0 : _o.name });
                    return;
                }
            }
            else if (((_p = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _p === void 0 ? void 0 : _p.name) == 'select-authenticator-authenticate' && ((_q = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _q === void 0 ? void 0 : _q.inputs) && ((_s = (_r = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _r === void 0 ? void 0 : _r.inputs) === null || _s === void 0 ? void 0 : _s.length) > 0) {
                const passwordOption = (_t = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _t === void 0 ? void 0 : _t.inputs[0].options.find((res) => res.value === "okta_password");
                if (passwordOption) {
                    authToken = await authClient.idx.proceed({ [authToken.nextStep.inputs[0].name]: oktaAuthJs.AuthenticatorKey.OKTA_PASSWORD });
                }
                else {
                    resolve({
                        remediation: (_u = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _u === void 0 ? void 0 : _u.name,
                        email: (_z = (_y = (_x = (_w = (_v = authToken === null || authToken === void 0 ? void 0 : authToken.neededToProceed[0]) === null || _v === void 0 ? void 0 : _v.value[0]) === null || _w === void 0 ? void 0 : _w.options[0]) === null || _x === void 0 ? void 0 : _x.relatesTo) === null || _y === void 0 ? void 0 : _y.profile) === null || _z === void 0 ? void 0 : _z.email,
                        phoneNumber: (_4 = (_3 = (_2 = (_1 = (_0 = authToken === null || authToken === void 0 ? void 0 : authToken.neededToProceed[0]) === null || _0 === void 0 ? void 0 : _0.value[0]) === null || _1 === void 0 ? void 0 : _1.options[1]) === null || _2 === void 0 ? void 0 : _2.relatesTo) === null || _3 === void 0 ? void 0 : _3.profile) === null || _4 === void 0 ? void 0 : _4.phoneNumber
                    });
                    return;
                }
                // else {
                //   resolve({'remediation': authToken?.nextStep?.name});
                // }
                // if (authToken.nextStep.inputs[0].name === 'authenticator') {
                //     authToken = await authClient.idx.proceed({[authToken.nextStep.inputs[0].name]: AuthenticatorKey.OKTA_EMAIL});
                //   }
            }
            else if (((_5 = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _5 === void 0 ? void 0 : _5.name) === 'authenticator-verification-data' && ((_6 = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _6 === void 0 ? void 0 : _6.inputs) && ((_8 = (_7 = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _7 === void 0 ? void 0 : _7.inputs) === null || _8 === void 0 ? void 0 : _8.length) > 0) {
                resolve({
                    remediation: (_9 = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _9 === void 0 ? void 0 : _9.name,
                    email: (_12 = (_11 = (_10 = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _10 === void 0 ? void 0 : _10.authenticator) === null || _11 === void 0 ? void 0 : _11.profile) === null || _12 === void 0 ? void 0 : _12.email
                });
                return;
            }
            if (authToken.status !== oktaAuthJs.IdxStatus.SUCCESS) {
                await this.proceed(authToken, authClient, data, resolve, reject);
            }
            else if (authToken.status === oktaAuthJs.IdxStatus.SUCCESS) {
                const tokenResponse = {
                    access_token: (_14 = (_13 = authToken.tokens) === null || _13 === void 0 ? void 0 : _13.accessToken) === null || _14 === void 0 ? void 0 : _14.accessToken,
                    refresh_token: (_16 = (_15 = authToken.tokens) === null || _15 === void 0 ? void 0 : _15.refreshToken) === null || _16 === void 0 ? void 0 : _16.refreshToken,
                    scope: (_18 = (_17 = authToken.tokens) === null || _17 === void 0 ? void 0 : _17.accessToken) === null || _18 === void 0 ? void 0 : _18.scopes.join(' '),
                    id_token: (_20 = (_19 = authToken.tokens) === null || _19 === void 0 ? void 0 : _19.idToken) === null || _20 === void 0 ? void 0 : _20.idToken,
                    token_type: (_22 = (_21 = authToken.tokens) === null || _21 === void 0 ? void 0 : _21.accessToken) === null || _22 === void 0 ? void 0 : _22.tokenType,
                    expires_in: (_24 = (_23 = authToken.tokens) === null || _23 === void 0 ? void 0 : _23.accessToken) === null || _24 === void 0 ? void 0 : _24.expiresAt
                };
                resolve(tokenResponse);
            }
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
                    if ((data === null || data === void 0 ? void 0 : data.remediation) === 'authenticator-verification-data') {
                        payload = { methodType: data === null || data === void 0 ? void 0 : data.methodType };
                    }
                    else {
                        payload = (data === null || data === void 0 ? void 0 : data.type) === 'email' ? { authenticator: oktaAuthJs.AuthenticatorKey.OKTA_EMAIL, methodType: data === null || data === void 0 ? void 0 : data.methodType } : { authenticator: oktaAuthJs.AuthenticatorKey.PHONE_NUMBER, methodType: data === null || data === void 0 ? void 0 : data.methodType };
                    }
                    const authToken = await this.authClient.idx.proceed(payload);
                    await this.proceed(authToken, this.authClient, data, resolve, reject);
                })().catch(err => {
                    reject(err);
                });
            });
        }
        verifyOtp(data) {
            return new Promise((resolve, reject) => {
                (async () => {
                    const authToken = await this.authClient.idx.proceed({ verificationCode: data === null || data === void 0 ? void 0 : data.otp });
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
                        authToken = await this.authClient.idx.proceed({ authenticator: oktaAuthJs.AuthenticatorKey.OKTA_EMAIL, methodType: data === null || data === void 0 ? void 0 : data.type });
                    }
                    else if ((data === null || data === void 0 ? void 0 : data.type) === 'phone') {
                        authToken = await this.authClient.idx.proceed({ authenticator: oktaAuthJs.AuthenticatorKey.PHONE_NUMBER, methodType: data === null || data === void 0 ? void 0 : data.methodType });
                    }
                    await this.proceed(authToken, this.authClient, data, resolve, reject);
                })().catch(err => {
                    reject(err);
                });
            });
        }
    }

    var web = /*#__PURE__*/Object.freeze({
        __proto__: null,
        CapOktaIdxWeb: CapOktaIdxWeb
    });

    exports.CapOktaIdx = CapOktaIdx;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({}, capacitorExports, oktaAuthJs);
//# sourceMappingURL=plugin.js.map
