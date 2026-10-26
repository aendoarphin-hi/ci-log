<template>
  <div>
    <div
      class="page-heading d-flex align-items-start justify-content-between flex-wrap gap-2">
      <div>
        <h1>{{ restrictedUser ? "My Requests" : "Requests" }}</h1>
        <p>
          {{
            restrictedUser
              ? "View and manage your requests"
              : "View and manage all requests"
          }}
        </p>
      </div>
      <button
        v-if="!showForm"
        class="btn btn-primary align-self-start"
        @click="showForm = true">
        + New request
      </button>
    </div>

    <div v-if="showForm" class="mb-4">
      <ResourceForm
        :submitting="submitting"
        :error-message="errorMessage"
        :editing-item="editingRequest"
        :fields="requestFormFields"
        :key-map="dateKeyMap"
        :blank-item="blankRequest"
        resource-name="Request"
        @save="saveRequest"
        @cancel-edit="cancelEdit"
        @cancel-add="cancelAdd" />
    </div>

    <ResourceTable
      v-if="!showForm"
      :input-visible="restrictedUser"
      class="d-none d-sm-block"
      :items="requests"
      :columns="tableColumns"
      item-name="request"
      :search-fields="['objective', 'scope', 'stakeholders', 'status']"
      filterable-field-key="status"
      :filter-options="requestStatuses"
      @edit="startEdit"
      @delete="deleteRequest"
      @reject="
        (v) => {
          showRejectModal = true;
          rejectedItem = v;
        }
      "
      @approve="approveRequest"
      @icon-click="showAttachments"
      :submitting="submitting" />
    <!-- Reject Modal -->
    <Transition
      enter-active-class="animate__animated animate__fadeIn animate__faster"
      leave-active-class="animate__animated animate__fadeOut animate__faster">
      <ModalComponent v-if="showRejectModal">
        <div class="bg-white p-3 rounded">
          <h5>Reject Reason</h5>
          <small class="text-muted">
            {{
              getNameByEmployeeNumber(
                this.employees,
                rejectedItem["submitted_by"],
              )
            }}
            will {{ notify ? "" : "not" }} be notified of this rejection
          </small>
          <hr />
          <textarea
            v-model="rejectReason"
            rows="7"
            cols="50"
            placeholder="Enter the details of this rejection"
            class="form-control mb-2">
          </textarea>
          <div class="hstack small mb-2">
            <label class="form-check-label me-2">Notify Requester</label>
            <input type="checkbox" class="form-check-input" v-model="notify" />
          </div>
          <div class="hstack btn-group">
            <button
              :disabled="rejecting"
              class="btn btn-sm btn-danger"
              @click="rejectRequest(rejectedItem)">
              Reject
            </button>
            <button
              :disabled="rejecting"
              class="btn btn-sm btn-secondary"
              @click="
                showRejectModal = false;
                notify = true;
              ">
              Cancel
            </button>
          </div>
        </div>
      </ModalComponent>
    </Transition>
    <!-- Attachments Modal -->
    <Transition
      enter-active-class="animate__animated animate__fadeIn animate__faster"
      leave-active-class="animate__animated animate__fadeOut animate__faster">
      <ModalComponent v-if="showAttachmentsModal">
        <div class="bg-white p-3 rounded" style="width: min(500px, 90vw)">
          <h5>Attachments</h5>
          <small>Click on the attachment to download it</small>
          <hr />

          <div v-if="selectedAttachments.length" class="list-group mb-3">
            <a
              v-for="file in attachmentsWithIcons"
              :key="file.uploadurl"
              :href="file.uploadurl"
              :download="file.uploadname"
              target="_blank"
              rel="noopener noreferrer"
              class="list-group-item list-group-item-action d-flex align-items-center gap-2">
              <component :is="file.icon" :class="file.iconClass" />
              {{ file.name }}
            </a>
          </div>

          <p v-else class="text-muted mb-3">No attachments found.</p>

          <div class="d-flex justify-content-end">
            <button
              class="btn btn-sm btn-secondary"
              @click="showAttachmentsModal = false">
              Close
            </button>
          </div>
        </div>
      </ModalComponent>
    </Transition>
  </div>
</template>

<script>
import { getNameByEmployeeNumber } from "../common/helpers.js";
import { store } from "../common/store.js";
import ResourceForm from "../components/ResourceForm.vue";
import ResourceTable from "../components/ResourceTable.vue";

import File from "vue-material-design-icons/File.vue";
import FilePdfBox from "vue-material-design-icons/FilePdfBox.vue";
import FileWord from "vue-material-design-icons/FileWord.vue";
import FileExcel from "vue-material-design-icons/FileExcel.vue";
import FileImage from "vue-material-design-icons/FileImage.vue";
import FileDelimited from "vue-material-design-icons/FileDelimited.vue";

// Static lookup: built once, not on every call
const FILE_TYPES = {
  pdf: { component: FilePdfBox, class: "text-danger" },
  doc: { component: FileWord, class: "text-primary" },
  docx: { component: FileWord, class: "text-primary" },
  xls: { component: FileExcel, class: "text-success" },
  xlsx: { component: FileExcel, class: "text-success" },
  csv: { component: FileDelimited, class: "text-info" },
  jpg: { component: FileImage, class: "text-warning" },
  jpeg: { component: FileImage, class: "text-warning" },
  png: { component: FileImage, class: "text-warning" },
  gif: { component: FileImage, class: "text-warning" },
};
const DEFAULT_FILE_TYPE = { component: File, class: "text-secondary" };

const REQUEST_STATUS_BADGE_CLASSES = {
  new: "bg-info-subtle text-info-emphasis border border-1 badge text-capitalize",
  "in progress":
    "bg-warning-subtle text-warning-emphasis badge text-capitalize",
  "on hold": "bg-secondary opacity-50 badge text-capitalize",
  complete: "bg-success-subtle text-success-emphasis badge text-capitalize",
};

export default {
  name: "RequestView",
  components: {
    ResourceForm,
    ResourceTable,
    File,
  },
  inject: ["toast"],
  data() {
    return {
      requests: [],
      employees: [],
      showForm: false,
      editingRequest: null,
      errorMessage: "",
      submitting: false,
      showRejectModal: false,
      rejecting: false,
      rejectReason: "",
      notify: true,
      showAttachmentsModal: false,
      selectedAttachments: [],
      unrestrictedUsers: [],
    };
  },
  computed: {
    attachmentsWithIcons() {
      return this.selectedAttachments.map((file) => {
        const ext = (file.uploadname || "").split(".").pop().toLowerCase();
        const { component, class: iconClass } =
          FILE_TYPES[ext] ?? DEFAULT_FILE_TYPE;
        return { ...file, icon: component, iconClass };
      });
    },
    restrictedUser() {
      const me = Number(store.userAuth.number);
      return !this.unrestrictedUsers.map(Number).includes(me);
    },
    requestFormFields() {
      return [
        {
          key: "submittedBy",
          label: "Submitted By",
          type: "text",
          hidden: true,
        },
        {
          key: "objective",
          label: "Objective",
          type: "textarea",
          rows: 4,
          placeholder:
            "What is the purpose of this request? What's the benefit, and how does it add value to an existing process?",
          required: true,
        },
        {
          key: "scope",
          label: "Scope",
          type: "textarea",
          rows: 2,
          placeholder: "What's included, and what's explicitly out of bounds?",
          required: true,
        },
        {
          key: "stakeholders",
          label: "Stakeholders",
          type: "text",
          placeholder:
            "Requester and anyone else impacted, e.g. Jane Doe (requester), Mark Lee (IT)",
          required: true,
        },
        { key: "startDate", label: "Start date", type: "date", required: true },
        { key: "endDate", label: "Target completion", type: "date" },
        {
          key: "status",
          label: "Status",
          type: "select",
          hidden: this.restrictedUser,
          options: this.requestStatuses,
          dateKeyMap: this.dateKeyMap,
        },
        { key: "files", label: "Attachments", type: "file" },
      ];
    },
    blankRequest() {
      return {
        submittedBy: "",
        objective: "",
        scope: "",
        stakeholders: "",
        startDate: "",
        endDate: "",
        status: "new",
        files: [],
      };
    },
    requestStatuses() {
      return ["new", "in progress", "on hold", "complete"];
    },
    dateKeyMap() {
      return {
        startDate: "start_date",
        endDate: "end_date",
      };
    },
    tableColumns() {
      const fmt = this.formatDate;
      // key = db column name
      return [
        {
          key: "created_at",
          label: "Date Logged",
          format: (v) => fmt(v.split(" ")[0]),
        },
        {
          key: "submitted_by",
          label: "Submitted By",
          format: (v) => getNameByEmployeeNumber(this.employees, v),
        },
        { key: "objective", label: "Objective" },
        { key: "scope", label: "Scope" },
        { key: "stakeholders", label: "Stakeholders" },
        { key: "start_date", label: "Start", format: (v) => fmt(v) },
        { key: "end_date", label: "Targeted End Date", format: (v) => fmt(v) },
        {
          key: "status",
          label: "Status",
          valueClassMap: REQUEST_STATUS_BADGE_CLASSES,
        },
        {
          key: "approved",
          label: "Approved",
          type: "select",
          format: (v) => (v > 0 ? "Yes" : "No"),
        },
        {
          key: "files",
          label: "Attachments",
          icon: {
            component: File,
            class: "text-secondary opacity-50 cursor-pointer disabled",
            iconClickEvent: "show-attachments",
          },
          format: (csv) =>
            csv.split(",").filter((str) => str.length > 0).length,
        },
        { key: "last_updated", label: "Last Updated", format: (v) => fmt(v, true) }, // value, format in time ago
      ];
    },
  },
  mounted() {
    this.loadRequests();
    this.loadEmployees(); // returns names and numbers
  },
  methods: {
    getNameByEmployeeNumber,
    async loadRequests() {
      try {
        // init the unrestricted users
        this.unrestrictedUsers =
          (await this.$axios.get(this.$api + "?unrestricted")).data || [];

        this.requests =
          (await this.$axios.get(this.$api + "?requests")).data || [];

        // show needed approved first, then by most recently created
        this.requests
          .sort((a, b) => a["approved"] - b["approved"])
          .sort((a, b) => b["created_at"] - a["created_at"]);
      } catch (err) {
        console.error("Could not load saved requests", err);
        this.requests = [];
        this.toast.show(
          "Could not load saved requests",
          "bg-danger-subtle text-danger-emphasis",
        );
      }
    },
    async loadEmployees() {
      try {
        this.employees = (await this.$axios.get(this.$api + "?emp")).data || [];
      } catch (err) {
        console.error("Could not load employees", err);
        this.employees = [];
      }
    },
    async saveRequest(body) {
      try {
        this.submitting = true;
        let response;
        // edit an existing request
        if (this.editingRequest?.id) {
          response = await this.$axios.post(
            this.$api + `?request&edit&id=${this.editingRequest.id}`,
            body,
          );
        } else {
          // create a new request
          response = await this.$axios.post(this.$api + "?request&new", body);
        }

        // clear form and reload data
        await this.loadRequests();
        this.submitting = false;
        this.toast.show(
          this.editingRequest?.id
            ? "Request updated"
            : "The request has been submitted and will be reviewed",
          "bg-success-subtle text-success-emphasis",
        );
        this.cancelEdit();
      } catch (err) {
        this.errorMessage = "Could not save request";
        console.error("Could not save request", err);
      }
    },
    startEdit(request) {
      this.editingRequest = request;
      this.showForm = true;
    },
    cancelEdit() {
      this.editingRequest = null;
      this.showForm = false;
    },
    cancelAdd() {
      this.showForm = false;
    },
    async deleteRequest(id) {
      if (
        this.showRejectModal === false &&
        !window.confirm(
          "All attachments in this request will also be deleted permanently. Confirm delete?",
        )
      ) {
        return;
      }
      try {
        const body = new FormData();
        body.append("id", id);
        await this.$axios.post(this.$api + "?request&delete", body);
        this.loadRequests();
      } catch (err) {
        console.error("Could not delete request", err);
      }
    },
    clearRejectForm() {
      this.rejectReason = "";
      this.notify = true;
      this.showRejectModal = false;
    },
    async rejectRequest(r) {
      try {
        this.rejecting = true;
        const body = new FormData();
        body.append("id", parseInt(r["id"]));
        body.append("reason", this.rejectReason);
        body.append("notify", Boolean(this.notify));
        body.append("employee_number", parseInt(r["submitted_by"]));
        await this.$axios.post(this.$api + "?request&reject", body);
        this.loadRequests();
        const notifyMessage = this.notify
          ? "Request rejected: an email was sent to "
          : "Request rejected: notification skipped for ";
        this.toast.show(
          notifyMessage +
            getNameByEmployeeNumber(this.employees, r["submitted_by"]),
          "bg-danger-subtle text-danger-emphasis",
        );
        this.rejecting = false;
        this.showRejectModal = false;
      } catch (err) {
        console.error("Could not reject request", err);
        this.toast.show(
          "Could not reject request",
          "bg-danger-subtle text-danger-emphasis",
        );
        this.rejecting = false;
        this.showRejectModal = false;
      }
    },
    async approveRequest(r) {
      try {
        this.submitting = true;
        const body = new FormData();
        body.append("request_id", r["id"]);
        body.append("employee_number", r["submitted_by"]);

        await this.$axios.post(this.$api + "?request&approve", body);

        this.loadRequests();
        this.submitting = false;
        this.toast.show(
          "Request approved: an email was sent to " +
            getNameByEmployeeNumber(this.employees, r["submitted_by"]),
          "bg-success-subtle text-success-emphasis",
        );
        this.clearRejectForm();
      } catch (err) {
        console.error("Could not approve request", err);
        this.toast.show(
          "Could not approve request",
          "bg-danger-subtle text-danger-emphasis",
        );
        this.clearRejectForm();
      }
    },
    formatDate(value, timeAgo = false) {
      if (!value || parseInt(value) === 0) return "\u2014";

      const date = new Date(String(value).replace(" ", "T"));

      if (Number.isNaN(date.getTime())) return value;

      if (timeAgo) {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        const formatter = new Intl.RelativeTimeFormat(undefined, {
          numeric: "auto",
        });

        const units = [
          { limit: 60, divisor: 1, unit: "second" },
          { limit: 3600, divisor: 60, unit: "minute" },
          { limit: 86400, divisor: 3600, unit: "hour" },
          { limit: 2592000, divisor: 86400, unit: "day" },
          { limit: 31536000, divisor: 2592000, unit: "month" },
          { limit: Infinity, divisor: 31536000, unit: "year" },
        ];

        const absSeconds = Math.abs(seconds);
        const unit = units.find((u) => absSeconds < u.limit);
        const amount = Math.round(seconds / unit.divisor);

        return formatter.format(-amount, unit.unit);
      }

      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      });
    },
    async showAttachments(req) {
      console.log(req);
      // get all attachments for this request
      const docs = [];
      for (const id of req.files.split(",")) {
        const doc = (await this.$axios.get(this.$api + "?docs&id=" + id)).data;
        docs.push(doc);
      }
      console.log(docs);
      this.selectedAttachments = docs;
      this.showAttachmentsModal = true;
    },
  },
};
</script>
