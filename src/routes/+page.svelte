<script lang="ts">
  import { supabase } from '$lib/supabase';
  import DeleteIcon from '$lib/components/DeleteIcon.svelte';
  import EditIcon from '$lib/components/EditIcon.svelte';
  import RankingIcon from '$lib/components/RankingIcon.svelte';
  import CalendarIcon from '$lib/components/CalendarIcon.svelte';
  import LocationIcon from '$lib/components/LocationIcon.svelte';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import TournamentForm from '$lib/components/TournamentForm.svelte';

  interface Tournament {
    id: number;
    name: string;
    date: string;
    location: string;
  }

  let tournaments: Tournament[] = [];
  let showForm = false;
  let loading = true;
  let selectedTournament: Tournament | null = null;
  
  const fetchTournaments = async () => {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('date', { ascending: true });
    if (error) console.error(error);
    else tournaments = data || [];
  };

  const deleteTournament = async (id: number) => {
    const { error } = await supabase.from('tournaments').delete().eq('id', id);
    if (error) {
      console.error(error);
    } else {
      fetchTournaments();
    }
  };

  const editTournament = (tournament: Tournament) => {
    selectedTournament = tournament;
    showForm = true;
  };

  // Funzione per chiudere il form
  const closeForm = () => {
    showForm = false;
    selectedTournament = null;
  };
  
  // Funzione per aprire la pagina di ranking
  const openRanking = (tournament: Tournament) => {
    goto(`/tournaments/${tournament.id}/ranking`);
  };

  onMount(() => {
    fetchTournaments();
  });
</script>

<div>
  <div class="flex items-center bg-[#231a10] p-4 pb-2 justify-between">
    <h2 class="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pl-12">Cagiano's Cup</h2>
  </div>
  <div class="@container">
    <div class="px-4 pt-2 @[480px]:pt-3">
      <div
        class="w-full h-[200px] bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-[#231a10] rounded-xl @[480px]:rounded-xl"
        style='background-image: url("/images/beach-volleyball.png");'
      ></div>
    </div>
  </div>
</div>

<div class="px-4">
  <h3 class="text-white text-lg font-bold mb-4 mt-1">Tournaments</h3>
  {#each tournaments as tournament}
    <div class="flex items-center gap-4 bg-[#231a10] px-4 py-2 justify-between rounded-xl mb-2">
      <div class="flex flex-col justify-center">
        <p class="text-white text-base font-medium">{tournament.name}</p>
        <div class="text-[#cbb090] text-sm font-normal flex items-center gap-2">
          <span class="flex items-center gap-1">
            <CalendarIcon />
            {new Date(tournament.date).toLocaleDateString()}
          </span>
          <span class="flex items-center gap-1">
            <LocationIcon />
            {tournament.location}
          </span>
        </div>
      </div>
      <div class="flex space-x-2">
        <button on:click={() => editTournament(tournament)} class="text-white">
          <EditIcon />
        </button>
        <button on:click={() => deleteTournament(tournament.id)} class="text-white">
          <DeleteIcon />
        </button>
        <a href={`/tournaments/${tournament.id}/ranking`} class="text-white">
          <RankingIcon />
        </a>
      </div>
    </div>
  {/each}

  <!-- Add New Tournament Button -->
  <div class="flex justify-center mt-4">
    <button
      class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#f49725] text-[#231a10] text-sm font-bold tracking-[0.015em]"
      on:click={() => (showForm = true)}
    >
      <span class="truncate">Add New Tournament</span>
    </button>
  </div>

  {#if showForm}
    <TournamentForm 
      tournament={selectedTournament} 
      on:close={closeForm} 
      on:refresh={fetchTournaments}
    />
  {/if}
</div>
