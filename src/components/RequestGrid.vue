<template>
  <div>
    <div class="d-flex flex-wrap align-items-center justify-content-between toolbar mb-3">
      <div class="d-flex flex-wrap toolbar ci-filters">
        <input
          v-model.trim="searchTerm"
          type="search"
          class="form-control"
          placeholder="Search objective, scope or stakeholder"
        >

        <select v-model="statusFilter" class="form-select">
          <option value="">All statuses</option>
          <option value="New">New</option>
          <option value="In Progress">In Progress</option>
          <option value="On Hold">On Hold</option>
          <option value="Complete">Complete</option>
        </select>
      </div>

      <div class="text-muted small ci-count">
        {{ sortedRequests.length }} of {{ requests.length }} request(s)
      </div>
    </div>

    <div v-if="requests.length === 0" class="empty-state">
      <p class="mb-1">No requests logged yet.</p>
      <p class="mb-0 small">
        Use the form to add the first continuous improvement request.
      </p>
    </div>

    <template v-else>
      <!-- Desktop table -->
      <div class="desktop-table table-responsive border shadow-sm border-danger border">
        <table class="table table-striped ci-table bg-white mb-0">
          <thead>
            <tr>
              <th
                v-for="column in columns"
                :key="column.key"
                :class="{ 'is-sorted': sortKey === column.key }"
                @click="setSort(column.key)"
              >
                {{ column.label }}

                <span v-if="sortKey === column.key" class="sort-caret">
                  {{ sortDir === 'asc' ? '\u25B2' : '\u25BC' }}
                </span>
              </th>

              <th style="width: 110px;">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="request in sortedRequests" :key="request.id">
              <td>{{ formatDate(request.dateLogged) }}</td>

              <td class="cell-objective">
                {{ request.objective }}
              </td>

              <td>{{ request.scope }}</td>

              <td>{{ request.stakeholders }}</td>

              <td>
                {{ formatDate(request.startDate) }}
                <span v-if="request.endDate">
                  &ndash; {{ formatDate(request.endDate) }}
                </span>
              </td>

              <td>
                <span :class="['status-pill', statusClass(request.status)]">
                  {{ request.status }}
                </span>
              </td>

              <td>
                <div class="d-flex gap-1">
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    @click="$emit('edit', request)"
                  >
                    Edit
                  </button>

                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="$emit('delete', request.id)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Responsive grid -->
      <div class="mobile-grid">
        <div class="row g-3">
          <div
            v-for="request in sortedRequests"
            :key="request.id"
            class="col-12 col-md-6"
          >
            <div class="card ci-card h-100">
              <div class="card-body">
                <div class="d-flex align-items-start justify-content-between gap-2 mb-2">
                  <div class="ci-card-title">
                    {{ request.objective }}
                  </div>

                  <span
                    :class="['status-pill', statusClass(request.status)]"
                  >
                    {{ request.status }}
                  </span>
                </div>

                <div class="ci-card-date text-muted small mb-3">
                  {{ formatDate(request.dateLogged) }}
                </div>

                <div class="ci-card-detail">
                  <div class="ci-card-label">Scope</div>
                  <div>
                    {{ request.scope || '\u2014' }}
                  </div>
                </div>

                <div class="ci-card-detail">
                  <div class="ci-card-label">Stakeholder(s)</div>
                  <div>
                    {{ request.stakeholders || '\u2014' }}
                  </div>
                </div>

                <div class="ci-card-detail">
                  <div class="ci-card-label">Timeline</div>
                  <div>
                    {{ formatDate(request.startDate) }}

                    <span v-if="request.endDate">
                      &ndash; {{ formatDate(request.endDate) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="card-footer bg-white d-flex gap-1">
                <button
                  class="btn btn-sm btn-outline-secondary flex-fill"
                  @click="$emit('edit', request)"
                >
                  Edit
                </button>

                <button
                  class="btn btn-sm btn-outline-danger flex-fill"
                  @click="$emit('delete', request.id)"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="sortedRequests.length === 0"
          class="text-center text-muted py-4"
        >
          No requests match the current filters.
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'RequestGrid',

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

      return this.requests.filter(request => {
        const matchesStatus =
          !this.statusFilter ||
          request.status === this.statusFilter

        const matchesTerm =
          !term ||
          [
            request.objective,
            request.scope,
            request.stakeholders
          ]
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

        if (valA < valB) {
          return sortDir === 'asc' ? -1 : 1
        }

        if (valA > valB) {
          return sortDir === 'asc' ? 1 : -1
        }

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
/* ============================================================
 * Responsive views
 * ============================================================ */

.mobile-grid {
  display: none;
}

/*
 * Switch from the table to the grid when the table becomes
 * too wide for the available viewport.
 */
@media (max-width: 1100px) {
  .desktop-table {
    display: none;
  }

  .mobile-grid {
    display: block;
  }
}

/* ============================================================
 * Filters
 * ============================================================ */

.ci-filters {
  gap: 0.5rem;
}

.ci-filters input {
  min-width: 220px;
}

.ci-filters select {
  max-width: 170px;
}

.ci-count {
  margin-left: 1rem;
}

/* ============================================================
 * Responsive grid cards
 * ============================================================ */

.ci-card {
  overflow: hidden;
}

.ci-card-title {
  min-width: 0;
  font-weight: 600;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.ci-card-date {
  line-height: 1;
}

.ci-card-detail {
  padding: 0.5rem 0;
}

.ci-card-detail + .ci-card-detail {
  border-top: 1px solid rgba(0, 0, 0, 0.075);
}

.ci-card-label {
  margin-bottom: 0.15rem;
  color: #6c757d;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

/* ============================================================
 * Small screens
 * ============================================================ */

@media (max-width: 575.98px) {
  .ci-filters {
    width: 100%;
  }

  .ci-filters input,
  .ci-filters select {
    width: 100%;
    max-width: none;
    min-width: 0;
  }

  .ci-count {
    width: 100%;
    margin: 0.5rem 0 0;
  }
}
</style>
