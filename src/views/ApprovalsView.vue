<template>
  <div>
    <div class="page-heading d-flex align-items-start justify-content-between flex-wrap gap-2">
      <div>
        <h1>Approvals</h1>
        <p>Approve or reject incoming requests</p>
      </div>
    </div>

    <div v-if="showForm" class="mb-4">
      <!-- some form -->
    </div>

    <!-- some table -->

  </div>
</template>

<script>

export default {
  name: 'ApprovalView',
  components: {
  },
  data () {
    return {
      // some data
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
    this.loadApprovals()
  },
  methods: {
    async loadApprovals () {
      try {
        this.approvals = (await this.$axios.get(this.$api + '?approvals')).data || []
      } catch (err) {
        console.error('Could not load saved approvals', err)
        this.approvals = []
      }
    },
    submitApproval () {
      try {
        console.log('create the approval')
      } catch (err) {
        console.error('Could create approval', err)
      }
    },
    saveApproval (payload) {
      if (payload.id) {
        const index = this.approvals.findIndex(r => r.id === payload.id)
        if (index !== -1) {
          this.approvals.splice(index, 1, { ...this.approvals[index], ...payload })
        }
      } else {
        this.approvals.push({
          ...payload,
          id: this.generateId(),
          dateLogged: this.today()
        })
      }
      this.submitApproval()
      this.cancelEdit()
    },
    startEdit (approval) {
      this.editingApproval = approval
      this.showForm = true
    },
    cancelEdit () {
      this.editingApproval = null
      this.showForm = false
    },
    cancelAdd () {
      this.showForm = false
    },
    deleteApproval (id) {
      this.approval = this.approvals.filter(r => r.id !== id)
      // call delete approval endpoint
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
