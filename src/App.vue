<template>
  <div class="app-shell">
    <header class="app-header flex-col gap-1 flex-md-row">
      <div class="app-header__brand">
        <img src="./assets/images/hayden-blue.svg" alt="Hayden logo" class="app-header__logo">
        <div>
          <span class="app-header__title">HAYDEN</span>&nbsp;
          <span class="app-header__subtitle">Continuous Improvement Log</span>
        </div>
      </div>
      <div class="app-header__nav">
        <router-link to="/requests" :class="{ 'border-bottom border-primary': this.$route.name === 'Requests' }">Requests</router-link>
        <router-link hidden to="/projects" :class="{ 'border-bottom border-primary': this.$route.name === 'Projects'}">Projects</router-link>
        <router-link hidden to="/approvals" :class="{ 'border-bottom border-primary': this.$route.name === 'Approvals'}">Approvals</router-link>
      </div>
    </header>

    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
