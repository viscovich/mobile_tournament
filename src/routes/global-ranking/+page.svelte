<!-- src/routes/global-ranking/+page.svelte -->
<script>
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  let globalRankings = [];

  const fetchGlobalRankings = async () => {
    const { data, error } = await supabase
      .rpc('calculate_global_rankings'); // We'll define this RPC function in SQL
    if (error) console.error(error);
    else globalRankings = data;
  };

  onMount(() => {
    fetchGlobalRankings();
  });
</script>

<div>
  <!-- Header della pagina -->
  <div class="flex items-center bg-[#231a10] p-4 pb-2 justify-between">
    <h2 class="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pl-12">Ranking globale</h2>
  </div>
  
  <!-- Immagine o banner -->
  <div class="@container">
    <div class="@[480px]:px-4 @[480px]:py-3">
      <div
        class="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-[#231a10] @[480px]:rounded-xl min-h-[218px]"
        style='background-image: url("/images/players-banner.png");'
      ></div>
    </div>
  </div>
</div>

<div class="p-4">
  <div class="space-y-2">
    {#each globalRankings as ranking}
      <div class="flex items-center justify-between bg-[#231a10] px-4 min-h-[72px] py-2 rounded-xl">
        <div>
          <p class="text-white text-base font-medium">{ranking.name}</p>
          <p class="text-[#cbb090] text-sm">
            Total Points: {ranking.total_points}
          </p>
        </div>
        <div>
          <p class="text-white text-sm">
            Tournaments Played: {ranking.tournaments_played}
          </p>
          <p class="text-[#cbb090] text-sm">
            Average Points: {ranking.average_points.toFixed(2)}
          </p>
        </div>
      </div>
    {/each}
  </div>
</div>

