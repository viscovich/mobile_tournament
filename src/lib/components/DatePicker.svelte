<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import CalendarIcon from './CalendarIcon.svelte';

  export let value = '';
  export let required = false;

  const dispatch = createEventDispatcher();
  let showCalendar = false;
  let inputRef: HTMLInputElement;

  // Get current date for default values and limits
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // State for the calendar
  $: selectedDate = value ? new Date(value + 'T00:00:00') : null;
  $: viewMonth = selectedDate ? selectedDate.getMonth() : currentMonth;
  $: viewYear = selectedDate ? selectedDate.getFullYear() : currentYear;

  // Calendar generation helpers
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  function generateCalendarDays() {
    const days = [];
    const totalDays = daysInMonth(viewYear, viewMonth);
    const firstDay = firstDayOfMonth(viewYear, viewMonth);

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add the days of the month
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }

    return days;
  }

  function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function selectDate(day: number) {
    if (day) {
      const newDate = new Date(viewYear, viewMonth, day);
      selectedDate = newDate;
      value = formatDate(newDate);
      dispatch('change', { value });
      showCalendar = false;
    }
  }

  function previousMonth() {
    if (viewMonth === 0) {
      viewMonth = 11;
      viewYear--;
    } else {
      viewMonth--;
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      viewMonth = 0;
      viewYear++;
    } else {
      viewMonth++;
    }
  }

  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  // Close calendar when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.date-picker-container')) {
      showCalendar = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="relative date-picker-container">
  <div class="relative">
    <input
      type="text"
      bind:this={inputRef}
      {required}
      readonly
      value={selectedDate ? selectedDate.toLocaleDateString('it-IT') : ''}
      placeholder="Seleziona una data"
      class="mt-1 block w-full border-2 border-[#cbb090] bg-[#231a10] text-white rounded-xl p-3 pr-12 focus:outline-none focus:border-[#f49725] hover:border-[#f49725]/70 placeholder-[#cbb090]/50 transition-all duration-200 cursor-pointer"
      on:click|stopPropagation={() => showCalendar = !showCalendar}
    />
    <div class="absolute right-3 top-1/2 -translate-y-1/2 text-[#cbb090]">
      <CalendarIcon />
    </div>
  </div>

  {#if showCalendar}
    <div class="absolute z-50 mt-2 p-4 bg-[#231a10] border-2 border-[#cbb090] rounded-xl shadow-xl w-[300px]">
      <div class="flex justify-between items-center mb-4">
        <button
          class="text-[#cbb090] hover:text-[#f49725] p-1"
          on:click|stopPropagation={previousMonth}
        >
          ←
        </button>
        <div class="text-[#cbb090] font-semibold">
          {monthNames[viewMonth]} {viewYear}
        </div>
        <button
          class="text-[#cbb090] hover:text-[#f49725] p-1"
          on:click|stopPropagation={nextMonth}
        >
          →
        </button>
      </div>

      <div class="grid grid-cols-7 gap-1 text-center mb-2">
        {#each ['D', 'L', 'M', 'M', 'G', 'V', 'S'] as day}
          <div class="text-[#cbb090] text-sm">{day}</div>
        {/each}
      </div>

      <div class="grid grid-cols-7 gap-1">
        {#each generateCalendarDays() as day}
          {#if day === null}
            <div></div>
          {:else}
            <button
              class="h-8 w-8 rounded-full flex items-center justify-center text-sm
                {selectedDate && day === selectedDate.getDate() && viewMonth === selectedDate.getMonth() && viewYear === selectedDate.getFullYear()
                  ? 'bg-[#f49725] text-[#231a10] font-bold'
                  : 'text-white hover:bg-[#cbb090]/20'}"
              on:click|stopPropagation={() => selectDate(day)}
            >
              {day}
            </button>
          {/if}
        {/each}
      </div>
    </div>
  {/if}
</div>
