import type { RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { getAuthContext } from '$lib/server/security';
import { isAdmin } from '$lib/server/admin';
import { getUnmappedIngredients } from '$lib/server/ingredient';
import {
	jsonWithRequestId,
	logError,
	logInfo,
	logWarn,
	resolveEventRequestId
} from '$lib/server/observability';

export const GET: RequestHandler = async (event) => {
	const { request, platform } = event;
	const requestId = resolveEventRequestId(event);

	logInfo('admin.ingredients.unmapped.start', requestId);

	const auth = await getAuthContext(request, platform);
	if (!auth.userId) {
		return jsonWithRequestId({ message: 'Authentication required' }, requestId, { status: 401 });
	}

	const db = requireDb(platform);
	if (!(await isAdmin(db, auth.userId, request))) {
		logWarn('admin.ingredients.unmapped.forbidden', requestId, { userId: auth.userId });
		return jsonWithRequestId({ message: 'Admin access required' }, requestId, { status: 403 });
	}

	try {
		const items = await getUnmappedIngredients(db);

		logInfo('admin.ingredients.unmapped.success', requestId, { count: items.length });

		return jsonWithRequestId({ items, total: items.length }, requestId);
	} catch (error) {
		logError('admin.ingredients.unmapped.failure', requestId, {
			error: error instanceof Error ? error.message : String(error)
		});
		return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, { status: 503 });
	}
};
