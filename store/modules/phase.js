import authAxios from '../../services/api.service.js'

const _unionBy = require('lodash/unionBy')

const state = {
  phases: [],
  phaseLastPage: null,
}

const getters = {
  getPhases: (state) => state.phases,
  getPhasesLastPage: (state) => state.phaseLastPage,
}

const mutations = {
  setPhases: (state, payload) => {
    state.phases = _unionBy(state.phases, payload, 'id')
  },
  setEmptyPhases: (state, payload) => (state.phases = payload),
  setPhaseLastPage: (state, payload) => (state.phaseLastPage = payload),
  setNewPhase: (state, payload) => state.phases.unshift(payload),
  setUpdatePhase: (state, payload) => {
    const id = state.phases.findIndex((item) => {
      return item.id === payload.id
    })
    Object.assign(state.phases[id], payload)
  },
  setRemovePhase: (state, payload) => {
    state.phases = state.phases.filter((item) => {
      return item.id !== payload
    })
  },
}

const actions = {
  fetchPhases({ commit, getters }, data) {
    return new Promise((resolve, reject) => {
      authAxios
        .get(
          `companies/${getters.getSelectedCompany.id}/projects/${data.projectId}/phases?page=${data.currentPage}`,
          getters.getToken
        )
        .then((response) => {
          commit('setPhases', response.data.data)
          commit('setPhaseLastPage', response.data.meta.last_page)
          resolve(response)
        })
        .catch((err) => {
          reject(err)
        })
    })
  },
  createPhase({ getters, commit }, data) {
    return new Promise((resolve, reject) => {
      authAxios
        .post(
          `companies/${getters.getSelectedCompany.id}/projects/${data.project_id}/phases`,
          getters.getToken,
          data.formData
        )
        .then((res) => {
          commit('setNewPhase', res.data.data)
          resolve(res)
        })
        .catch((err) => {
          reject(err.response)
        })
    })
  },
  updatePhase({ commit, getters }, data) {
    return new Promise((resolve, reject) => {
      authAxios
        .post(
          `companies/${data.company_id}/projects/${data.project_id}/phases/${data.phase_id}?company_id=${data.company_id}&project_id=${data.project_id}&phase_id=${data.phase_id}`,
          getters.getToken,
          data.formData
        )
        .then((res) => {
          commit('setUpdatePhase', res.data.data)
          resolve(res)
        })
        .catch((err) => {
          reject(err.response)
        })
    })
  },
  deletePhase({ commit, getters }, data) {
    return new Promise((resolve, reject) => {
      authAxios
        .delete(
          `companies/${data.company_id}/projects/${data.project_id}/phases/${data.phase_id}?company_id=${data.company_id}&project_id=${data.project_id}&phase_id=${data.phase_id}`,
          getters.getToken
        )
        .then((res) => {
          commit('setRemovePhase', data.phase_id)
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
