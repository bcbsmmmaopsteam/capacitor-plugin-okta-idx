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
        let username = call.getString("username") ?? ""
        let password = call.getString("password") ?? ""

        let flow = InteractionCodeFlow(
            issuer: URL(string: issuer)!,
            clientId: clientId,
            scopes: scopes.joined(separator: " "),
            redirectUri: URL(string: redirectUri)!)
        
//       let response =  await flow.start();
        
    flow.start { result in
        switch result {
        case .success(var response):
            
            self.proceed(call, response: response)
            
            break
        case .failure(_):
            break
        }
            
            
            
            
            
            
            
            
            
            
            
            
            
            
//            guard let remediation = response.remediations[.identify],
//                  let usernameField = remediation["identifier"]
////                  let passwordField = remediation["credentials.passcode"]
//                else {
//                    call.reject("Login Unsuccesful")
//                    return
//                }
//            usernameField.value = username
////            remediation["credentials.passcode"]?.value = password
//
//            remediation.proceed() { tokenResponse in
//                switch tokenResponse {
//                case .success(let userNameResponse):
//                        guard let remediation = userNameResponse.remediations[.challengeAuthenticator],
//                            let passwordField = remediation["credentials.passcode"]
//                        else {
//                            call.reject("")
//                            return
//                        }
//                        passwordField.value = password
//                        remediation.proceed() { tokenResponse in
//                            switch tokenResponse {
//                            case .success(let finalResponse):
//                                finalResponse.exchangeCode() { tokens in
//                                    switch tokens {
//                                    case .success(let accessTokens):
//                                        call.resolve([
//                                            "access_token": accessTokens.accessToken,
//                                            "refresh_token": accessTokens.refreshToken ?? "",
//                                            "scope": accessTokens.scope ?? "",
//                                            "id_token": accessTokens.idToken?.rawValue ?? "",
//                                            "token_type": accessTokens.tokenType,
//                                            "expires_in": accessTokens.expiresIn
//                                        ])
//                                        break
//                                    case .failure(_):
//                                        call.reject("")
//                                        break
//                                    }
//
//                                }
//                                break
//                            case .failure(_):
//                                call.reject("")
//                                break
//                            }
//                        }
//
//                    break
//                case .failure(_):
//                    call.reject("")
//                    break
//                }
//            }
//        case .failure(let error):
//            call.reject("Login Unsuccesful")
//            print(error)
//            break
//        }
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
        else if let remediation = response.remediations[.challengeAuthenticator],
                let passwordField = remediation["credentials.passcode"] {
            
            passwordField.value = password
            
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
}
