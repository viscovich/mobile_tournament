<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '../app.css'; 
  import HomeIcon from '$lib/components/HomeIcon.svelte';
  import RankingIcon from '$lib/components/RankingIcon.svelte';
  import PlayersIcon from '$lib/components/PlayersIcon.svelte';
  import { page } from '$app/stores';
  
  interface PageData {
    players?: any[];
  }
  
  export let data: PageData = {};
</script>

 {#if data && data.players}
    <!-- Utilizza data.players se disponibile -->
    <p>Lista dei giocatori globale: {data.players.length}</p>
  {/if}
  
<div
  class="relative flex flex-col bg-[#231a10] justify-between overflow-x-hidden pb-20"
  style="font-family: Lexend, 'Noto Sans', sans-serif;"
>
  <slot></slot>
  
  <!-- Bottom Navigation Menu -->
  <nav class="fixed bottom-0 left-0 right-0 flex gap-2 border-t border-[#493722] bg-[#342818] px-4 pb-3 pt-2 z-50">
    <a
      class="flex flex-1 flex-col items-center justify-end gap-1 rounded-full {$page.url.pathname === '/' ? 'text-white' : 'text-[#cbb090]'}"
      href="/"
    >
      <HomeIcon size="24px" color={$page.url.pathname === '/' ? '#ffffff' : '#cbb090'} />
      <p class="text-xs font-medium tracking-[0.015em]">
        Home
      </p>
    </a>

    <a
      class="flex flex-1 flex-col items-center justify-end gap-1 {$page.url.pathname === '/players' ? 'text-white' : 'text-[#cbb090]'}"
      href="/players"
    >
      <PlayersIcon size="24px" color={$page.url.pathname === '/players' ? '#ffffff' : '#cbb090'} />
      <p class="text-xs font-medium tracking-[0.015em]">
        Players
      </p>
    </a>
    <a
      class="flex flex-1 flex-col items-center justify-end gap-1 {$page.url.pathname === '/global-ranking' ? 'text-white' : 'text-[#cbb090]'}"
      href="/global-ranking"
    >   
      <RankingIcon size="24px" color={$page.url.pathname === '/global-ranking' ? '#ffffff' : '#cbb090'} />
      <p class="text-xs font-medium tracking-[0.015em]">
        Global Ranking
      </p>
    </a>
  </nav>
</div>
