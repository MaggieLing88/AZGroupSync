import jwt from 'jsonwebtoken'
import { Logger } from '../logger/winstonLogger.js'
import jwksClient from 'jwks-rsa'

const log = Logger.getInstance()

export function getAuthorizationHeader(req) {
    const authorization = req.headers.authorization || req.headers.Authorization
    let token = ''
    if (!authorization)
        throw new Error('Missing authorization header')
    else if (!authorization.includes('Bearer'))
        throw new Error('Invalid authorization header format')
    else
        token = authorization.split(" ")[1]

    return token
}

//Authorization header verification & validation
export function verifyAndValidateJWT(token) {
    // Verify the JWT
    return new Promise((resolve, reject) => {
        jwt.verify(token, getKey, (err, decoded) => {
            if (err) {
                return reject(err instanceof Error ? err : new Error(String(err)));
            }
            try {
                if (decoded)
                    validateJWT(decoded)
                else
                    return reject(new Error("JWT access token undefined"))
            } catch (error) {
                return reject(error instanceof Error ? error : new Error(String(error)))
            }
            resolve()
        });
    });
}

function validateJWT(decoded) {
    // Example claim validation
    const claims = decoded;
    if (claims.iss !== `https://login.microsoftonline.com/${String(process.env.TENANT_ID)}/v2.0`) {
        throw Error("Invalid issuer")
    } else if (claims.aud !== `${String(process.env.CLIENT_ID)}`) {
        throw Error("Invalid audience")
    } else if (!claims.roles?.includes('invokeAPI')) {
        throw Error("Missing or invalid roles")
    }
}

// Function to retrieve signing key
export function getKey(header, callback) {
    const JWKS_URI = `https://login.microsoftonline.com/${String(process.env.TENANT_ID)}/discovery/v2.0/keys`
    const client = jwksClient({ jwksUri: JWKS_URI })
    client.getSigningKey(header.kid, (err, key) => {
        if (key) {
            const signingKey = key.getPublicKey()
            callback(err, signingKey)
        } else {
            callback(new Error("Signing key not found"), undefined)
        }
    });
}

