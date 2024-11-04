<!-- src/lib/components/NewPlayerForm.svelte -->
<script>
  import { supabase } from '$lib/supabase';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  let name = '';

  const savePlayer = async () => {
    if (!name) {
      alert('Please enter a name.');
      return;
    }

    const { error } = await supabase
      .from('players')
      .insert([{ name }]);
    if (error) {
      console.error(error);
      alert('Error saving player.');
    } else {
      dispatch('refresh');
      dispatch('close');
    }
  };
</script>

<style>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-content {
    background: #fff;
    padding: 1.5rem;
    border-radius: 8px;
    width: 90%;
    max-width: 400px;
  }
</style>

<div class="modal" on:click={() => dispatch('close')}>
  <div class="modal-content" on:click|stopPropagation>
    <h2 class="text-xl font-bold mb-4">New Player</h2>
    <div class="mb-4">
      <label class="block text-gray-700">Name</label>
      <input
        type="text"
        bind:value={name}
        class="w-full px-3 py-2 border rounded"
        placeholder="Player Name"
      />
    </div>
    <div class="flex justify-end">
      <button
        on:click={savePlayer}
class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#f49725] text-[#231a10] text-sm font-bold tracking-[0.015em]"
      >
        Save
      </button> 
      <button
        on:click={() => dispatch('close')}
class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#f49725] text-[#231a10] text-sm font-bold tracking-[0.015em]"
      >
        Cancel
      </button>
    </div>
  </div>
</div>

