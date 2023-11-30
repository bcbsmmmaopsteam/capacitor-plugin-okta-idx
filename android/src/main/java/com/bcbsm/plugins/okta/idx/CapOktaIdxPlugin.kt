package com.bcbsm.plugins.okta.idx

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.okta.authfoundation.client.OidcClient
import com.okta.authfoundation.client.OidcClientResult
import com.okta.authfoundation.client.OidcConfiguration
import com.okta.authfoundation.credential.Token
import com.okta.idx.kotlin.client.InteractionCodeFlow
import com.okta.idx.kotlin.client.InteractionCodeFlow.Companion.createInteractionCodeFlow
import com.okta.idx.kotlin.dto.IdxAuthenticator
import com.okta.idx.kotlin.dto.IdxProfileCapability
import com.okta.idx.kotlin.dto.IdxRemediation
import com.okta.idx.kotlin.dto.IdxResendCapability
import com.okta.idx.kotlin.dto.IdxResponse
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import okhttp3.HttpUrl.Companion.toHttpUrl
import org.json.JSONException

@CapacitorPlugin(name = "CapOktaIdx")
class CapOktaIdxPlugin : Plugin() {

    var idxResponseSession: IdxResponse? = null
    var interactionCodeFlowSession: InteractionCodeFlow? = null
    private var remidiation: IdxRemediation? = null

    @PluginMethod
    @Throws(JSONException::class)
    fun fetchTokens(call: PluginCall) {
        val oidcClient: OidcClient = initializeConnection(call);

        GlobalScope.launch {
            val response: OidcClientResult<InteractionCodeFlow>  = oidcClient.createInteractionCodeFlow(
                    call.getString("redirectUri")!!
            )
            var idxresponse: OidcClientResult<IdxResponse> = response.getOrThrow().resume();
            proceed(call, response.getOrThrow(), idxresponse.getOrThrow());
        }
    }

    @PluginMethod
    @Throws(JSONException::class)
    fun refreshToken(call: PluginCall) {
        val oidcClient: OidcClient = initializeConnection(call);
        GlobalScope.launch {
            val tokensResult: OidcClientResult<Token>  = oidcClient.refreshToken(call.getString("refresh_token")!!);
            try {
                var tokens = tokensResult.getOrThrow();
                processResponse(call, tokens);
            }catch (e: Exception) {
                call.reject(e.message, (e as OidcClientResult.Error.HttpResponseException).responseCode.toString());
            }
        }

    }

    @PluginMethod
    @Throws(JSONException::class)
    fun selectAuthenticator(call: PluginCall) {
        var index: Int = remidiation?.form?.visibleFields?.get(0)?.options?.indexOfFirst { it.authenticator?.key == "okta_email" }!!
        remidiation?.form?.visibleFields?.get(0)?.selectedOption = remidiation?.form?.visibleFields?.get(0)?.options?.get(index)
        makeProceedRequest(call, remidiation, interactionCodeFlowSession!!);
    }

    @PluginMethod
    @Throws(JSONException::class)
    fun verifyOtp(call: PluginCall) {
        remidiation?.form?.visibleFields?.get(0)?.form?.visibleFields?.get(0)?.value = call.getString("otp")
        makeProceedRequest(call, remidiation, interactionCodeFlowSession!!);
    }

    @PluginMethod
    @Throws(JSONException::class)
    fun resendOtp(call: PluginCall) {
        var resendRemediation = idxResponseSession?.authenticators?.current?.capabilities?.get<IdxResendCapability>()?.remediation
        makeProceedRequest(call, resendRemediation, interactionCodeFlowSession!!);
    }

    fun initializeConnection(call: PluginCall): OidcClient {
        val oidcConfig = OidcConfiguration(
                call.getString("clientId")!!,
                call.getString("scopes")!!
        )

        return OidcClient.createFromDiscoveryUrl(
                oidcConfig,
                (call.getString("issuer") + "/.well-known/openid-configuration").toHttpUrl()
        )
    }

    fun proceed(call: PluginCall, interactionCodeFlow: InteractionCodeFlow, idxResponse: IdxResponse) {
        idxResponseSession = idxResponse
        interactionCodeFlowSession = interactionCodeFlow
        if (idxResponse.messages.size > 0) {
            call.reject(idxResponse.messages.get(0).message)
        }else if (idxResponse.isLoginSuccessful) {
            remidiation = idxResponse.remediations.get(IdxRemediation.Type.ISSUE);
            GlobalScope.launch {
                var tokensResult: OidcClientResult<Token>  = interactionCodeFlowSession!!.exchangeInteractionCodeForTokens(remidiation!!);
                try {
                    var tokens = tokensResult.getOrThrow();
                    processResponse(call, tokens);
                } catch (e: Exception) {
                    call.reject(e.message, (e as OidcClientResult.Error.HttpResponseException).responseCode.toString());
                }
            }
        }else {
            if (idxResponse.remediations.get(IdxRemediation.Type.IDENTIFY) != null) {
                remidiation = idxResponse.remediations.get(IdxRemediation.Type.IDENTIFY);
                remidiation?.form?.visibleFields?.get(0)?.value = call.getString("username");
                makeProceedRequest(call, remidiation, interactionCodeFlowSession!!);
            }else if (idxResponse.remediations.get(IdxRemediation.Type.CHALLENGE_AUTHENTICATOR) != null) {
                remidiation = idxResponse.remediations.get(IdxRemediation.Type.CHALLENGE_AUTHENTICATOR);
                if (idxResponse?.authenticators?.current?.key == "okta_password") {
                    remidiation?.form?.visibleFields?.get(0)?.form?.visibleFields?.get(0)?.value = call.getString("password")
                    makeProceedRequest(call, remidiation, interactionCodeFlowSession!!);
                }else {
                    val ret = JSObject();
                    ret.put("remediation", "verificationCode");
                    call.resolve(ret)
                }
            }else if (idxResponse.remediations.get(IdxRemediation.Type.SELECT_AUTHENTICATOR_AUTHENTICATE) != null) {
                remidiation = idxResponse.remediations.get(IdxRemediation.Type.SELECT_AUTHENTICATOR_AUTHENTICATE)
                if (idxResponse.authenticators.get(IdxAuthenticator.Kind.PASSWORD) != null) {
                    var index: Int = remidiation?.form?.visibleFields?.get(0)?.options?.indexOfFirst { it.authenticator?.key == "okta_password" }!!
                    remidiation?.form?.visibleFields?.get(0)?.selectedOption = remidiation?.form?.visibleFields?.get(0)?.options?.get(index)
                    makeProceedRequest(call, remidiation, interactionCodeFlowSession!!);
                }else {
                    val ret = JSObject();
                    ret.put("remediation", "select-authenticator-authenticate");
                    ret.put("email", (idxResponse.authenticators.get(IdxAuthenticator.Kind.EMAIL) as IdxAuthenticator).capabilities.get<IdxProfileCapability>()?.profile?.get("email"))
                    ret.put("phoneNumber", (idxResponse.authenticators.get(IdxAuthenticator.Kind.PHONE) as IdxAuthenticator).capabilities.get<IdxProfileCapability>()?.profile?.get("phoneNumber"))
                    call.resolve(ret)
                }
            }
        }
    }

    fun makeProceedRequest(call: PluginCall, remidiation: IdxRemediation?, interactionCodeFlow: InteractionCodeFlow) {
        if (remidiation != null) {
            GlobalScope.launch {
                val clientResult: OidcClientResult<IdxResponse> = interactionCodeFlow.proceed(remidiation);
                try {
                    var tokens = clientResult.getOrThrow();
                    proceed(call, interactionCodeFlow, tokens);
                } catch (e: Exception) {
                    call.reject(e.message, (e as OidcClientResult.Error.HttpResponseException).responseCode.toString());
                }
            }
        }
    }

    fun processResponse(call: PluginCall, tokens: Token) {
        if (tokens != null) {
            val ret = JSObject();
            ret.put("access_token", tokens.accessToken);
            ret.put("expires_in", tokens.expiresIn);
            ret.put("id_token", tokens.idToken);
            ret.put("refresh_token", tokens.refreshToken);
            ret.put("scope", tokens.scope);
            ret.put("token_type", tokens.tokenType);
            call.resolve(ret)
        }else {
            call.reject("No Token Response found");
        }
    }
}