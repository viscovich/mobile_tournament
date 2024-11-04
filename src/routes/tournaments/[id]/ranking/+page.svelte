<!-- src/routes/tournaments/[id]/ranking/+page.svelte -->
<script>
  import { goto } from '$app/navigation';
  export let data;
  export let form; // Importa il form

  console.log('Dati ricevuti in +page.svelte:', data);
  console.log('Dati del form:', form);

  // Crea una mappa dei rankings esistenti per un accesso rapido
  const rankingsMap = new Map();
  if (data && data.existingRankings) {
    data.existingRankings.forEach(r => {
      rankingsMap.set(r.player_id, r.rank);
    });
  }

  // Inizializza i rankings, precompilando se esistono
  let rankings;
  if (data && data.players && data.tournament) {
    rankings = data.players.map(player => ({
      player_id: player.id,
      name: player.name, // Usa 'name' come definito nello script
      rank: rankingsMap.get(player.id) || '' // Precompila con il rank esistente
    }));
  } else {
    rankings = [];
    console.error('Data.players o data.tournament è undefined!');
  }

  // Redirezione immediata dopo il salvataggio
  $: if (form?.data?.message === 'Rankings inseriti con successo!') {
    goto('/'); // Reindirizza alla home page
  }
</script>

<style>
  .form-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    background-color: #f9f9f9;
    border-radius: 8px;
  }

  .player-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .player-name {
    flex: 2;
    padding-right: 1rem;
  }

  .player-rank {
    flex: 1;
  }

  .error {
    color: red;
    margin-bottom: 1rem;
  }

  .success {
    color: green;
    margin-bottom: 1rem;
  }

  button {
    padding: 0.5rem 1rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background-color: #45a049;
  }

  .cancel-button {
    background-color: #f44336;
    margin-left: 1rem;
  }

  .cancel-button:hover {
    background-color: #e53935;
  }
</style>

<div class="form-container">
  <!-- Intestazione Generale del Torneo -->
  <h1 class="text-3xl font-bold mb-6">
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
        Pippo
        </div>
        <div class="player-rank">
          <input 
            type="number" 
            min="1" 
            max="8" 
            name={`rankings[${index}].rank`} 
            bind:value={rankings[index].rank} 
            required 
            placeholder="Posizione"
            class="border rounded p-2 w-full"
          />
          <input type="hidden" name={`rankings[${index}].player_id`} value={ranking.player_id} />
        </div>
      </div>
    {/each}
    <input type="hidden" name="tournament_id" value={data.tournament.id} />
    <div>
      <button type="submit">Salva Rankings</button>
      <button type="button" on:click={() => goto('/')} class="cancel-button">Annulla</button>
    </div>
  </form>
</div>

