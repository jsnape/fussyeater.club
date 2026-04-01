<script lang="ts">
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<h1>Shopping List</h1>
<p>Generate and manage your weekly shopping lists.</p>

{#if !data.shoppingList}
	<p>No shopping list available yet.</p>
{:else}
	<h2>Created: {data.shoppingList.createdAt}</h2>

	{#if data.shoppingList.items.length === 0}
		<p>Your shopping list is currently empty.</p>
	{:else}
		<ul>
			{#each data.shoppingList.items as item (`${item.name}-${item.unit}-${item.category}`)}
				<li>
					{item.name} - {item.quantity} {item.unit}
					{#if item.isChecked} (checked){/if}
				</li>
			{/each}
		</ul>
	{/if}
{/if}

<h3>Edit Shopping List</h3>
{#if form?.success}
	<p>Shopping list saved successfully.</p>
{:else if form?.message}
	<p>{form.message}</p>
{/if}
<form method="POST">
	<label>
		Meal Plan Id
		<input name="mealPlanId" required value={data.shoppingList?.mealPlanId ?? ''} />
	</label>
	<label>
		Items JSON
		<textarea name="itemsJson" rows="6">{JSON.stringify(data.shoppingList?.items ?? [], null, 2)}</textarea>
	</label>
	<button type="submit">Save Shopping List</button>
</form>
