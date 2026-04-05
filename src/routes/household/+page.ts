import type { PageLoad } from './$types';
import { ApiError, apiFetchWith } from '$lib/api';
import type { components } from '$lib/api-types';

type HouseholdMember = components['schemas']['HouseholdMember'];
type InviteStatus = components['schemas']['InviteStatus'];

function pageErrorMessage(status: number): string {
    switch (status) {
        case 403:
            return 'You do not have permission to view household details.';
        case 429:
            return 'Too many requests right now. Please try again in a moment.';
        case 503:
            return 'Household services are temporarily unavailable.';
        default:
            return 'Unable to load household details right now.';
    }
}

export const load: PageLoad = async ({ fetch }) => {
    try {
        const [membersResponse, invitesResponse] = await Promise.all([
            apiFetchWith<{ members: HouseholdMember[] }>(fetch, '/api/households/members'),
            apiFetchWith<{ invites: InviteStatus[] }>(fetch, '/api/households/invites')
        ]);

        return {
            members: membersResponse.members,
            invites: invitesResponse.invites,
            loadError: null
        };
    } catch (error) {
        if (error instanceof ApiError) {
            return {
                members: [] as HouseholdMember[],
                invites: [] as InviteStatus[],
                loadError: pageErrorMessage(error.status)
            };
        }

        return {
            members: [] as HouseholdMember[],
            invites: [] as InviteStatus[],
            loadError: 'Unable to load household details right now.'
        };
    }
};
