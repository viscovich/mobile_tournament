<!-- src/routes/players/+page.svelte -->
<script lang="ts">
  import { supabase } from '$lib/supabase';
  import DeleteIcon from '$lib/components/DeleteIcon.svelte';
  import EditIcon from '$lib/components/EditIcon.svelte';
  import NewPlayerForm from '$lib/components/NewPlayerForm.svelte';
  import EditPlayerForm from '$lib/components/EditPlayerForm.svelte';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store'; // Import get
  import type { User } from '@supabase/supabase-js';
  import { userStore } from '$lib/stores/auth';
  import TournamentSelect from '$lib/components/TournamentSelect.svelte'; // Import component
  import { selectedTournamentId } from '$lib/stores/tournamentStore'; // Import store
  import { checkImageExists, getPlayerImageSrc } from '$lib/utils/image-utils';

  interface Player {
    id: number;
    name: string;
    total_points: number;
    tournaments_played: number;
    imageUrl: string;
  }

  let players: Player[] = [];
  let showNewForm = false;
  let showEditForm = false;
  let selectedPlayer: Player | null = null;
  let loading = true;
  let errorMessage = '';
  let showDeleteConfirm = false;
  let playerToDelete: Player | null = null;
  let currentTournamentId: number | null = null; // Add currentTournamentId state

  // Funzione per recuperare tutti i giocatori e i loro dati per l'edizione selezionata
  const fetchPlayers = async (tournamentId: number | null) => {
    loading = true;
    errorMessage = '';
    players = [];

    try {
      console.log(`[Players] Starting fetch for edition: ${tournamentId}`);

      // 1. First fetch all players
      const { data: allPlayers, error: playersError } = await supabase
        .from('players')
        .select('*');

      if (playersError) throw playersError;

      console.log(`[Players] Fetched ${allPlayers?.length ?? 0} total players.`);

      const rankingDataMap = new Map<number, { total_points: number; tournaments_played: number }>(); // Declare rankingDataMap

      // Fetch ranking data for the selected edition (if an edition is selected)
      if (tournamentId) {
        console.log(`[Players] Fetching ranking data for edition ${tournamentId}...`);
        const { data: rankingData, error: rankingError } = await supabase
          .rpc('calculate_global_rankings', { p_edition_id: tournamentId });

        if (rankingError) {
          // Log error but continue, we can still show players with 0 points/tournaments
          console.error(`[Players] Error fetching ranking data for edition ${tournamentId}:`, rankingError);
          errorMessage = `Errore nel recuperare i dati di ranking per l'edizione ${tournamentId}. I punteggi potrebbero non essere aggiornati.`;
        } else if (rankingData) {
          console.log(`[Players] Fetched ranking data for ${rankingData.length} players in edition ${tournamentId}.`);
          rankingData.forEach((rank: any) => { // Use 'any' temporarily if type is complex
            rankingDataMap.set(rank.id, {
              total_points: rank.total_points,
              tournaments_played: rank.tournaments_played
            });
          });
        }
      } else {
        console.log('[Players] No tournament edition selected, skipping ranking data fetch.');
        // If no tournament is selected, all players will have 0 points/tournaments displayed
      }

      // 3. Merge all players with ranking data
      console.log('[Players] Merging all players with ranking data...');
      console.log(`[Players] All players count: ${allPlayers?.length ?? 0}`); // Use allPlayers
      console.log(`[Players] Ranking data count: ${rankingDataMap.size}`);
      
      // Assign to the outer scope players variable, no new declaration for mergedPlayers
      players = (allPlayers || []).map((player: any) => { // Add type for player
        const rankInfo = rankingDataMap.get(player.id);
        console.log(`[Players] Merging player ${player.id} (${player.name}) - ` + 
                   `Rank info: ${rankInfo ? 'exists' : 'null'}`);
        return {
          id: player.id,
          name: player.name,
          total_points: rankInfo?.total_points ?? 0,
          tournaments_played: rankInfo?.tournaments_played ?? 0,
          imageUrl: '/images/default-player.jpg' // Default image, will be updated below
        };
      });

      // Sort players alphabetically by name before checking images
      players.sort((a, b) => a.name.localeCompare(b.name)); // Sort the main players array
      console.log(`[Players] Merged players count: ${players.length}`);
      console.log('[Players] First 3 merged players:', players.slice(0, 3));
      console.log('[Players] Checking images for merged players...');
      // 4. Check images for all players
      const imageCheckResults = await Promise.allSettled(players.map(async (player) => { // Use players array
        try {
          console.log(`[Players] Checking image for player ${player.id}`);
          const exists = await checkImageExists(player.id);
          player.imageUrl = exists ? getPlayerImageSrc(player.id) : '/images/default-player.jpg';
          console.log(`[Players] Image for player ${player.id}: ${player.imageUrl}`);
        } catch (err) {
          console.error(`[Players] Error checking image for player ${player.id}:`, err);
          player.imageUrl = '/images/default-player.jpg';
        }
      }));

      // Log any failed image checks
      const failedChecks = imageCheckResults.filter(result => result.status === 'rejected');
      if (failedChecks.length > 0) {
        console.warn(`[Players] ${failedChecks.length} image checks failed`);
      }

      // Trigger a re-render by creating a new array (already done by assigning to players)
      // players = [...players]; // This line is now redundant as we directly modify 'players'
      console.log(`[Players] Fetched ${players.length} players for edition ${tournamentId}`);
    } catch (err) {
      console.error(`[Players] Unexpected error in fetchPlayers for edition ${tournamentId}:`, err);
      errorMessage = `Errore imprevisto nel recuperare i giocatori per l'edizione ${tournamentId}.`;
    } finally {
      loading = false;
    }
  };

  const confirmDelete = (player: Player) => {
    playerToDelete = player;
    showDeleteConfirm = true;
  };

  const deletePlayer = async () => {
    if (!playerToDelete) return;

    console.log(`[Players] Deleting player ${playerToDelete.id}`);
    const { error } = await supabase.from('players').delete().eq('id', playerToDelete.id);
    if (error) {
      console.error('[Players] Error deleting player:', error);
      alert('Errore nella cancellazione del giocatore.');
    } else {
      console.log(`[Players] Player ${playerToDelete.id} deleted successfully`);
      refreshPlayers(); // Use refreshPlayers here
    }
    showDeleteConfirm = false;
    playerToDelete = null;
  };

  const editPlayer = (player: Player) => {
    selectedPlayer = { ...player };
    showEditForm = true;
  };

  onMount(() => {
    console.log('[Players] Component mounted, subscribing to tournament changes.');
    // Subscribe to changes in selectedTournamentId
    const unsubscribe = selectedTournamentId.subscribe((id: number | null) => {
      console.log(`[Players] Selected tournament ID changed to: ${id}`);
      currentTournamentId = id;
      fetchPlayers(currentTournamentId);
    });

    // Initial fetch based on current store value
    const initialTournamentId = get(selectedTournamentId);
    console.log(`[Players] Initial tournament ID from store: ${initialTournamentId}`);
    if (typeof initialTournamentId === 'number') {
      fetchPlayers(initialTournamentId);
    } else {
      fetchPlayers(null); // Fetch with null if initial value isn't a number
    }
    
    return () => {
      console.log('[Players] Component destroying, unsubscribing from tournament changes.');
      unsubscribe(); // Unsubscribe on component destroy
    };
  });

  // Helper to refresh players for the current tournament
  const refreshPlayers = () => {
    console.log(`[Players] Refreshing players for current tournament ID: ${currentTournamentId}`);
    fetchPlayers(currentTournamentId); // Fetch for the current tournament
  }
</script>

<div>
  <!-- Tournament Selector -->
  <div class="px-4 pt-4">
    <TournamentSelect />
  </div> 

  <!-- Header della pagina -->
  <div class="flex items-center bg-[#231a10] p-4 pb-2 justify-between">
    <h2 class="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Cagiano's Cup</h2>
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
  <h3 class="text-white text-lg font-bold mb-4 mt-1">Giocatori</h3>
  
  {#if loading}
    <p class="text-white">Caricamento...</p>
  {:else if errorMessage}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {errorMessage}
    </div>
  {:else}
    {#each players as player (player.id)}
      <div class="flex items-center gap-4 bg-[#231a10] px-4 py-2 justify-between rounded-xl mb-2">
        <div class="flex items-center">
          <div
            class="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-14"
            style={`background-image: url("${player.imageUrl}");`}
          ></div>
          <div class="flex flex-col justify-center ml-2">
            <p class="text-white text-base font-medium">{player.name}</p>
            <p class="text-[#cbb090] text-sm font-normal">
              Punti Totali: {player.total_points} · Tornei Giocati: {player.tournaments_played}
            </p>
          </div>
        </div>
        {#if $userStore}
          <div class="flex space-x-2">
            <button on:click={() => editPlayer(player)} class="text-white">
              <EditIcon />
            </button>
            <button on:click={() => confirmDelete(player)} class="text-white">
              <DeleteIcon />
            </button>
          </div>
        {/if}
      </div>
    {/each}
  {/if}

  {#if $userStore}
    <div class="flex justify-center mt-4">
      <button
        class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#f49725] text-[#231a10] text-sm font-bold tracking-[0.015em]"
        on:click={() => (showNewForm = true)}
      >
        <span class="truncate">Aggiungi Nuovo Giocatore</span>
      </button>
    </div>
  {/if}

  {#if showNewForm}
    <NewPlayerForm on:close={() => showNewForm = false} on:refresh={refreshPlayers} />
  {/if}

  {#if showEditForm && selectedPlayer}
    <EditPlayerForm 
      player={selectedPlayer} 
      onClose={() => { 
        showEditForm = false; 
        selectedPlayer = null; 
      }} 
      onRefresh={refreshPlayers} 
    />
  {/if}

  <!-- Delete Confirmation Modal -->
  {#if showDeleteConfirm && playerToDelete}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50">
      <div class="bg-[#231a10] rounded-xl p-6 max-w-sm w-full">
        <h3 class="text-white text-lg font-bold mb-4">Conferma eliminazione</h3>
        <p class="text-[#cbb090] mb-6">Sei sicuro di voler eliminare il giocatore "{playerToDelete.name}"?</p>
        <div class="flex justify-end space-x-4">
          <button
            class="px-4 py-2 rounded-xl bg-[#231a10] text-[#cbb090] border border-[#cbb090]"
            on:click={() => {
              showDeleteConfirm = false;
              playerToDelete = null;
            }}
          >
            Annulla
          </button>
          <button
            class="px-4 py-2 rounded-xl bg-[#f49725] text-[#231a10] font-bold"
            on:click={deletePlayer}
          >
            Elimina
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
