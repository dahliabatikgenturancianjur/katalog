import { createRoute } from 'honox/factory'
import { getCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'

export default createRoute(async (c, next) => {
  // 1. Loloskan rute halaman login agar tidak terjadi infinite loop
  if (c.req.path === '/admin/login') {
    await next()
    return
  }

  // 2. Cek ketersediaan cookie
  const token = getCookie(c, 'admin_token')
  if (!token) {
    return c.redirect('/admin/login')
  }

  // 3. Verifikasi JWT di dalam blok try-catch secara mandiri
  try {
    await verify(token, c.env.JWT_SECRET)
  } catch (err) {
    return c.redirect('/admin/login')
  }

  // 4. Jalankan halaman dashboard DI LUAR blok try-catch
  await next()
})
