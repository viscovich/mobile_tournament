<!-- src/routes/tournaments/[id]/ranking/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { enhance } from '$app/forms';
  import { isAuthenticated } from '$lib/stores/auth';

  interface Player {
    id: number;
    name: string;
  }

  interface Ranking {
    player_id: number;
    rank: number;
    points: number;
    players?: Player;
  }

  interface Tournament {
    id: number;
    name: string;
    multiplier: number;
  }

  interface PageData {
    players?: Player[];
    tournament: Tournament;
    existingRankings?: Ranking[];
    rankingsWithPlayers?: Ranking[];
  }

  interface RankingFormData {
    player_id: number;
    name: string;
    rank: number | '';
  }

  export let data: PageData;
  export let form: { data?: { message: string }; status?: string };

  // Per utenti autenticati: crea una mappa dei rankings esistenti per un accesso rapido
  const rankingsMap = new Map<number, { rank: number }>();
  $: if ($isAuthenticated && data.existingRankings) {
    data.existingRankings.forEach((r: Ranking) => {
      rankingsMap.set(r.player_id, { rank: r.rank });
    });
  }

  // Per utenti autenticati: inizializza i rankings, precompilando se esistono e ordinando alfabeticamente
  let rankings: RankingFormData[] = [];
  $: if ($isAuthenticated && data.players && data.tournament) {
    rankings = data.players
      .map((player: Player): RankingFormData => ({
        player_id: player.id,
        name: player.name,
        rank: rankingsMap.has(player.id) ? rankingsMap.get(player.id)!.rank : ''
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  function getBasePoints(rank: number): number {
    switch(rank) {
      case 1: return 100;
      case 2: return 75;
      case 3: return 50;
      case 4: return 25;
      default: return 0;
    }
  }

  function getPoints(rank: number): number {
    const basePoints = getBasePoints(rank);
    return basePoints * (data.tournament?.multiplier || 1);
  }

  function formatPoints(points: number): string {
    return points.toString().padStart(3, '0');
  }

  function incrementRank(index: number) {
    if (typeof rankings[index].rank === 'number') {
      rankings[index].rank = rankings[index].rank + 1;
    } else if (rankings[index].rank === '') {
      rankings[index].rank = 1;
    }
    rankings = [...rankings];
  }

  function decrementRank(index: number) {
    if (typeof rankings[index].rank === 'number' && rankings[index].rank > 1) {
      rankings[index].rank = rankings[index].rank - 1;
    }
    rankings = [...rankings];
  }

  function getPodiumIcon(rank: number) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  }
</script>

<style>
  .form-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
    box-sizing: border-box;
  }

  @media (min-width: 640px) {
    .form-container {
      padding: 2rem;
    }
  }

  .page-title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
    color: white;
    word-break: break-word;
  }

  @media (min-width: 640px) {
    .page-title {
      font-size: 1.875rem;
    }
  }

  .player-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    padding: 0.75rem;
    background-color: #231a10;
    border-radius: 0.75rem;
  }

  .player-name {
    flex: 1;
    padding-right: 1rem;
    color: white;
    font-size: 1rem;
    word-break: break-word;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .podium-icon {
    font-size: 1.5rem;
    min-width: 1.5rem;
  }

  .player-rank {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .rank-display {
    color: white;
    font-weight: bold;
    min-width: 2rem;
    text-align: center;
  }

  .points-display {
    color: #cbb090;
    margin-left: 1rem;
    min-width: 5.5rem;
    font-family: 'Courier New', monospace;
  }

  .rank-button {
    width: 30px;
    height: 30px;
    padding: 0;
    border: none;
    background-color: #f49725;
    color: #000000;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.2rem;
  }

  .rank-button:hover {
    background-color: #e88a15;
  }

  .error {
    color: #ef4444;
    margin-bottom: 1rem;
    padding: 0.75rem;
    background-color: #fee2e2;
    border-radius: 0.5rem;
  }

  .success {
    color: #22c55e;
    margin-bottom: 1rem;
    padding: 0.75rem;
    background-color: #dcfce7;
    border-radius: 0.5rem;
  }

  .button {
    min-height: 44px;
    padding: 0.75rem 1.5rem;
    background-color: #f49725;
    color: #000000;
    border: none;
    border-radius: 0.75rem;
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .button:hover {
    background-color: #e88a15;
  }

  .button:active {
    background-color: #d67d14;
  }

  .cancel-button {
    min-height: 44px;
    padding: 0.75rem 1.5rem;
    background-color: transparent;
    color: #ffffff;
    border: 2px solid #f49725;
    border-radius: 0.75rem;
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .cancel-button:hover {
    background-color: rgba(244, 151, 37, 0.1);
  }

  .buttons-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
  }

  input[type="number"] {
    width: 60px;
    min-height: 30px;
    padding: 0.25rem;
    border: 2px solid #cbb090;
    border-radius: 0.5rem;
    background-color: #ffffff;
    color: #231a10;
    font-size: 1rem;
    -webkit-appearance: none;
    margin: 0;
    text-align: center;
  }

  input[type="number"]:focus {
    outline: none;
    border-color: #f49725;
    box-shadow: 0 0 0 2px rgba(244, 151, 37, 0.2);
  }

  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type="number"] {
    -moz-appearance: textfield;
  }

  @media screen and (max-width: 768px) {
    input[type="number"] {
      font-size: 16px;
    }
  }

  .multiplier-badge {
    background-color: #f49725;
    color: #231a10;
    padding: 0.25rem 0.5rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: bold;
    margin-left: 0.5rem;
  }
</style>

<div>
  <!-- Header della pagina -->
  <div class="flex items-center bg-[#231a10] p-4 pb-2 justify-between">
    <h2 class="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Cagiano's Cup</h2>
  </div>
  
  <!-- Immagine o banner -->
  <div class="@container">
    <div class="px-4 pt-2 @[480px]:pt-3">
      <div
        class="w-full h-[200px] bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-[#231a10] rounded-xl @[480px]:rounded-xl"
        style='background-image: url("/images/beach-volleyball.png");'
      ></div>
    </div>
  </div>
</div>

<div class="form-container">
  <h1 class="page-title">
    {#if data && data.tournament}
      Ranking del Torneo: {data.tournament.name}
      {#if data.tournament.multiplier > 1}
        <span class="multiplier-badge">Punti x{data.tournament.multiplier}</span>
      {/if}
    {:else}
      Ranking del Torneo
    {/if}
  </h1>

  {#if form?.data?.message}
    <div class={form.status === 'error' ? 'error' : 'success'}>
      {form.data.message}
    </div>
  {/if}

  {#if $isAuthenticated}
    <!-- Vista per utenti autenticati -->
    <form 
      method="post" 
      use:enhance={() => {
        return async ({ result }) => {
          if (result.type === 'success') {
            await goto('/');
          }
        };
      }}
    >
      {#each rankings as ranking, index}
        <div class="player-row">
          <div class="player-name">
            {ranking.name}
          </div>
          <div class="player-rank">
            <button type="button" class="rank-button" on:click={() => decrementRank(index)}>-</button>
            <input 
              type="number" 
              inputmode="numeric"
              name={`rankings[${index}].rank`} 
              bind:value={ranking.rank} 
              placeholder="Pos"
            />
            <button type="button" class="rank-button" on:click={() => incrementRank(index)}>+</button>
            <input type="hidden" name={`rankings[${index}].points`} value={ranking.rank ? getPoints(ranking.rank) : 0} />
            <input type="hidden" name={`rankings[${index}].player_id`} value={ranking.player_id} />
            <span class="points-display">{formatPoints(ranking.rank ? getPoints(ranking.rank) : 0)} punti</span>
          </div>
        </div>
      {/each}
      <input type="hidden" name="tournament_id" value={data.tournament.id} />
      <div class="buttons-container">
        <button type="button" class="cancel-button" on:click={() => goto('/')}>Cancel</button>
        <button type="submit" class="button">Save</button>
      </div>
    </form>
  {:else}
    <!-- Vista per utenti non autenticati -->
    {#if data.rankingsWithPlayers && data.rankingsWithPlayers.length > 0}
      {#each data.rankingsWithPlayers as ranking}
        <div class="player-row">
          <div class="player-name">
            <span class="podium-icon">{getPodiumIcon(ranking.rank)}</span>
            {ranking.players?.name}
          </div>
          <div class="flex items-center gap-4">
            <div class="rank-display">
              {ranking.rank}°
            </div>
            <div class="points-display">
              {formatPoints(getPoints(ranking.rank))} punti
            </div>
          </div>
        </div>
      {/each}
    {:else}
      <div class="player-row">
        <div class="player-name">Nessun giocatore classificato</div>
      </div>
    {/if}
  {/if}
</div>
