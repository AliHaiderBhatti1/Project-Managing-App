<template>
  <div><Login></Login></div>
</template>
<script>
export default {
  middleware: 'auth',
  components: {
    Login: () => import('../../components/Login/Login.vue'),
  },
}
</script>
