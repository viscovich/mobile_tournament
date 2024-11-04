<!-- src/lib/components/NewTournamentForm.svelte -->
<script>
  import { supabase } from '$lib/supabase';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  let name = '';
  let date = '';
  let location = '';

  const saveTournament = async () => {
    if (!name || !date || !location) {
      alert('Please fill in all fields.');
      return;
    }

    const { error } = await supabase
      .from('tournaments')
      .insert([{ name, date, location }]);
    if (error) {
      console.error(error);
      alert('Error saving tournament.');
    } else {
      dispatch('refresh');
      dispatch('close');
    }
  };
</script>

<style>
  .modal {
    /* Simple modal styles */
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
    <h2 class="text-xl font-bold mb-4">New Tournament</h2>
    <div class="mb-4">
      <label class="block text-gray-700">Name</label>
      <input
        type="text"
        bind:value={name}
        class="w-full px-3 py-2 border rounded"
        placeholder="Tournament Name"
      />
    </div>
    <div class="mb-4">
      <label class="block text-gray-700">Date</label>
      <input
        type="date"
        bind:value={date}
        class="w-full px-3 py-2 border rounded"
      />
    </div>
    <div class="mb-4">
      <label class="block text-gray-700">Location</label>
      <input
        type="text"
        bind:value={location}
        class="w-full px-3 py-2 border rounded"
        placeholder="Location"
      />
    </div>
    <div class="flex justify-end">
      <button
        on:click={saveTournament}
        class="bg-blue-500 text-white px-4 py-2 rounded mr-2"
      >
        Save
      </button>
      <button
        on:click={() => dispatch('close')}
        class="bg-gray-300 text-gray-700 px-4 py-2 rounded"
      >
        Cancel
      </button>
    </div>
  </div>
</div>

