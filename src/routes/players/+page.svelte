<!-- src/routes/players/+page.svelte -->
<script lang="ts">
  import { supabase } from '$lib/supabase';
  import DeleteIcon from '$lib/components/DeleteIcon.svelte';
  import EditIcon from '$lib/components/EditIcon.svelte';
  import NewPlayerForm from '$lib/components/NewPlayerForm.svelte';
  import EditPlayerForm from '$lib/components/EditPlayerForm.svelte';
  import { onMount } from 'svelte';
  import type { User } from '@supabase/supabase-js';

  interface Player {
    id: number;
    name: string;
    total_points: number;
    tournaments_played: number;
  }

  let players: Player[] = [];
  let showNewForm = false;
  let showEditForm = false;
  let selectedPlayer: Player | null = null;
  let loading = true;
  let errorMessage = '';
  let showDeleteConfirm = false;
  let playerToDelete: Player | null = null;
  let user: User | null = null;
  let showLoginForm = false;
  let email = '';
  let password = '';
  let errorMsg = '';

  // Funzione per recuperare i giocatori con le classifiche globali
  const fetchPlayers = async () => {
    const { data, error } = await supabase.rpc('calculate_global_rankings');
    if (error) {
      console.error('Errore nel recuperare i giocatori:', error);
      errorMessage = 'Errore nel recuperare i giocatori.';
    } else {
      // Sort players alphabetically by name
      players = (data || []).sort((a: Player, b: Player) => a.name.localeCompare(b.name));
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

  const confirmDelete = (player: Player) => {
    playerToDelete = player;
    showDeleteConfirm = true;
  };

  const deletePlayer = async () => {
    if (!playerToDelete) return;

    const { error } = await supabase.from('players').delete().eq('id', playerToDelete.id);
    if (error) {
      console.error('Errore nella cancellazione del giocatore:', error);
      alert('Errore nella cancellazione del giocatore.');
    } else {
      fetchPlayers();
    }
    showDeleteConfirm = false;
    playerToDelete = null;
  };

  const editPlayer = (player: Player) => {
    selectedPlayer = { ...player };
    showEditForm = true;
  };

  onMount(async () => {
    fetchPlayers();
    
    // Get initial auth state
    const { data: { user: initialUser } } = await supabase.auth.getUser();
    user = initialUser;

    // Set up auth state listener
    supabase.auth.onAuthStateChange((event, session) => {
      user = session?.user || null;
    });
  });
</script>

<div>
  <!-- Header della pagina -->
  <div class="flex items-center bg-[#231a10] p-4 pb-2 justify-between">
    <h2 class="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Cagiano's Cup</h2>
    <button
      on:click={() => user ? handleLogout() : (showLoginForm = true)}
      class="px-4 py-1 rounded-lg bg-[#f49725] text-[#231a10] text-sm font-bold"
    >
      {user ? 'Logout' : 'Login'}
    </button>
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

<!-- Login Form Modal -->
{#if showLoginForm && !user}
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
          <div class="space-x-2">
            <button
              type="button"
              on:click={handleSignup}
              class="px-4 py-2 rounded-xl bg-[#2a2118] text-[#f49725] border border-[#f49725]"
            >
              Registrati
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded-xl bg-[#f49725] text-[#231a10] font-bold"
            >
              Login
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
{/if}

<div class="px-4">
  <h3 class="text-white text-lg font-bold mb-4 mt-1">Giocatori</h3>
  
  {#if loading}
    <p class="text-white">Caricamento...</p>
  {:else if errorMessage}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {errorMessage}
    </div>
  {:else}
    {#each players as player}
      <div class="flex items-center gap-4 bg-[#231a10] px-4 py-2 justify-between rounded-xl mb-2">
        <div class="flex flex-col justify-center">
          <p class="text-white text-base font-medium">{player.name}</p>
          <p class="text-[#cbb090] text-sm font-normal">
            Punti Totali: {player.total_points} · Tornei Giocati: {player.tournaments_played}
          </p>
        </div>
        {#if user}
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

  {#if user}
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
    <NewPlayerForm on:close={() => showNewForm = false} on:refresh={() => fetchPlayers()} />
  {/if}

  {#if showEditForm && selectedPlayer}
    <EditPlayerForm 
      player={selectedPlayer} 
      onClose={() => { 
        showEditForm = false; 
        selectedPlayer = null; 
      }} 
      onRefresh={() => { 
        fetchPlayers(); 
      }} 
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
