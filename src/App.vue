<template>
  <div class="app-shell">
    <header class="app-header flex-col gap-1 flex-md-row">
      <div class="app-header__brand">
        <img
          src="./assets/images/hayden-blue.svg"
          alt="Hayden logo"
          class="app-header__logo" />
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
    <!-- status banner for informing user is basic or unrestricted -->
    <div class="position-fixed w-100 bg-body-secondary px-1 small text-end text-uppercase bottom-0">
      <span class="small"><strong>Logged in as:</strong> {{ empName }}<span v-if="unrestricted">&nbsp;&nbsp;|&nbsp;&nbsp;<strong>Role:</strong> Administrative</span></span>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import ToastComponent from "./components/ToastComponent.vue";
import { store } from "./common/store.js";

export default {
  name: "App",

  components: {
    ToastComponent,
  },

  data() {
    return {
      unrestrictedUsers: [],
    };
  },

  provide() {
    return {
      unrestrictedUsers: computed(() => this.unrestrictedUsers),
      toast: {
        show: (title, message, classList) => {
          this.$refs.toast.showToast(title, message, classList);
        },
      },
    };
  },

  computed: {
    unrestricted() {
      return this.unrestrictedUsers.includes(Number(store.userAuth.number))
    },
    empName() {
      return store.userAuth.name
    },
    origin() {
      return (
        window.location.protocol +
        "//" +
        window.location.hostname +
        "/ttprod/v3"
      );
    },
  },

  async mounted() {
    try {
      this.unrestrictedUsers = (await this.$axios.get(this.$api + "?unrestricted")).data || [];
      console.log(store.userAuth)
    } catch (e) {
      console.error(e)
    }
  },
};
</script>
