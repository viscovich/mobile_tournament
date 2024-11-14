<!-- src/lib/components/EditPlayerForm.svelte -->
<script lang="ts">
  import { supabase } from '$lib/supabase';
  import { checkImageExists, getPlayerImageSrc } from '$lib/utils/image-utils';

  export let player: { 
    id: number; 
    name: string; 
    imageUrl?: string; 
  };
  export let onClose: () => void;
  export let onRefresh: () => void;

  let name = player.name;
  let error = '';

  const handleSubmit = async () => {
    console.log(`[EditPlayerForm] Attempting to update player ${player.id}`);

    if (!name.trim()) {
      error = 'Il nome è obbligatorio.';
      return;
    }

    const { data, error: updateError } = await supabase
      .from('players')
      .update({ name })
      .eq('id', player.id);

    if (updateError) {
      console.error(`[EditPlayerForm] Error updating player ${player.id}:`, updateError);
      error = updateError.message;
    } else {
      // Verify image existence after name update
      try {
        console.log(`[EditPlayerForm] Checking image existence for player ${player.id}`);
        const exists = await checkImageExists(player.id);
        
        if (exists) {
          player.imageUrl = getPlayerImageSrc(player.id);
          console.log(`[EditPlayerForm] Image found for player ${player.id}: ${player.imageUrl}`);
        } else {
          player.imageUrl = '/images/default-player.jpg';
          console.warn(`[EditPlayerForm] No image found for player ${player.id}, using default`);
        }
      } catch (err) {
        console.error(`[EditPlayerForm] Error checking image for player ${player.id}:`, err);
        player.imageUrl = '/images/default-player.jpg';
      }
      
      console.log(`[EditPlayerForm] Player ${player.id} updated successfully`);
      onRefresh();
      onClose();
    }
  };
</script>

<div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
  <div class="bg-[#231a10] p-8 rounded-xl w-full max-w-md shadow-xl border-2 border-[#cbb090]/20">
    <h2 class="text-2xl font-bold mb-8 text-white">Modifica Giocatore</h2>

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
        required 
        placeholder="Inserisci il nome del giocatore"
      />
    </div>

    <div class="flex justify-end space-x-4">
      <button 
        on:click={onClose}
        class="flex items-center justify-center rounded-xl h-11 px-6 bg-[#231a10] border-2 border-[#cbb090] text-[#cbb090] text-sm font-bold tracking-wider hover:border-[#f49725] hover:text-[#f49725] transition-all duration-200"
      >
        Annulla
      </button>
      <button 
        on:click={handleSubmit}
        class="flex items-center justify-center rounded-xl h-11 px-6 bg-[#f49725] text-[#231a10] text-sm font-bold tracking-wider hover:bg-[#f49725]/90 shadow-lg transition-all duration-200"
      >
        Aggiorna
      </button>
    </div>
  </div>
</div>
