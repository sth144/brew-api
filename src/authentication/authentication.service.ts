import * as jwt from "express-jwt";
import * as jwksRsa from "jwks-rsa";
import * as jwtDecode from "jwt-decode";

export const PROJECT_ID = "hindss-project";

/**
 * Service which provides global access to a jwt verifier and jwt decoding method.
 *  Uses Auth0 for 3rd party authorization
 */
export class AuthenticationService {
    private static _instance: AuthenticationService;
    public static get Instance(): AuthenticationService {
        if (!this._instance) this._instance = new AuthenticationService();
        return this._instance;
    }

    public JwtVerifier;

    private constructor() { 
        this.JwtVerifier = jwt({
            secret: jwksRsa.expressJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: "https://dev-hdtedn05.auth0.com/.well-known/jwks.json" 
            }),
            issuer: "https://dev-hdtedn05.auth0.com/", 
            algorithms: ["RS256"] 
        });
    }

    public decodeJwt(jwt) {
        return jwtDecode(jwt);
    }
}