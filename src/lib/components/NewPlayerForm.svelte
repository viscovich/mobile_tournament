<!-- src/lib/components/NewPlayerForm.svelte -->
<script lang="ts">
  import { supabase } from '$lib/supabase';
  import { createEventDispatcher } from 'svelte';
  import { getPlayerImageSrc } from '$lib/utils/image-utils';

  const dispatch = createEventDispatcher();
  
  let name = '';
  let error = '';

  const savePlayer = async () => {
    console.log('[NewPlayerForm] Attempting to save new player');

    if (!name.trim()) {
      console.warn('[NewPlayerForm] Attempted to save player with empty name');
      error = 'Il nome è obbligatorio.';
      return;
    }

    try {
      // Insert the new player
      const { data, error: insertError } = await supabase
        .from('players')
        .insert([{ name }])
        .select('id');  // Return the inserted player's ID

      if (insertError) {
        console.error('[NewPlayerForm] Error saving player:', insertError);
        error = 'Errore nel salvare il giocatore.';
        return;
      }

      // Log successful player creation
      if (data && data.length > 0) {
        const newPlayerId = data[0].id;
        console.log(`[NewPlayerForm] Player created successfully with ID: ${newPlayerId}`);

        // Prepare default image URL
        const defaultImageUrl = getPlayerImageSrc(newPlayerId);
        console.log(`[NewPlayerForm] Default image URL for new player: ${defaultImageUrl}`);
      }

      // Dispatch events to refresh and close the form
      dispatch('refresh');
      dispatch('close');
    } catch (err) {
      console.error('[NewPlayerForm] Unexpected error:', err);
      error = 'Errore imprevisto.';
    }
  };
</script>

<div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4" on:click={() => dispatch('close')}>
  <div class="bg-[#231a10] p-8 rounded-xl w-full max-w-md shadow-xl border-2 border-[#cbb090]/20" on:click|stopPropagation>
    <h2 class="text-2xl font-bold mb-8 text-white">Nuovo Giocatore</h2>

    {#if error}
      <div class="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
        {error}
      </div>
    {/if}

    <div class="mb-8">
      <label class="block text-[#cbb090] text-sm font-bold mb-2">Nome</label>
      <input
        type="text"
        bind:value={name}
        class="mt-1 block w-full border-2 border-[#cbb090] bg-[#231a10] text-white rounded-xl p-3 focus:outline-none focus:border-[#f49725] hover:border-[#f49725]/70 placeholder-[#cbb090]/50 transition-all duration-200"
        placeholder="Inserisci il nome del giocatore"
        required
      />
    </div>

    <div class="flex justify-end space-x-4">
      <button
        on:click={() => dispatch('close')}
        class="flex items-center justify-center rounded-xl h-11 px-6 bg-[#231a10] border-2 border-[#cbb090] text-[#cbb090] text-sm font-bold tracking-wider hover:border-[#f49725] hover:text-[#f49725] transition-all duration-200"
      >
        Annulla
      </button>
      <button
        on:click={savePlayer}
        class="flex items-center justify-center rounded-xl h-11 px-6 bg-[#f49725] text-[#231a10] text-sm font-bold tracking-wider hover:bg-[#f49725]/90 shadow-lg transition-all duration-200"
      >
        Salva
      </button>
    </div>
  </div>
</div>
