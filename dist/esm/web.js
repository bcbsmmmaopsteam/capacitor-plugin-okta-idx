import { WebPlugin } from '@capacitor/core';
import { OktaAuth } from '@okta/okta-auth-js';
export class CapOktaIdxWeb extends WebPlugin {
    async echo(options) {
        console.log('ECHO', options);
        return options;
    }
    fetchTokens(data) {
        return new Promise((resolve, reject) => {
            const authClient = new OktaAuth({
                issuer: data.issuer,
                clientId: data.clientId,
                redirectUri: data.redirectUri,
                scopes: data.scopes
            });
            const username = data.username;
            const password = data.password;
            (async () => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                const authToken = await authClient.idx.authenticate({
                    username,
                    password
                });
                if (authToken.status === 'SUCCESS') {
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
}
//# sourceMappingURL=web.js.map