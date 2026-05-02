const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.trim()
		.replace(/['']/g, '')
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.replace(/-{2,}/g, '-')
		.replace(/^-|-$/g, '');
}

export function isValidSlug(id: string): boolean {
	if (!id || id.length > 200) {
		return false;
	}

	return SLUG_PATTERN.test(id);
}
