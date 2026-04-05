import { betterAuth } from 'better-auth';

type AuthConfig = {
    secret?: string;
    baseURL?: string;
    microsoftClientId?: string;
    microsoftClientSecret?: string;
};

export function createAuth(config: AuthConfig) {
    return betterAuth({
        secret: config.secret,
        baseURL: config.baseURL,
        emailAndPassword: {
            enabled: true,
            requireEmailVerification: false
        },
        socialProviders: {
            microsoft: {
                clientId: config.microsoftClientId ?? '',
                clientSecret: config.microsoftClientSecret ?? ''
            }
        }
    });
}
