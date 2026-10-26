<template>
  <!-- LET'S TRY TO KEEP THIS FORM AS GENERIC AS POSSIBLE -->
  <div class="card card-form shadow-sm bg-hayden-blue">
    <div class="card-header">
      {{ editingItem ? `Edit ${resourceName}` : `New ${resourceName}` }}
    </div>
    <div class="card-body">
      <p v-if="errorMessage.length > 0" class="text-danger">{{ errorMessage }}</p>
      <form @submit.prevent="handleSubmit" :class="submitting ? 'disabled-all-inputs' : ''">
        <div :hidden="field.hidden" v-for="field in fields" :key="field.key" class="mb-3">
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
            :required="field.required"
          ></textarea>

          <input
            v-else-if="field.type === 'date'"
            v-model="form[field.key]"
            type="date"
            class="form-control"
            :placeholder="field.placeholder || ''"
            :required="field.required"
          />

          <select
            v-else-if="field.type === 'select'"
            v-model="form[field.key]"
            class="form-select text-capitalize"
          >
            <option v-if="field.placeholder" value="" disabled>
              {{ field.placeholder }}
            </option>
            <option v-for="option in field.options" :key="option" :value="option">
              {{ option }}
            </option>
          </select>

          <div v-else-if="field.type === 'file'" :hidden="field.hidden">
            <input
              ref="fileInput"
              @change="handleFileChange"
              type="file"
              multiple
              class="form-control"
            />
            <div v-if="form.files.length > 0" class="attachments-container">
              <small class="form-text text-muted d-block">Attachments</small>
              <span v-for="(f, i) in form.files" :key="i" class="mt-1">
                <span
                  @click="removeFile(i)"
                  class="me-1 mb-1 cursor-pointer badge border text-muted"
                >
                  {{ f.name }} <span class="text-danger">&times;</span>
                </span>
              </span>
            </div>
          </div>

          <input
            v-else
            :hidden="field.hidden"
            v-model.trim="form[field.key]"
            type="text"
            class="form-control"
            :placeholder="field.placeholder || ''"
            :required="field.required"
          />
        </div>
        <div class="d-flex gap-2 justify-content-end">
          <button
            type="submit"
            class="btn btn-primary hstack"
            :disabled="!formFilled || submitting"
          >
            <div class="spin me-1" v-if="submitting"><Loading /></div>
            {{ editingItem ? "Save changes" : `Submit ${resourceName}` }}
          </button>
          <button
            v-if="editingItem"
            :disabled="submitting"
            type="button"
            class="btn btn-outline-secondary"
            @click="$emit('cancel-edit')"
          >
            Cancel
          </button>
          <button
            v-else
            :disabled="submitting"
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
  import Loading from "vue-material-design-icons/Loading.vue";
  export default {
    name: "ResourceForm",
    props: {
      editingItem: {
        type: Object,
        default: null,
      },
      fields: {
        type: Array,
        default: () => [],
      },
      resourceName: {
        type: String,
        default: "Item",
      },
      blankItem: {
        type: Object,
      },
      keyMap: {
        type: Object,
        default: () => ({}),
      },
      errorMessage: {
        type: String,
        default: "",
      },
      submitting: {
        type: Boolean,
        default: false,
      }
    },
    emits: ["save", "cancel-edit", "cancel-add", "edited"],
    components: {
      Loading,
    },
    data() {
      return {
        form: {},
        fileInputElement: null,
        attachedFiles: [],
      };
    },
    computed: {
      editingId() {
        return this.editingItem ? this.editingItem.id : null;
      },
      formFilled() {
        return this.fields
          .filter((field) => field.required)
          .every((field) => {
            const value = this.form[field.key];
            return value !== "" && value != null;
          });
      },
    },
    watch: {
      editingItem: {
        immediate: true,
        async handler(item) {
          if (item) {
            this.form = {};

            for (const field of this.fields) {
              const dbKey = this.keyMap[field.key];
              const key = dbKey || field.key;

              // existing attachment IDs are handled separately.
              if (field.key === "files" || key === "files") continue;

              const value = item[key];

              this.form[field.key] =
                value == null || (field.type === "date" && value === "0000-00-00") ? "" : value;
            }

            this.form.files = [];
          } else {
            this.form = { ...this.blankItem, files: [] };
          }
          // fetch and populate existing attached files (skip nulls).
          const csvIds = item?.files ? item.files.split(",").filter((id) => id.trim() !== "") : [];

          this.attachedFiles = [];

          for (const id of csvIds) {
            const response = await this.$axios.get(this.$api + "?docs&id=" + id);

            if (response.data && response.data.id) {
              this.attachedFiles.push(response.data);
            }
          }
        },
      },
    },
    methods: {
      handleSubmit() {
        const body = new FormData();
        // send regular fields as JSON, excluding files.
        body.append(
          "request",
          JSON.stringify(
            Object.fromEntries(Object.entries(this.form).filter(([key]) => key !== "files")),
          ),
        );

        // only upload newly selected browser files.
        const newFiles = Array.isArray(this.form.files) ? this.form.files : [];

        newFiles.forEach((file) => {
          body.append("files[]", file);
        });

        // perserve existing document IDs separately.
        const existingFileIds = this.attachedFiles.map((file) => String(file.id));

        body.append("existingFiles", JSON.stringify(existingFileIds));

        this.$emit("save", body);

        if (!this.editingId) {
          this.form = { ...this.blankItem, files: [] };
        }
      },

      handleFileChange(event) {
        this.fileInputElement = event.target;
        this.form.files = Array.from(event.target.files);
      },
      // remove browser uploaded file
      removeFile(i) {
        this.form.files.splice(i, 1);

        const dataTransfer = new DataTransfer();
        this.form.files.forEach((file) => dataTransfer.items.add(file));

        this.fileInputElement.files = dataTransfer.files;
      },
      // remove the actually stored s3 file and db record
      removeStoredFile(fileId) {
        // TODO: fetch the file ID, delete s3 file and db record
      },
      formatFileSize(bytes) {
        if (typeof bytes === "string") bytes = parseInt(bytes);
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const dm = bytes < k ? 0 : 1;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
      },
    },
  };
</script>

<style scoped>
  .card-body {
    background-color: white;
    border-radius: 0 0 var(--bs-border-radius) var(--bs-border-radius);
  }
  .card-form {
    border: 1px solid var(--neutral-lightest);
  }

  .card-form textarea.form-control {
    min-width: 700px;
    min-height: calc(1.5em + 0.75rem + calc(var(--bs-border-width) * 2));
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

  .attachments-container {
    max-width: 700px;
  }

  .disable-all-inputs * {
    pointer-events: none;
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
