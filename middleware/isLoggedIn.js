export default function ({ app }) {
  app.router.beforeResolve((to, from, next) => {
    const token = localStorage.getItem('auth._token.local')
    if (to.path === '/login' && token) next('/projects')
    else next()
  })
}
