export type ColorToken = {
    name: string;
    token: string;
    hex: string;
};

export type ScaleToken = {
    token: string;
    value: string;
};

export const colorTokens: ColorToken[] = [
    { name: 'Primary', token: '--fe-color-primary', hex: '#0D9488' },
    { name: 'Secondary', token: '--fe-color-secondary', hex: '#F97316' },
    { name: 'Accent', token: '--fe-color-accent', hex: '#8B5CF6' },
    { name: 'Success', token: '--fe-color-success', hex: '#22C55E' },
    { name: 'Warning', token: '--fe-color-warning', hex: '#F59E0B' },
    { name: 'Danger', token: '--fe-color-danger', hex: '#EF4444' },
    { name: 'Surface', token: '--fe-color-surface', hex: '#F8FAFC' },
    { name: 'Text', token: '--fe-color-text', hex: '#1E293B' },
    { name: 'Text Muted', token: '--fe-color-text-muted', hex: '#64748B' }
];

export const spacingTokens: ScaleToken[] = [
    { token: '--fe-space-xs', value: '4px' },
    { token: '--fe-space-sm', value: '8px' },
    { token: '--fe-space-md', value: '16px' },
    { token: '--fe-space-lg', value: '24px' },
    { token: '--fe-space-xl', value: '32px' },
    { token: '--fe-space-2xl', value: '48px' },
    { token: '--fe-space-3xl', value: '64px' },
    { token: '--fe-space-4xl', value: '96px' }
];

export const elevationTokens: ScaleToken[] = [
    { token: '--fe-shadow-sm', value: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' },
    { token: '--fe-shadow-md', value: '0 4px 16px rgba(0,0,0,0.08)' },
    { token: '--fe-shadow-lg', value: '0 12px 32px rgba(0,0,0,0.10)' }
];
