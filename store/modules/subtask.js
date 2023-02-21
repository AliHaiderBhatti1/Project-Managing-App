import authAxios from '../../services/api.service.js'

const _unionBy = require('lodash/unionBy')

const state = {
  subTasks: [],
  subTaskLastPage: null,
}

const getters = {
  getSubTasks: (state) => state.subTasks,
  getSubTasksLastPage: (state) => state.subTaskLastPage,
}

const mutations = {
  setSubTasks: (state, payload) => {
    state.subTasks = _unionBy(state.subTasks, payload, 'id')
  },
  setEmptySubTasks: (state, payload) => (state.subTasks = payload),
  setSubTaskLastPage: (state, payload) => (state.subTaskLastPage = payload),
  setNewSubTask: (state, payload) => state.subTasks.unshift(payload),
  setUpdateSubTask: (state, payload) => {
    const id = state.subTasks.findIndex((item) => {
      return item.id === payload.id
    })
    Object.assign(state.subTasks[id], payload)
  },
  setRemoveSubTask: (state, payload) => {
    state.subTasks = state.subTasks.filter((item) => {
      return item.id !== payload
    })
  },
}

const actions = {
  fetchSubTasks({ commit, getters }, data) {
    return new Promise((resolve, reject) => {
      authAxios
        .get(
          `companies/${getters.getSelectedCompany.id}/projects/${data.projectId}/phases/${data.phaseId}/tasks/${data.taskId}/subtasks?page=${data.currentPage}`,
          getters.getToken
        )
        .then((response) => {
          commit('setSubTasks', response.data.data)
          commit('setSubTaskLastPage', response.data.meta.last_page)
          resolve(response)
        })
        .catch((err) => {
          reject(err)
        })
    })
  },
  createSubTask({ getters, commit }, data) {
    return new Promise((resolve, reject) => {
      authAxios
        .post(
          `companies/${getters.getSelectedCompany.id}/projects/${data.project_id}/phases/${data.phase_id}/tasks/${data.task_id}/subtasks`,
          getters.getToken,
          data.formData
        )
        .then((res) => {
          commit('setNewSubTask', res.data.data)
          resolve(res)
        })
        .catch((err) => {
          reject(err.response)
        })
    })
  },
  updateSubTask({ commit, getters }, data) {
    return new Promise((resolve, reject) => {
      authAxios
        .post(
          `companies/${data.company_id}/projects/${data.project_id}/phases/${data.phase_id}/tasks/${data.task_id}/subtasks/${data.subtask_id}?company_id=${data.company_id}&project_id=${data.project_id}&phase_id=${data.phase_id}&task_id=${data.task_id}&subtask_id=${data.subtask_id}`,
          getters.getToken,
          data.formData
        )
        .then((res) => {
          commit('setUpdateSubTask', res.data.data)
          resolve(res)
        })
        .catch((err) => {
          reject(err.response)
        })
    })
  },
  deleteSubTask({ commit, getters }, data) {
    return new Promise((resolve, reject) => {
      authAxios
        .delete(
          `companies/${data.company_id}/projects/${data.project_id}/phases/${data.phase_id}/tasks/${data.task_id}/subtasks/${data.subtask_id}?company_id=${data.company_id}&project_id=${data.project_id}&phase_id=${data.phase_id}&task_id=${data.task_id}&subtask_id=${data.subtask_id}`,
          getters.getToken
        )
        .then((res) => {
          commit('setRemoveSubTask', data.subtask_id)
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
