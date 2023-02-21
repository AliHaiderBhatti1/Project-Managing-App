<template>
  <div class="mt-2 w-100">
    <div
      v-if="getTasks?.length"
      class="pointer d-flex flex-wrap justify-center align-center"
    >
      <v-card
        v-for="(task, index) in getTasks"
        :key="index"
        min-width="345"
        min-height="345"
        class="mx-2 my-2 pointer"
        @click="openSubTask(task)"
      >
        <div class="d-flex">
          <v-card-title
            class="d-inline-block text-truncate pointer text-capitalize theme-color"
          >
            {{ task.name }}
          </v-card-title>
          <v-spacer></v-spacer>
          <v-menu
            v-if="getUserRole === 'admin'"
            ref="menu"
            :close-on-content-click="false"
            transition="scale-transition"
            min-width="auto"
            left
          >
            <template v-slot:activator="{ on, attrs }">
              <div v-on="on" v-bind="attrs">
                <v-btn class="mt-3" text small fab>
                  <v-icon dense class="theme-color"
                    >mdi-dots-vertical</v-icon
                  ></v-btn
                >
              </div>
            </template>
            <v-list color="white">
              <v-list-item
                class="pointer theme-color"
                @click.stop="editTask(task)"
                >Edit Task</v-list-item
              >
              <hr />
              <v-list-item
                class="pointer theme-color"
                @click.stop="
                  deleteId = task.id
                  dialog = true
                "
                >Delete Task</v-list-item
              >
            </v-list>
          </v-menu>
        </div>
        <div class="d-flex mr-6">
          <v-card-text class="theme-color" style="font-size: 18px">
            Start Date:
          </v-card-text>
          <v-text-field
            :value="task.start_date.slice(0, 10)"
            prepend-icon="mdi-calendar"
            readonly
            color="yellow darken-2"
          >
            <v-icon slot="prepend" class="theme-color">
              mdi-calendar</v-icon
            ></v-text-field
          >
        </div>
        <div class="d-flex mr-6">
          <v-card-text style="font-size: 18px" class="theme-color">
            End Date:
          </v-card-text>
          <v-text-field
            :value="task.end_date.slice(0, 10)"
            prepend-icon="mdi-calendar"
            readonly
            color="yellow darken-2"
          >
            <v-icon slot="prepend" class="theme-color">
              mdi-calendar</v-icon
            ></v-text-field
          >
        </div>

        <div class="d-flex justify-center">
          <v-progress-circular
            class="mt-2 ml-1"
            :rotate="360"
            :size="55"
            :width="5"
            :value="task.completion"
            :color="checkStatus(task.completion)"
          >
            <div class="font-13">
              {{ Math.floor(task.completion) + '%' }}
            </div>
          </v-progress-circular>
        </div>
      </v-card>
    </div>
    <v-card
      v-if="!pageLoading && getTasks?.length >= 9"
      height="1"
      v-intersect.quiet="getNextPage"
    />
    <div
      v-if="pageLoading"
      class="w-100 my-2 d-flex align-center justify-center"
    >
      <v-progress-circular
        size="30"
        width="3"
        indeterminate
        color="primary"
      ></v-progress-circular>
    </div>
    <div
      v-if="!getTasks.length"
      class="d-flex justify-center align-center w-100"
      style="height: 100vh"
    >
      <h2 class="theme-color">No Tasks Found.</h2>
    </div>
    <v-dialog v-model="dialog" persistent max-width="290">
      <v-card>
        <v-card-text class="pt-4"
          >Are you sure you want to delete this task?</v-card-text
        >
        <v-card-actions>
          <v-btn
            color="success"
            class="white--text"
            small
            @click="removeTask()"
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
    <TaskDialog
      v-if="openTaskDialog"
      :openTaskDialog.sync="openTaskDialog"
      :taskTitleFlag.sync="taskTitleFlag"
      :taskId.sync="taskId"
      :taskName.sync="taskName"
      :taskStartDate.sync="taskStartDate"
      :taskEndDate.sync="taskEndDate"
    ></TaskDialog>
    <SubTasks
      v-if="openSubTaskDialog"
      :openSubTaskDialog.sync="openSubTaskDialog"
      :taskId.sync="taskId"
    ></SubTasks>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import snackbarMixin from '../../mixins/snackbar'
export default {
  name: 'TasksList',
  middleware: 'auth',
  mixins: [snackbarMixin],
  components: {
    TaskDialog: () => import('../../components/Tasks/TaskDialog.vue'),
    SubTasks: () => import('../SubTasks/SubTasks.vue'),
  },
  data() {
    return {
      currentPage: 1,
      openTaskDialog: false,
      taskTitleFlag: 'Update Task',
      taskId: null,
      taskName: null,
      taskStartDate: null,
      taskEndDate: null,
      openSubTaskDialog: false,
      pageLoading: false,
      dialog: false,
      deleteId: null,
      loader: false,
    }
  },
  computed: {
    ...mapGetters([
      'getTasks',
      'getTasksLastPage',
      'getSelectedCompany',
      'getUserRole',
    ]),
  },
  methods: {
    ...mapMutations(['setEmptyTasks']),
    ...mapActions(['fetchTasks', 'deleteTask', 'logout']),
    checkStatus(value) {
      if (value >= 90) return 'green'
      else if (value < 90 && value >= 50) return 'rgb(204, 100, 214)'
      else if (value < 50 && value >= 11) return 'orange'
      else if (value <= 10) return 'red'
    },
    getNextPage(_, __, isIntersecting) {
      if (isIntersecting) {
        this.currentPage = this.currentPage + 1
        if (this.currentPage <= this.getTasksLastPage) {
          this.pageLoading = true
          this.fetchTasks({
            projectId: this.$route.params.projectId,
            phaseId: this.$route.params.phaseId,
            currentPage: this.currentPage,
          }).then(() => {
            this.pageLoading = false
          })
        }
      }
    },
    editTask(task) {
      this.openTaskDialog = true
      this.taskId = task.id
      this.taskName = task.name
      this.taskStartDate = task.start_date.slice(0, 10)
      this.taskEndDate = task.end_date.slice(0, 10)
    },
    removeTask() {
      this.loader = true
      this.deleteTask({
        company_id: this.getSelectedCompany.id,
        project_id: this.$route.params.projectId,
        phase_id: this.$route.params.phaseId,
        task_id: this.deleteId,
      })
        .then((res) => {
          this.loader = false
          this.dialog = false
          this.deleteId = null
          if (res.status === 204 || res.status === 200 || res.status === 201)
            this.showSnackbar(true, 'Task deleted successfully!', false)
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
    openSubTask(task) {
      this.openSubTaskDialog = true
      this.taskId = task.id
    },
  },
  mounted() {
    this.setEmptyTasks([])
    this.fetchTasks({
      projectId: this.$route.params.projectId,
      phaseId: this.$route.params.phaseId,
      currentPage: this.currentPage,
    }).catch((err) => {
      if (err.response.status === 404) {
        this.showSnackbar(
          true,
          `Phase with ${this.$route.params.phaseId} not exist!`,
          true
        )
        setTimeout(() => {
          this.$router.back()
        }, 1000)
      }
    })
  },
}
</script>
<style scoped>
.font-14 {
  font-size: 14px;
  font-weight: bold;
}
</style>
