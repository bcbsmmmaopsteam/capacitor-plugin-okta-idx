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
                const authClient = new oktaAuthJs.OktaAuth({
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
                    const authToken = await authClient.idx.startTransaction();
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
                        await this.proceed(authToken, authClient, data, resolve, reject);
                    }
                    {
                        reject();
                    }
                })().catch(err => {
                    reject(err);
                });
            });
        }
        async proceed(authToken, authClient, data, resolve, reject) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
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
                if (authToken.nextStep.inputs[0].name === 'password') {
                    authToken = await authClient.idx.proceed({ [authToken.nextStep.inputs[0].name]: password });
                }
            }
            if (authToken.status === oktaAuthJs.IdxStatus.PENDING) {
                await this.proceed(authToken, authClient, data, resolve, reject);
            }
            else if (authToken.status === oktaAuthJs.IdxStatus.SUCCESS) {
                const tokenResponse = {
                    access_token: (_l = (_k = authToken.tokens) === null || _k === void 0 ? void 0 : _k.accessToken) === null || _l === void 0 ? void 0 : _l.accessToken,
                    refresh_token: (_o = (_m = authToken.tokens) === null || _m === void 0 ? void 0 : _m.refreshToken) === null || _o === void 0 ? void 0 : _o.refreshToken,
                    scope: (_q = (_p = authToken.tokens) === null || _p === void 0 ? void 0 : _p.accessToken) === null || _q === void 0 ? void 0 : _q.scopes.join(' '),
                    id_token: (_s = (_r = authToken.tokens) === null || _r === void 0 ? void 0 : _r.idToken) === null || _s === void 0 ? void 0 : _s.idToken,
                    token_type: (_u = (_t = authToken.tokens) === null || _t === void 0 ? void 0 : _t.accessToken) === null || _u === void 0 ? void 0 : _u.tokenType,
                    expires_in: (_w = (_v = authToken.tokens) === null || _v === void 0 ? void 0 : _v.accessToken) === null || _w === void 0 ? void 0 : _w.expiresAt
                };
                resolve(tokenResponse);
            }
        }
        refreshToken(data) {
            return new Promise((resolve) => {
                resolve(data);
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
