import { createRoute } from 'honox/factory'
import { setCookie } from 'hono/cookie'
import { sign } from 'hono/jwt'

// Handler GET tetap sama
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

// Handler POST diperbaiki
export const POST = createRoute(async (c) => {
  const body = await c.req.parseBody()
  const username = body['username'] as string
  const password = body['password'] as string

  const user = await c.env.DB.prepare("SELECT * FROM users WHERE username = ? AND password = ?").bind(username, password).first()
  
  if (user) {
    // PERBAIKAN: Tambahkan 'HS256' sebagai parameter ketiga
    const token = await sign({ id: user.id, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 }, c.env.JWT_SECRET, 'HS256')
    setCookie(c, 'admin_token', token, { path: '/', httpOnly: true, secure: true })
    return c.redirect('/admin')
  } else {
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
})
