<template>
  <div>
    <PhasesList></PhasesList>
  </div>
</template>
<script>
export default {
  middleware: 'auth',
  components: {
    PhasesList: () => import('../../components/Phases/PhasesList.vue'),
  },
}
</script>
