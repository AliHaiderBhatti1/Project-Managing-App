<template>
  <div>
    <TasksList></TasksList>
  </div>
</template>
<script>
export default {
  middleware: 'auth',
  components: {
    TasksList: () => import('../../components/Tasks/TasksList.vue'),
  },
}
</script>
