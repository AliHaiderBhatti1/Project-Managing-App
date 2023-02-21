import authAxios from '../../services/api.service.js'

const _unionBy = require('lodash/unionBy')

const state = {
  projects: [],
  selectedProject: null,
  lastPage: null,
}
const getters = {
  getProjects: (state) => state.projects,
  getSelectedProject: (state) => state.selectedProject,
  getLastPage: (state) => state.lastPage,
}
const mutations = {
  setProjects: (state, data) => {
    // state.projects = state.projects.concat(data)
    state.projects = _unionBy(state.projects, data, 'id')
  },
  setSelectedProject: (state, data) => (state.selectedProject = data),
  setEmptyProjects: (state, data) => (state.projects = data),
  setNewProject: (state, data) => state.projects.unshift(data),
  setLastPage: (state, data) => (state.lastPage = data),
  setRemoveProject: (state, data) => {
    state.projects = state.projects.filter((item) => {
      return item.id !== data
    })
  },
  setUpdateProject: (state, data) => {
    const id = state.projects.findIndex((item) => {
      return item.id === data.id
    })
    Object.assign(state.projects[id], data)
  },
}
const actions = {
  fetchProjects({ commit, getters }, currentPage) {
    return new Promise((resolve, reject) => {
      authAxios
        .get(
          `companies/${getters.getSelectedCompany.id}/projects?page=${currentPage}`,
          getters.getToken
        )
        .then((response) => {
          commit('setProjects', response.data.data)
          commit('setLastPage', response.data.meta.last_page)
          resolve(response)
        })
        .catch((err) => {
          reject(err)
        })
    })
  },
  createProject({ getters, commit }, data) {
    return new Promise((resolve, reject) => {
      authAxios
        .post(
          `companies/${getters.getSelectedCompany.id}/projects`,
          getters.getToken,
          data
        )
        .then((res) => {
          commit('setNewProject', res.data.data)
          resolve(res)
        })
        .catch((err) => {
          reject(err.response)
        })
    })
  },
  updateProject({ commit, getters }, data) {
    return new Promise((resolve, reject) => {
      authAxios
        .post(
          `companies/${data.company_id}/projects/${data.project_id}?company_id=${data.company_id}&project_id=${data.project_id}`,
          getters.getToken,
          data.formData
        )
        .then((res) => {
          commit('setUpdateProject', res.data.data)
          resolve(res)
        })
        .catch((err) => {
          reject(err.response)
        })
    })
  },
  deleteProject({ commit, getters }, data) {
    return new Promise((resolve, reject) => {
      authAxios
        .delete(
          `companies/${data.company_id}/projects/${data.project_id}?company_id=${data.company_id}&project_id=${data.project_id}`,
          getters.getToken
        )
        .then((res) => {
          commit('setRemoveProject', data.project_id)
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
