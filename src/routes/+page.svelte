<script lang="ts">
  import { supabase } from '$lib/supabase';
  import DeleteIcon from '$lib/components/DeleteIcon.svelte';
  import EditIcon from '$lib/components/EditIcon.svelte';
  import RankingIcon from '$lib/components/RankingIcon.svelte';
  import CalendarIcon from '$lib/components/CalendarIcon.svelte';
  import LocationIcon from '$lib/components/LocationIcon.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import TournamentForm from '$lib/components/TournamentForm.svelte';
  import type { User } from '@supabase/supabase-js';
  import { userStore } from '$lib/stores/auth';
  import { page } from '$app/stores';

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
  let showDeleteConfirm = false;
  let tournamentToDelete: Tournament | null = null;
  let showLoginForm = false;
  let email = '';
  let password = '';
  let errorMsg = '';
  
  const fetchTournaments = async () => {
    loading = true;
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('date', { ascending: true })
      .throwOnError();

    if (error) {
      console.error(error);
      tournaments = [];
    } else {
      tournaments = data || [];
    }
    loading = false;
  };

  const handleLogin = async () => {
    errorMsg = '';
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      errorMsg = error.message;
    } else {
      showLoginForm = false;
      email = '';
      password = '';
    }
  };

  const handleSignup = async () => {
    errorMsg = '';
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (error) {
      errorMsg = error.message;
    } else {
      errorMsg = 'Controlla la tua email per confermare la registrazione.';
      email = '';
      password = '';
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error logging out:', error.message);
  };

  const confirmDelete = (tournament: Tournament) => {
    tournamentToDelete = tournament;
    showDeleteConfirm = true;
  };

  const deleteTournament = async () => {
    if (!tournamentToDelete) return;

    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', tournamentToDelete.id)
      .throwOnError();

    if (error) {
      console.error('Error deleting tournament:', error);
    } else {
      await fetchTournaments();
    }
    showDeleteConfirm = false;
    tournamentToDelete = null;
  };

  const editTournament = (tournament: Tournament) => {
    selectedTournament = tournament;
    showForm = true;
  };

  const closeForm = () => {
    showForm = false;
    selectedTournament = null;
  };

  const handleRefresh = async () => {
    await fetchTournaments();
  };
  
  const openRanking = (tournament: Tournament) => {
    goto(`/tournaments/${tournament.id}/ranking`);
  };

  // Subscribe to page changes to refresh data
  $: {
    if ($page) {
      fetchTournaments();
    }
  }

  onMount(() => {
    fetchTournaments();
  });
</script>

<div>
  <div class="flex items-center bg-[#231a10] p-4 pb-2 justify-between">
    <h2 class="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Cagiano's Cup</h2>
    <button
      on:click={() => $userStore ? handleLogout() : (showLoginForm = true)}
      class="px-4 py-1 rounded-lg bg-[#f49725] text-[#231a10] text-sm font-bold"
    >
      {$userStore ? 'Logout' : 'Login'}
    </button>
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

<!-- Login Form Modal -->
{#if showLoginForm && !$userStore}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50">
    <div class="bg-[#231a10] rounded-xl p-6 max-w-sm w-full">
      <h3 class="text-white text-lg font-bold mb-4">Login</h3>
      <form on:submit|preventDefault={handleLogin} class="space-y-4">
        <div>
          <label for="email" class="block text-[#cbb090] mb-1">Email</label>
          <input
            type="email"
            id="email"
            bind:value={email}
            class="w-full px-3 py-2 rounded-lg bg-[#2a2118] text-white border border-[#cbb090] focus:outline-none focus:border-[#f49725]"
            required
          />
        </div>
        <div>
          <label for="password" class="block text-[#cbb090] mb-1">Password</label>
          <input
            type="password"
            id="password"
            bind:value={password}
            class="w-full px-3 py-2 rounded-lg bg-[#2a2118] text-white border border-[#cbb090] focus:outline-none focus:border-[#f49725]"
            required
          />
        </div>
        {#if errorMsg}
          <p class="text-red-500 text-sm">{errorMsg}</p>
        {/if}
        <div class="flex justify-between space-x-4">
          <button
            type="button"
            class="px-4 py-2 rounded-xl bg-[#231a10] text-[#cbb090] border border-[#cbb090]"
            on:click={() => {
              showLoginForm = false;
              email = '';
              password = '';
              errorMsg = '';
            }}
          >
            Annulla
          </button>
          <button
            type="submit"
            class="px-4 py-2 rounded-xl bg-[#f49725] text-[#231a10] font-bold"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<div class="px-4">
  <h3 class="text-white text-lg font-bold mb-4 mt-1">Tournaments</h3>
  {#if loading}
    <p class="text-white">Caricamento...</p>
  {:else}
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
        {#if $userStore}
          <div class="flex space-x-2">
            <button on:click={() => editTournament(tournament)} class="text-white">
              <EditIcon />
            </button>
            <button on:click={() => confirmDelete(tournament)} class="text-white">
              <DeleteIcon />
            </button>
            <a href={`/tournaments/${tournament.id}/ranking`} class="text-white">
              <RankingIcon />
            </a>
          </div>
        {:else}
          <div class="flex space-x-2">
            <a href={`/tournaments/${tournament.id}/ranking`} class="text-white">
              <RankingIcon />
            </a>
          </div>
        {/if}
      </div>
    {/each}
  {/if}

  {#if $userStore}
    <!-- Add New Tournament Button -->
    <div class="flex justify-center mt-4">
      <button
        class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#f49725] text-[#231a10] text-sm font-bold tracking-[0.015em]"
        on:click={() => (showForm = true)}
      >
        <span class="truncate">Add New Tournament</span>
      </button>
    </div>
  {/if}

  {#if showForm}
    <TournamentForm 
      tournament={selectedTournament} 
      on:close={closeForm} 
      on:refresh={handleRefresh}
    />
  {/if}

  <!-- Delete Confirmation Modal -->
  {#if showDeleteConfirm && tournamentToDelete}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50">
      <div class="bg-[#231a10] rounded-xl p-6 max-w-sm w-full">
        <h3 class="text-white text-lg font-bold mb-4">Conferma eliminazione</h3>
        <p class="text-[#cbb090] mb-6">Sei sicuro di voler eliminare il torneo "{tournamentToDelete.name}"?</p>
        <div class="flex justify-end space-x-4">
          <button
            class="px-4 py-2 rounded-xl bg-[#231a10] text-[#cbb090] border border-[#cbb090]"
            on:click={() => {
              showDeleteConfirm = false;
              tournamentToDelete = null;
            }}
          >
            Annulla
          </button>
          <button
            class="px-4 py-2 rounded-xl bg-[#f49725] text-[#231a10] font-bold"
            on:click={deleteTournament}
          >
            Elimina
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
