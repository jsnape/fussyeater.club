<script lang="ts">
  import { Button } from "flowbite-svelte";
  import { CheckCircleSolid } from "flowbite-svelte-icons";
</script>

<section class="rounded-xl border border-primary-200 bg-white p-5 shadow-sm sm:p-6">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <div class="flex items-start gap-3">
      <CheckCircleSolid class="mt-0.5 h-5 w-5 text-green-600" aria-label="Trust signal" />
      <p class="max-w-2xl text-sm leading-relaxed text-primary-800">
        Families using FussyEater Club can organize meals around preferences and allergies with less stress and
        more confidence.
      </p>
    </div>
    <Button color="yellow">Create your first plan</Button>
  </div>
</section>
