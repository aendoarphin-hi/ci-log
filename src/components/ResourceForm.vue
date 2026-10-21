<template>
  <div class="card card-form shadow-sm bg-hayden-blue">
    <div class="card-header">
      {{ editingItem ? `Edit ${resourceName}` : `New ${resourceName}` }}
    </div>
    <div class="card-body">
      <form @submit.prevent="handleSubmit">
        <div v-for="field in fields" :key="field.key" class="mb-3">
          <label class="form-label">
            {{ field.label }}
            <span v-if="field.required" class="required-mark">*</span>
          </label>

          <textarea
            v-if="field.type === 'textarea'"
            v-model.trim="form[field.key]"
            class="form-control"
            :rows="field.rows || 2"
            :placeholder="field.placeholder || ''"
            :required="field.required"></textarea>

          <input
            v-else-if="field.type === 'date'"
            v-model="form[field.key]"
            type="date"
            class="form-control"
            :placeholder="field.placeholder || ''"
            :required="field.required" />

          <select
            v-else-if="field.type === 'select'"
            v-model="form[field.key]"
            class="form-select">
            <option v-if="field.placeholder" value="" disabled>
              {{ field.placeholder }}
            </option>
            <option
              v-for="option in field.options"
              :key="option"
              :value="option">
              {{ option }}
            </option>
          </select>

          <input
            v-else
            v-model.trim="form[field.key]"
            type="text"
            class="form-control"
            :placeholder="field.placeholder || ''"
            :required="field.required" />
        </div>

        <div class="d-flex gap-2 justify-content-end">
          <button type="submit" class="btn btn-primary" :disabled="!formFilled">
            {{ editingItem ? "Save changes" : `Add ${resourceName}` }}
          </button>
          <button
            v-if="editingItem"
            type="button"
            class="btn btn-outline-secondary"
            @click="$emit('cancel-edit')">
            Cancel
          </button>
          <button
            v-else
            type="button"
            class="btn btn-outline-secondary"
            @click="$emit('cancel-add')">
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResourceForm',
  props: {
    editingItem: {
      type: Object,
      default: null
    },
    fields: {
      type: Array,
      default: () => []
    },
    resourceName: {
      type: String,
      default: 'Item'
    },
    blankItem: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['save', 'cancel-edit', 'cancel-add'],
  data () {
    return {
      form: {}
    }
  },
  computed: {
    editingId () {
      return this.editingItem ? this.editingItem.id : null
    },
    formFilled () {
      return this.fields
        .filter((field) => field.required)
        .every((field) => {
          const value = this.form[field.key]
          return value !== '' && value != null
        })
    }
  },
  watch: {
    editingItem: {
      immediate: true,
      handler (item) {
        this.form = item ? { ...item } : { ...this.blankItem }
      }
    }
  },
  methods: {
    handleSubmit () {
      this.$emit('save', { ...this.form })
      if (!this.editingId) {
        this.form = { ...this.blankItem }
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
