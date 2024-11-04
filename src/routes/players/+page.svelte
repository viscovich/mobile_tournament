<!-- src/routes/players/+page.svelte -->
<script>
  import { supabase } from '$lib/supabase';
  import DeleteIcon from '$lib/components/DeleteIcon.svelte';
  import EditIcon from '$lib/components/EditIcon.svelte';
  import NewPlayerForm from '$lib/components/NewPlayerForm.svelte';
  import EditPlayerForm from '$lib/components/EditPlayerForm.svelte';
  import { onMount } from 'svelte';

  let players = [];
  let showNewForm = false;
  let showEditForm = false;
  let selectedPlayer = null;
  let loading = true;
  let errorMessage = '';

  // Funzione per recuperare i giocatori con le classifiche globali
  const fetchPlayers = async () => {
    const { data, error } = await supabase.rpc('calculate_global_rankings');
    if (error) {
      console.error('Errore nel recuperare i giocatori:', error);
      errorMessage = 'Errore nel recuperare i giocatori.';
    } else {
      players = data;
    }
    loading = false;
  };

  const deletePlayer = async (id) => {
    const { error } = await supabase.from('players').delete().eq('id', id);
    if (error) {
      console.error('Errore nella cancellazione del giocatore:', error);
      alert('Errore nella cancellazione del giocatore.');
    } else {
      fetchPlayers();
    }
  };

  const editPlayer = (player) => {
    selectedPlayer = { ...player };
    showEditForm = true;
  };

  onMount(() => {
    fetchPlayers();
  });
</script>

<style>
  /* Aggiungi eventuali stili personalizzati qui */
</style>

<div>
  <!-- Header della pagina -->
  <div class="flex items-center bg-[#231a10] p-4 pb-2 justify-between">
    <h2 class="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pl-12">Lista dei Giocatori</h2>
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
  <h3 class="text-white text-lg font-bold mb-4">Giocatori</h3>
  
  {#if loading}
    <p class="text-white">Caricamento...</p>
  {:else if errorMessage}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {errorMessage}
    </div>
  {:else}
    {#each players as player}
      <div class="flex items-center gap-4 bg-[#231a10] px-4 min-h-[72px] py-2 justify-between rounded-xl mb-2">
        <div class="flex flex-col justify-center">
          <p class="text-white text-base font-medium">{player.name}</p>
          <p class="text-[#cbb090] text-sm font-normal">
            Punti Totali: {player.total_points} · Tornei Giocati: {player.tournaments_played}
          </p>
        </div>
        <div class="flex space-x-2">
          <button on:click={() => editPlayer(player)} class="text-white">
            <EditIcon />
          </button>
          <button on:click={() => deletePlayer(player.id)} class="text-white">
            <DeleteIcon />
          </button>

        </div>
      </div>
    {/each}
  {/if}

  <!-- Pulsante per aggiungere un nuovo giocatore -->
  <div class="flex justify-center mt-4">
    <button
      class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#f49725] text-[#231a10] text-sm font-bold tracking-[0.015em]"
      on:click={() => (showNewForm = true)}
    >
      <span class="truncate">Aggiungi Nuovo Giocatore</span>
    </button>
  </div>

  {#if showNewForm}
    <NewPlayerForm on:close={() => showNewForm = false} on:refresh={() => fetchPlayers()} />
  {/if}

 {#if showEditForm && selectedPlayer}
    <EditPlayerForm 
      player={selectedPlayer} 
      onClose={() => { 
        console.log('Closing edit form'); // Debugging
        showEditForm = false; 
        selectedPlayer = null; 
      }} 
      onRefresh={() => { 
        console.log('Refreshing players'); // Debugging
        fetchPlayers(); 
      }} 
    />
  {/if}
</div>

