<!-- src/lib/components/NewTournamentForm.svelte -->
<script>
  import { supabase } from '$lib/supabase';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  let name = '';
  let date = '';
  let location = '';
  let multiplier = 1;

  const saveTournament = async () => {
    if (!name || !date || !location) {
      alert('Please fill in all fields.');
      return;
    }

    const { error } = await supabase
      .from('tournaments')
      .insert([{ name, date, location, multiplier }]);
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
    background: white;
    padding: 0.25rem;
    border-radius: 4px;
    width: 90%;
    max-width: 400px;
    max-height: 80%;
    overflow-y: auto;
  }

  .title {
    font-size: 0.875rem;
    font-weight: bold;
    margin: 0 0 0.25rem 0;
  }

  .form-row {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-bottom: 0.25rem;
    min-height: 1.25rem;
  }

  .form-row:last-child {
    margin-bottom: 0;
  }

  .form-row label {
    flex: 0 0 4.5rem;
    font-size: 0.75rem;
    color: #4b5563;
  }

  .form-input {
    flex: 1;
    height: 1.25rem;
    padding: 0 0.25rem;
    font-size: 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 2px;
    margin: 0;
    box-sizing: border-box;
  }

  .buttons {
    display: flex;
    justify-content: flex-end;
    gap: 0.25rem;
    margin-top: 0.25rem;
  }

  .btn {
    font-size: 0.75rem;
    padding: 0.125rem 0.375rem;
    border-radius: 2px;
    border: none;
    cursor: pointer;
    height: 1.25rem;
    line-height: 1;
  }

  .btn.cancel {
    background: #e5e7eb;
    color: #4b5563;
  }

  .btn.save {
    background: #3b82f6;
    color: white;
  }

  /* Remove browser default styles */
  input, select {
    margin: 0;
    appearance: none;
  }

  select.form-input {
    background: white;
    padding-right: 1rem;
  }
</style>

<div class="modal" on:click={() => dispatch('close')}>
  <div class="modal-content" on:click|stopPropagation>
    <h2 class="title">New Tournament</h2>
    <div class="form-row">
      <label>Name</label>
      <input
        type="text"
        bind:value={name}
        class="form-input"
        placeholder="Tournament Name"
      />
    </div>
    <div class="form-row">
      <label>Date</label>
      <input
        type="date"
        bind:value={date}
        class="form-input"
      />
    </div>
    <div class="form-row">
      <label>Location</label>
      <input
        type="text"
        bind:value={location}
        class="form-input"
        placeholder="Location"
      />
    </div>
    <div class="form-row">
      <label>Multiplier</label>
      <select
        bind:value={multiplier}
        class="form-input"
      >
        <option value={1}>Normal (1x)</option>
        <option value={2}>Double Points (2x)</option>
      </select>
    </div>
    <div class="buttons">
      <button class="btn cancel" on:click={() => dispatch('close')}>
        Cancel
      </button>
      <button class="btn save" on:click={saveTournament}>
        Save
      </button>
    </div>
  </div>
</div>
