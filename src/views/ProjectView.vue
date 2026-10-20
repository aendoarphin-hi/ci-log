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

export default {
  name: 'RequestView',
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
  mounted () {

  },
  methods: {

  }
}
</script>
