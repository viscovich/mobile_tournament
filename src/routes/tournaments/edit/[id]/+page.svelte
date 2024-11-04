<!-- src/routes/tournaments/+page.svelte -->
<script>
  import { goto } from '$app/navigation';

  // Supponiamo di avere un array di tornei
  export let tournaments = [
    { id: '1', name: "Cagiano's Cup", date: '2024-06-15', location: 'Beach Arena' },
    { id: '2', name: "Beach Battle", date: '2024-07-20', location: 'Sunset Park' },
    // Altri tornei...
  ];

  function editTournament(id) {
    goto(`/tournaments/edit/${id}`);
  }
</script>

<div class="container mx-auto p-4">
  <h1 class="text-3xl font-bold mb-6">Lista dei Tornei</h1>
  
  {#each tournaments as tournament}
    <div class="flex justify-between items-center bg-white p-4 rounded shadow mb-4">
      <div>
        <h2 class="text-xl font-semibold">{tournament.name}</h2>
        <p>{new Date(tournament.date).toLocaleDateString()} &middot; {tournament.location}</p>
      </div>
      <button on:click={() => editTournament(tournament.id)} class="text-blue-500 hover:text-blue-700">
        <img src="/icons/edit.svg" alt="Edit Tournament" class="w-6 h-6" />
      </button>
    </div>
  {/each}
</div>

