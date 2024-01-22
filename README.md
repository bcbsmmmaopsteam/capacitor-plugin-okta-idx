# capacitor-plugin-okta-idx

Okta

## Install

```bash
npm install capacitor-plugin-okta-idx
npx cap sync
```

## API

<docgen-index>

* [`fetchTokens(...)`](#fetchtokens)
* [`refreshToken(...)`](#refreshtoken)
* [`selectAuthenticator(...)`](#selectauthenticator)
* [`verifyOtp(...)`](#verifyotp)
* [`resendOtp()`](#resendotp)
* [`selectAlternateAuthenticator(...)`](#selectalternateauthenticator)
* [Interfaces](#interfaces)
* [Enums](#enums)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### fetchTokens(...)

```typescript
fetchTokens(data: TokenRequestOptions) => Promise<any>
```

| Param      | Type                                                                |
| ---------- | ------------------------------------------------------------------- |
| **`data`** | <code><a href="#tokenrequestoptions">TokenRequestOptions</a></code> |

**Returns:** <code>Promise&lt;any&gt;</code>

--------------------


### refreshToken(...)

```typescript
refreshToken(data: TokenRequestOptions) => Promise<any>
```

| Param      | Type                                                                |
| ---------- | ------------------------------------------------------------------- |
| **`data`** | <code><a href="#tokenrequestoptions">TokenRequestOptions</a></code> |

**Returns:** <code>Promise&lt;any&gt;</code>

--------------------


### selectAuthenticator(...)

```typescript
selectAuthenticator(data: AuthenticatorOptions) => Promise<any>
```

| Param      | Type                                                                  |
| ---------- | --------------------------------------------------------------------- |
| **`data`** | <code><a href="#authenticatoroptions">AuthenticatorOptions</a></code> |

**Returns:** <code>Promise&lt;any&gt;</code>

--------------------


### verifyOtp(...)

```typescript
verifyOtp(data: VarifyOptions) => Promise<any>
```

| Param      | Type                                                    |
| ---------- | ------------------------------------------------------- |
| **`data`** | <code><a href="#varifyoptions">VarifyOptions</a></code> |

**Returns:** <code>Promise&lt;any&gt;</code>

--------------------


### resendOtp()

```typescript
resendOtp() => Promise<any>
```

**Returns:** <code>Promise&lt;any&gt;</code>

--------------------


### selectAlternateAuthenticator(...)

```typescript
selectAlternateAuthenticator(data: AuthenticatorOptions) => Promise<any>
```

| Param      | Type                                                                  |
| ---------- | --------------------------------------------------------------------- |
| **`data`** | <code><a href="#authenticatoroptions">AuthenticatorOptions</a></code> |

**Returns:** <code>Promise&lt;any&gt;</code>

--------------------


### Interfaces


#### TokenRequestOptions

| Prop                | Type                 |
| ------------------- | -------------------- |
| **`issuer`**        | <code>string</code>  |
| **`clientId`**      | <code>string</code>  |
| **`redirectUri`**   | <code>string</code>  |
| **`scopes`**        | <code>string</code>  |
| **`username`**      | <code>string</code>  |
| **`password`**      | <code>string</code>  |
| **`rememberme`**    | <code>boolean</code> |
| **`refresh_token`** | <code>string</code>  |


#### AuthenticatorOptions

| Prop              | Type                                                                        |
| ----------------- | --------------------------------------------------------------------------- |
| **`type`**        | <code><a href="#authenticatortype">AuthenticatorType</a></code>             |
| **`methodType`**  | <code><a href="#authenticatormethodtype">AuthenticatorMethodType</a></code> |
| **`remediation`** | <code>string</code>                                                         |


#### VarifyOptions

| Prop      | Type                |
| --------- | ------------------- |
| **`otp`** | <code>string</code> |


### Enums


#### AuthenticatorType

| Members     | Value                |
| ----------- | -------------------- |
| **`EMAIL`** | <code>'email'</code> |
| **`PHONE`** | <code>'phone'</code> |


#### AuthenticatorMethodType

| Members     | Value                |
| ----------- | -------------------- |
| **`EMAIL`** | <code>'email'</code> |
| **`VOICE`** | <code>'voice'</code> |
| **`SMS`**   | <code>'sms'</code>   |

</docgen-api>
