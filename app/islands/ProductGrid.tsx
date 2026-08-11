import { useState } from 'hono/jsx'

type ProductImage = { id: number; url: string }
type Product = { id: number; name: string; description: string; images: ProductImage[] }

export default function ProductGrid({ products, totalPages, currentPage, waNumber }: { products: Product[], totalPages: number, currentPage: number, waNumber: string }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  const openModal = (product: Product) => {
    setSelectedProduct(product)
    setCurrentSlide(0)
  }

  const closeModal = () => {
    setSelectedProduct(null)
  }

  const nextSlide = () => {
    if (selectedProduct && currentSlide < selectedProduct.images.length - 1) setCurrentSlide(currentSlide + 1)
  }

  const prevSlide = () => {
    if (selectedProduct && currentSlide > 0) setCurrentSlide(currentSlide - 1)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div>
      <div class="mb-8">
        <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Katalog Produk</h1>
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center no-print gap-4 mt-4">
          <h2 class="text-xl font-semibold text-gray-600">Koleksi Kami</h2>
          <button onClick={handlePrint} class="w-full md:w-auto bg-gray-800 text-white px-6 py-3 md:py-2 rounded-lg shadow hover:bg-gray-700 transition-colors font-medium">
            🖨️ Print Katalog
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div class="text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm border">
          Belum ada produk yang ditampilkan di halaman ini.
        </div>
      ) : (
        <div class="print-area grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <div key={product.id} onClick={() => openModal(product)} class="cursor-pointer bg-white border rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden group">
              <div class="w-full h-40 md:h-56 bg-gray-200 overflow-hidden relative">
                {product.images.length > 0 ? (
                  <img src={product.images[0].url} alt={product.name} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div class="flex items-center justify-center h-full text-gray-400 text-sm">No Image</div>
                )}
              </div>
              <div class="p-4">
                <h3 class="font-bold text-lg mb-1 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                <p class="text-sm text-gray-500 line-clamp-2">{product.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RENDER PAGINASI DI SINI */}
      {totalPages > 1 && (
        <div class="flex flex-wrap justify-center mt-10 gap-2 no-print">
          {Array.from({ length: totalPages }).map((_, i) => (
            <a key={i} href={`/?page=${i + 1}`} class={`px-4 py-2 border rounded-lg font-medium transition-colors ${currentPage === i + 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              {i + 1}
            </a>
          ))}
        </div>
      )}

      {selectedProduct && (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 md:p-0 no-print" onClick={closeModal}>
          <div class="bg-white w-full md:w-11/12 max-w-4xl rounded-2xl shadow-2xl overflow-hidden print-area relative flex flex-col md:flex-row max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModal} class="absolute top-3 right-3 bg-white bg-opacity-90 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200 no-print z-20 shadow text-xl font-bold">&times;</button>
            
            <div class="relative w-full md:w-1/2 h-64 md:h-auto bg-gray-100 flex items-center justify-center shrink-0">
              {selectedProduct.images.length > 0 ? (
                <img src={selectedProduct.images[currentSlide].url} alt={selectedProduct.name} class="w-full h-full object-contain" />
              ) : (
                <span class="text-gray-400">Tidak ada gambar</span>
              )}
              
              {selectedProduct.images.length > 1 && (
                <div class="absolute inset-0 flex items-center justify-between px-2 no-print">
                  <button onClick={prevSlide} disabled={currentSlide === 0} class="bg-white bg-opacity-90 rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-30 shadow hover:bg-gray-50 transition-all">
                    &#8592;
                  </button>
                  <button onClick={nextSlide} disabled={currentSlide === selectedProduct.images.length - 1} class="bg-white bg-opacity-90 rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-30 shadow hover:bg-gray-50 transition-all">
                    &#8594;
                  </button>
                </div>
              )}
            </div>

            <div class="p-6 md:p-8 flex flex-col justify-between w-full md:w-1/2 overflow-y-auto">
              <div>
                <h2 class="text-2xl md:text-3xl font-bold mb-4">{selectedProduct.name}</h2>
                <p class="text-gray-600 mb-8 whitespace-pre-wrap leading-relaxed">{selectedProduct.description}</p>
              </div>
              
              <div class="flex flex-col sm:flex-row gap-3 no-print mt-auto">
                <a href={`https://wa.me/${waNumber}?text=Halo, saya ingin bertanya tentang produk: ${encodeURIComponent(selectedProduct.name)}`} target="_blank" class="flex-1 bg-green-500 hover:bg-green-600 text-white text-center font-bold py-3 md:py-4 rounded-xl transition-colors shadow-sm">
                  Tanya via WhatsApp
                </a>
                <button onClick={handlePrint} class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 md:py-4 rounded-xl transition-colors">
                  🖨️ Print Produk
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
