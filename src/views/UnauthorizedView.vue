<template>
  <div class="unauthorized-view">
    <h5>Unauthorized Access</h5>
    <p class="text-muted mb-0">
      You do not have permission to access this section.
    </p>
    <a :href="origin">Return to Home</a>
  </div>
</template>

<script>
export default {
  name: "UnauthorizedView",
  computed: {
    origin() {
      return window.location.protocol + "//" + window.location.hostname + "/ttprod/v3";
    },
  }
};
</script>

<style scoped>
.unauthorized-view {
  position: fixed;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 30px;
  width: min(400px, 90vw);
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.068);
  border-radius: var(--bs-border-radius);
  text-align: center;
}
</style>