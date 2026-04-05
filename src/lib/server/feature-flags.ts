export const FEATURE_FLAGS = {
    registrationV2Enabled: 'auth.registration_v2_enabled',
    inviteMultiuseEnabled: 'auth.invite_multiuse_enabled',
    microsoftOAuthEnabled: 'auth.microsoft_oauth_enabled'
} as const;

const DEFAULTS: Record<(typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS], boolean> = {
    [FEATURE_FLAGS.registrationV2Enabled]: true,
    [FEATURE_FLAGS.inviteMultiuseEnabled]: true,
    [FEATURE_FLAGS.microsoftOAuthEnabled]: true
};

export function isFeatureEnabled(platform: App.Platform | undefined, name: string): boolean {
    const envKey = name.toUpperCase().replace(/\./g, '_');
    const raw = (platform?.env as Record<string, unknown> | undefined)?.[envKey];

    if (typeof raw === 'string') {
        return raw === '1' || raw.toLowerCase() === 'true';
    }

    if (typeof raw === 'boolean') {
        return raw;
    }

    return DEFAULTS[name as keyof typeof DEFAULTS] ?? false;
}
