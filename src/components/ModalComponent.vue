<template>
  <div class="modal-backdrop">
    <slot></slot>
  </div>
</template>

<script>
  export default {};
</script>

<style scoped>
  .modal-backdrop {
    backdrop-filter: blur(3px);
    background-color: rgba(0, 0, 0, 0.096);
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    filter: drop-shadow(0px 4px 10px rgba(0, 0, 0, 0.096));
  }
</style>
