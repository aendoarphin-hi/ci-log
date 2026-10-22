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
            class="form-select text-capitalize">
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

          <div v-else-if="field.type === 'file'">
            <input
              ref="fileInput"
              @change="handleFileChange"
              type="file"
              multiple
              class="form-control" />

            <template v-if="!editingId">
              <span v-for="(f, i) in form.files" :key="i" class="mt-1">
                <span
                  @click="removeFile(i)"
                  class="me-1 cursor-pointer badge text-secondary bg-light">
                  {{ f.name }} <span class="text-danger">&times;</span>
                </span>
              </span>
            </template>

            <template v-else>
              <!-- list all attached files of the editing item -->
              <span v-for="(f, i) in existingFiles" :key="i" class="mt-1">
                <span
                  @click="removeFile(i)"
                  class="me-1 cursor-pointer badge text-secondary bg-light">
                  {{ f.name }} <span class="text-danger">&times;</span>
                </span>
              </span>
            </template>
          </div>

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
      form: {},
      fileInputElement: null,
      existingFiles: []
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
      async handler (item) {
        this.form = item ? { ...item } : { ...this.blankItem }
        this.existingFiles = (await this.$axios.get(this.$api + '?docs')).data || []
      }
    }
  },
  methods: {
    handleSubmit () {
      const body = new FormData()

      // Send regular fields as JSON.
      body.append(
        'request',
        JSON.stringify(
          Object.fromEntries(
            Object.entries(this.form).filter(([key]) => key !== 'files')
          )
        )
      )

      // Send files separately.
      this.form.files.forEach((file) => {
        body.append('files[]', file)
      })

      if (
        !window.confirm(
          JSON.stringify(
            {
              ...this.form,
              files: this.form.files.map((file) => file.name)
            },
            null,
            2
          )
        )
      ) {
        return
      }

      this.$emit('save', body)

      if (!this.editingId) {
        this.form = { ...this.blankItem, files: [] }
      }
    },

    handleFileChange (event) {
      this.fileInputElement = event.target
      this.form.files = Array.from(event.target.files)
    },

    removeFile (i) {
      this.form.files.splice(i, 1)

      const dataTransfer = new DataTransfer()
      this.form.files.forEach((file) => dataTransfer.items.add(file))

      this.fileInputElement.files = dataTransfer.files
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
