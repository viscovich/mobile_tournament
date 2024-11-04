<!-- src/routes/+page.svelte -->
<script>
  import { supabase } from '$lib/supabase';
  import DeleteIcon from '$lib/components/DeleteIcon.svelte';
  import EditIcon from '$lib/components/EditIcon.svelte';
  import RankingIcon from '$lib/components/RankingIcon.svelte';
  import { onMount } from 'svelte';
   import { goto } from '$app/navigation';
  import    TournamentForm from '$lib/components/TournamentForm.svelte';
  let tournaments = [];
  let showForm = false;
    let loading = true;
  let selectedTournament = null;
  
  const fetchTournaments = async () => {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('date', { ascending: true });
    if (error) console.error(error);
    else tournaments = data;
  };

  const deleteTournament = async (id) => {
    const { error } = await supabase.from('tournaments').delete().eq('id', id);
    if (error) {
      console.error(error);
    } else {
      fetchTournaments();
    }
  };
  const editTournament = (tournament) => {
    selectedTournament = tournament;
    showForm = true;
  };

  // Funzione per chiudere il form
  const closeForm = () => {
    showForm = false;
    selectedTournament = null;
  };
  
  // Funzione per aprire la pagina di ranking
  const openRanking = (tournament) => {
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
          <div class="@[480px]:px-4 @[480px]:py-3">
            <div
              class="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-[#231a10] @[480px]:rounded-xl min-h-[218px]"
              style='background-image: url("/images/beach-volleyball.png");'
            ></div>
          </div>
        </div>
       </div>

<div class="p-4">
  <h3 class="text-white text-lg font-bold mb-4">Tournaments</h3>
  {#each tournaments as tournament}
    <div class="flex items-center gap-4 bg-[#231a10] px-4 min-h-[72px] py-2 justify-between rounded-xl mb-2">
      <div class="flex flex-col justify-center">
        <p class="text-white text-base font-medium">{tournament.name}</p>
        <p class="text-[#cbb090] text-sm font-normal">
          {new Date(tournament.date).toLocaleDateString()} · {tournament.location}
        </p>
      </div>
      <div class="flex space-x-2">
    <button on:click={() => editTournament(tournament)} class="text-white">
          <EditIcon />
        </button>
        <button on:click={() => deleteTournament(tournament.id)} class="text-white">
          <DeleteIcon />
        </button>
        <a href={`/ranking/${tournament.id}`} class="text-white">
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

