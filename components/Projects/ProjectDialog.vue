<template>
  <div>
    <v-dialog v-model="projectDialogFlag" width="500"
      ><v-card min-height="380">
        <v-card-title
          class="px-1 text-truncate dialog-title-border theme-bg-color"
          style="color: white"
        >
          <div class="d-flex justify-center float-left" style="width: 90%">
            <span class="d-inline-block text-truncate" style="max-width: 300px">
              <b class="ui-theme-color modals-title-size">
                {{ titleFlag }}
              </b>
            </span>
          </div>
          <div
            class="d-flex justify-end align-center float-right"
            style="width: 10%; height: 32px"
          >
            <v-icon
              small
              color="white"
              @click="projectDialogFlag = false"
              class="d-flex mr-2"
            >
              mdi-close
            </v-icon>
          </div>
        </v-card-title>
        <hr />
        <div class="mx-6 my-2">
          <label for="Email">Add Title *</label>
        </div>
        <div style="max-width: 455px" class="mx-6">
          <v-text-field
            v-model="projectTitle"
            color="yellow darken-2"
            outlined
            autofocus
          ></v-text-field>
        </div>
        <div class="mx-6 my-2">
          <label for="image">Upload Image *</label>
        </div>
        <div class="d-flex ml-6 mr-2 align-center">
          <input
            type="file"
            id="file"
            ref="file"
            accept="image/*"
            v-on:change="preview"
          />
          <v-img
            v-if="imgSrc"
            style="border-radius: 50%"
            :src="imgSrc"
            width="45px"
          ></v-img>
          <div v-if="!imgSrc && titleFlag !== 'Create Project'">
            <img
              src="@/assets/images/buildvue_logo_500x500_notag.png"
              contain
              style="border-radius: 50%"
              width="150px"
            />
          </div>
        </div>
        <div class="d-flex">
          <div></div>
          <v-spacer></v-spacer
          ><v-btn
            v-if="imgSrc"
            text
            small
            fab
            @click="imgSrc = null"
            style="margin-right: 60px"
            ><v-icon color="red" dense>mdi-delete-outline</v-icon></v-btn
          >
        </div>
        <v-card-actions class="d-flex mx-3">
          <v-btn @click="projectDialogFlag = false" style="width: 100px"
            >Cancel</v-btn
          >
          <v-spacer></v-spacer>
          <v-btn
            @click="onSubmit()"
            class="ma-4 btn theme-color"
            style="width: 100px"
            >Save
            <v-progress-circular
              v-if="loader"
              indeterminate
              class="ml-2"
            ></v-progress-circular>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import snackbarMixin from '../../mixins/snackbar'
export default {
  props: [
    'openTaskDialog',
    'titleFlag',
    'projectName',
    'imagePath',
    'projectId',
  ],
  mixins: [snackbarMixin],
  data() {
    return {
      projectDialogFlag: true,
      projectTitle: this.projectName,
      file: '',
      imgSrc: this.imagePath,
      projectID: this.projectId,
      loader: false,
      defaultImage:
        "require('../../assets/images/buildvue_logo_500x500_notag.png')",
    }
  },
  computed: {
    ...mapGetters(['getSelectedCompany']),
  },
  methods: {
    ...mapActions(['createProject', 'updateProject', 'logout']),
    onSubmit() {
      const formData = new FormData()
      formData.append('name', this.projectTitle)
      if (this.titleFlag === 'Create Project') {
        if (this.file) formData.append('image', this.file)
        if (formData.get('name')) {
          this.loader = true
          this.createProject(formData)
            .then((res) => {
              this.loader = false
              if (
                res.status === 204 ||
                res.status === 200 ||
                res.status === 201
              ) {
                this.showSnackbar(true, 'Project created successfully!', false)
                this.projectDialogFlag = false
              }
            })
            .catch((err) => {
              this.loader = false
              if (err.status === 401) {
                this.projectDialogFlag = false
                this.showSnackbar(true, err.data.data.message, true)
                setTimeout(() => {
                  this.logout()
                }, 1000)
              }
              if (err.status === 400)
                this.showSnackbar(true, err.data.data.message, true)
              if (err.status === 422) {
                this.showSnackbar(true, err.data.data.message, true)
              }
            })
        } else {
          this.showSnackbar(true, 'Please enter name!', true)
        }
      } else if (this.titleFlag === 'Update Project') {
        formData.append('_method', 'PUT')
        if (this.file) formData.append('image', this.file)
        if (formData.get('name')) {
          this.loader = true
          this.updateProject({
            formData,
            company_id: this.getSelectedCompany.id,
            project_id: this.projectId,
          })
            .then((res) => {
              this.loader = false

              if (res.status === 204 || res.status === 200) {
                this.showSnackbar(true, 'Project updated successfully!', false)
                this.projectDialogFlag = false
              }
            })
            .catch((err) => {
              this.loader = false
              if (err.status === 400)
                this.showSnackbar(true, err.data.data.message, true)
              if (err.status === 401) {
                this.projectDialogFlag = false
                this.showSnackbar(true, err.data.data.message, true)
                setTimeout(() => {
                  this.logout()
                }, 1000)
              }
              if (err.status === 422) {
                this.showSnackbar(true, err.data.data.message, true)
              }
            })
        } else this.showSnackbar(true, 'Please enter name!', true)
      }
    },
    preview(e) {
      if (this.$refs.file.files[0].size > 5000000) {
        this.showSnackbar(
          true,
          'Image size should not be greater than 5 MB',
          true
        )
      } else {
        this.file = this.$refs.file.files[0]
        const imgSrc = window.URL.createObjectURL(e.target.files[0])
        this.imgSrc = imgSrc
      }
    },
  },
  watch: {
    projectDialogFlag(value) {
      if (!value) this.$emit('update:openProjectDialog', false)
    },
  },
}
</script>

<style scoped>
.mt-110 {
  margin-top: 80px;
}
.btn {
  color: white;
}
</style>
