<template>
  <div>
    <div class="page-heading d-flex align-items-start justify-content-between flex-wrap gap-2">
      <div>
        <h1>Continuous improvement requests</h1>
        <p>Log, sort and track improvement requests from intake through completion.</p>
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
      <RequestForm
        :editing-request="editingRequest"
        @save="saveRequest"
        @cancel-edit="cancelEdit"
        @cancel-add="cancelAdd"
      />
    </div>

    <RequestTable v-if="!showForm"
      class="d-none d-lg-block"
      :requests="requests"
      @edit="startEdit"
      @delete="deleteRequest"
    />

    <RequestGrid v-if="!showForm"
      class="d-lg-none"
      :requests="requests"
      @edit="startEdit"
      @delete="deleteRequest"
    />
  </div>
</template>

<script>
import RequestForm from '../components/RequestForm.vue'
import RequestGrid from '../components/RequestGrid.vue'
import RequestTable from '../components/RequestTable.vue'

const STORAGE_KEY = 'ci-log'

export default {
  name: 'RequestLog',
  components: {
    RequestForm,
    RequestTable,
    RequestGrid
  },
  data () {
    return {
      requests: [],
      showForm: false,
      editingRequest: null
    }
  },
  created () {
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
    }
  }
}
</script>
