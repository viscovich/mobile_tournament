<!-- src/routes/tournaments/[id]/ranking/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';

  interface Player {
    id: number;
    name: string;
  }

  interface Ranking {
    player_id: number;
    rank: number;
  }

  interface Tournament {
    id: number;
    name: string;
  }

  interface PageData {
    players: Player[];
    tournament: Tournament;
    existingRankings: Ranking[];
  }

  interface RankingFormData {
    player_id: number;
    name: string;
    rank: number | '';
  }

  export let data: PageData;
  export let form: { data?: { message: string }; status?: string };

  console.log('Dati ricevuti in +page.svelte:', data);
  console.log('Dati del form:', form);

  // Crea una mappa dei rankings esistenti per un accesso rapido
  const rankingsMap = new Map<number, number>();
  if (data && data.existingRankings) {
    data.existingRankings.forEach((r: Ranking) => {
      rankingsMap.set(r.player_id, r.rank);
    });
  }

  // Inizializza i rankings, precompilando se esistono e ordinando alfabeticamente
  let rankings: RankingFormData[] = [];
  if (data && data.players && data.tournament) {
    rankings = data.players
      .map((player: Player): RankingFormData => ({
        player_id: player.id,
        name: player.name,
        rank: rankingsMap.has(player.id) ? rankingsMap.get(player.id)! : ''
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
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
  }

  .player-rank {
    display: flex;
    align-items: center;
    gap: 0.5rem;
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

  /* Rimuove le frecce spinners dagli input number */
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type="number"] {
    -moz-appearance: textfield;
  }

  /* Previene lo zoom su input focus su iOS */
  @media screen and (max-width: 768px) {
    input[type="number"] {
      font-size: 16px;
    }
  }
</style>

<div class="form-container">
  <h1 class="page-title">
    {#if data && data.tournament}
      Ranking del Torneo: {data.tournament.name}
    {:else}
      Ranking del Torneo
    {/if}
  </h1>

  {#if form?.data?.message}
    <div class={form.status === 'error' ? 'error' : 'success'}>
      {form.data.message}
    </div>
  {/if}

  <form method="post">
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
          <input type="hidden" name={`rankings[${index}].player_id`} value={ranking.player_id} />
        </div>
      </div>
    {/each}
    <input type="hidden" name="tournament_id" value={data.tournament.id} />
    <div class="buttons-container">
      <button type="button" class="cancel-button" on:click={() => goto('/')}>Cancel</button>
      <button type="submit" class="button">Save</button>
    </div>
  </form>
</div>
