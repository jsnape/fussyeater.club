<script lang="ts">
  import { Badge, Button, Card, Input, Label } from "flowbite-svelte";
  import { ChartPieSolid, CheckCircleSolid, CogSolid } from "flowbite-svelte-icons";

  const colorTokens = [
    { name: "Primary", token: "--fe-color-primary", hex: "#DC2626" },
    { name: "Secondary", token: "--fe-color-secondary", hex: "#F87171" },
    { name: "Accent / CTA", token: "--fe-color-accent", hex: "#CA8A04" },
    { name: "Success", token: "--fe-color-success", hex: "#16A34A" },
    { name: "Surface", token: "--fe-color-surface", hex: "#FEF2F2" },
    { name: "Text", token: "--fe-color-text", hex: "#450A0A" }
  ];

  const spacingTokens = [
    { token: "--fe-space-xs", value: "4px" },
    { token: "--fe-space-sm", value: "8px" },
    { token: "--fe-space-md", value: "16px" },
    { token: "--fe-space-lg", value: "24px" },
    { token: "--fe-space-xl", value: "32px" },
    { token: "--fe-space-2xl", value: "48px" }
  ];

  const elevationTokens = [
    { token: "--fe-shadow-sm", value: "0 1px 2px rgba(69,10,10,0.08)" },
    { token: "--fe-shadow-md", value: "0 6px 18px rgba(69,10,10,0.12)" },
    { token: "--fe-shadow-lg", value: "0 12px 30px rgba(69,10,10,0.16)" }
  ];
</script>

<main class="min-h-dvh bg-primary-50 px-6 py-8 md:px-10 md:py-12">
  <div class="mx-auto max-w-6xl space-y-8">
    <section class="rounded-2xl border border-primary-200 bg-white p-6 shadow-sm md:p-8">
      <div class="flex flex-wrap items-center gap-3">
        <Badge color="red">Design System</Badge>
        <Badge color="yellow">Tailwind + Flowbite</Badge>
      </div>
      <h1 class="mt-4 text-3xl font-semibold tracking-tight text-primary-900 md:text-4xl">
        FussyEater Design Showcase
      </h1>
      <p class="mt-3 max-w-3xl text-base leading-relaxed text-primary-800">
        This page demonstrates the brand tokens, typography scale, spacing, elevation, and reusable UI patterns
        used for the family recipe and meal planning experience.
      </p>
      <div class="mt-6 flex flex-wrap items-center gap-3">
        <Button color="yellow" size="lg">Primary CTA</Button>
        <Button color="light" size="lg">Secondary Action</Button>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-3">
      <Card class="border-primary-200 bg-white">
        <div class="space-y-2 p-2">
          <CheckCircleSolid class="h-6 w-6 text-green-600" aria-label="Trust and reliability" />
          <h2 class="text-lg font-semibold text-primary-900">Trust</h2>
          <p class="text-sm text-primary-800">Clear hierarchy and positive feedback states for busy families.</p>
        </div>
      </Card>

      <Card class="border-primary-200 bg-white">
        <div class="space-y-2 p-2">
          <ChartPieSolid class="h-6 w-6 text-primary-700" aria-label="Visual consistency" />
          <h2 class="text-lg font-semibold text-primary-900">Consistency</h2>
          <p class="text-sm text-primary-800">Token-driven colors, spacing, and shadows across all pages.</p>
        </div>
      </Card>

      <Card class="border-primary-200 bg-white">
        <div class="space-y-2 p-2">
          <CogSolid class="h-6 w-6 text-primary-700" aria-label="Implementation system" />
          <h2 class="text-lg font-semibold text-primary-900">System</h2>
          <p class="text-sm text-primary-800">Tailwind utility-first styling with Flowbite components first.</p>
        </div>
      </Card>
    </section>

    <section class="rounded-2xl border border-primary-200 bg-white p-6 shadow-sm">
      <h2 class="text-xl font-semibold text-primary-900">Color Tokens</h2>
      <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {#each colorTokens as color (color.token)}
          <div class="rounded-xl border border-primary-200 p-3">
            <div
              class="h-14 rounded-lg border border-black/10"
              style={`background-color: var(${color.token});`}
              aria-label={`${color.name} swatch`}
            ></div>
            <p class="mt-3 text-sm font-semibold text-primary-900">{color.name}</p>
            <p class="text-xs text-primary-700">{color.token}</p>
            <p class="text-xs text-primary-700">{color.hex}</p>
          </div>
        {/each}
      </div>
    </section>

    <section class="grid gap-4 lg:grid-cols-2">
      <Card class="border-primary-200 bg-white">
        <div class="space-y-4 p-2">
          <h2 class="text-xl font-semibold text-primary-900">Typography</h2>
          <div class="space-y-3">
            <h3 class="text-3xl font-semibold text-primary-900">Heading Sample (Varela Round)</h3>
            <p class="text-base leading-relaxed text-primary-800">
              Body sample in Nunito Sans. The system favors warm, practical language and clear readability on
              mobile-first layouts.
            </p>
            <p class="text-sm text-primary-700">Minimum mobile body text size: 16px.</p>
          </div>
        </div>
      </Card>

      <Card class="border-primary-200 bg-white">
        <div class="space-y-4 p-2">
          <h2 class="text-xl font-semibold text-primary-900">Form Patterns</h2>
          <div>
            <Label for="demo-email" class="mb-2 block text-sm font-medium text-primary-900">Email</Label>
            <Input id="demo-email" type="email" placeholder="parent@example.com" />
          </div>
          <div>
            <Label for="demo-search" class="mb-2 block text-sm font-medium text-primary-900">Recipe search</Label>
            <Input id="demo-search" type="search" placeholder="chicken pasta" />
          </div>
          <p class="text-xs text-primary-700">All interactive controls should keep visible focus styles.</p>
        </div>
      </Card>
    </section>

    <section class="grid gap-4 lg:grid-cols-2">
      <Card class="border-primary-200 bg-white">
        <div class="space-y-3 p-2">
          <h2 class="text-xl font-semibold text-primary-900">Spacing Scale</h2>
          {#each spacingTokens as item (item.token)}
            <div class="flex items-center justify-between rounded-lg border border-primary-100 px-3 py-2">
              <span class="text-sm font-medium text-primary-900">{item.token}</span>
              <span class="text-sm text-primary-700">{item.value}</span>
            </div>
          {/each}
        </div>
      </Card>

      <Card class="border-primary-200 bg-white">
        <div class="space-y-3 p-2">
          <h2 class="text-xl font-semibold text-primary-900">Elevation Scale</h2>
          {#each elevationTokens as item (item.token)}
            <div class="rounded-lg border border-primary-100 bg-primary-50 px-3 py-3" style={`box-shadow: var(${item.token});`}>
              <p class="text-sm font-medium text-primary-900">{item.token}</p>
              <p class="text-xs text-primary-700">{item.value}</p>
            </div>
          {/each}
        </div>
      </Card>
    </section>
  </div>
</main>
