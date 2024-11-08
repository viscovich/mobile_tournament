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

  // Inizializza i rankings, precompilando se esistono
  let rankings: RankingFormData[] = [];
  if (data && data.players && data.tournament) {
    rankings = data.players.map((player: Player) => ({
      player_id: player.id,
      name: player.name,
      rank: rankingsMap.get(player.id) || ''
    }));
  }

  // Redirezione immediata dopo il salvataggio
  $: if (form?.data?.message === 'Rankings inseriti con successo!') {
    goto('/');
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
    margin-bottom: 1rem;
    padding: 1rem;
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
    width: 100px;
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
    margin-right: 1rem;
    margin-bottom: 0.5rem;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .button:hover {
    background-color: #e88a15;
  }

  .button:active {
    background-color: #d67d14;
  }

  .buttons-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  input[type="number"] {
    width: 100%;
    min-height: 44px;
    padding: 0.75rem;
    border: 2px solid #cbb090;
    border-radius: 0.5rem;
    background-color: #ffffff;
    color: #231a10;
    font-size: 1rem;
    -webkit-appearance: none;
    margin: 0;
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
          <input 
            type="number" 
            inputmode="numeric"
            pattern="[0-9]*"
            min="1" 
            max="8" 
            name={`rankings[${index}].rank`} 
            bind:value={ranking.rank} 
            placeholder="Posizione"
          />
          <input type="hidden" name={`rankings[${index}].player_id`} value={ranking.player_id} />
        </div>
      </div>
    {/each}
    <input type="hidden" name="tournament_id" value={data.tournament.id} />
    <div class="buttons-container">
      <button type="submit" class="button">Save</button>
      <button type="button" on:click={() => goto('/')} class="button">Cancel</button>
    </div>
  </form>
</div>
