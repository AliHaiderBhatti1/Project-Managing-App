import authAxios from '../../services/api.service.js'

const _unionBy = require('lodash/unionBy')

const state = {
  tasks: [],
  taskLastPage: null,
}

const getters = {
  getTasks: (state) => state.tasks,
  getTasksLastPage: (state) => state.taskLastPage,
}

const mutations = {
  setTasks: (state, payload) => {
    state.tasks = _unionBy(state.tasks, payload, 'id')
  },
  setEmptyTasks: (state, payload) => (state.tasks = payload),
  setTaskLastPage: (state, payload) => (state.taskLastPage = payload),
  setNewTask: (state, payload) => state.tasks.unshift(payload),
  setUpdateTask: (state, payload) => {
    const id = state.tasks.findIndex((item) => {
      return item.id === payload.id
    })
    Object.assign(state.tasks[id], payload)
  },
  setRemoveTask: (state, payload) => {
    state.tasks = state.tasks.filter((item) => {
      return item.id !== payload
    })
  },
}

const actions = {
  fetchTasks({ commit, getters }, data) {
    return new Promise((resolve, reject) => {
      authAxios
        .get(
          `companies/${getters.getSelectedCompany.id}/projects/${data.projectId}/phases/${data.phaseId}/tasks?page=${data.currentPage}`,
          getters.getToken
        )
        .then((response) => {
          commit('setTasks', response.data.data)
          commit('setTaskLastPage', response.data.meta.last_page)
          resolve(response)
        })
        .catch((err) => {
          reject(err)
        })
    })
  },
  createTask({ getters, commit }, data) {
    return new Promise((resolve, reject) => {
      authAxios
        .post(
          `companies/${getters.getSelectedCompany.id}/projects/${data.project_id}/phases/${data.phase_id}/tasks`,
          getters.getToken,
          data.formData
        )
        .then((res) => {
          commit('setNewTask', res.data.data)
          resolve(res)
        })
        .catch((err) => {
          reject(err.response)
        })
    })
  },
  updateTask({ commit, getters }, data) {
    return new Promise((resolve, reject) => {
      authAxios
        .post(
          `companies/${data.company_id}/projects/${data.project_id}/phases/${data.phase_id}/tasks/${data.task_id}?company_id=${data.company_id}&project_id=${data.project_id}&phase_id=${data.phase_id}&task_id=${data.task_id}`,
          getters.getToken,
          data.formData
        )
        .then((res) => {
          commit('setUpdateTask', res.data.data)
          resolve(res)
        })
        .catch((err) => {
          reject(err.response)
        })
    })
  },
  deleteTask({ commit, getters }, data) {
    return new Promise((resolve, reject) => {
      authAxios
        .delete(
          `companies/${data.company_id}/projects/${data.project_id}/phases/${data.phase_id}/tasks/${data.task_id}?company_id=${data.company_id}&project_id=${data.project_id}&phase_id=${data.phase_id}&task_id=${data.task_id}`,
          getters.getToken
        )
        .then((res) => {
          commit('setRemoveTask', data.task_id)
          resolve(res)
        })
        .catch((err) => {
          reject(err.response)
        })
    })
  },
  getSingleTask({ commit, getters }, data) {
    return new Promise((resolve, reject) => {
      authAxios
        .get(
          `companies/${getters.getSelectedCompany.id}/projects/${data.project_id}/phases/${data.phase_id}/tasks/${data.task_id}?company_id=${data.company_id}&project_id=${data.project_id}&phase_id=${data.phase_id}&task_id=${data.task_id}`,
          getters.getToken,
          data.formData
        )
        .then((res) => {
          commit('setUpdateTask', res.data.data)
          resolve(res)
        })
        .catch((err) => {
          reject(err.response)
        })
    })
  },
}

export default {
  state,
  getters,
  mutations,
  actions,
}
