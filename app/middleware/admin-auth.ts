export default defineNuxtRouteMiddleware(async () => {
  const requestFetch = useRequestFetch()
  const me = await requestFetch<{ authenticated: boolean }>('/api/auth/me')
  if (!me.authenticated) {
    return navigateTo('/admin/login')
  }
})
