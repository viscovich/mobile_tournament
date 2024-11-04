<!-- src/lib/components/TournamentForm.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { supabase } from '$lib/supabase';
  export let tournament = null; // Se null, è per aggiungere un nuovo torneo
  const dispatch = createEventDispatcher();

  let name = tournament ? tournament.name : '';
  let date = tournament ? tournament.date : '';
    let location = tournament ? tournament.location : '';
  // Altri campi del torneo...
  let error = '';

  const handleSubmit = async () => {
    if (!name.trim()) {
      error = 'Il nome è obbligatorio.';
      return;
    }

    if (tournament) {
      // Aggiorna il torneo esistente
      const { data, error: updateError } = await supabase
        .from('tournaments')
        .update({ name, date, location })
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
        .insert([{ name, date, location }]);

      if (insertError) {
        console.error('Errore nell\'aggiunta del torneo:', insertError);
        error = insertError.message;
      } else {
        dispatch('refresh'); // Emmetti evento di refresh
        dispatch('close');   // Emmetti evento di chiusura
      }
    }
  };
</script>

<style>
  /* Aggiungi eventuali stili personalizzati qui */
</style>

<!-- Overlay del form -->
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-white p-6 rounded-lg w-96">
    <h2 class="text-2xl font-bold mb-4">{tournament ? 'Modifica Torneo' : 'Aggiungi Nuovo Torneo'}</h2>

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
        placeholder="Inserisci il nome del torneo"
      />
    </div>

    <div class="mb-4">
      <label class="block text-gray-700">Data</label>
      <input 
        type="date" 
        bind:value={date} 
        class="mt-1 block w-full border rounded p-2" 
        required 
        placeholder="Inserisci la data del torneo"
      />
    </div>

    <div class="mb-4">
      <label class="block text-gray-700">Data</label>
      <input 
        type="location" 
        bind:value={date} 
        class="mt-1 block w-full border rounded p-2" 
        required 
        placeholder="Inserisci il luogo del torneo"
      />
    </div>
    <!-- Aggiungi altri campi necessari -->

    <div class="flex justify-end space-x-2">
      <button 
        on:click={() => dispatch('close')} 
        class="flex items-center justify-center rounded-xl h-10 px-4 bg-gray-300 text-gray-700 text-sm font-bold tracking-[0.015em] hover:bg-gray-400 transition-colors duration-200"
      >
        Annulla
      </button>
      <button 
        on:click={handleSubmit} 
        class="flex items-center justify-center rounded-xl h-10 px-4 bg-blue-500 text-white text-sm font-bold tracking-[0.015em] hover:bg-blue-600 transition-colors duration-200"
      >
        {tournament ? 'Aggiorna' : 'Aggiungi'}
      </button>
    </div>
  </div>
</div>

