<script lang="ts">
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  import { selectedTournamentId } from '$lib/stores/tournamentStore'; // Import store

  interface Tournament {
    id: number;
    name: string;
  }

  let tournaments: Tournament[] = [];
  let loading = true;

  const fetchTournaments = async () => {
    loading = true;
    // Fetch from the new 'tournament_editions' table
    const { data, error } = await supabase
      .from('tournament_editions') 
      .select('id, name') 
      .order('id', { ascending: false }) // Order by ID descending to get the latest first
      .throwOnError();

    if (error) {
      console.error('Error fetching tournament editions:', error);
      tournaments = [];
    } else {
      const fetchedTournaments = data || [];
      tournaments = fetchedTournaments; // Store all tournaments for the dropdown
      
      // Set the default tournament edition ONLY if no tournament is currently selected in the store
      if (fetchedTournaments.length > 0 && $selectedTournamentId === null) { 
        selectedTournamentId.set(fetchedTournaments[0].id); // Set default only if store is null
      }
    }
    loading = false;
  };

  onMount(() => {
    fetchTournaments();
  });

  const handleTournamentChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    const tournamentId = parseInt(target.value);
    $selectedTournamentId = tournamentId; // Update the store value directly
    selectedTournamentId.set(tournamentId); // Also update the store
  };
</script>

<div class="mb-4">
  <label for="tournament" class="block text-white text-sm font-bold mb-2">Seleziona Torneo:</label>
  {#if loading}
    <p class="text-white">Caricamento...</p>
  {:else}
    <select
      id="tournament"
      class="block w-full border-2 border-[#cbb090] bg-[#231a10] text-white rounded-xl p-3 focus:outline-none focus:border-[#f49725] hover:border-[#f49725]/70 transition-all duration-200"
      on:change={handleTournamentChange}
      value={$selectedTournamentId}
    >
      {#each tournaments as tournament (tournament.id)}
        <option value={tournament.id} selected={tournament.id === $selectedTournamentId}>{tournament.name}</option>
      {/each}
    </select>
  {/if}
</div>
