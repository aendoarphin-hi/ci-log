<template>
  <div class="card card-form shadow-sm bg-hayden-blue">
    <div class="card-header">
      {{ editingId ? 'Edit request' : 'New request' }}
    </div>
    <div class="card-body">
      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label class="form-label">
            Objective <span class="required-mark">*</span>
          </label>
          <textarea
            v-model.trim="form.objective"
            class="form-control"
            rows="2"
            placeholder="What is the purpose of this request? What's the benefit, and how does it add value to an existing process?"
            required
          ></textarea>
        </div>

        <div class="mb-3">
          <label class="form-label">
            Scope <span class="required-mark">*</span>
          </label>
          <textarea
            v-model.trim="form.scope"
            class="form-control"
            rows="2"
            placeholder="What's included, and what's explicitly out of bounds?"
            required
          ></textarea>
        </div>

        <div class="mb-3">
          <label class="form-label">
            Stakeholders <span class="required-mark">*</span>
          </label>
          <input
            v-model.trim="form.stakeholders"
            type="text"
            class="form-control"
            placeholder="Requester and anyone else impacted, e.g. Jane Doe (requester), Mark Lee (IT)"
            required
          >
        </div>

        <div class="row">
          <div class="col-sm-6 mb-3">
            <label class="form-label">
              Start date <span class="required-mark">*</span>
            </label>
            <input
              v-model="form.startDate"
              type="date"
              class="form-control"
              required
            >
          </div>
          <div class="col-sm-6 mb-3">
            <label class="form-label">Target completion date</label>
            <input
              v-model="form.endDate"
              type="date"
              class="form-control"
              :min="form.startDate || undefined"
            >
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Status</label>
          <select v-model="form.status" class="form-select">
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Complete">Complete</option>
          </select>
        </div>

        <div class="d-flex gap-2 justify-content-end">
          <button type="submit" class="btn btn-primary" :disabled="!formFilled">
            {{ editingId ? 'Save changes' : 'Add request' }}
          </button>
          <button
            v-if="editingId"
            type="button"
            class="btn btn-outline-secondary"
            @click="$emit('cancel-edit')"
          >
            Cancel
          </button>
          <button
            v-else
            type="button"
            class="btn btn-outline-secondary"
            @click="$emit('cancel-add')"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RequestForm',
  props: {
    editingRequest: {
      type: Object,
      default: null
    }
  },
  emits: ['save', 'cancel-edit', 'cancel-add'],
  data () {
    return {
      form: this.blankForm()
    }
  },
  computed: {
    editingId () {
      return this.editingRequest ? this.editingRequest.id : null
    },
    formFilled () {
      return (
        this.form.objective &&
        this.form.scope &&
        this.form.stakeholders &&
        this.form.startDate
      )
    }
  },
  watch: {
    editingRequest: {
      immediate: true,
      handler (request) {
        this.form = request ? { ...request } : this.blankForm()
        console.clear(); console.log(this.form)
      }
    },
    form: {
      deep: true,
      handler () {
        console.clear(); console.log(this.form)
      }
    }
  },
  methods: {
    blankForm () {
      return {
        objective: '',
        scope: '',
        stakeholders: '',
        startDate: '',
        endDate: '',
        status: 'New'
      }
    },
    handleSubmit () {
      this.$emit('save', { ...this.form })
      if (!this.editingId) {
        this.form = this.blankForm()
      }
    }
  }
}
</script>

<style scoped>
.card-form {
  border: 1px solid var(--neutral-lightest);
}
.card-form .card-header {
  background-color: var(--hayden-blue-lighter);
  border-bottom: 1px solid var(--neutral-lightest);
  font-weight: 600;
  color: white;
}
.required-mark {
  color: var(--bs-danger);
}
</style>
