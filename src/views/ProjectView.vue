<template>
  <div>
    <div class="page-heading d-flex align-items-start justify-content-between flex-wrap gap-2">
      <div>
        <h1>Projects</h1>
        <p>View existing projects or submit a new one</p>
      </div>
      <button
        v-if="!showForm"
        class="btn btn-primary align-self-start"
        @click="showForm = true"
      >
        + New project
      </button>
    </div>

    <div v-if="showForm" class="mb-4">
      <ResourceForm
        :editing-item="editingProject"
        :fields="projectFields"
        :blank-item="blankProject"
        resource-name="Project"
        @save="saveProject"
        @cancel-edit="cancelEdit"
        @cancel-add="cancelAdd"
      />
    </div>

    <ResourceTable v-if="!showForm"
      class="d-none d-lg-block"
      :items="projects"
      :columns="tableColumns"
      item-name="project"
      :search-fields="['name', 'description', 'owner']"
      filterable-field-key="status"
      :filter-options="projectStatuses"
      @edit="startEdit"
      @delete="deleteProject"
    />
  </div>
</template>

<script>
import ResourceForm from '../components/ResourceForm.vue'
import ResourceTable from '../components/ResourceTable.vue'

const STORAGE_KEY = 'ci-log-projects'

export default {
  name: 'ProjectView',
  components: {
    ResourceForm,
    ResourceTable
  },
  data () {
    return {
      projects: [],
      showForm: false,
      editingProject: null
    }
  },
  computed: {
    projectFields () {
      return [
        {
          key: 'name',
          label: 'Project name',
          type: 'text',
          placeholder: 'What is the project called?',
          required: true
        },
        {
          key: 'description',
          label: 'Description',
          type: 'textarea',
          rows: 2,
          placeholder: 'What is this project trying to achieve?',
          required: true
        },
        {
          key: 'owner',
          label: 'Owner',
          type: 'text',
          placeholder: 'Project lead, e.g. Jane Doe',
          required: true
        },
        { key: 'startDate', label: 'Start date', type: 'date', required: true },
        { key: 'targetDate', label: 'Target completion date', type: 'date' },
        { key: 'status', label: 'Status', type: 'select', options: this.projectStatuses }
      ]
    },
    blankProject () {
      return {
        name: '',
        description: '',
        owner: '',
        startDate: '',
        targetDate: '',
        status: 'New'
      }
    },
    projectStatuses () {
      return ['New', 'In Progress', 'On Hold', 'Complete']
    },
    tableColumns () {
      const fmt = this.formatDate
      return [
        { key: 'name', label: 'Project Name' },
        { key: 'description', label: 'Description' },
        { key: 'owner', label: 'Owner' },
        { key: 'startDate', label: 'Start Date', format: v => fmt(v) },
        { key: 'targetDate', label: 'Target Date', format: v => fmt(v) },
        { key: 'status', label: 'Status' },
        { key: 'dateCreated', label: 'Created', format: v => fmt(v) }
      ]
    }
  },
  mounted () {
    this.loadProjects()
  },
  methods: {
    loadProjects () {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        this.projects = raw ? JSON.parse(raw) : []
      } catch (err) {
        console.error('Could not load saved projects', err)
        this.projects = []
      }
    },
    persist () {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.projects))
      } catch (err) {
        console.error('Could not save projects', err)
      }
    },
    saveProject (payload) {
      if (payload.id) {
        const index = this.projects.findIndex(p => p.id === payload.id)
        if (index !== -1) {
          this.projects.splice(index, 1, { ...this.projects[index], ...payload })
        }
      } else {
        this.projects.push({
          ...payload,
          id: this.generateId(),
          dateCreated: this.today()
        })
      }
      this.persist()
      this.cancelEdit()
    },
    startEdit (project) {
      this.editingProject = project
      this.showForm = true
    },
    cancelEdit () {
      this.editingProject = null
      this.showForm = false
    },
    cancelAdd () {
      this.showForm = false
    },
    deleteProject (id) {
      this.projects = this.projects.filter(p => p.id !== id)
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
