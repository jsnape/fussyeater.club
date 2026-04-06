export function getCookieValue(name: string): string | null {
    const token = document.cookie
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${name}=`))
        ?.slice(name.length + 1);
    return token ? decodeURIComponent(token) : null;
}
