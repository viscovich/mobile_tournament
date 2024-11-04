<!-- src/lib/components/NewPlayerForm.svelte -->
<script>
  import { supabase } from '$lib/supabase';
  export let onClose;
  export let onRefresh;

  let name = '';
  let age = '';
  let position = '';
  let error = '';

  const handleSubmit = async () => {
    if (!name || !age || !position) {
      error = 'Tutti i campi sono obbligatori.';
      return;
    }

    const { data, error: insertError } = await supabase
      .from('players')
      .insert([{ name, age: Number(age), position }]);

    if (insertError) {
      error = insertError.message;
    } else {
      onRefresh();
      onClose();
    }
  };
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
  <div class="bg-white p-6 rounded-lg w-96">
    <h2 class="text-2xl font-bold mb-4">Aggiungi Nuovo Giocatore</h2>

    {#if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    {/if}

    <div class="mb-4">
      <label class="block text-gray-700">Nome</label>
      <input type="text" bind:value={name} class="mt-1 block w-full border rounded p-2" required />
    </div>

    <div class="mb-4">
      <label class="block text-gray-700">Età</label>
      <input type="number" bind:value={age} class="mt-1 block w-full border rounded p-2" required min="0" />
    </div>

    <div class="mb-4">
      <label class="block text-gray-700">Posizione</label>
      <input type="text" bind:value={position} class="mt-1 block w-full border rounded p-2" required />
    </div>

    <div class="flex justify-end space-x-2">
      <button on:click={onClose} class="px-4 py-2 bg-gray-300 text-gray-700 rounded">Annulla</button>
      <button on:click={handleSubmit} class="px-4 py-2 bg-blue-500 text-white rounded">Aggiungi</button>
    </div>
  </div>
</div>

