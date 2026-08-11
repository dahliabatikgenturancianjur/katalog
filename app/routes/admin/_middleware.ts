import { createRoute } from 'honox/factory'
import { getCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'

export default createRoute(async (c, next) => {
  if (c.req.path === '/admin/login') {
    await next()
    return
  }

  const token = getCookie(c, 'admin_token')
  if (!token) {
    return c.redirect('/admin/login')
  }

  try {
    await verify(token, c.env.JWT_SECRET)
    await next()
  } catch (err) {
    return c.redirect('/admin/login')
  }
})
