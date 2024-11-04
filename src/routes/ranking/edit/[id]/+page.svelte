<!-- src/routes/ranking/edit/[id]/+page.svelte -->
<script context="module">
  export async function load({ params, fetch }) {
    const { id } = params;
    const res = await fetch(`/api/ranking/${id}`);

    if (res.ok) {
      const ranking = await res.json();
      return { props: { ranking } };
    } else {
      return { status: res.status, error: new Error('Ranking non trovato') };
    }
  }
</script>

<script>
  import { goto } from '$app/navigation';
  export let ranking;

  let playerName = ranking.playerName;
  let score = ranking.score;

  async function handleSubmit() {
    const updatedRanking = { playerName, score };
    const res = await fetch(`/api/ranking/${ranking.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedRanking)
    });

    if (res.ok) {
      alert('Ranking aggiornato con successo!');
      goto('/ranking'); // Naviga alla lista dei ranking o altra pagina
    } else {
      const err = await res.text();
      alert(`Errore nell'aggiornamento del ranking: ${err}`);
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="edit-form bg-white p-6 rounded shadow-md">
  <h2 class="text-2xl font-bold mb-4">Modifica Ranking</h2>

  <label class="block mb-4">
    <span class="text-gray-700">Nome Giocatore</span>
    <input type="text" bind:value={playerName} class="mt-1 block w-full" required />
  </label>

  <label class="block mb-4">
    <span class="text-gray-700">Punteggio</span>
    <input type="number" bind:value={score} class="mt-1 block w-full" required />
  </label>

  <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Aggiorna Ranking
  </button>
</form>

