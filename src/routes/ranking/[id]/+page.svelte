<!-- src/routes/ranking/[id]/+page.svelte -->
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
  export let ranking;
</script>

<div class="container mx-auto p-4">
  <h1 class="text-3xl font-bold mb-6">Ranking di {ranking.playerName}</h1>
  <p>Punteggio: {ranking.score}</p>
  <!-- Aggiungi ulteriori dettagli o funzionalità come necessario -->
</div>

