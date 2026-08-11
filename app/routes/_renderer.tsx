import { jsxRenderer } from 'hono/jsx-renderer'
import { Script } from 'honox/server'

export default jsxRenderer(async ({ children, title }, c) => {
  let logoUrl = ''
  try {
    const logoResult = await c.env.DB.prepare("SELECT value FROM settings WHERE key = 'logo_url'").first()
    if (logoResult && logoResult.value) {
      logoUrl = logoResult.value as string
    }
  } catch (e) {
    // Abaikan jika DB belum siap
  }

  return (
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title || 'Katalog Produk'}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="/app/style.css" />
        <Script src="/app/client.ts" async />
      </head>
      <body class="bg-gray-50 text-gray-800 min-h-screen">
        <nav class="bg-white shadow-sm no-print">
          <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div class="flex items-center">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" class="h-10 md:h-12 object-contain" />
              ) : (
                <span class="text-gray-400 italic text-sm">Logo belum diatur</span>
              )}
            </div>
            <a href="/admin" class="text-sm font-medium text-gray-500 hover:text-blue-600 bg-gray-100 px-4 py-2 rounded-lg transition-colors">Area Admin</a>
          </div>
        </nav>
        <main class="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
})
