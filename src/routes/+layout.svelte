<!-- src/routes/+layout.svelte -->
<script>
  import '../app.css'; 
  import HomeIcon from '$lib/components/HomeIcon.svelte';
  import RankingIcon from '$lib/components/RankingIcon.svelte';
  import PlayersIcon from '$lib/components/PlayersIcon.svelte';
  import GlobalRankingIcon from '$lib/components/GlobalRankingIcon.svelte';
  export let data;
</script>

 {#if data && data.players}
    <!-- Utilizza data.players se disponibile -->
    <p>Lista dei giocatori globale: {data.players.length}</p>
  {/if}
  
<div
  class="relative flex flex-col min-h-screen bg-[#231a10] justify-between overflow-x-hidden"
  style="font-family: Lexend, 'Noto Sans', sans-serif;"
>
  <slot></slot>
  
  <!-- Bottom Navigation Menu -->
  <nav class="flex gap-2 border-t border-[#493722] bg-[#342818] px-4 pb-3 pt-2">
    <a
      class="flex flex-1 flex-col items-center justify-end gap-1 rounded-full text-white"
      href="/"
    >
      <HomeIcon size="24px" color="#ffffff" />
      <p class="text-white text-xs font-medium tracking-[0.015em]">
        Home
      </p>
    </a>

    <a
      class="flex flex-1 flex-col items-center justify-end gap-1 text-[#cbb090]"
      href="/players"
    >
      <PlayersIcon size="24px" color="#cbb090" />
      <p class="text-[#cbb090] text-xs font-medium tracking-[0.015em]">
        Players
      </p>
    </a>
    <a
      class="flex flex-1 flex-col items-center justify-end gap-1 text-[#cbb090]"
      href="/global-ranking"
    >   
      <GlobalRankingIcon size="24px" color="#cbb090" />
      <p class="text-[#cbb090] text-xs font-medium tracking-[0.015em]">
        Global Ranking
      </p>
    </a>
  </nav>
</div>

