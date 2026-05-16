import type { PageLoad } from './$types';
import { ApiError, apiFetchWith } from '$lib/api';
import type { components } from '$lib/api-types';
import { error } from '@sveltejs/kit';

type HouseholdMember = components['schemas']['HouseholdMember'];
type InviteStatus = components['schemas']['InviteStatus'];
type MemberProfile = components['schemas']['MemberProfile'];
type ListHouseholdMembersResponse = components['schemas']['ListHouseholdMembersResponse'];
type ListHouseholdInvitesResponse = components['schemas']['ListHouseholdInvitesResponse'];
type ListProfilesResponse = components['schemas']['ListProfilesResponse'];

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
        const [membersResponse, invitesResponse, profilesResponse] = await Promise.all([
            apiFetchWith<ListHouseholdMembersResponse>(fetch, '/api/households/members'),
            apiFetchWith<ListHouseholdInvitesResponse>(fetch, '/api/households/invites'),
            apiFetchWith<ListProfilesResponse>(fetch, '/api/households/profiles')
        ]);

        return {
            members: membersResponse.members,
            invites: invitesResponse.invites,
            profiles: profilesResponse.profiles,
            syncEnabled: profilesResponse.syncEnabled,
            loadError: null
        };
    } catch (caughtError) {
        if (caughtError instanceof ApiError) {
            if (caughtError.status === 403) {
                throw error(403, 'Only household owners can manage household settings.');
            }
            return {
                members: [] as HouseholdMember[],
                invites: [] as InviteStatus[],
                profiles: [] as MemberProfile[],
                syncEnabled: false,
                loadError: pageErrorMessage(caughtError.status)
            };
        }

        return {
            members: [] as HouseholdMember[],
            invites: [] as InviteStatus[],
            profiles: [] as MemberProfile[],
            syncEnabled: false,
            loadError: 'Unable to load household details right now.'
        };
    }
};
