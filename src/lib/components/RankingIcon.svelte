<!-- src/lib/components/RankingIcon.svelte -->
<script>
  export let size = '24px';
  export let color = 'currentColor';
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  fill={color}
  viewBox="0 0 256 256"
>
  <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,200V56H216V200Zm136-24V96a8,8,0,0,0-8-8H152a8,8,0,0,0-8,8v80a8,8,0,0,0,16,0V104h8v72a8,8,0,0,0,8,8Zm-48,0V128a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V136h8v40a8,8,0,0,0,8,8ZM88,176V152a8,8,0,0,0-8-8H64a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V160h8v16a8,8,0,0,0,8,8Z"></path>
</svg>
