package com.bcbsm.plugins.okta.idx;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.okta.idx.sdk.api.client.IDXAuthenticationWrapper;
import com.okta.idx.sdk.api.client.ProceedContext;
import com.okta.idx.sdk.api.model.AuthenticationStatus;
import com.okta.idx.sdk.api.model.RequestContext;
import com.okta.idx.sdk.api.response.AuthenticationResponse;
import com.okta.idx.sdk.api.model.AuthenticationOptions;

@CapacitorPlugin(name = "CapOktaIdx")
public class CapOktaIdxPlugin extends Plugin {

    @PluginMethod
    public void fetchTokens(PluginCall call) throws JSONException {
        IDXAuthenticationWrapper idxAuthenticationWrapper = new IDXAuthenticationWrapper(
                call.getString("issuer"),
                call.getString("clientId"),
                null,
                new HashSet<String>(call.getArray("scopes").toList()),
                call.getString("redirectUri"));
        AuthenticationResponse beginResponse = idxAuthenticationWrapper.begin();
        AuthenticationResponse authenticationResponse = idxAuthenticationWrapper
                .authenticate(new AuthenticationOptions(call.getString("username"), call.getString("password").toCharArray()), beginResponse.getProceedContext());
        if(authenticationResponse.getErrors().isEmpty()) {
            if(authenticationResponse.getAuthenticationStatus() == AuthenticationStatus.SUCCESS &&
                    authenticationResponse.getTokenResponse() != null) {
                JSObject ret = new JSObject();
                ret.put("access_token", authenticationResponse.getTokenResponse().getAccessToken());
                ret.put("expires_in", authenticationResponse.getTokenResponse().getExpiresIn());
                ret.put("id_token", authenticationResponse.getTokenResponse().getIdToken());
                ret.put("refresh_token", authenticationResponse.getTokenResponse().getRefreshToken());
                ret.put("scope", authenticationResponse.getTokenResponse().getScope());
                ret.put("token_type", authenticationResponse.getTokenResponse().getTokenType());
                call.resolve(ret);

            }else {
                call.reject("No Token Response found");
            }
        }else {
            call.reject(authenticationResponse.getErrors().get(0));
        }
    }
}
