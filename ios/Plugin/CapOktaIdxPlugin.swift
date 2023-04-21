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
        let scopes = call.getArray("scopes", [])

//        let flow = InteractionCodeFlow(
//            issuer: URL(string: issuer)!,
//            clientId: clientId,
//            scopes: scopes.description,
//            redirectUri: URL(string: redirectUri)!)
//
//        let username = call.getString("username") ?? ""
//        let password = call.getString("password") ?? ""
//
//        if #available(iOS 15.0, *) {
//            var response = try await flow.start()
//
//            guard let remediation  = response.remediations[.identify],
//                   let usernameField = remediation["identifier"],
//                  let passwordField = remediation["credentials.passcode"]
//            else {
//                return nil
//            }
//
//            usernameField.value = username
//            passwordField.value = password
//
//            response = try await remediation.proceed()
//
//            guard response.isLoginSuccessful
//            else {
//                return nil
//            }
//
//            return try await response.exchangeCode()
//        } else {
//            // Fallback on earlier versions
//            return nil
//        }
    }
}
