<template>
  <v-app app dark>
    <v-snackbar
      v-model="snackbar"
      class="mt-5"
      top
      right
      :color="snackbarMessagecolor ? 'red lighten-5' : 'green lighten-5'"
      light
      timeout="5000"
    >
      <span :class="snackbarMessagecolor ? 'red--text' : 'green--text'">
        {{ snackbarMessage }}</span
      >
      <template #action="{ attrs }">
        <v-btn
          :color="snackbarMessagecolor ? 'red' : 'green'"
          text
          v-bind="attrs"
          small
          fab
          @click="snackbar = false"
        >
          <v-icon small> mdi-close-circle </v-icon>
        </v-btn>
      </template>
    </v-snackbar>
    <v-app-bar
      v-if="$route.name !== 'Login'"
      app
      dense
      height="70"
      class="toolbar elevation-1 theme-bg-color"
    >
      <v-menu
        content-class="bg-color"
        ref="menu"
        v-model="companyMenu"
        :close-on-content-click="false"
        transition="scale-transition"
        min-width="auto"
        left
        nudge-top="200"
        nudge-right="200"
      >
        <template v-slot:activator="{ on }">
          <div v-on="on">
            <v-app-bar-nav-icon v-on="on" lg color="white"></v-app-bar-nav-icon>
          </div>
        </template>
        <v-text-field
          prepend-inner-icon="mdi-magnify"
          background-color="white"
          color="yellow darken-2"
          placeholder="Search"
          class="pa-1 position"
          outlined
          hide-details
          autofocus
          solo
          dense
          flat
          v-model="search"
        >
        </v-text-field>
        <v-list v-if="searchedCompanies" color="white">
          <v-list-item
            v-for="(company, index) in searchedCompanies"
            :key="index"
            class="pointer"
            style="color: rgb(255, 98, 0)"
            :class="
              company.id == getSelectedCompany.id ? 'selected-company' : ''
            "
            @click="selectCompany(company)"
            >{{ company.name }}
            <v-spacer></v-spacer>

            <div
              v-if="company.id == getSelectedCompany.id"
              class="caption ml-2 mr-1 default theme-color"
            >
              Default
            </div>
          </v-list-item>

          <div v-if="search && !searchedCompanies.length">
            <p class="no-results-found my-1">No results found.</p>
          </div>
        </v-list>
      </v-menu>

      <v-toolbar-title
        class="font-weight-bold"
        :class="isMobile ? 'text-h5' : 'text-h4'"
        >{{ title }}</v-toolbar-title
      >

      <v-spacer></v-spacer>
      <v-btn
        v-if="!isMobile && getUserRole === 'admin'"
        v-show="loggedIn"
        class="create-btn-width theme-color mr-2"
        color="white"
        @click="openDialog()"
        >Create {{ buttonTitle }}</v-btn
      >
      <v-btn v-if="isMobile && getUserRole === 'admin'" @click="openDialog()"
        ><v-icon class="theme-color" dense>mdi-plus</v-icon></v-btn
      >
      <v-btn
        v-if="!isMobile"
        v-show="loggedIn"
        class="btn-width theme-color"
        color="white"
        @click="logout()"
        >Logout</v-btn
      >
      <v-btn class="ml-2" v-if="isMobile" v-show="loggedIn" @click="logout()"
        ><v-icon class="theme-color" dense>mdi-logout</v-icon></v-btn
      >
    </v-app-bar>
    <v-main style="height: calc(100vh - 70px)">
      <div v-if="$route.name !== 'Login'" class="ml-3 mt-2">
        <v-btn
          v-if="!isMobile"
          class="btn-width theme-color"
          color="white"
          @click="$router.back()"
          >Back</v-btn
        >
        <v-btn class="ml-2 theme-color" v-if="isMobile" @click="$router.back()"
          ><v-icon class="theme-color" dense>mdi-arrow-left</v-icon></v-btn
        >
      </div>
      <Nuxt class="d-flex justify-center align-center w-100" />
    </v-main>
    <ProjectDialog
      v-if="openProjectDialog"
      :openProjectDialog.sync="openProjectDialog"
      :titleFlag.sync="titleFlag"
    />
    <PhaseDialog
      v-if="openPhaseDialog"
      :openPhaseDialog.sync="openPhaseDialog"
      :phaseTitleFlag.sync="phaseTitleFlag"
      :projectId.sync="$route.params.projectIds"
    />
    <TaskDialog
      v-if="openTaskDialog"
      :openTaskDialog.sync="openTaskDialog"
      :taskTitleFlag.sync="taskTitleFlag"
    />
  </v-app>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
export default {
  name: 'DefaultLayout',
  components: {
    ProjectDialog: () => import('../components/Projects/ProjectDialog.vue'),
    PhaseDialog: () => import('../components/Phases/PhaseDialog.vue'),
    TaskDialog: () => import('../components/Tasks/TaskDialog.vue'),
  },
  data() {
    return {
      fixed: false,
      title: '',
      buttonTitle: '',
      openProjectDialog: false,
      openPhaseDialog: false,
      openTaskDialog: false,
      titleFlag: 'Create Project',
      phaseTitleFlag: 'Create Phase',
      taskTitleFlag: 'Create Task',
      snackbar: false,
      snackbarMessagecolor: false,
      snackbarMessage: null,
      search: null,
      currentPage: 1,
      companyMenu: false,
    }
  },
  computed: {
    ...mapGetters([
      'getToken',
      'getSelectedCompany',
      'getCompanies',
      'getUserRole',
    ]),
    loggedIn() {
      return !!this.$auth.loggedIn || this.$route.path !== '/login'
    },
    searchedCompanies() {
      return this.search && this.getCompanies
        ? this.getCompanies.filter((item) => {
            return item.name
              ? item.name.toLowerCase().includes(this.search.toLowerCase())
              : false
          })
        : this.getCompanies
    },
    isMobile() {
      return this.$breakpoints.sm || this.$breakpoints.sSm
    },
  },
  methods: {
    ...mapMutations([
      'setToken',
      'setSelectedCompany',
      'setCompanies',
      'setSelectedProject',
      'setEmptyProjects',
      'setUserRole',
    ]),
    ...mapActions(['fetchProjects', 'logout']),
    checkRouteName() {
      const routeName = this.$route.name
      if (routeName === 'ProjectsList') {
        this.title = 'Projects List'
        this.buttonTitle = 'Project'
      } else if (routeName === 'PhasesList') {
        this.title = 'Phases List'
        this.buttonTitle = 'Phase'
      } else if (routeName === 'TasksList') {
        this.title = 'Tasks List'
        this.buttonTitle = 'Task'
      }
    },
    selectCompany(company) {
      if (this.getSelectedCompany.id !== company.id) {
        this.setSelectedCompany(company)
        localStorage.setItem('setSelectedCompany', JSON.stringify(company))
        if (this.$route.name !== 'ProjectsList')
          this.$router.push({ path: '/projects' })
        else {
          this.setEmptyProjects([])
          this.fetchProjects(this.currentPage)
        }
        setTimeout(() => {
          this.companyMenu = false
        }, 1500)
        this.snackbar = true
        this.snackbarMessage = 'Company changed successfully!'
        this.snackbarMessagecolor = false
      }
    },
    openDialog() {
      if (this.buttonTitle === 'Project') this.openProjectDialog = true
      else if (this.buttonTitle === 'Phase') this.openPhaseDialog = true
      else if (this.buttonTitle === 'Task') this.openTaskDialog = true
    },
  },
  mounted() {
    this.$nuxt.$on('show-snackbar', (event) => {
      this.snackbar = event.snackbar
      this.snackbarMessage = event.snackbarMessage
      this.snackbarMessagecolor = event.snackbarMessagecolor
    })
    this.checkRouteName()
    const token = localStorage.getItem('auth._token.local')
    if (token) {
      this.setToken(token.slice(7))
      this.setCompanies(JSON.parse(localStorage.getItem('setCompanies')))
      this.setUserRole([JSON.parse(localStorage.getItem('setUserRole'))])
      this.setSelectedCompany(
        JSON.parse(localStorage.getItem('setSelectedCompany'))
      )
      this.setSelectedProject(
        JSON.parse(localStorage.getItem('setSelectedProject'))
      )
    }
    if (!this.getSelectedCompany?.id) this.logout()
  },
  beforeDestroy() {
    this.$nuxt.$off('show-snackbar')
  },
  watch: {
    $route(value) {
      if (value) this.checkRouteName()
    },
  },
}
</script>
<style scoped>
.btn-width {
  width: 100px;
}
.create-btn-width {
  width: 140px;
}
.toolbar {
  color: white;
}
.bg-color {
  background-color: white !important;
}
.no-results-found {
  font-size: 13px;
  color: grey;
  text-align: center !important;
  align-content: center !important;
}
.pointer {
  cursor: pointer;
}
.selected-company {
  background-color: rgb(253, 243, 207);
}
</style>
<style>
::-webkit-scrollbar {
  width: 0px !important;
}
.theme-color {
  color: rgb(223, 164, 77) !important;
}
.theme-bg-color {
  background-color: rgb(223, 164, 77) !important;
}
</style>
