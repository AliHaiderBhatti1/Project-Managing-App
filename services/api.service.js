const axios = require('axios').default

const baseUrl = process.env.baseURL

const ApiService = {
  get: (endpoint, token) => {
    if (!token) {
      return axios.get(`${baseUrl}${endpoint}`)
    }
    const customAxios = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return customAxios.get(`${baseUrl}${endpoint}`)
  },
  post: (endpoint, token, body) => {
    if (!token) {
      return axios.post(`${baseUrl}${endpoint}`, body)
    }
    const customAxios = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return customAxios.post(`${baseUrl}${endpoint}`, body)
  },
  delete: (endpoint, token) => {
    const customAxios = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return customAxios.delete(`${baseUrl}${endpoint}`)
  },
}

export default ApiService
