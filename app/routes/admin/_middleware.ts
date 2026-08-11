import { createRoute } from 'honox/factory'
import { getCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'

export default createRoute(async (c, next) => {
  console.log(`[MIDDLEWARE TRACKING] A. Mengakses rute: ${c.req.path}`);

  if (c.req.path === '/admin/login') {
    console.log("[MIDDLEWARE TRACKING] B. Rute adalah halaman login, meloloskan akses...");
    await next()
    return
  }

  const token = getCookie(c, 'admin_token')
  if (!token) {
    console.log("[MIDDLEWARE TRACKING] C. GAGAL: Cookie 'admin_token' TIDAK DITEMUKAN dari browser. Redirect ke login.");
    return c.redirect('/admin/login')
  }

  console.log("[MIDDLEWARE TRACKING] D. Cookie ditemukan, mencoba verifikasi JWT...");
  try {
    await verify(token, c.env.JWT_SECRET)
    console.log("[MIDDLEWARE TRACKING] E. SUKSES: Verifikasi JWT berhasil. Membuka dashboard...");
  } catch (err) {
    console.error("[MIDDLEWARE ERROR FATAL] F. GAGAL: Verifikasi JWT gagal (Token tidak valid atau JWT_SECRET salah):", err);
    return c.redirect('/admin/login')
  }

  await next()
})
