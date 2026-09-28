<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="app-header__brand">
        <img src="./assets/images/hayden-blue.svg" alt="Hayden logo" class="app-header__logo">
        <div>
          <span class="app-header__title">HAYDEN</span>&nbsp;
          <span class="app-header__subtitle">Continuous Improvement Log</span>
        </div>
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
