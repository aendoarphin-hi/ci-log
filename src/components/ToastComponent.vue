<template>
  <div id="global-toast" data-bs-delay="5000" :class="classList" class="toast">
    <span>{{ message }}</span>
    <button
      type="button"
      class="btn-close ms-1 m-auto small"
      data-bs-dismiss="toast"
      aria-label="Close"
    ></button>
  </div>
</template>

<script>
  import { Toast } from "bootstrap";

  export default {
    name: "GlobalToast",

    data() {
      return {
        message: "",
        classList: "",
        toast: null,
      };
    },

    mounted() {
      this.toast = new Toast(document.getElementById("global-toast"));
    },

    methods: {
      async showToast(message, classList = "") {
        this.message = message;
        this.classList = classList;
        // Vue updates the `:class` binding asynchronously. If we call
        // toast.show() immediately, Bootstrap adds the `show` class, but
        // Vue's pending class patch then rewrites className and wipes out
        // Bootstrap's `show` class (and the custom classes weren't in the
        // DOM yet when show() started). Wait for Vue to flush the classes
        // to the element first, then let Bootstrap add its `show` class.
        await this.$nextTick();
        this.toast.show();
      },
    },
  };
</script>

<style scoped>
  .toast {
    margin: auto;
    z-index: 9999;
    position: fixed;
    top: 10px;
    left: 50vw;
    transform: translateX(-50%);
    padding: 10px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: max-content;
  }
</style>
