<template>
  <div class="d-flex justify-center align-center" style="height: 100vh">
    <!-- snackbar -->
    <v-snackbar
      v-model="snackbar"
      class="mt-5"
      top
      right
      :color="updateTaskError ? 'red lighten-5' : 'green lighten-5'"
      light
    >
      <span :class="updateTaskError ? 'red--text' : 'green--text'">
        {{ snackbarMessage }}</span
      >
      <template #action="{ attrs }">
        <v-btn
          :color="updateTaskError ? 'red' : 'green'"
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
    <!-- card -->
    <v-card :width="isMobile ? '350px' : '700px'">
      <div class="logo py-4 d-flex justify-center">
        <v-icon x-large class="theme-color"> mdi-domain </v-icon>
        <v-card-title class="text-h3">
          Build<span class="rounded-lg px-2 theme-bg-color" style="color: white"
            >Vue</span
          >
        </v-card-title>
      </div>
      <v-card-text>
        <p
          v-if="validate"
          id="login-card-sub-heading"
          class="red--text red lighten-4 pa-4 rounded"
        >
          {{ validate }}
        </p>
        <div
          v-if="errorLogin"
          class="mt-2 mx-8 red lighten-4 rounded red--text pa-3"
        >
          <small>{{ errorLogin }}</small>
        </div>
        <!--card Heading -->
        <v-card-title>
          <p id="login-card-heading" class="font-weight-bold theme-color">
            Login
          </p>
          <!-- <p>to get started with Task Timer</p> -->
        </v-card-title>
        <v-form
          id="login-form"
          ref="form"
          v-model="valid"
          lazy-validation
          autocomplete="off"
        >
          <!-- email Input Field -->
          <label for="Email">Email Address *</label>
          <v-text-field
            v-model="username"
            color="yellow darken-2"
            outlined
            :rules="emailValidation"
            @focus="focus"
          ></v-text-field>
          <!-- Password Input Field -->
          <label for="Password">Password *</label>
          <v-text-field
            v-model="password"
            color="yellow darken-2"
            outlined
            :rules="passwordValidation"
            :append-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
            :type="visible ? 'text' : 'password'"
            class="mb-n7"
            @click:append="visible = !visible"
            @keydown.enter="login()"
            @focus="focus"
          ></v-text-field>
          <!-- CheckBox Field -->
          <!-- <v-row align="center" class="mx-1">
            <v-spacer></v-spacer>
            <router-link
              id="forget-password-link"
              to="/forget-password"
              class="text-decoration-none subtitle success-text"
              >Forgot Password?</router-link
            >
          </v-row> -->
          <!-- Login button -->
          <v-btn
            :disabled="!valid"
            width="60%"
            class="theme-bg-color white--text mx-auto text-capitalize mt-5 white--text align-center d-flex"
            @click="login"
          >
            Login
            <v-progress-circular
              v-if="loader"
              indeterminate
              class="ml-2"
            ></v-progress-circular>
          </v-btn>

          <!--SignUp Page Redirect Text -->
          <!-- <p class="mt-1 subtitle ml-1 justify-center align-center d-flex">
            Don't have an account?
            <router-link
              id="signup-link"
              to=""
              class="text-decoration-none success-text ml-2"
              >Sign Up</router-link
            >
          </p> -->
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { emailRules, passwordRules } from '../../validations/validations'
import snackbarMixin from '../../mixins/snackbar'
export default {
  name: 'LoginPage',
  middleware: 'auth',
  mixins: [snackbarMixin],
  data() {
    return {
      username: null,
      validate: '',
      loader: false,
      errorLogin: '',
      visible: false,
      valid: true,
      password: null,
      emailValidation: emailRules,
      passwordValidation: passwordRules,
      updateTaskError: null,
      snackbar: false,
      snackbarMessage: null,
      autofilled: false,
    }
  },
  computed: {
    isMobile() {
      return this.$breakpoints.sm || this.$breakpoints.sSm
    },
  },
  methods: {
    ...mapActions(['loginUser', 'logout']),
    login() {
      const loginCreds = {
        client_id: 2,
        client_secret: process.env.client_secret,
        username: this.username,
        password: this.password,
        grant_type: 'password',
      }
      if (this.username && this.password) {
        this.loader = true
        this.loginUser(loginCreds)
          .then((res) => {
            this.loader = false
            if (!res.companies?.length) {
              this.logout()
              localStorage.removeItem('setSelectedCompany')
              this.showSnackbar(
                true,
                'You do not belong to any company. Please contact the administrator',
                true
              )
            }
          })
          .catch((err) => {
            this.loader = false
            if (err.response.status)
              this.showSnackbar(
                true,
                'Please enter the valid credentials!',
                true
              )
          })
      } else this.showSnackbar(true, 'Please enter all the credentials!', true)
    },
    focus() {
      this.validate = ''
      this.errorLogin = ''
    },
  },
}
</script>
<style>
.logo {
  opacity: 0.9;
}
</style>
