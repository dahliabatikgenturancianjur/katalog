import { createRoute } from 'honox/factory'
import { setCookie } from 'hono/cookie'
import { sign } from 'hono/jwt'

// Handler untuk menampilkan halaman login (GET)
export default createRoute(async (c) => {
  return c.render(
    <div class="max-w-md mx-auto mt-20 bg-white p-8 border rounded-xl shadow-sm">
      <h2 class="text-2xl font-bold mb-6 text-center">Admin Login</h2>
      <form method="POST" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Username</label>
          <input type="text" name="username" class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Password</label>
          <input type="password" name="password" class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
        </div>
        <button type="submit" class="w-full bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700">Login</button>
      </form>
    </div>
  )
})

// Handler untuk memproses form login (POST)
export const POST = createRoute(async (c) => {
  console.log("[LOGIN TRACKING] 1. POST request diterima di halaman login.");
  
  const body = await c.req.parseBody()
  const username = body['username'] as string
  const password = body['password'] as string

  console.log(`[LOGIN TRACKING] 2. Mencoba login dengan username: ${username}`);

  try {
    const user = await c.env.DB.prepare("SELECT * FROM users WHERE username = ? AND password = ?").bind(username, password).first()
    
    if (user) {
      console.log("[LOGIN TRACKING] 3. User ditemukan di database. Mulai membuat Token JWT.");
      const token = await sign({ id: user.id, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 }, c.env.JWT_SECRET)
      
      console.log("[LOGIN TRACKING] 4. Token berhasil dibuat. Menyimpan Cookie ke browser...");
      setCookie(c, 'admin_token', token, { path: '/', httpOnly: true, secure: true })
      
      console.log("[LOGIN TRACKING] 5. Cookie diset. Redirect ke /admin");
      return c.redirect('/admin')
    } else {
      console.log("[LOGIN TRACKING] X. Gagal: Username atau password salah.");
      const error = 'Username atau Password salah!'
      return c.render(
        <div class="max-w-md mx-auto mt-20 bg-white p-8 border rounded-xl shadow-sm">
          <h2 class="text-2xl font-bold mb-6 text-center">Admin Login</h2>
          <div class="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>
          <form method="POST" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Username</label>
              <input type="text" name="username" class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Password</label>
              <input type="password" name="password" class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <button type="submit" class="w-full bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700">Login</button>
          </form>
        </div>
      )
    }
  } catch (error) {
    console.error("[LOGIN ERROR FATAL] Terjadi kesalahan server saat login:", error);
    return c.text("Terjadi kesalahan fatal saat login. Cek Log Cloudflare.", 500)
  }
})
