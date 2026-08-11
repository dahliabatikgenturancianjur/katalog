import { createRoute } from 'honox/factory'

// Fungsi untuk upload gambar ke Cloudinary via API
async function uploadToCloudinary(file: File, cloudName: string, apiKey: string, apiSecret: string): Promise<string> {
  const timestamp = Math.round((new Date()).getTime() / 1000).toString()
  const msgBuffer = new TextEncoder().encode(`timestamp=${timestamp}${apiSecret}`)
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  const formData = new FormData()
  formData.append("file", file)
  formData.append("timestamp", timestamp)
  formData.append("api_key", apiKey)
  formData.append("signature", signature)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData
  })
  const data = await res.json()
  return data.secure_url
}

// Fungsi utama untuk me-render Dashboard beserta form-form di dalamnya
async function renderDashboard(c: any, message: string = '') {
  const { results: settingsRaw } = await c.env.DB.prepare("SELECT * FROM settings").all()
  const waNumber = settingsRaw.find((s: any) => s.key === 'whatsapp_number')?.value || ''
  const itemsPerPage = settingsRaw.find((s: any) => s.key === 'items_per_page')?.value || ''
  const logoUrl = settingsRaw.find((s: any) => s.key === 'logo_url')?.value || ''
  
  const { results: products } = await c.env.DB.prepare("SELECT * FROM products ORDER BY id DESC").all()

  return c.render(
    <div class="space-y-6 md:space-y-8 pb-10">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-xl shadow-sm border border-gray-100 gap-4">
        <h2 class="text-2xl font-bold text-gray-800">Dashboard Admin</h2>
        <a href="/" class="w-full sm:w-auto text-center bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors">
          Lihat Web &rarr;
        </a>
      </div>

      {message && (
        <div class="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg shadow-sm font-medium">
          {message}
        </div>
      )}

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Panel Config */}
        <div class="bg-white p-5 md:p-7 border rounded-xl shadow-sm">
          <h3 class="text-xl font-bold border-b pb-3 mb-5 text-gray-800">Pengaturan Web</h3>
          <form method="POST" enctype="multipart/form-data" class="space-y-5">
            <input type="hidden" name="action" value="update_settings" />
            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-700">Nomor WhatsApp</label>
              <input type="text" name="whatsapp_number" value={waNumber} placeholder="Contoh: 62812..." class="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-700">Jumlah Produk Per Halaman</label>
              <input type="number" name="items_per_page" value={itemsPerPage} class="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-700">Upload Logo Header (Opsional)</label>
              {logoUrl && <img src={logoUrl} alt="Current Logo" class="h-12 mb-3 object-contain" />}
              <input type="file" name="logo" accept="image/*" class="w-full border border-gray-300 p-2 rounded-lg bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              <p class="text-xs text-gray-500 mt-2">Biarkan kosong jika tidak ingin mengubah logo.</p>
            </div>
            <button type="submit" class="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm">Simpan Pengaturan</button>
          </form>
        </div>

        {/* Panel Tambah Produk */}
        <div class="bg-white p-5 md:p-7 border rounded-xl shadow-sm">
          <h3 class="text-xl font-bold border-b pb-3 mb-5 text-gray-800">Tambah Produk Baru</h3>
          <form method="POST" enctype="multipart/form-data" class="space-y-5">
            <input type="hidden" name="action" value="add_product" />
            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-700">Nama Produk</label>
              <input type="text" name="name" class="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:green-blue-500 outline-none transition-all" required />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-700">Deskripsi</label>
              <textarea name="description" rows={4} class="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none" required></textarea>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-700">Gambar Galeri (Bisa Pilih Banyak)</label>
              <input type="file" name="images" multiple accept="image/*" class="w-full border border-gray-300 p-2 rounded-lg bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" required />
            </div>
            <button type="submit" class="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm">Simpan Produk</button>
          </form>
        </div>
      </div>

      {/* Tabel Manajemen Produk */}
      <div class="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div class="p-5 md:p-7 border-b">
          <h3 class="text-xl font-bold text-gray-800">Daftar Produk ({products.length})</h3>
        </div>
        <div class="overflow-x-auto w-full">
          <table class="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr class="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <th class="p-4 font-semibold">ID</th>
                <th class="p-4 font-semibold">Nama Produk</th>
                <th class="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              {products.map((p: any) => (
                <tr key={p.id} class="hover:bg-blue-50 transition-colors">
                  <td class="p-4 text-sm text-gray-500 font-medium">#{p.id}</td>
                  <td class="p-4 font-semibold text-gray-800">{p.name}</td>
                  <td class="p-4 text-right">
                    <form method="POST" onSubmit={(e) => { if(!confirm('Yakin ingin menghapus produk ini secara permanen?')) e.preventDefault() }} class="inline-block">
                      <input type="hidden" name="action" value="delete_product" />
                      <input type="hidden" name="product_id" value={p.id} />
                      <button type="submit" class="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors shadow-sm">Hapus</button>
                    </form>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={3} class="p-8 text-center text-gray-500 italic">Belum ada produk di dalam katalog.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Handler untuk Request GET (Membuka Dashboard)
export default createRoute(async (c) => {
  return renderDashboard(c)
})

// Handler untuk Request POST (Update Setting, Tambah/Hapus Produk)
export const POST = createRoute(async (c) => {
  let message = ''
  const body = await c.req.parseBody({ all: true })
  const action = body['action']

  if (action === 'update_settings') {
    const waNumber = body['whatsapp_number'] as string
    const itemsPerPage = body['items_per_page'] as string
    const logoFile = body['logo']
    
    await c.env.DB.prepare("UPDATE settings SET value = ? WHERE key = 'whatsapp_number'").bind(waNumber).run()
    await c.env.DB.prepare("UPDATE settings SET value = ? WHERE key = 'items_per_page'").bind(itemsPerPage).run()
    
    if (logoFile instanceof File && logoFile.size > 0) {
      try {
        const url = await uploadToCloudinary(logoFile, c.env.CLOUDINARY_CLOUD_NAME, c.env.CLOUDINARY_API_KEY, c.env.CLOUDINARY_API_SECRET)
        if (url) {
          await c.env.DB.prepare("UPDATE settings SET value = ? WHERE key = 'logo_url'").bind(url).run()
        }
      } catch (e) {
        console.error("Gagal upload logo", e)
      }
    }
    message = 'Pengaturan dan/atau Logo berhasil diperbarui.'
  } 
  else if (action === 'add_product') {
    const name = body['name'] as string
    const description = body['description'] as string
    const files = (Array.isArray(body['images']) ? body['images'] : [body['images']]).filter(f => f instanceof File && f.size > 0) as File[]
    
    const insertResult = await c.env.DB.prepare("INSERT INTO products (name, description) VALUES (?, ?) RETURNING id").bind(name, description).first()
    const productId = insertResult?.id

    if (productId && files.length > 0) {
      for (const file of files) {
        try {
          const url = await uploadToCloudinary(file, c.env.CLOUDINARY_CLOUD_NAME, c.env.CLOUDINARY_API_KEY, c.env.CLOUDINARY_API_SECRET)
          if (url) {
            await c.env.DB.prepare("INSERT INTO product_images (product_id, url) VALUES (?, ?)").bind(productId, url).run()
          }
        } catch (e) {
          console.error("Gagal upload gambar galeri", e)
        }
      }
    }
    message = 'Produk berhasil ditambahkan.'
  }
  else if (action === 'delete_product') {
    const productId = body['product_id'] as string
    await c.env.DB.prepare("DELETE FROM products WHERE id = ?").bind(productId).run()
    message = 'Produk berhasil dihapus.'
  }

  return renderDashboard(c, message)
})
