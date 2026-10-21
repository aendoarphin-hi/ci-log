<template>
  <div>
    <div
      class="d-flex flex-wrap align-items-center justify-content-between toolbar mb-3">
      <div class="d-flex flex-wrap toolbar ci-filters">
        <input
          v-model.trim="searchTerm"
          type="search"
          class="form-control"
          :placeholder="`Search ${searchableLabels.join(', ')}`" />

        <select
          v-if="hasStatusFilter"
          v-model="statusFilter"
          class="form-select">
          <option value="">All statuses</option>
          <option v-for="status in statuses" :key="status" :value="status">
            {{ status }}
          </option>
        </select>
      </div>

      <div class="text-muted small ci-count">
        {{ sortedItems.length }} of {{ items.length }} {{ itemName
        }}{{ items.length === 1 ? "" : "s" }}
      </div>
    </div>

    <div v-if="items.length === 0" class="empty-state">
      <p class="mb-1">No {{ itemName.toLowerCase() }}s logged yet.</p>
      <p class="mb-0 small">
        Use the form to add the first {{ itemName.toLowerCase() }}.
      </p>
    </div>

    <template v-else>
      <!-- Desktop table -->
      <div
        class="desktop-table table-responsive border shadow-sm border-danger border">
        <table class="table table-striped ci-table bg-white mb-0">
          <thead>
            <tr>
              <th
                v-for="column in displayColumns"
                :key="column.key"
                :class="{ 'is-sorted': sortKey === column.key }"
                @click="setSort(column.key)">
                {{ column.label }}
                <span v-if="sortKey === column.key" class="sort-caret">
                  {{ sortDir === "asc" ? "\u25B2" : "\u25BC" }}
                </span>
              </th>
              <th style="width: 110px">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in sortedItems" :key="item.id">
              <td v-for="column in displayColumns" :key="column.key">
                {{ cellValue(item, column) }}
              </td>
              <td>
                <div class="d-flex gap-1">
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    @click="$emit('edit', item)">
                    Edit
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="$emit('delete', item.id)">
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
            v-for="item in sortedItems"
            :key="item.id"
            class="col-sm-6 col-lg-4">
            <div class="card ci-card h-100 shadow-sm border">
              <div class="card-body">
                <div
                  class="d-flex justify-content-between align-items-start mb-2">
                  <h6 class="ci-card-title mb-0">
                    {{ cellValue(item, titleColumn) }}
                  </h6>
                  <span :class="['status-pill', statusClass(item[statusKey])]">
                    {{ item[statusKey] }}
                  </span>
                </div>
                <div
                  class="ci-card-detail"
                  v-for="column in detailColumns"
                  :key="column.key">
                  <span class="ci-card-label">{{ column.label }}</span>
                  <div class="ci-card-date">{{ cellValue(item, column) }}</div>
                </div>
              </div>
              <div class="card-footer d-flex gap-2 bg-transparent border-0">
                <button
                  class="btn btn-sm btn-outline-secondary flex-fill"
                  @click="$emit('edit', item)">
                  Edit
                </button>
                <button
                  class="btn btn-sm btn-outline-danger flex-fill"
                  @click="$emit('delete', item.id)">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'ResourceGrid',
  props: {
    items: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      default: () => []
    },
    itemName: {
      type: String,
      default: 'item'
    },
    searchFields: {
      type: Array,
      default: () => []
    },
    statusKey: {
      type: String,
      default: 'status'
    },
    statuses: {
      type: Array,
      default: () => []
    },
    titleField: {
      type: String,
      default: 'objective'
    }
  },
  emits: ['edit', 'delete'],
  data () {
    return {
      searchTerm: '',
      statusFilter: '',
      sortKey: this.defaultSortKey,
      sortDir: 'desc'
    }
  },
  computed: {
    defaultSortKey () {
      return this.columns.length ? this.columns[0].key : ''
    },
    displayColumns () {
      return this.columns.filter((column) => column.key !== '__actions__')
    },
    hasStatusFilter () {
      return this.statuses.length > 0
    },
    titleColumn () {
      return (
        this.displayColumns.find((c) => c.key === this.titleField) ||
        this.displayColumns[0] || {
          key: this.titleField,
          label: this.titleField
        }
      )
    },
    detailColumns () {
      return this.displayColumns.filter(
        (column) => column.key !== this.titleField
      )
    },
    searchableFields () {
      return this.searchFields.length
        ? this.searchFields
        : this.displayColumns.map((c) => c.key)
    },
    searchableLabels () {
      return this.searchableFields.map((key) => {
        const column = this.displayColumns.find((c) => c.key === key)
        return column ? column.label : key
      })
    },
    filteredItems () {
      const term = this.searchTerm.toLowerCase()
      const status = this.statusFilter
      return this.items.filter((item) => {
        const matchesTerm = this.searchableFields.some((key) => {
          const value = this.cellValue(item, { key })
          return String(value == null ? '' : value)
            .toLowerCase()
            .includes(term)
        })
        const matchesStatus =
          !status || String(item[this.statusKey]) === status
        return matchesTerm && matchesStatus
      })
    },
    sortedItems () {
      const list = [...this.filteredItems]
      const { sortKey, sortDir } = this
      if (!sortKey) return list
      list.sort((a, b) => {
        const valA = String(a[sortKey] || '').toLowerCase()
        const valB = String(b[sortKey] || '').toLowerCase()
        if (valA < valB) return sortDir === 'asc' ? -1 : 1
        if (valA > valB) return sortDir === 'asc' ? 1 : -1
        return 0
      })
      return list
    }
  },
  methods: {
    setSort (key) {
      if (!key) return
      if (this.sortKey === key) {
        this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortKey = key
        this.sortDir = 'asc'
      }
    },
    cellValue (item, column) {
      if (column.render) {
        return column.render(item)
      }
      const value = item[column.key]
      if (column.format) {
        return column.format(value, item)
      }
      return value
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
 * Table
 * ============================================================ */

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

/* ============================================================
 * Status pills
 * ============================================================ */

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
