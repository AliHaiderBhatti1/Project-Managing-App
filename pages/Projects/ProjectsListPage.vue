<template>
  <div>
    <ProjectsList></ProjectsList>
  </div>
</template>
<script>
export default {
  middleware: 'auth',
  components: {
    ProjectsList: () => import('../../components/Projects/ProjectsList.vue'),
  },
}
</script>
