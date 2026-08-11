import { jsxRenderer } from 'hono/jsx-renderer'
import { Script } from 'honox/server'

export default jsxRenderer(({ children, title }) => {
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
            <h1 class="text-xl font-bold text-blue-600">Katalog Produk</h1>
            <a href="/admin" class="text-sm text-gray-500 hover:text-blue-500">Admin Area</a>
          </div>
        </nav>
        <main class="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
})
