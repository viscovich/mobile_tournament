<!-- src/lib/components/EditPlayerForm.svelte -->
<script>
  import { supabase } from '$lib/supabase';
  export let player;
  export let onClose;
  export let onRefresh;

  let name = player.name;
  let error = '';

  const handleSubmit = async () => {
    if (!name.trim()) {
      error = 'Il nome è obbligatorio.';
      return;
    }

    const { data, error: updateError } = await supabase
      .from('players')
      .update({ name })
      .eq('id', player.id);

    if (updateError) {
      console.error('Errore nell\'aggiornamento del giocatore:', updateError);
      error = updateError.message;
    } else {
      onRefresh();
      onClose();
    }
  };
</script>

<style>
  /* Aggiungi eventuali stili personalizzati qui */
</style>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-white p-6 rounded-lg w-96">
    <h2 class="text-2xl font-bold mb-4">Modifica Giocatore</h2>

    {#if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    {/if}

    <div class="mb-4">
      <label class="block text-gray-700">Nome</label>
      <input 
        type="text" 
        bind:value={name} 
        class="mt-1 block w-full border rounded p-2" 
        required 
        placeholder="Inserisci il nome del giocatore"
      />
    </div>

    <div class="flex justify-end space-x-2">
<button 
  on:click={onClose} 
  class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors duration-200"
>
  Annulla
</button>
      <button 
  on:click={handleSubmit} 
  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
>
  Aggiorna
</button>
    </div>
  </div>
</div>

