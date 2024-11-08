<!-- src/routes/global-ranking/+page.svelte -->
<script lang="ts">
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  import DownloadIcon from '$lib/components/DownloadIcon.svelte';
  import html2canvas from 'html2canvas';

  interface GlobalRanking {
    name: string;
    total_points: number;
    tournaments_played: number;
    average_points: number;
  }

  let globalRankings: GlobalRanking[] = [];
  let tableRef: HTMLElement;

  const fetchGlobalRankings = async () => {
    const { data, error } = await supabase
      .rpc('calculate_global_rankings');
    if (error) console.error(error);
    else globalRankings = data || [];
  };

  const downloadRankingImage = async () => {
    if (!tableRef) return;
    
    try {
      const canvas = await html2canvas(tableRef, {
        backgroundColor: '#231a10',
        scale: 2
      });
      
      const link = document.createElement('a');
      link.download = 'ranking.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  onMount(() => {
    fetchGlobalRankings();
  });
</script>

<div>
  <!-- Header della pagina -->
  <div class="flex items-center bg-[#231a10] p-4 pb-2 justify-between">
    <h2 class="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Cagiano's Cup</h2>
    <button 
      class="text-white hover:text-[#cbb090] transition-colors"
      on:click={downloadRankingImage}
      title="Download ranking as image"
    >
      <DownloadIcon size="28px" />
    </button>
  </div>
  
  <!-- Immagine o banner -->
  <div class="@container">
    <div class="px-4 pt-2 @[480px]:pt-3">
      <div
        class="w-full h-[200px] bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-[#231a10] rounded-xl @[480px]:rounded-xl"
        style='background-image: url("/images/players-banner.png");'
      ></div>
    </div>
  </div>
</div>

<div class="px-4">
  <h3 class="text-white text-lg font-bold mb-4 mt-1">Classifica</h3>
  <div class="space-y-2" bind:this={tableRef}>
    {#each globalRankings as ranking, index}
      <div class="flex items-center gap-4 bg-[#231a10] px-4 py-2 rounded-xl">
        <div class="flex-shrink-0">
          <div class="bg-[#CD7F32] text-[#231a10] w-8 h-8 rounded-full flex items-center justify-center font-bold">
            {index + 1}
          </div>
        </div>
        <div class="flex-1 flex items-center justify-between">
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
      </div>
    {/each}
  </div>
</div>
