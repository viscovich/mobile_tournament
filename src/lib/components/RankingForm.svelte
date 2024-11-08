<!-- src/lib/components/RankingForm.svelte -->
<script lang="ts">
  export let playerName: string;
  export let score: number;
  export let onSubmit: () => void;
</script>

<form on:submit|preventDefault={onSubmit} class="edit-form bg-white p-6 rounded shadow-md">
  <h2 class="text-2xl font-bold mb-4">Modifica Ranking</h2>

  <label class="block mb-4">
    <span class="text-gray-700">Nome Giocatore</span>
    <input type="text" bind:value={playerName} class="mt-1 block w-full" required />
  </label>

  <label class="block mb-4">
    <span class="text-gray-700">Punteggio</span>
    <input type="number" bind:value={score} class="mt-1 block w-full" />
  </label>

  <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Aggiorna Ranking
  </button>
</form>
