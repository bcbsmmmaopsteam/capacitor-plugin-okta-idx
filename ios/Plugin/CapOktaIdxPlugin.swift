import Foundation
import Capacitor
import OktaIdx

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(CapOktaIdxPlugin)
public class CapOktaIdxPlugin: CAPPlugin {
    private let implementation = CapOktaIdx()

    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.resolve([
            "value": implementation.echo(value)
        ])
    }

    @objc func fetchTokens(_ call: CAPPluginCall) {
        
        let issuer = call.getString("issuer") ?? ""
        let clientId = call.getString("clientId") ?? ""
        let redirectUri = call.getString("redirectUri") ?? ""
        let scopes = call.options?["scopes"] as! [String]

        let flow = InteractionCodeFlow(
            issuer: URL(string: issuer)!,
            clientId: clientId,
            scopes: scopes.joined(separator: " "),
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
    
    func proceed(_ call: CAPPluginCall, response: Response) {
        
        let username = call.getString("username") ?? ""
        let password = call.getString("password") ?? ""
        
        if let message = response.messages.allMessages.first {
            call.reject(message.message)
            return
        }
        
        
        if let remediation = response.remediations[.identify],
           let usernameField = remediation["identifier"] {
            
            usernameField.value = username
            remediation["credentials.passcode"]?.value = password
            
            self.remediationProcess(call, remediation: remediation)
            return
        }
        else if let remediation = response.remediations[.challengeAuthenticator],
                let passwordField = remediation["credentials.passcode"] {
            
            passwordField.value = password
            
            self.remediationProcess(call, remediation: remediation)
            return
            
        }
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
        remediation.proceed() { usernameResponse in
            switch usernameResponse {
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
}
