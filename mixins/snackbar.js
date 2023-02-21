export default {
  data() {
    return {}
  },
  methods: {
    showSnackbar(flag, message, color) {
      this.$nuxt.$emit('show-snackbar', {
        snackbarMessagecolor: color,
        snackbarMessage: message,
        snackbar: flag,
      })
    },
  },
}
