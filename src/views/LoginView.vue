<template>
  <form class="login-form" @submit.prevent="login">
    <h5 class="text-center">Log In to Continue</h5>
    <p class="text-muted text-center mb-0">This section requires authentication</p>
    <p class="error">{{ error }}</p>
    <input :disabled="submitting" required v-model="username" class="form-control form-control-sm mb-3" type="text" placeholder="Email or Employee Number" />
    <input :disabled="submitting" required v-model="password" class="form-control form-control-sm mb-3" type="password" placeholder="Password" />
    <button :disabled="submitting" class="btn btn-sm w-100 btn-primary" type="submit">{{ submitting ? "Logging In..." : "Log In" }}</button>
  </form>
</template>

<script>
import { store } from "../common/store";

  export default {
    data() {
      return {
        username: "",
        password: "",
        error: "",
        submitting: false
      }
    },
    mounted() {
      // no need to log in if they are already
      if (store.userAuth.id) this.$router.push("/");
    },
    methods: {
      async login() {
        try {
          this.submitting = true;
          const body = new FormData();
          body.append("username", this.username);
          body.append("password", this.password);
          const res = await this.$axios.post("/api/?login", body);
          if (!res.data.success) { this.error = res.data.message; return; }
          this.$router.push("/");
          this.error = "";
        } catch (err) {
          console.log(err)
        } finally {
          this.username = "";
          this.password = "";
          this.submitting = false;
        }
      }
    }
  }
</script>

<style scoped>
  .login-form {
    /*center it exactly in the middle*/
    position: fixed;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 30px;
    width: 400px;
    background-color: white;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.068);
    border-radius: var(--bs-border-radius);
    text-align: center;
  }
  .error {
    font-size: 0.8rem;
    text-justify: distribute;
    color: var(--bs-danger);
    margin-bottom: 10px;
  }
</style>