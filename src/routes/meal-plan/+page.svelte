<script lang="ts">
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const defaultMealsJson = '[]';
</script>

<h1>Meal Plan</h1>
<p>Plan your meals for the week.</p>

{#if !data.mealPlan}
	<p>No meal plan available yet.</p>
{:else}
	<h2>{data.mealPlan.title}</h2>
	<p>{data.mealPlan.startDate} to {data.mealPlan.endDate}</p>

	{#if data.mealPlan.meals.length === 0}
		<p>No meals have been scheduled yet.</p>
	{:else}
		<ul>
			{#each data.mealPlan.meals as meal (`${meal.date}-${meal.mealType}-${meal.recipeId}`)}
				<li>{meal.date}: {meal.mealType} (recipe {meal.recipeId}, serves {meal.servings})</li>
			{/each}
		</ul>
	{/if}
{/if}

<h3>Edit Meal Plan</h3>
{#if form?.success}
	<p>Meal plan saved successfully.</p>
{:else if form?.message}
	<p>{form.message}</p>
{/if}
<form method="POST">
	<label>
		Title
		<input name="title" required value={data.mealPlan?.title ?? ''} />
	</label>
	<label>
		Start Date
		<input name="startDate" type="date" required value={data.mealPlan?.startDate ?? ''} />
	</label>
	<label>
		End Date
		<input name="endDate" type="date" required value={data.mealPlan?.endDate ?? ''} />
	</label>
	<label>
		Meals JSON
		<textarea name="mealsJson" rows="6">{JSON.stringify(data.mealPlan?.meals ?? JSON.parse(defaultMealsJson), null, 2)}</textarea>
	</label>
	<button type="submit">Save Meal Plan</button>
</form>
