<template>
  <div>
    <div class="page-heading d-flex align-items-start justify-content-between flex-wrap gap-2">
      <div>
        <h1>Approvals</h1>
        <p>View existing approvals or submit a new one</p>
      </div>
    </div>

    <div v-if="showForm" class="mb-4">
      <ResourceForm
        :editing-item="editingRequest"
        :fields="approvalFields"
        :blank-item="blankApproval"
        resource-name="Approval"
        @save="saveRequest"
        @cancel-edit="cancelEdit"
        @cancel-add="cancelAdd"
      />
    </div>

    <ResourceTable v-if="!showForm"
      class="d-none d-lg-block"
      :items="requests"
      :columns="tableColumns"
      item-name="approval"
      :search-fields="['title', 'description']"
      status-key="status"
      :statuses="approvalStatuses"
      @edit="startEdit"
      @delete="deleteRequest"
    />

    <ResourceGrid v-if="!showForm"
      class="d-lg-none"
      :items="requests"
      :columns="tableColumns"
      item-name="approval"
      title-field="title"
      :search-fields="['title', 'description']"
      status-key="status"
      :statuses="approvalStatuses"
      @edit="startEdit"
      @delete="deleteRequest"
    />
  </div>
</template>

<script>
import ResourceForm from '../components/ResourceForm.vue'
import ResourceGrid from '../components/ResourceGrid.vue'
import ResourceTable from '../components/ResourceTable.vue'

const STORAGE_KEY = 'ci-log'

export default {
  name: 'RequestView',
  components: {
    ResourceForm,
    ResourceTable,
    ResourceGrid
  },
  data () {
    return {
      requests: [],
      showForm: false,
      editingRequest: null
    }
  },
  computed: {
    approvalFields () {
      return [
        {
          key: 'title',
          label: 'Title',
          type: 'text',
          placeholder: 'What is being approved?',
          required: true
        },
        {
          key: 'description',
          label: 'Description',
          type: 'textarea',
          rows: 2,
          placeholder: 'Details of the approval request',
          required: true
        },
        { key: 'status', label: 'Status', type: 'select', options: this.approvalStatuses }
      ]
    },
    blankApproval () {
      return {
        title: '',
        description: '',
        status: 'Pending'
      }
    },
    approvalStatuses () {
      return ['Pending', 'Approved', 'Rejected']
    },
    tableColumns () {
      const fmt = this.formatDate
      return [
        { key: 'title', label: 'Title' },
        { key: 'description', label: 'Description' },
        { key: 'status', label: 'Status' },
        { key: 'dateLogged', label: 'Logged', format: v => fmt(v) }
      ]
    }
  },
  mounted () {
    this.loadRequests()
  },
  methods: {
    loadRequests () {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        this.requests = raw ? JSON.parse(raw) : []
      } catch (err) {
        console.error('Could not load saved requests', err)
        this.requests = []
      }
    },
    persist () {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.requests))
      } catch (err) {
        console.error('Could not save requests', err)
      }
    },
    saveRequest (payload) {
      if (payload.id) {
        const index = this.requests.findIndex(r => r.id === payload.id)
        if (index !== -1) {
          this.requests.splice(index, 1, { ...this.requests[index], ...payload })
        }
      } else {
        this.requests.push({
          ...payload,
          id: this.generateId(),
          dateLogged: this.today()
        })
      }
      this.persist()
      this.cancelEdit()
    },
    startEdit (request) {
      this.editingRequest = request
      this.showForm = true
    },
    cancelEdit () {
      this.editingRequest = null
      this.showForm = false
    },
    cancelAdd () {
      this.showForm = false
    },
    deleteRequest (id) {
      this.requests = this.requests.filter(r => r.id !== id)
      this.persist()
    },
    generateId () {
      return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    },
    today () {
      return new Date().toISOString().slice(0, 10)
    },
    formatDate (value) {
      if (!value) return '\u2014'
      const date = new Date(`${value}T00:00:00`)
      if (Number.isNaN(date.getTime())) return value
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }
}
</script>
