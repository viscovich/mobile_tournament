<!-- src/lib/components/NewPlayerForm.svelte -->
<script>
  import { supabase } from '$lib/supabase';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  let name = '';
  let error = '';

  const savePlayer = async () => {
    if (!name.trim()) {
      error = 'Please enter a name.';
      return;
    }

    const { error: saveError } = await supabase
      .from('players')
      .insert([{ name }]);
    if (saveError) {
      console.error(saveError);
      error = 'Error saving player.';
    } else {
      dispatch('refresh');
      dispatch('close');
    }
  };
</script>

<div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4" on:click={() => dispatch('close')}>
  <div class="bg-[#231a10] p-8 rounded-xl w-full max-w-md shadow-xl border-2 border-[#cbb090]/20" on:click|stopPropagation>
    <h2 class="text-2xl font-bold mb-8 text-white">New Player</h2>

    {#if error}
      <div class="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
        {error}
      </div>
    {/if}

    <div class="mb-8">
      <label class="block text-[#cbb090] text-sm font-bold mb-2">Name</label>
      <input
        type="text"
        bind:value={name}
        class="mt-1 block w-full border-2 border-[#cbb090] bg-[#231a10] text-white rounded-xl p-3 focus:outline-none focus:border-[#f49725] hover:border-[#f49725]/70 placeholder-[#cbb090]/50 transition-all duration-200"
        placeholder="Enter player name"
        required
      />
    </div>

    <div class="flex justify-end space-x-4">
      <button
        on:click={() => dispatch('close')}
        class="flex items-center justify-center rounded-xl h-11 px-6 bg-[#231a10] border-2 border-[#cbb090] text-[#cbb090] text-sm font-bold tracking-wider hover:border-[#f49725] hover:text-[#f49725] transition-all duration-200"
      >
        Cancel
      </button>
      <button
        on:click={savePlayer}
        class="flex items-center justify-center rounded-xl h-11 px-6 bg-[#f49725] text-[#231a10] text-sm font-bold tracking-wider hover:bg-[#f49725]/90 shadow-lg transition-all duration-200"
      >
        Save
      </button>
    </div>
  </div>
</div>
