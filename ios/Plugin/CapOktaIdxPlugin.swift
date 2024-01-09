import Foundation
import Capacitor
import OktaIdx

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(CapOktaIdxPlugin)
public class CapOktaIdxPlugin: CAPPlugin {

    
    var flow: (InteractionCodeFlow)? = nil
    var response: Response? = nil
    
    @objc func fetchTokens(_ call: CAPPluginCall) {
        
        let issuer = call.getString("issuer") ?? ""
        let clientId = call.getString("clientId") ?? ""
        let redirectUri = call.getString("redirectUri") ?? ""
        let scopes = call.getString("scopes") ?? ""

        let flow = InteractionCodeFlow(
            issuer: URL(string: issuer)!,
            clientId: clientId,
            scopes: scopes,
            redirectUri: URL(string: redirectUri)!)
        
            flow.start { result in
                switch result {
                case .success(let response):
                    self.proceed(call, response: response)
                    
                    break
                case .failure(_):
                    break
                }

            }
        
        }
    
    @objc func refreshToken(_ call: CAPPluginCall) {
        let issuer = call.getString("issuer") ?? ""
        let clientId = call.getString("clientId") ?? ""
        let redirectUri = call.getString("redirectUri") ?? ""
        let scopes = call.getString("scopes") ?? ""
        let refreshToken = call.getString("refresh_token") ?? ""
        
        let flow = InteractionCodeFlow(
            issuer: URL(string: issuer)!,
            clientId: clientId,
            scopes: scopes,
            redirectUri: URL(string: redirectUri)!)
        
        Token.from(refreshToken: refreshToken, using: flow.client) { result in
            switch result {
            case .success(let accessTokens):
                
                call.resolve([
                    "access_token": accessTokens.accessToken,
                    "refresh_token": accessTokens.refreshToken ?? "",
                    "scope": accessTokens.scope ?? "",
                    "id_token": accessTokens.idToken?.rawValue ?? "",
                    "token_type": accessTokens.tokenType,
                    "expires_in": accessTokens.expiresIn
                ])
                
                break
            case .failure(let error):
                call.reject(error.errorDescription ?? "")
                break
            }
        }
    }
    
    func proceed(_ call: CAPPluginCall, response: Response) {
        self.response = response
        let username = call.getString("username") ?? ""
        let password = call.getString("password") ?? ""
        
        if let message = response.messages.allMessages.first {
            call.reject(message.message, message.localizationKey)
            return
        }
        
        
        if let remediation = response.remediations[.identify],
           let usernameField = remediation["identifier"],
           let rememberMeField = remediation["rememberMe"] {
            
            usernameField.value = username
            rememberMeField.value = call.getString("rememberme") ?? ""
            remediation["credentials.passcode"]?.value = password
            
            self.remediationProcess(call, remediation: remediation)
            return
        }
        else if let remediation = response.remediations[.challengeAuthenticator] {
            if response.authenticators.current?.key == "okta_password",
               let passwordField = remediation["credentials.passcode"] {
                
                passwordField.value = password
                self.remediationProcess(call, remediation: remediation)
            }else {
                call.resolve([
                    "remediation": remediation.name
                ])
            }
            return
        }
        else if let remediation = response.remediations[.selectAuthenticatorAuthenticate],
                let authenticatorField = remediation["authenticator"]
    {
            let chosenOption = authenticatorField.options?.first(where: {option in
                option.label == "Password"
            })
            if (chosenOption == nil) {
                let emailAuthenticators: OktaIdx.Authenticator? = response.authenticators.enrolled.first(where: {option in
                    option.type == OktaIdx.Authenticator.Kind.email
                }) ?? nil
                let phoneAuthenticators: OktaIdx.Authenticator? = response.authenticators.enrolled.first(where: {option in
                    option.type == OktaIdx.Authenticator.Kind.phone
                }) ?? nil
                let emailCapability: Capability.Profile = emailAuthenticators?.capabilities[0] as! Capability.Profile
                let phoneCapability: Capability.Profile = phoneAuthenticators?.capabilities[0] as! Capability.Profile
                call.resolve([
                    "remediation": remediation.name,
                    "email": emailCapability.values.first?.value ?? "",
                    "phoneNumber": phoneCapability.values.first?.value ?? ""
                ])
                return
            }
//            call.resolve(["remediation": remediation.name])
            authenticatorField.selectedOption = chosenOption
            
            self.remediationProcess(call, remediation: remediation)
            return
        }
//        else if let remediation = response.remediations[.challengeAuthenticator] {
//            call.reject(remediation.name)
//            return
//        }
                    
        else if response.isLoginSuccessful {
            response.exchangeCode() { tokens in
                switch tokens {
                case .success(let accessTokens):
                    
                    call.resolve([
                        "access_token": accessTokens.accessToken,
                        "refresh_token": accessTokens.refreshToken ?? "",
                        "scope": accessTokens.scope ?? "",
                        "id_token": accessTokens.idToken?.rawValue ?? "",
                        "token_type": accessTokens.tokenType,
                        "expires_in": accessTokens.expiresIn
                    ])
                    break
                case .failure(_):
                    call.reject("")
                    break
                }
                return
            }
        }
        else {
            call.reject("")
            return
        }
    }
    
    func remediationProcess(_ call: CAPPluginCall, remediation: Remediation) {
            remediation.proceed() { response in
                switch response {
                case .success(let successResponse):
                    self.proceed(call, response: successResponse)
                    break
                case .failure(_):
                    call.reject("")
                    break
                }
                return
            }
        
    }
    
    @objc func selectAuthenticator(_ call: CAPPluginCall) {
        if let remediation = self.response?.remediations[.selectAuthenticatorAuthenticate],
                let authenticatorField = remediation["authenticator"]
        {
            if call.getString("type") == "email" {
                let chosenOption = authenticatorField.options?.first(where: {option in
                    option.label == "Email"
                })
                
                authenticatorField.selectedOption = chosenOption
            }else {
                let phoneOption = authenticatorField.options?.first(where: { option in
                    option.label == "Phone"
                })
                var smsMethod: Remediation.Form.Field? = nil
                let methodTypeField = phoneOption?["methodType"]
                if call.getString("methodType") == "sms" {
                    smsMethod = methodTypeField?.options?.first(where: { option in
                              option.label == "SMS"
                          })
                }else {
                    smsMethod = methodTypeField?.options?.first(where: { option in
                              option.label == "Voice call"
                          })
                }
                authenticatorField.selectedOption = phoneOption
                methodTypeField?.selectedOption = smsMethod
            }
            
            self.remediationProcess(call, remediation: remediation)
        }else {
            call.reject("")
        }
       
    }
    
    @objc func selectAlternateAuthenticator(_ call: CAPPluginCall) {
//        if let remediation = self.response?.remediations[.selectAuthenticatorAuthenticate]
        selectAuthenticator(call)
    }
    
    @objc func verifyOtp(_ call: CAPPluginCall) {
        
        
        if let remediation = self.response?.remediations[.challengeAuthenticator],
           let passwordField = remediation["credentials.passcode"] {
            passwordField.value = call.getString("otp") ?? ""
            
            self.remediationProcess(call, remediation: remediation)
        }
    }
    
    @objc func resendOtp(_ call: CAPPluginCall) {
        let capability: Capability.Resendable = self.response!.authenticators.current?.capabilities[1] as! Capability.Resendable
        capability.resend() { response in
            switch response {
            case .success(let successResponse):
                call.resolve([
                    "remediation": ""
                ])
                break
            case .failure(_):
                call.reject("")
                break
            }
            return
            }
        }
    }

