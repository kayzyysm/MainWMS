import React, { useState, useEffect } from 'react';
import { 
  Search, ShoppingCart, Tag, Sparkles, CreditCard, 
  Printer, CheckCircle2, Trash2, Plus, Minus, ChevronUp, 
  ChevronLeft, ChevronRight, QrCode, Store, Percent
} from 'lucide-react';

// รายการ Mock สินค้า (12 รายการ)
const PRODUCTS = [
  { id: 'p1', name: 'Logitech G Pro X Superlight 2', category: 'Gadgets', price: 4590, originalPrice: 4990, image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=600&auto=format&fit=crop', isSale: true, isRecommended: true, description: 'เมาส์เกมมิ่งไร้สายน้ำหนักเบาพิเศษ เซนเซอร์ HERO 2' },
  { id: 'p2', name: 'Keychron K2 Wireless Mechanical Keyboard', category: 'Gadgets', price: 3890, originalPrice: 3890, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=600&auto=format&fit=crop', isSale: false, isRecommended: true, description: 'คีย์บอร์ดไร้สายสวิตช์มินิมอล รองรับ Mac & Windows' },
  { id: 'p3', name: 'Monitor IPS 27" 180Hz Gaming', category: 'Gadgets', price: 5900, originalPrice: 6500, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600&auto=format&fit=crop', isSale: true, isRecommended: false, description: 'จอมอนิเตอร์ขอบบาง คมชัดระดับ 2K Refresh Rate High' },
  { id: 'p4', name: 'Sony WH-1000XM5 Headphones', category: 'Audio', price: 11900, originalPrice: 13900, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop', isSale: true, isRecommended: true, description: 'หูฟังตัดเสียงรบกวนระดับท็อป ตัดเสียงเงียบกริบ เสียงเบสทรงพลัง' },
  { id: 'p5', name: 'Ergonomic Desk Chair Mesh', category: 'Furniture', price: 8900, originalPrice: 8900, image: 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?q=80&w=600&auto=format&fit=crop', isSale: false, isRecommended: false, description: 'เก้าอี้เพื่อสุขภาพ ระบายอากาศดีเยี่ยม ปรับระดับหลังได้ครบ' },
  { id: 'p6', name: 'Smartwatch Series Pro Amoled', category: 'Gadgets', price: 4290, originalPrice: 4990, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop', isSale: true, isRecommended: false, description: 'นาฬิกาอัจฉริยะ วัดการออกกำลังกายและสุขภาพตลอด 24 ชม.' },
  { id: 'p7', name: 'Anker PowerBank 20,000mAh 87W', category: 'Accessories', price: 2190, originalPrice: 2490, image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?q=80&w=600&auto=format&fit=crop', isSale: true, isRecommended: false, description: 'พาวเวอร์แบงก์ชาร์จไว รองรับการชาร์จแล็ปท็อป USB-C' },
  { id: 'p8', name: 'Studio Condenser Microphone USB', category: 'Audio', price: 3200, originalPrice: 3500, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop', isSale: true, isRecommended: true, description: 'ไมโครโฟนคมชัดระดับสตูดิโอ เหมาะสำหรับสตรีมและพอดแคสต์' },
  { id: 'p9', name: 'Portable Bluetooth Speaker Bass+', category: 'Audio', price: 2890, originalPrice: 2890, image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=600&auto=format&fit=crop', isSale: false, isRecommended: false, description: 'ลำโพงบลูทูธกันน้ำ IPX7 แบตเตอรี่ใช้งานยาวนาน 15 ชม.' },
  { id: 'p10', name: 'Professional Mirrorless Camera 4K', category: 'Gadgets', price: 28900, originalPrice: 31900, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop', isSale: true, isRecommended: true, description: 'กล้องมิลเลอร์เลสไฟล์ภาพสวย คมชัด วิดีโอ 4K HDR' },
  { id: 'p11', name: 'Waterproof Everyday Backpack 20L', category: 'Accessories', price: 1890, originalPrice: 1890, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop', isSale: false, isRecommended: false, description: 'กระเป๋าเป้สะพายหลังกันน้ำ มีช่องใส่โน้ตบุ๊ก 15.6 นิ้ว' },
  { id: 'p12', name: 'Minimalist Minimal Desk Pad Leather', category: 'Furniture', price: 690, originalPrice: 890, image: 'https://images.unsplash.com/photo-1616440342855-5231713532f8?q=80&w=600&auto=format&fit=crop', isSale: true, isRecommended: false, description: 'แผ่นรองโต๊ะทำงานหนัง PU พรีเมียม กันน้ำ เช็ดทำความสะอาดง่าย' },
];

export default function StorefrontOutboundTerminal({ currentUser, onLogout }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [cart, setCart] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('promptpay');
  const [completedOrder, setCompletedOrder] = useState(null);

  // Carousel State
  const recommendedProducts = PRODUCTS.filter(p => p.isRecommended);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play Carousel
  useEffect(() => {
    if (recommendedProducts.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % recommendedProducts.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [recommendedProducts.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % recommendedProducts.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + recommendedProducts.length) % recommendedProducts.length);

  // Filter สินค้า
  const filteredProducts = PRODUCTS.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeFilter === 'sale') return matchesSearch && product.isSale;
    if (activeFilter === 'recommended') return matchesSearch && product.isRecommended;
    return matchesSearch;
  });

  // Cart Functions
  const handleAddToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const handleUpdateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Totals
  const subtotal = cart.reduce((sum, item) => sum + (item.originalPrice * item.qty), 0);
  const grandTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalDiscount = subtotal - grandTotal;
  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Payment & Receipt
  const handleConfirmPayment = () => {
    const orderData = {
      orderId: 'INV-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleString('th-TH'),
      items: [...cart],
      subtotal,
      discount: totalDiscount,
      grandTotal,
      paymentMethod,
      cashier: currentUser?.username || 'STAFF-01'
    };

    setCompletedOrder(orderData);
    setCart([]);
    setIsCheckoutOpen(false);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="p-6 bg-slate-900 h-screen font-sans flex gap-6 overflow-hidden">
      
      {/* CSS พิมพ์ใบเสร็จ A4 ซ่อน Header/Footer เบราว์เซอร์อย่างสมบูรณ์ */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            margin: 0; /* ซ่อน Title, URL, Page Number, Date ประจำเบราว์เซอร์ */
            size: A4 portrait;
          }
          body * {
            visibility: hidden;
          }
          #printable-outbound-receipt, #printable-outbound-receipt * {
            visibility: visible;
          }
          #printable-outbound-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 12mm !important; /* ระยะขอบกระดาษพิมพ์จริง */
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box !important;
          }
        }
      `}} />

      {/* 1. LEFT SIDEBAR */}
      <div className="w-[300px] lg:w-[320px] h-full bg-[#0b0f19] text-white flex flex-col justify-between p-7 shrink-0 overflow-hidden rounded-3xl border border-slate-800 shadow-xl print:hidden">
        <div className="absolute inset-0 z-0 opacity-30 mix-blend-luminosity pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=1000&auto=format&fit=crop"
            alt="Storefront"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/70 to-transparent" />
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-black tracking-widest text-white leading-none">STORE</h1>
          <p className="text-xl font-bold tracking-[0.25em] text-slate-300 mt-2">O U T B O U N D</p>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="bg-[#1a233a]/90 backdrop-blur-md border border-slate-700/60 rounded-2xl p-4 shadow-lg">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Outbound Cart Summary</span>
            <div className="flex justify-between items-baseline mt-2">
              <span className="text-xs text-slate-400">รายการในรถเข็น:</span>
              <span className="text-sm font-bold text-white">{totalItemsCount} ชิ้น</span>
            </div>
            <div className="flex justify-between items-baseline mt-1">
              <span className="text-xs text-slate-400">ยอดรวมชำระ:</span>
              <span className="text-xl font-black text-emerald-400">฿{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-[#1a233a]/85 backdrop-blur-md border border-slate-700/60 rounded-2xl px-5 py-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <ChevronUp className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-200">
                {currentUser?.username || 'Staff_Store'}
              </span>
            </div>
            {onLogout && (
              <button onClick={onLogout} className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors">
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. RIGHT MAIN CONTAINER */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 flex flex-col justify-between h-full print:hidden">
        
        {/* Header & Search */}
        <div className="border-b border-slate-100 pb-4 shrink-0 flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold uppercase tracking-wider border border-emerald-100 flex items-center gap-1.5">
                <Store size={13} /> Customer Storefront
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
              ระบบหน้าร้านและการจ่ายเงิน (Outbound POS)
            </h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="ค้นหาสินค้า หรือ หมวดหมู่..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Content Area Split */}
        <div className="flex gap-6 flex-1 min-h-0 mt-4 items-start">
          
          {/* LEFT: Product Catalog */}
          <div className="flex-1 flex flex-col h-full min-h-0 space-y-4">
            
            {/* 1. SLIDESHOW CAROUSEL */}
            {recommendedProducts.length > 0 && (
              <div className="relative h-44 bg-slate-950 rounded-2xl overflow-hidden shrink-0 shadow-md group">
                {recommendedProducts.map((prod, idx) => {
                  const isActive = idx === currentSlide;
                  return (
                    <div
                      key={prod.id}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                      }`}
                    >
                      <img 
                        src={prod.image} 
                        alt={prod.name} 
                        className="w-full h-full object-cover opacity-50 transition-transform duration-700 scale-105 group-hover:scale-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent p-5 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                            <Sparkles size={12} /> สินค้าแนะนำประจำวัน
                          </span>
                          <div className="flex gap-1.5 z-20">
                            {recommendedProducts.map((_, dotIdx) => (
                              <button 
                                key={dotIdx} 
                                onClick={() => setCurrentSlide(dotIdx)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${dotIdx === currentSlide ? 'w-5 bg-indigo-500' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-white font-extrabold text-lg leading-snug">{prod.name}</p>
                            <p className="text-slate-300 text-xs line-clamp-1 mt-0.5">{prod.description}</p>
                            <div className="flex items-baseline gap-2 mt-2">
                              <span className="text-emerald-400 font-black text-xl">฿{prod.price.toLocaleString()}</span>
                              {prod.isSale && (
                                <span className="text-slate-400 text-xs line-through">฿{prod.originalPrice.toLocaleString()}</span>
                              )}
                            </div>
                          </div>

                          <button 
                            onClick={() => handleAddToCart(prod)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition transform active:scale-95 cursor-pointer"
                          >
                            <Plus size={14} /> ใส่รถเข็น
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Nav Controls */}
                <button 
                  onClick={prevSlide} 
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition z-30"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={nextSlide} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition z-30"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* 2. Filter Tabs */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeFilter === 'all' 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ทั้งหมด ({PRODUCTS.length})
              </button>
              <button
                onClick={() => setActiveFilter('recommended')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeFilter === 'recommended' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }`}
              >
                <Sparkles size={13} /> สินค้าแนะนำ
              </button>
              <button
                onClick={() => setActiveFilter('sale')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeFilter === 'sale' 
                    ? 'bg-rose-600 text-white shadow-sm' 
                    : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                }`}
              >
                <Percent size={13} /> โปรโมชันลดราคา
              </button>
            </div>

            {/* 3. Product Cards Grid */}
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="border border-slate-200 hover:border-indigo-400 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md bg-white flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative h-36 bg-slate-100 overflow-hidden">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.isSale && (
                          <span className="absolute top-2 right-2 bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                            SALE
                          </span>
                        )}
                      </div>

                      <div className="p-3.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {product.category}
                        </span>
                        <h4 className="font-bold text-slate-800 text-xs mt-0.5 leading-snug line-clamp-1">{product.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{product.description}</p>
                      </div>
                    </div>

                    <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-100 flex items-center justify-between mt-auto">
                      <div>
                        {product.isSale && (
                          <span className="text-[10px] text-slate-400 line-through block">
                            ฿{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                        <span className="text-sm font-black text-slate-900">
                          ฿{product.price.toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        className="bg-slate-900 hover:bg-indigo-600 text-white p-2 rounded-xl transition shadow-sm flex items-center justify-center active:scale-95 cursor-pointer"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT: Cart Panel */}
          <div className="w-[340px] h-full border border-slate-200 rounded-2xl p-4 bg-slate-50/50 shadow-sm flex flex-col justify-between shrink-0">
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">ตะกร้าสินค้า (Cart)</h3>
                </div>
                <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full">
                  {totalItemsCount} ชิ้น
                </span>
              </div>

              {/* Scrollable Cart Items */}
              <div className="space-y-2.5 my-3 overflow-y-auto flex-1 pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-xs italic bg-white rounded-2xl border border-dashed border-slate-200">
                    ยังไม่มีสินค้าในรถเข็น
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs flex items-center justify-between gap-2">
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border shrink-0" />
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-xs leading-snug truncate">{item.name}</p>
                        <p className="text-xs font-black text-indigo-600 mt-0.5">
                          ฿{(item.price * item.qty).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                          <button onClick={() => handleUpdateQty(item.id, -1)} className="w-4 h-4 bg-white text-slate-600 font-bold rounded shadow-xs text-xs flex items-center justify-center hover:bg-slate-200 cursor-pointer">
                            <Minus size={10} />
                          </button>
                          <span className="text-xs font-bold text-slate-800 px-1">{item.qty}</span>
                          <button onClick={() => handleUpdateQty(item.id, 1)} className="w-4 h-4 bg-white text-slate-600 font-bold rounded shadow-xs text-xs flex items-center justify-center hover:bg-slate-200 cursor-pointer">
                            <Plus size={10} />
                          </button>
                        </div>

                        <button onClick={() => handleRemoveFromCart(item.id)} className="text-slate-400 hover:text-rose-500 p-1 transition cursor-pointer">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Summary Footer */}
              <div className="pt-3 border-t border-slate-200 shrink-0 space-y-2">
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-xs text-rose-600 font-semibold">
                    <span>ส่วนลดโปรโมชัน:</span>
                    <span>-฿{totalDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-semibold">ยอดชำระสุทธิ:</span>
                  <span className="text-lg font-black text-slate-900">฿{grandTotal.toLocaleString()}</span>
                </div>

                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  disabled={cart.length === 0}
                  className={`w-full py-2.5 rounded-xl font-bold transition text-xs flex items-center justify-center gap-2 ${
                    cart.length > 0
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <CreditCard size={15} /> ดำเนินการชำระเงิน (Checkout)
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* PAYMENT MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-3xl p-6 w-[480px] max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CreditCard className="text-emerald-600" size={18} /> ชำระเงิน (Payment)
              </h3>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-4 my-4">
              <label className="text-xs font-bold text-slate-600 block">เลือกช่องทางการชำระเงิน:</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPaymentMethod('promptpay')}
                  className={`p-3 rounded-2xl border-2 text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                    paymentMethod === 'promptpay' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <QrCode size={20} />
                  <span className="text-xs">PromptPay</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border-2 text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                    paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <CreditCard size={20} />
                  <span className="text-xs">Credit Card</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 rounded-2xl border-2 text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                    paymentMethod === 'cash' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Tag size={20} />
                  <span className="text-xs">เงินสด (Cash)</span>
                </button>
              </div>

              {paymentMethod === 'promptpay' && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
                  <div className="w-28 h-28 bg-white border border-slate-300 rounded-xl mx-auto flex items-center justify-center shadow-xs">
                    <QrCode size={70} className="text-slate-800" />
                  </div>
                  <p className="text-[11px] text-slate-500">สแกน QR Code เพื่อชำระเงิน <b>฿{grandTotal.toLocaleString()}</b></p>
                </div>
              )}

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>ราคารวมสินค้า:</span>
                  <span>฿{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>ส่วนลด:</span>
                  <span>-฿{totalDiscount.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900 text-sm">
                  <span>ยอดชำระสุทธิ:</span>
                  <span className="text-emerald-600">฿{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsCheckoutOpen(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs cursor-pointer">
                ยกเลิก
              </button>
              <button onClick={handleConfirmPayment} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer">
                <CheckCircle2 size={16} /> ยืนยันรับชำระเงิน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {completedOrder && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:fixed print:inset-0">
          <div className="bg-white rounded-3xl p-6 w-full max-w-3xl max-h-[92vh] flex flex-col justify-between shadow-2xl border border-slate-200 print:shadow-none print:border-none print:w-full print:p-0 print:max-h-none">
            
            {/* Control Header Before Print */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 shrink-0 print:hidden">
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <CheckCircle2 size={16} /> ชำระเงินสำเร็จ / Transaction Completed
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={handlePrintReceipt} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition cursor-pointer"
                >
                  <Printer size={15} /> พิมพ์ใบเสร็จ (Print Receipt)
                </button>
                <button 
                  onClick={() => setCompletedOrder(null)} 
                  className="text-slate-400 hover:text-slate-600 font-bold px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs transition cursor-pointer"
                >
                  ✕ ปิดหน้าต่าง
                </button>
              </div>
            </div>

            {/* PRINTABLE RECEIPT CONTENT */}
            <div className="overflow-y-auto flex-1 pr-1 print:overflow-visible">
              <div id="printable-outbound-receipt" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 text-slate-800 relative w-full flex flex-col justify-between overflow-hidden">
                <div>
                  {/* Header ใบเสร็จ โทน Outbound Emerald/Dark Slate */}
                  <div className="bg-[#052e16] text-white -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 p-6 sm:p-8 mb-6 flex justify-between items-start rounded-t-2xl" style={{ backgroundColor: '#052e16', color: '#ffffff' }}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-400/30">
                          Outbound Terminal POS
                        </span>
                      </div>
                      <h1 className="text-2xl font-black tracking-wider mt-1 text-white">KPA STOREFRONT</h1>
                      <p className="text-xs text-emerald-200/80 uppercase tracking-widest mt-0.5">OFFICIAL SALES RECEIPT & TAX INVOICE</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-2">TAX ID: 0105560000000 | Branch: 00001 (Main Store)</p>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <p className="text-xs font-mono font-bold text-emerald-400">RECEIPT NO: {completedOrder.orderId}</p>
                      <p className="text-xs font-mono text-slate-300 mt-0.5">Date: {completedOrder.date}</p>
                      <p className="text-xs font-mono text-slate-300">Staff: {completedOrder.cashier}</p>
                      <p className="text-xs font-mono text-emerald-300 font-semibold mt-0.5">Payment: {completedOrder.paymentMethod.toUpperCase()}</p>
                      
                      {/* QR Code ประจำใบเสร็จ */}
                      <div className="mt-3 bg-white p-1.5 rounded-xl inline-block shadow-md">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(completedOrder.orderId)}`}
                          alt="Receipt QR Code"
                          className="w-14 h-14 object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ตารางสินค้า */}
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-xs font-bold text-slate-600 border-b border-slate-200">
                        <th className="py-3 px-3">ลำดับ</th>
                        <th className="py-3 px-3">รายการสินค้า (Product)</th>
                        <th className="py-3 px-3 text-center">จำนวน (Qty)</th>
                        <th className="py-3 px-3 text-right">ราคา/หน่วย</th>
                        <th className="py-3 px-3 text-right">ราคารวม (Total)</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-slate-700">
                      {completedOrder.items.map((it, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          <td className="py-3 px-3 font-mono text-slate-400">{i + 1}</td>
                          <td className="py-3 px-3 font-semibold text-slate-800">{it.name}</td>
                          <td className="py-3 px-3 text-center font-bold text-slate-800">{it.qty}</td>
                          <td className="py-3 px-3 text-right font-mono">฿{it.price.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">฿{(it.price * it.qty).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Summary Breakdown */}
                  <div className="mt-6 flex justify-end">
                    <div className="w-64 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>ราคารวม (Subtotal):</span>
                        <span className="font-mono">฿{completedOrder.subtotal.toLocaleString()}</span>
                      </div>
                      {completedOrder.discount > 0 && (
                        <div className="flex justify-between text-rose-600 font-semibold">
                          <span>ส่วนลดโปรโมชัน:</span>
                          <span className="font-mono">-฿{completedOrder.discount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="border-t border-slate-200 pt-2.5 flex justify-between font-black text-slate-900 text-sm">
                        <span>ยอดสุทธิ (Grand Total):</span>
                        <span className="text-emerald-700 font-mono">฿{completedOrder.grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ลายเซ็นท้ายใบเสร็จ */}
                <div className="mt-10 pt-6 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-12 text-xs mb-6">
                    <div className="text-center">
                      <div className="border-b border-dashed border-slate-300 pb-8"></div>
                      <p className="text-slate-500 mt-2 font-medium">ลายเซ็นลูกค้า / Customer Signature</p>
                    </div>
                    <div className="text-center">
                      <div className="border-b border-dashed border-slate-300 pb-8"></div>
                      <p className="text-slate-500 mt-2 font-medium">ลายเซ็นแคชเชียร์ / Cashier Signature</p>
                    </div>
                  </div>
                  <div className="text-center pt-2">
                    <p className="text-[11px] text-slate-400 font-medium">
                      ขอบคุณที่ใช้บริการ / Thank you for shopping with KPA Store. Please keep this receipt for warranty claims.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 shrink-0 print:hidden">
              <button 
                onClick={() => setCompletedOrder(null)} 
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                ปิดหน้าต่างและเริ่มขายรายการใหม่
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}