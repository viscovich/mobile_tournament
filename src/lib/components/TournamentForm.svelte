<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { supabase } from '$lib/supabase';
  import DatePicker from './DatePicker.svelte';

  interface Tournament {
    id: number;
    name: string;
    date: string;
    location: string;
    multiplier: number;
  }

  export let tournament: Tournament | null = null;
  const dispatch = createEventDispatcher<{
    close: void;
    refresh: void;
  }>();

  let name = tournament ? tournament.name : '';
  let date = tournament ? tournament.date : '';
  let location = tournament ? tournament.location : '';
  let multiplier = tournament ? tournament.multiplier : 1;
  let error = '';

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!name.trim()) {
      error = 'Il nome è obbligatorio.';
      return;
    }

    if (tournament) {
      // Aggiorna il torneo esistente
      const { data, error: updateError } = await supabase
        .from('tournaments')
        .update({ name, date, location, multiplier })
        .eq('id', tournament.id);

      if (updateError) {
        console.error('Errore nell\'aggiornamento del torneo:', updateError);
        error = updateError.message;
      } else {
        dispatch('refresh'); // Emmetti evento di refresh
        dispatch('close');   // Emmetti evento di chiusura
      }
    } else {
      // Crea un nuovo torneo
      const { data, error: insertError } = await supabase
        .from('tournaments')
        .insert([{ name, date, location, multiplier }]);

      if (insertError) {
        console.error('Errore nell\'aggiunta del torneo:', insertError);
        error = insertError.message;
      } else {
        dispatch('refresh'); // Emmetti evento di refresh
        dispatch('close');   // Emmetti evento di chiusura
      }
    }
  };

  const handleClose = () => {
    dispatch('close');
  };
</script>

<div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
  <form class="bg-[#231a10] p-8 rounded-xl w-full max-w-md shadow-xl border-2 border-[#cbb090]/20" on:submit={handleSubmit}>
    <h2 class="text-2xl font-bold mb-8 text-white">{tournament ? 'Modifica Torneo' : 'Aggiungi Nuovo Torneo'}</h2>

    {#if error}
      <div class="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
        {error}
      </div>
    {/if}

    <div class="mb-6">
      <label class="block text-[#cbb090] text-sm font-bold mb-2">Nome</label>
      <input 
        type="text" 
        bind:value={name} 
        class="mt-1 block w-full border-2 border-[#cbb090] bg-[#231a10] text-white rounded-xl p-3 focus:outline-none focus:border-[#f49725] hover:border-[#f49725]/70 placeholder-[#cbb090]/50 transition-all duration-200" 
        required 
        placeholder="Inserisci il nome del torneo"
      />
    </div>

    <div class="mb-6">
      <label class="block text-[#cbb090] text-sm font-bold mb-2">Data</label>
      <DatePicker bind:value={date} required />
    </div>

    <div class="mb-6">
      <label class="block text-[#cbb090] text-sm font-bold mb-2">Luogo</label>
      <input 
        type="text" 
        bind:value={location} 
        class="mt-1 block w-full border-2 border-[#cbb090] bg-[#231a10] text-white rounded-xl p-3 focus:outline-none focus:border-[#f49725] hover:border-[#f49725]/70 placeholder-[#cbb090]/50 transition-all duration-200" 
        required 
        placeholder="Inserisci il luogo del torneo"
      />
    </div>

    <div class="mb-6">
      <label class="block text-[#cbb090] text-sm font-bold mb-2">Moltiplicatore Punti</label>
      <select
        bind:value={multiplier}
        class="mt-1 block w-full border-2 border-[#cbb090] bg-[#231a10] text-white rounded-xl p-3 focus:outline-none focus:border-[#f49725] hover:border-[#f49725]/70 transition-all duration-200"
      >
        <option value={1}>Normale (1x)</option>
        <option value={2}>Punti Doppi (2x)</option>
      </select>
    </div>

    <div class="buttons-container">
      <button type="button" class="cancel-button" on:click={() => dispatch('close')}>Cancel</button>
      <button type="submit" class="button">Save</button>
    </div>
  </form>
</div>

<style>
  .form-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
    box-sizing: border-box;
  }

  @media (min-width: 640px) {
    .form-container {
      padding: 2rem;
    }
  }

  .page-title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
    color: white;
    word-break: break-word;
  }

  @media (min-width: 640px) {
    .page-title {
      font-size: 1.875rem;
    }
  }

  .error {
    color: #ef4444;
    margin-bottom: 1rem;
    padding: 0.75rem;
    background-color: #fee2e2;
    border-radius: 0.5rem;
  }

  .success {
    color: #22c55e;
    margin-bottom: 1rem;
    padding: 0.75rem;
    background-color: #dcfce7;
    border-radius: 0.5rem;
  }

  .button {
    min-height: 44px;
    padding: 0.75rem 1.5rem;
    background-color: #f49725;
    color: #000000;
    border: none;
    border-radius: 0.75rem;
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .button:hover {
    background-color: #e88a15;
  }

  .button:active {
    background-color: #d67d14;
  }

  .cancel-button {
    min-height: 44px;
    padding: 0.75rem 1.5rem;
    background-color: transparent;
    color: #ffffff;
    border: 2px solid #f49725;
    border-radius: 0.75rem;
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .cancel-button:hover {
    background-color: rgba(244, 151, 37, 0.1);
  }

  .buttons-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
  }
</style>
