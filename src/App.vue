<template>
  <div class="app-shell">
    <header class="app-header flex-col gap-1 flex-md-row">
      <div class="app-header__brand">
        <img src="./assets/images/hayden-blue.svg" alt="Hayden logo" class="app-header__logo" />
        <div>
          <span class="app-header__title">HAYDEN</span>&nbsp;
          <span class="app-header__subtitle">Continuous Improvement</span>
        </div>
      </div>
      <div class="app-header__nav">
        <!-- nothing at the moment -->
        <a :href="origin" class="app-header__link">Exit</a>
      </div>
    </header>

    <main class="app-main">
      <router-view />
    </main>
    <ToastComponent ref="toast" />
  </div>
</template>

<script>
  import ToastComponent from "./components/ToastComponent.vue";
  export default {
    name: "App",
    components: {
      ToastComponent,
    },
    provide() {
      return {
        toast: {
          show: (title, message, classList) => {
            this.$refs.toast.showToast(title, message, classList);
          },
        },
      };
    },
    computed: {
      origin() {
        return window.location.protocol + "//" + window.location.hostname + "/ttprod/v3";
      },
    },
  };
</script>
