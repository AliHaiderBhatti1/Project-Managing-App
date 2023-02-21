<template>
  <div>
    <v-dialog v-model="subTaskDialogFlag" scrollable max-width="600px"
      ><v-card max-width="600px">
        <v-card-title
          class="px-1 text-truncate dialog-title-border theme-bg-color"
          style="color: white"
        >
          <div class="d-flex justify-center float-left" style="width: 90%">
            <span class="d-inline-block text-truncate" style="max-width: 300px">
              <b class="ui-theme-color modals-title-size"> Sub Tasks List </b>
            </span>
          </div>
          <div
            class="d-flex justify-end align-center float-right"
            style="width: 10%; height: 32px"
          >
            <v-icon
              small
              color="white"
              @click="subTaskDialogFlag = false"
              class="d-flex mr-2"
            >
              mdi-close
            </v-icon>
          </div>
        </v-card-title>
        <v-card-subtitle
          v-if="getUserRole === 'admin'"
          class="mt-3 w-100 px-4 py-0 mb-2"
        >
          <div class="d-flex">
            <v-text-field
              v-model="name"
              placeholder="Sub task name..."
              autofocus
              hide-details
              outlined
              dense
              class="ml-5"
              color="yellow darken-2"
              @keydown.enter="addSubTask()"
            >
              <div v-if="!isMobile" slot="append" class="d-flex">
                <div
                  slot="append"
                  class="theme-color"
                  style="font-size: 13px; margin-top: 3px"
                >
                  enter
                </div>
                <v-icon
                  slot="append"
                  style="margin-top: 4px"
                  x-small
                  class="theme-color"
                  >mdi-keyboard-return</v-icon
                >
              </div>
            </v-text-field>
            <v-btn
              v-if="!isMobile"
              class="btn-width theme-color ml-2"
              color="white"
              @click="addSubTask()"
              >Add Sub Task</v-btn
            >
            <v-btn
              v-if="isMobile"
              class="ml-1 mt-1"
              small
              height="35px"
              @click="addSubTask()"
              ><v-icon class="theme-color" dense>mdi-plus</v-icon></v-btn
            >
          </div>
        </v-card-subtitle>
        <v-card-text class="mt-2" style="height: 480px">
          <div class="pa-0 ma-0">
            <div
              class="d-flex justify-center pa-0 ma-0"
              v-for="(item, index) in getSubTasks"
              :key="item.id"
            >
              <span style="margin-top: 10px" class="theme-color">
                {{ index + 1 }}.
              </span>
              <v-checkbox
                v-show="editItem !== item.id"
                :input-value="item.finished"
                :label="item.name"
                hide-details
                color="rgb(223, 164, 77)"
                class="my-1"
                :class="index >= 9 ? 'ml-1' : 'ml-3'"
                dense
                @change="changeSubTaskValue(item, $event)"
                :disabled="getUserRole === 'client'"
              >
                <div
                  slot="label"
                  class="text-truncate d-inline-block text-capitalize theme-color"
                  :style="
                    isMobile
                      ? getUserRole === 'admin'
                        ? 'max-width: 140px !important'
                        : 'max-width: 200px !important'
                      : getUserRole === 'admin'
                      ? 'max-width: 400px !important'
                      : 'max-width: 450px !important'
                  "
                >
                  {{ item.name }}
                </div></v-checkbox
              >
              <v-text-field
                v-if="item.id === editItem"
                placeholder="Placeholder"
                v-model="subTaskName"
                autofocus
                hide-details
                outlined
                dense
                class="ml-6"
                color="yellow darken-2"
                @keydown.enter="changeSubTaskName(item, item.finished)"
                ><div v-if="!isMobile" slot="append" class="d-flex">
                  <div
                    slot="append"
                    style="font-size: 13px; margin-top: 3px"
                    class="theme-color"
                  >
                    enter
                  </div>
                  <v-icon
                    slot="append"
                    style="margin-top: 4px"
                    x-small
                    class="theme-color"
                    >mdi-keyboard-return</v-icon
                  >
                </div>
              </v-text-field>
              <v-btn
                v-if="item.id === editItem && getUserRole === 'admin'"
                text
                small
                fab
                ><v-icon class="theme-color" dense @click="editItem = null"
                  >mdi-close-circle-outline</v-icon
                ></v-btn
              >
              <v-spacer></v-spacer>
              <v-btn
                v-if="item.id === editItem && getUserRole === 'admin'"
                text
                small
                fab
                ><v-icon
                  class="theme-color"
                  dense
                  @click="changeSubTaskName(item, item.finished)"
                  >mdi-check</v-icon
                ></v-btn
              >
              <v-btn
                v-if="item.id !== editItem && getUserRole === 'admin'"
                text
                small
                fab
                ><v-icon class="theme-color" dense @click="editSubTask(item)"
                  >mdi-pencil</v-icon
                ></v-btn
              >
              <v-btn v-if="getUserRole === 'admin'" text small fab
                ><v-icon
                  class="theme-color"
                  dense
                  @click="
                    deleteId = item.id
                    dialog = true
                  "
                  >mdi-delete-outline</v-icon
                ></v-btn
              >
            </div>
            <v-card
              v-if="!pageLoading && getSubTasks?.length >= 14"
              height="1"
              v-intersect.quiet="getNextPage"
            />
            <div
              v-if="pageLoading"
              class="w-100 my-2 d-flex align-center justify-center"
            >
              <v-progress-circular
                size="20"
                width="3"
                indeterminate
                color="primary"
              ></v-progress-circular>
            </div>
            <div
              v-if="!getSubTasks.length"
              class="d-flex justify-center align-center w-100"
              style="min-height: 400px"
            >
              <h2 class="theme-color">No Sub Tasks Found.</h2>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialog" persistent max-width="290">
      <v-card>
        <v-card-text class="pt-4"
          >Are you sure you want to delete this subtask?</v-card-text
        >
        <v-card-actions>
          <v-btn
            color="success"
            class="white--text"
            small
            @click="removeSubTask()"
          >
            Yes<v-progress-circular
              v-if="loader"
              indeterminate
              size="20"
              class="ml-2"
            ></v-progress-circular>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="red" class="white--text" small @click="dialog = false">
            No
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import snackbarMixin from '../../mixins/snackbar'
export default {
  props: ['taskId'],
  mixins: [snackbarMixin],
  data() {
    return {
      dialog: false,
      name: null,
      subTaskName: null,
      subTaskDialogFlag: true,
      editItem: null,
      pageLoading: false,
      currentPage: 1,
      deleteId: null,
      loader: false,
    }
  },
  computed: {
    ...mapGetters([
      'getSubTasks',
      'getSelectedCompany',
      'getSubTasksLastPage',
      'getUserRole',
    ]),
    isMobile() {
      return this.$breakpoints.sm || this.$breakpoints.sSm
    },
  },
  methods: {
    ...mapMutations(['setEmptySubTasks']),
    ...mapActions([
      'fetchSubTasks',
      'createSubTask',
      'updateSubTask',
      'deleteSubTask',
      'getSingleTask',
      'logout',
    ]),
    addSubTask() {
      const formData = new FormData()
      formData.append('name', this.name)
      this.createSubTask({
        formData,
        project_id: this.$route.params.projectId,
        phase_id: this.$route.params.phaseId,
        task_id: this.taskId,
      })
        .then((res) => {
          this.name = null
          this.getSingleTask({
            project_id: this.$route.params.projectId,
            phase_id: this.$route.params.phaseId,
            task_id: this.taskId,
          })
          if (res.status === 204 || res.status === 200 || res.status === 201) {
            this.showSnackbar(true, 'Subtask created successfully!', false)
          }
        })
        .catch((err) => {
          if (err.status === 401) {
            this.showSnackbar(true, err.data.data.message, true)
            setTimeout(() => {
              this.logout()
            }, 1000)
          }
          if (err.status === 400) {
            this.showSnackbar(true, err.data.data.message, true)
          }
        })
    },
    changeSubTaskValue(item, event) {
      this.changeSubTaskName(item, event).then(() => {
        this.getSingleTask({
          project_id: this.$route.params.projectId,
          phase_id: this.$route.params.phaseId,
          task_id: this.taskId,
        })
      })
    },
    editSubTask(item) {
      this.editItem = item.id
      this.subTaskName = item.name
    },
    changeSubTaskName(item, value) {
      return new Promise((resolve) => {
        const formData = new FormData()
        formData.append('name', this.subTaskName ? this.subTaskName : item.name)
        formData.append('finished', value ? 1 : 0)
        formData.append('_method', 'PUT')
        this.updateSubTask({
          formData,
          company_id: this.getSelectedCompany.id,
          project_id: this.$route.params.projectId,
          phase_id: this.$route.params.phaseId,
          task_id: this.taskId,
          subtask_id: item.id,
        })
          .then((res) => {
            this.editItem = null
            if (res.status === 204 || res.status === 200) {
              this.showSnackbar(true, 'Subtask updated successfully!', false)
            }
            resolve()
          })
          .catch((err) => {
            if (err.status === 401) {
              this.showSnackbar(true, err.data.data.message, true)
              setTimeout(() => {
                this.logout()
              }, 1000)
            }
            if (err.status === 400)
              this.showSnackbar(true, err.data.data.message, true)
          })
      })
    },
    getNextPage(_, __, isIntersecting) {
      if (isIntersecting) {
        this.currentPage = this.currentPage + 1
        if (this.currentPage <= this.getSubTasksLastPage) {
          this.pageLoading = true
          this.fetchSubTasks({
            projectId: this.$route.params.projectId,
            phaseId: this.$route.params.phaseId,
            taskId: this.taskId,
            currentPage: this.currentPage,
          }).then(() => {
            this.pageLoading = false
          })
        }
      }
    },
    removeSubTask() {
      this.loader = true
      this.deleteSubTask({
        company_id: this.getSelectedCompany.id,
        project_id: this.$route.params.projectId,
        phase_id: this.$route.params.phaseId,
        task_id: this.taskId,
        subtask_id: this.deleteId,
      })
        .then((res) => {
          this.loader = false
          this.dialog = false
          this.deleteId = null
          this.getSingleTask({
            project_id: this.$route.params.projectId,
            phase_id: this.$route.params.phaseId,
            task_id: this.taskId,
          })
          if (res.status === 204 || res.status === 200) {
            this.showSnackbar(true, 'Subtask deleted successfully!', false)
          }
        })
        .catch((err) => {
          if (err.status === 401) {
            this.showSnackbar(true, err.data.data.message, true)
            setTimeout(() => {
              this.logout()
            }, 1000)
          }
        })
    },
  },
  mounted() {
    this.setEmptySubTasks([])
    this.fetchSubTasks({
      projectId: this.$route.params.projectId,
      phaseId: this.$route.params.phaseId,
      taskId: this.taskId,
      currentPage: this.currentPage,
    }).catch((err) => {
      if (err.response.status === 404) {
        this.showSnackbar(
          true,
          `Task with ${this.$route.params.phaseId} not exist!`,
          true
        )
        setTimeout(() => {
          this.$router.back()
        }, 1000)
      }
    })
  },
  watch: {
    subTaskDialogFlag(value) {
      if (!value) this.$emit('update:openSubTaskDialog', false)
    },
  },
}
</script>
<style scoped>
.btn-width {
  width: 130px;
}
</style>
