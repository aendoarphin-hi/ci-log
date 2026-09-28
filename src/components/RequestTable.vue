<template>
  <div>
    <div class="d-flex flex-wrap align-items-center justify-content-between toolbar mb-3">
      <div class="d-flex flex-row toolbar">
        <input v-model.trim="searchTerm" type="search" class="form-control" style="min-width: 370px; width: 270px"
          placeholder="Search objective, scope or stakeholder" />
        <select v-model="statusFilter" class="form-select" style="max-width: 170px">
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="In Progress">In Progress</option>
          <option value="On Hold">On Hold</option>
          <option value="Complete">Complete</option>
        </select>
      </div>
      <div class="text-muted small">
        {{ sortedRequests.length }} of {{ requests.length }} request(s)
      </div>
    </div>

    <div v-if="requests.length === 0" class="empty-state">
      <p class="mb-1">No requests logged yet.</p>
      <p class="mb-0 small">Use the form to add the first continuous improvement request.</p>
    </div>

    <div v-else class="table-responsive border shadow-sm rounded"
      style="max-height: 80vh; overflow-y: auto;">
      <table class="table table-striped ci-table bg-white">
        <thead style="position: sticky; top: 0">
          <tr>
            <th v-for="column in columns" :key="column.key" :class="{ 'is-sorted': sortKey === column.key }"
              @click="setSort(column.key)">
              {{ column.label }}
              <span class="sort-caret" :style="{ opacity: sortKey === column.key ? '1' : '0' }">
                {{ sortDir === "asc" ? "\u25B2" : "\u25BC" }}
              </span>
            </th>
            <th style="width: 110px">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in [
            ...sortedRequests
          ]" :key="request.id">
            <td>{{ formatDate(request.dateLogged) }}</td>
            <td class="cell-objective">{{ request.objective }}</td>
            <td>{{ request.scope }}</td>
            <td>{{ request.stakeholders }}</td>
            <td>
              {{ formatDate(request.startDate) }}
              <span v-if="request.endDate"> &ndash; {{ formatDate(request.endDate) }}</span>
            </td>
            <td>
              <span :class="['status-pill', statusClass(request.status)]">
                {{ request.status }}
              </span>
            </td>
            <td>
              <div class="d-flex gap-1">
                <button class="btn btn-sm btn-outline-secondary" @click="$emit('edit', request)">
                  Edit
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="$emit('delete', request.id)">
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RequestTable',
  props: {
    requests: {
      type: Array,
      default: () => []
    }
  },
  emits: ['edit', 'delete'],
  data () {
    return {
      searchTerm: '',
      statusFilter: '',
      sortKey: 'dateLogged',
      sortDir: 'desc',
      columns: [
        { key: 'dateLogged', label: 'Date logged' },
        { key: 'objective', label: 'Objective' },
        { key: 'scope', label: 'Scope' },
        { key: 'stakeholders', label: 'Stakeholder(s)' },
        { key: 'startDate', label: 'Timeline' },
        { key: 'status', label: 'Status' }
      ]
    }
  },
  computed: {
    filteredRequests () {
      const term = this.searchTerm.toLowerCase()
      return this.requests.filter((request) => {
        const matchesStatus = !this.statusFilter || request.status === this.statusFilter
        const matchesTerm =
          !term ||
          [request.objective, request.scope, request.stakeholders]
            .join(' ')
            .toLowerCase()
            .includes(term)
        return matchesStatus && matchesTerm
      })
    },
    sortedRequests () {
      const list = [...this.filteredRequests]
      const { sortKey, sortDir } = this
      list.sort((a, b) => {
        const valA = (a[sortKey] || '').toString().toLowerCase()
        const valB = (b[sortKey] || '').toString().toLowerCase()
        if (valA < valB) return sortDir === 'asc' ? -1 : 1
        if (valA > valB) return sortDir === 'asc' ? 1 : -1
        return 0
      })
      return list
    }
  },
  methods: {
    setSort (key) {
      if (this.sortKey === key) {
        this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortKey = key
        this.sortDir = 'asc'
      }
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
    },
    statusClass (status) {
      const map = {
        New: 'status-pill--new',
        'In Progress': 'status-pill--in-progress',
        'On Hold': 'status-pill--on-hold',
        Complete: 'status-pill--complete'
      }
      return map[status] || 'status-pill--new'
    }
  }
}
</script>

<style scoped>
/* y scrollbar */
#app > div > main > div > div.d-none.d-lg-block > div.table-responsive::-webkit-scrollbar {
  border-radius: 0 var(--bs-border-radius) var(--bs-border-radius) 0;
  width: 8px;
}
div::-webkit-scrollbar-thumb {
  background-color: var(--neutral-lighter);
  border-radius: var(--bs-border-radius);
  margin: 4px;
}
/* table */
.ci-table {
  border-collapse: collapse;
  width: 100%;
}

.ci-table thead th {
  background-color: var(--hayden-blue-lighter);
  color: white;
  font-weight: 500;
  font-size: 0.82rem;
  vertical-align: middle;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  border-color: var(--hayden-blue-dark);
}

.ci-table thead th.is-sorted {
  filter: brightness(1.1);
}

.ci-table thead th .sort-caret {
  font-size: 0.7rem;
  margin-left: 0.25rem;
  opacity: 0.8;
}

.ci-table tbody tr:hover {
  background-color: rgba(var(--hayden-blue-lighter), 0.07);
}

.ci-table td {
  font-size: 0.88rem;
  vertical-align: middle;
}

.ci-table .cell-objective {
  max-width: 320px;
}

.status-pill {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 600;
  line-height: 1.2;
}

.status-pill--new {
  background-color: #1c76bb48;
  color: var(--hayden-blue-dark);
}

.status-pill--in-progress {
  background-color: #ffc10749;
  color: darken(var(--warning), 15%);
}

.status-pill--complete {
  background-color: #19875454;
  color: darken(var(--success), 10%);
}

.status-pill--on-hold {
  background-color: var(--neutral-lightest);
  color: var(--neutral-dark);
}

.toolbar {
  gap: 0.6rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--neutral);
}
</style>
