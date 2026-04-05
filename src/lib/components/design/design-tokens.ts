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
    { name: 'Primary', token: '--fe-color-primary', hex: '#DC2626' },
    { name: 'Secondary', token: '--fe-color-secondary', hex: '#F87171' },
    { name: 'Accent / CTA', token: '--fe-color-accent', hex: '#CA8A04' },
    { name: 'Success', token: '--fe-color-success', hex: '#16A34A' },
    { name: 'Surface', token: '--fe-color-surface', hex: '#FEF2F2' },
    { name: 'Text', token: '--fe-color-text', hex: '#450A0A' }
];

export const spacingTokens: ScaleToken[] = [
    { token: '--fe-space-xs', value: '4px' },
    { token: '--fe-space-sm', value: '8px' },
    { token: '--fe-space-md', value: '16px' },
    { token: '--fe-space-lg', value: '24px' },
    { token: '--fe-space-xl', value: '32px' },
    { token: '--fe-space-2xl', value: '48px' }
];

export const elevationTokens: ScaleToken[] = [
    { token: '--fe-shadow-sm', value: '0 1px 2px rgba(69,10,10,0.08)' },
    { token: '--fe-shadow-md', value: '0 6px 18px rgba(69,10,10,0.12)' },
    { token: '--fe-shadow-lg', value: '0 12px 30px rgba(69,10,10,0.16)' }
];
