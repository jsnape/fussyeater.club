import type { RequestHandler } from '@sveltejs/kit';
import { requireDb } from '$lib/server/db';
import { getAuthContext } from '$lib/server/security';
import { getMembership } from '$lib/server/household';
import {
	jsonWithRequestId,
	logError,
	logInfo,
	logWarn,
	resolveEventRequestId
} from '$lib/server/observability';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 100;

export const GET: RequestHandler = async (event) => {
	const { request, platform, url } = event;
	const requestId = resolveEventRequestId(event);
	logInfo('recipes.list.get.start', requestId, { path: '/api/recipes' });

	const qRaw = url.searchParams.get('q')?.trim() ?? '';
	const pageRaw = url.searchParams.get('page');
	const pageSizeRaw = url.searchParams.get('pageSize');
	const sort = url.searchParams.get('sort') ?? 'latest';

	const page = pageRaw ? Number.parseInt(pageRaw, 10) : DEFAULT_PAGE;
	const pageSize = pageSizeRaw ? Number.parseInt(pageSizeRaw, 10) : DEFAULT_PAGE_SIZE;

	if (Number.isNaN(page) || page < 1 || Number.isNaN(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
		logWarn('recipes.list.get.invalid_params', requestId, { page: pageRaw, pageSize: pageSizeRaw });
		return jsonWithRequestId({ message: 'Invalid page or pageSize parameter' }, requestId, { status: 400 });
	}

	try {
		const db = requireDb(platform);
		const auth = await getAuthContext(request, platform);
		const membership = auth.userId ? await getMembership(db, auth.userId) : null;
		const userHouseholdId = membership?.householdId ?? null;

		let countSql: string;
		let listSql: string;
		const binds: unknown[] = [];
		let bindIndex = 1;

		// Build WHERE clause
		const conditions: string[] = [];

		// Visibility: public + user's private household recipes
		if (userHouseholdId) {
			conditions.push(`(visibility = 'public' OR (visibility = 'private' AND household_id = ?${bindIndex}))`);
			binds.push(userHouseholdId);
			bindIndex++;
		} else {
			conditions.push("visibility = 'public'");
		}

		// Keyword search
		if (qRaw) {
			conditions.push(`(title LIKE ?${bindIndex} OR description LIKE ?${bindIndex})`);
			binds.push(`%${qRaw}%`);
			bindIndex++;
		}

		const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

		// Sort
		let orderClause: string;
		switch (sort) {
			case 'quickest':
				orderClause = 'ORDER BY (COALESCE(prep_minutes, 0) + COALESCE(cook_minutes, 0)) ASC, title ASC';
				break;
			case 'latest':
			default:
				orderClause = 'ORDER BY created_at DESC, title ASC';
				break;
		}

		// Count query
		countSql = `SELECT COUNT(*) as total FROM recipes ${whereClause}`;
		const countResult = await db.prepare(countSql).bind(...binds).first<{ total: number }>();
		const total = countResult?.total ?? 0;

		// List query
		const offset = (page - 1) * pageSize;
		listSql = `SELECT id, title, description, image_url, type, visibility,
			servings, yield, prep_minutes, cook_minutes, source_reference, tags
			FROM recipes ${whereClause} ${orderClause} LIMIT ?${bindIndex} OFFSET ?${bindIndex + 1}`;

		const listBinds = [...binds, pageSize, offset];
		const listResult = await db.prepare(listSql).bind(...listBinds).all<{
			id: string;
			title: string;
			description: string | null;
			image_url: string | null;
			type: string;
			visibility: string;
			servings: number | null;
			yield: string | null;
			prep_minutes: number | null;
			cook_minutes: number | null;
			source_reference: string | null;
			tags: string;
		}>();

		const items = (listResult.results ?? []).map((row) => {
			const timings =
				row.prep_minutes != null || row.cook_minutes != null
					? { prepMinutes: row.prep_minutes ?? undefined, cookMinutes: row.cook_minutes ?? undefined }
					: undefined;

			return {
				id: row.id,
				title: row.title,
				description: row.description ?? undefined,
				imageUrl: row.image_url ?? undefined,
				type: row.type,
				visibility: row.visibility,
				timings,
				servings: row.servings ?? undefined,
				yield: row.yield ?? undefined,
				tags: safeParseJson<string[]>(row.tags, []),
				sourceReference: row.type === 'reference' ? safeParseJson(row.source_reference, undefined) : undefined
			};
		});

		logInfo('recipes.list.get.success', requestId, {
			queryPresent: Boolean(qRaw),
			resultCount: items.length,
			total,
			page
		});

		return jsonWithRequestId({ items, page, pageSize, total }, requestId);
	} catch (error) {
		logError('recipes.list.get.unexpected_failure', requestId, {
			error: error instanceof Error ? error.message : String(error)
		});
		return jsonWithRequestId({ message: 'Service temporarily unavailable' }, requestId, { status: 503 });
	}
};

function safeParseJson<T>(raw: string | null, fallback: T): T {
	if (!raw) return fallback;
	try {
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
}
