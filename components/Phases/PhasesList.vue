<template>
  <div class="mt-2 w-100">
    <div class="pointer d-flex flex-wrap justify-center align-center">
      <v-card
        v-for="(phase, index) in getPhases"
        :key="index"
        max-width="350"
        min-height="400"
        class="mx-2 my-2"
        @click="openPhase(phase)"
      >
        <div class="d-flex">
          <v-card-title
            class="d-inline-block text-truncate pointer text-capitalize theme-color"
          >
            {{ phase.name }}
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
            <template v-slot:activator="{ on }">
              <div v-on="on">
                <v-btn class="mt-3" text small fab>
                  <v-icon v-on="on" dense class="theme-color"
                    >mdi-dots-vertical</v-icon
                  ></v-btn
                >
              </div>
            </template>
            <!-- date picker -->
            <v-list color="white">
              <v-list-item
                class="pointer theme-color"
                @click.stop="editPhase(phase)"
                >Edit Phase</v-list-item
              >
              <hr />
              <v-list-item
                class="pointer theme-color"
                @click.stop="
                  deleteId = phase.id
                  dialog = true
                "
                >Delete Phase</v-list-item
              >
            </v-list>
          </v-menu>
        </div>
        <div v-if="phase.image">
          <v-img
            :src="
              phase.image.includes('https://')
                ? phase.image
                : baseUrl.slice(0, -8) + phase.image
            "
            class="box-fit"
            contain
          />
        </div>
        <!-- <v-img
          v-if="phase.image"
          :src="
            phase.image.includes('https://')
              ? phase.image
              : baseUrl.slice(0, -8) + phase.image
          "
          height="250"
          width="350px"
        ></v-img> -->
        <div v-else>
          <img
            src="../../assets/images/buildvue_logo_500x500_notag.png"
            class="box-fit"
            contain
          />
        </div>
      </v-card>
    </div>
    <v-card
      v-if="!pageLoading && getPhases?.length >= 9"
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
      v-if="!getPhases.length"
      class="d-flex justify-center align-center w-100"
      style="height: 100vh"
    >
      <h2 class="theme-color">No Phases Found.</h2>
    </div>
    <v-dialog v-model="dialog" persistent max-width="290">
      <v-card>
        <v-card-text class="pt-4"
          >Are you sure you want to delete this phase?</v-card-text
        >
        <v-card-actions>
          <v-btn
            color="success"
            class="white--text"
            small
            @click="removePhase()"
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
    <PhaseDialog
      v-if="openPhaseDialog"
      :openPhaseDialog.sync="openPhaseDialog"
      :phaseTitleFlag.sync="phaseTitleFlag"
      :phaseName.sync="phaseName"
      :imagePath.sync="imagePath"
      :phaseId.sync="phaseId"
    ></PhaseDialog>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import snackbarMixin from '../../mixins/snackbar'
export default {
  name: 'PhasesList',
  middleware: 'auth',
  mixins: [snackbarMixin],
  components: {
    PhaseDialog: () => import('./PhaseDialog.vue'),
  },
  data() {
    return {
      show: false,
      flag: false,
      pageLoading: false,
      baseUrl: process.env.baseURL,
      currentPage: 1,
      openPhaseDialog: false,
      phaseTitleFlag: 'Update Phase',
      phaseName: null,
      imagePath: null,
      projectId: null,
      dialog: false,
      deleteId: null,
      loader: false,
    }
  },
  computed: {
    ...mapGetters([
      'getPhases',
      'getPhasesLastPage',
      'getSelectedCompany',
      'getUserRole',
    ]),
  },
  methods: {
    ...mapActions(['fetchPhases', 'deletePhase', 'logout']),
    ...mapMutations(['setEmptyPhases']),
    openPhase(phase) {
      this.$router.push({
        path: `${this.$route.path + '/' + phase.id + '/tasks'}`,
        params: { id: 'test title' },
      })
    },
    removePhase() {
      this.loader = true
      this.deletePhase({
        company_id: this.getSelectedCompany.id,
        project_id: this.$route.params.projectId,
        phase_id: this.deleteId,
      })
        .then((res) => {
          this.loader = true
          this.dialog = false
          this.deleteId = null
          if (res.status === 204 || res.status === 200 || res.status === 201)
            this.showSnackbar(true, 'Phase deleted successfully!', false)
        })
        .catch((err) => {
          if (err.status === 401) {
            this.openPhaseDialog = false
            this.showSnackbar(true, err.data.data.message, true)
            setTimeout(() => {
              this.logout()
            }, 1000)
          }
        })
    },
    getNextPage(_, __, isIntersecting) {
      if (isIntersecting) {
        this.currentPage = this.currentPage + 1
        if (this.currentPage <= this.getPhasesLastPage) {
          this.pageLoading = true
          this.fetchPhases({
            projectId: this.$route.params.projectId,
            currentPage: this.currentPage,
          }).then(() => {
            this.pageLoading = false
          })
        }
      }
    },
    editPhase(phase) {
      this.openPhaseDialog = true
      this.phaseName = phase.name
      this.phaseId = phase.id
      this.imagePath = phase.image
        ? phase.image?.includes('https://')
          ? phase.image
          : this.baseUrl.slice(0, -8) + phase.image
        : null
    },
  },
  mounted() {
    this.setEmptyPhases([])
    this.fetchPhases({
      projectId: this.$route.params.projectId,
      currentPage: this.currentPage,
    }).catch((err) => {
      if (err.response.status === 404) {
        this.showSnackbar(
          true,
          `Project with ${this.$route.params.projectId} not exist!`,
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
.overflow-scroll {
  overflow: scroll !important;
}
.pointer {
  cursor: pointer;
}
.box-fit {
  object-fit: contain !important;
  width: 350px;
  height: 300px;
}
</style>
