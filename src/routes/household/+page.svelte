<script lang="ts">
	import type { ActionData, PageData } from "./$types";

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<h1>Household</h1>
<p>Manage your household members and food preferences.</p>

{#if !data.household}
	<p>No household profile found for the current user.</p>
{:else}
	<dl>
		<dt>Name</dt>
		<dd>{data.household.name}</dd>

		<dt>Invite code</dt>
		<dd>{data.household.inviteCode || 'Not set'}</dd>

		<dt>Created</dt>
		<dd>{data.household.createdAt}</dd>
	</dl>
{/if}

<h3>Edit Household</h3>
{#if form?.success}
	<p>Household saved successfully.</p>
{:else if form?.message}
	<p>{form.message}</p>
{/if}
<form method="POST">
	<label>
		Name
		<input name="name" required value={data.household?.name ?? ''} />
	</label>
	<label>
		Invite code
		<input name="inviteCode" value={data.household?.inviteCode ?? ''} />
	</label>
	<button type="submit">Save Household</button>
</form>
