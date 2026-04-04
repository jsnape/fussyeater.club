<script lang="ts">
  import { page } from "$app/state";
  import { NavBrand, NavHamburger, NavLi, Navbar, NavUl } from "flowbite-svelte";
  import { siteNavLinks } from "$lib/components/layout/nav-links";

  let activeUrl = $derived(page.url.pathname);
</script>

<header class="border-b border-primary-200 bg-white/90 backdrop-blur">
  <Navbar fluid class="mx-auto w-full max-w-6xl px-6 py-3 md:px-10" aria-label="Main">
    <NavBrand href="/" class="text-base font-semibold text-primary-900">FussyEater Club</NavBrand>
    <NavHamburger />
    <NavUl {activeUrl} class="text-sm font-medium text-primary-800">
      {#each siteNavLinks as link (link.href)}
        <NavLi href={link.href}>{link.label}</NavLi>
      {/each}
    </NavUl>
  </Navbar>
</header>
