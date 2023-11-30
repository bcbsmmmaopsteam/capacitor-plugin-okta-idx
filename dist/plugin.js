var capacitorCapOktaIdx = (function (exports, core, oktaAuthJs) {
    'use strict';

    const CapOktaIdx = core.registerPlugin('CapOktaIdx', {
        web: () => Promise.resolve().then(function () { return web; }).then(m => new m.CapOktaIdxWeb()),
    });

    class CapOktaIdxWeb extends core.WebPlugin {
        initializeOkta(data) {
            this.authClient = new oktaAuthJs.OktaAuth({
                issuer: data.issuer,
                clientId: data.clientId,
                redirectUri: data.redirectUri,
                scopes: (data.scopes).split(' '),
            });
        }
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
                    if (authToken.status === oktaAuthJs.IdxStatus.SUCCESS) {
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
                    else if (authToken.status === oktaAuthJs.IdxStatus.PENDING) {
                        await this.proceed(authToken, this.authClient, data, resolve, reject);
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
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11;
            const username = data.username;
            const password = data.password;
            if (((_a = authToken === null || authToken === void 0 ? void 0 : authToken.messages) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                reject({ message: authToken.messages[0].message });
            }
            else if (((_b = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _b === void 0 ? void 0 : _b.name) == 'identify' && ((_c = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _c === void 0 ? void 0 : _c.inputs) && ((_e = (_d = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _d === void 0 ? void 0 : _d.inputs) === null || _e === void 0 ? void 0 : _e.length) > 0) {
                if (authToken.nextStep.inputs[0].name === 'username') {
                    authToken = await authClient.idx.proceed({ [authToken.nextStep.inputs[0].name]: username });
                }
            }
            else if (((_f = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _f === void 0 ? void 0 : _f.name) == 'challenge-authenticator' && ((_g = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _g === void 0 ? void 0 : _g.inputs) && ((_j = (_h = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _h === void 0 ? void 0 : _h.inputs) === null || _j === void 0 ? void 0 : _j.length) > 0) {
                // let verificationCode = '1234';
                if (authToken.nextStep.inputs[0].name === 'password') {
                    authToken = await authClient.idx.proceed({ [authToken.nextStep.inputs[0].name]: password });
                }
                else if (authToken.nextStep.inputs[0].name === 'verificationCode') {
                    // authToken = await authClient.idx.proceed({[authToken.nextStep.inputs[0].name]: verificationCode});
                    resolve({ remediation: authToken.nextStep.inputs[0].name });
                    return;
                }
            }
            else if (((_k = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _k === void 0 ? void 0 : _k.name) == 'select-authenticator-authenticate' && ((_l = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _l === void 0 ? void 0 : _l.inputs) && ((_o = (_m = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _m === void 0 ? void 0 : _m.inputs) === null || _o === void 0 ? void 0 : _o.length) > 0) {
                const passwordOption = (_p = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _p === void 0 ? void 0 : _p.inputs[0].options.find((res) => res.value === "okta_password");
                if (passwordOption) {
                    authToken = await authClient.idx.proceed({ [authToken.nextStep.inputs[0].name]: oktaAuthJs.AuthenticatorKey.OKTA_PASSWORD });
                }
                else {
                    resolve({
                        remediation: (_q = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _q === void 0 ? void 0 : _q.name,
                        options: (_r = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _r === void 0 ? void 0 : _r.inputs[0].options
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
            else if (((_s = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _s === void 0 ? void 0 : _s.name) == 'authenticator-verification-data' && ((_t = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _t === void 0 ? void 0 : _t.inputs) && ((_v = (_u = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _u === void 0 ? void 0 : _u.inputs) === null || _v === void 0 ? void 0 : _v.length) > 0) {
                if (authToken.nextStep.inputs[0].name === 'methodType') {
                    if ((data === null || data === void 0 ? void 0 : data.type) === 'email') {
                        authToken = await authClient.idx.proceed({ [authToken.nextStep.inputs[0].name]: (_x = (_w = authToken.nextStep.inputs[0]) === null || _w === void 0 ? void 0 : _w.options[0]) === null || _x === void 0 ? void 0 : _x.value });
                    }
                    else if ((data === null || data === void 0 ? void 0 : data.type) === 'phone') {
                        authToken = await authClient.idx.proceed({ [authToken.nextStep.inputs[0].name]: (_z = (_y = authToken.nextStep.inputs[0]) === null || _y === void 0 ? void 0 : _y.options[0]) === null || _z === void 0 ? void 0 : _z.value });
                    }
                }
            }
            if (authToken.status === oktaAuthJs.IdxStatus.PENDING) {
                await this.proceed(authToken, authClient, data, resolve, reject);
            }
            else if (authToken.status === oktaAuthJs.IdxStatus.SUCCESS) {
                const tokenResponse = {
                    access_token: (_1 = (_0 = authToken.tokens) === null || _0 === void 0 ? void 0 : _0.accessToken) === null || _1 === void 0 ? void 0 : _1.accessToken,
                    refresh_token: (_3 = (_2 = authToken.tokens) === null || _2 === void 0 ? void 0 : _2.refreshToken) === null || _3 === void 0 ? void 0 : _3.refreshToken,
                    scope: (_5 = (_4 = authToken.tokens) === null || _4 === void 0 ? void 0 : _4.accessToken) === null || _5 === void 0 ? void 0 : _5.scopes.join(' '),
                    id_token: (_7 = (_6 = authToken.tokens) === null || _6 === void 0 ? void 0 : _6.idToken) === null || _7 === void 0 ? void 0 : _7.idToken,
                    token_type: (_9 = (_8 = authToken.tokens) === null || _8 === void 0 ? void 0 : _8.accessToken) === null || _9 === void 0 ? void 0 : _9.tokenType,
                    expires_in: (_11 = (_10 = authToken.tokens) === null || _10 === void 0 ? void 0 : _10.accessToken) === null || _11 === void 0 ? void 0 : _11.expiresAt
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
                const authClient = new oktaAuthJs.OktaAuth({
                    issuer: data.issuer,
                    clientId: data.clientId,
                    redirectUri: data.redirectUri,
                    scopes: (data.scopes).split(' '),
                });
                (async () => {
                    let authToken;
                    if ((data === null || data === void 0 ? void 0 : data.type) === 'email') {
                        authToken = await authClient.idx.proceed({ authenticator: oktaAuthJs.AuthenticatorKey.OKTA_EMAIL });
                    }
                    else if ((data === null || data === void 0 ? void 0 : data.type) === 'phone') {
                        authToken = await authClient.idx.proceed({ authenticator: oktaAuthJs.AuthenticatorKey.PHONE_NUMBER });
                    }
                    await this.proceed(authToken, authClient, data, resolve, reject);
                })().catch(err => {
                    reject(err);
                });
            });
        }
        verifyOtp(data) {
            return new Promise((resolve, reject) => {
                const authClient = new oktaAuthJs.OktaAuth({
                    issuer: data.issuer,
                    clientId: data.clientId,
                    redirectUri: data.redirectUri,
                    scopes: (data.scopes).split(' '),
                });
                (async () => {
                    const authToken = await authClient.idx.proceed({ verificationCode: data === null || data === void 0 ? void 0 : data.otp });
                    await this.proceed(authToken, authClient, data, resolve, reject);
                })().catch(err => {
                    reject(err);
                });
            });
        }
        resendOtp() {
            return new Promise((resolve, reject) => {
                (async () => {
                    var _a;
                    const authToken = await this.authClient.idx.proceed({ resend: true });
                    console.log(authToken);
                    resolve({
                        remediation: (_a = authToken === null || authToken === void 0 ? void 0 : authToken.nextStep) === null || _a === void 0 ? void 0 : _a.name
                    });
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
