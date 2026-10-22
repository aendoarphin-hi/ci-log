<template>
  <div>
    <div class="page-heading d-flex align-items-start justify-content-between flex-wrap gap-2">
      <div>
        <h1>Requests</h1>
        <p>View existing requests or submit a new one</p>
      </div>
      <button
        v-if="!showForm"
        class="btn btn-primary align-self-start"
        @click="showForm = true"
      >
        + New request
      </button>
    </div>

    <div v-if="showForm" class="mb-4">
      <ResourceForm
        :editing-item="editingRequest"
        :fields="requestFields"
        :blank-item="blankRequest"
        resource-name="Request"
        @save="saveRequest"
        @cancel-edit="cancelEdit"
        @cancel-add="cancelAdd"
      />
    </div>

    <ResourceTable v-if="!showForm"
      class="d-none d-lg-block"
      :items="requests"
      :columns="tableColumns"
      item-name="request"
      :search-fields="['objective', 'scope', 'stakeholders']"
      status-key="status"
      :statuses="requestStatuses"
      @edit="startEdit"
      @delete="deleteRequest"
    />

    <ResourceGrid v-if="!showForm"
      class="d-lg-none"
      :items="requests"
      :columns="tableColumns"
      item-name="request"
      title-field="objective"
      :search-fields="['objective', 'scope', 'stakeholders']"
      status-key="status"
      :statuses="requestStatuses"
      @edit="startEdit"
      @delete="deleteRequest"
    />
  </div>
</template>

<script>
import ResourceForm from '../components/ResourceForm.vue'
import ResourceGrid from '../components/ResourceGrid.vue'
import ResourceTable from '../components/ResourceTable.vue'

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
    requestFields () {
      return [
        {
          key: 'objective',
          label: 'Objective',
          type: 'textarea',
          rows: 2,
          placeholder: 'What is the purpose of this request? What\'s the benefit, and how does it add value to an existing process?',
          required: true
        },
        {
          key: 'scope',
          label: 'Scope',
          type: 'textarea',
          rows: 2,
          placeholder: "What's included, and what's explicitly out of bounds?",
          required: true
        },
        {
          key: 'stakeholders',
          label: 'Stakeholders',
          type: 'text',
          placeholder: 'Requester and anyone else impacted, e.g. Jane Doe (requester), Mark Lee (IT)',
          required: true
        },
        { key: 'startDate', label: 'Start date', type: 'date', required: true },
        { key: 'endDate', label: 'Target completion date', type: 'date' },
        { key: 'status', label: 'Status', type: 'select', options: this.requestStatuses },
        { key: 'files', label: 'Attachments', type: 'file' }
      ]
    },
    blankRequest () {
      return {
        objective: '',
        scope: '',
        stakeholders: '',
        startDate: '',
        endDate: '',
        status: 'new',
        files: []
      }
    },
    requestStatuses () {
      return ['new', 'in progress', 'on hold', 'complete']
    },
    tableColumns () {
      const fmt = this.formatDate
      return [
        { key: 'dateLogged', label: 'Date Logged', format: v => fmt(v) },
        { key: 'objective', label: 'Objective' },
        { key: 'scope', label: 'Scope' },
        { key: 'stakeholders', label: 'Stakeholders' },
        { key: 'dates', label: 'Dates', render: item => `${fmt(item.startDate)}${item.endDate ? ' \u2013 ' + fmt(item.endDate) : ''}` },
        { key: 'status', label: 'Status' },
        { key: 'last_updated', label: 'Last Updated', format: v => fmt(v) }
      ]
    }
  },
  mounted () {
    this.loadRequests()
  },
  methods: {
    async loadRequests () {
      try {
        this.requests = (await this.$axios.get(this.$api + '?requests')).data || []
      } catch (err) {
        console.error('Could not load saved requests', err)
        this.requests = []
      }
    },
    submitRequest () {
      try {
        console.log('submit the request')
      } catch (err) {
        console.error('Could not save requests', err)
      }
    },
    async saveRequest (body) {
      try {
        const response = await this.$axios.post(
          this.$api + '?request&new',
          body
        )

        console.log('Request saved:', response.data)

        await this.loadRequests()
        this.cancelEdit()
      } catch (err) {
        console.error('Could not save request', err)
      }
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
      this.submitRequest()
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
