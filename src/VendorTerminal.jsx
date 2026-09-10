import React, { useState } from 'react';
import { Bell, Plus, ChevronUp, ArrowLeft, Printer, CheckCircle } from 'lucide-react';

export default function VendorTerminal({ currentUser, onBack, onLogout }) {
  const [currentView, setCurrentView] = useState('list');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [itemList, setItemList] = useState([]);

  const [activeReceipt, setActiveReceipt] = useState(null);

  const [receipts, setReceipts] = useState([
    { id: 'RECEIPT 1', docNo: 'WH-INV-761561', date: '8/5/2569', quantity: 4, status: 'Pending', items: [] },
    { id: 'RECEIPT 3', docNo: 'WH-INV-761562', date: '8/5/2569', quantity: 2, status: 'Confirmed', items: [] },
  ]);

  const productOptions = [
    { id: 'PRD-001', name: 'Keyboard RGB', weight: 0.8 },
    { id: 'PRD-002', name: 'Laptop Stand', weight: 1.2 },
    { id: 'PRD-003', name: 'Webcam 1080p', weight: 0.3 },
    { id: 'PRD-004', name: 'Mouse Pad XL', weight: 0.5 },
    { id: 'PRD-005', name: 'Mouse Wireless', weight: 0.2 },
  ];

  const filteredProducts = productOptions.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = () => {
    if (!searchTerm || !quantity) return;

    const qtyNum = parseInt(quantity, 10) || 1;
    const unitWeight = selectedProduct ? selectedProduct.weight : 0.5;
    const totalWeightVal = (qtyNum * unitWeight).toFixed(2);

    const newItem = {
      id: selectedProduct ? selectedProduct.id : 'INB-' + Math.floor(10000000 + Math.random() * 90000000),
      productName: selectedProduct ? selectedProduct.name : searchTerm,
      quantity: qtyNum,
      weight: unitWeight,
      totalWeight: `${totalWeightVal}`
    };

    setItemList([...itemList, newItem]);
    setSearchTerm('');
    setQuantity('');
    setSelectedProduct(null);
  };

  const handleConfirmReceipt = () => {
    if (itemList.length === 0) return;

    const totalQty = itemList.reduce((acc, curr) => acc + curr.quantity, 0);
    const newReceiptName = `RECEIPT ${receipts.length + 1}`;
    const docNumber = `WH-INV-${Math.floor(100000 + Math.random() * 900000)}`;
    const currentDate = new Date().toLocaleDateString('th-TH');

    const newReceiptData = {
      id: newReceiptName,
      docNo: docNumber,
      date: currentDate,
      quantity: totalQty,
      status: 'Pending',
      items: [...itemList]
    };

    setReceipts([newReceiptData, ...receipts]);
    setActiveReceipt(newReceiptData);
    setCurrentView('preview');
    setItemList([]);
  };

  return (
    <div className="flex h-screen w-full bg-[#f8f9fa] overflow-hidden font-sans">

      {/* CSS ตัด Margin ของหน้ากระดาษเพื่อซ่อน Header/Footer ของ Browser และบังคับพิมพ์สี */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body * {
            visibility: hidden;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            min-height: 100vh;
            margin: 0;
            padding: 15mm;
            box-sizing: border-box;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />

      {/* ================= 1. LEFT SIDEBAR ================= */}
      <div className="w-[320px] lg:w-[380px] h-full relative bg-[#0b0f19] text-white flex flex-col justify-between p-8 shrink-0 overflow-hidden print:hidden">
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity">
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000&auto=format&fit=crop"
            alt="Logistics Fleet"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/60 to-transparent" />
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-black tracking-widest text-white leading-none">KPA</h1>
          <p className="text-3xl font-bold tracking-[0.35em] text-slate-200 mt-2">W.M.S</p>
        </div>

        <div className="relative z-10">
          <div className="bg-[#1a233a]/80 backdrop-blur-md border border-slate-700/60 rounded-full px-5 py-2.5 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <ChevronUp className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-200">
                {currentUser?.username || 'Vendor001'}
              </span>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors cursor-pointer"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= 2. RIGHT MAIN CONTENT ================= */}
      <div className="flex-1 h-full flex flex-col overflow-y-auto">

        {/* Header Bar */}
        <header className="bg-[#161d2f] text-white py-6 px-10 text-center shadow-md print:hidden">
          <h2 className="text-3xl font-serif tracking-tight font-normal">Warehouse Automation System</h2>
          <p className="text-xs font-mono text-slate-400 mt-1 uppercase tracking-wider">
            ROLE: User {currentUser?.username || 'Vendor001'} (Inbound)
          </p>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-8 lg:p-12 max-w-6xl mx-auto w-full">

          {/* VIEW 1: VENDOR TERMINAL (RECEIPT LIST) */}
          {currentView === 'list' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">VENDOR TERMINAL</h3>
                <button
                  onClick={() => setCurrentView('add')}
                  className="bg-[#ff1e1e] hover:bg-[#e01414] text-white px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  ADD NEW RECEIPT
                </button>
              </div>

              <div className="bg-white rounded-2xl p-4 mb-6 shadow border border-slate-200/80 flex items-center gap-4">
                <div className="bg-[#ff2d2d] text-white p-3 rounded-2xl shadow-sm">
                  <Bell className="w-6 h-6 fill-current" />
                </div>
                <span className="text-sm font-semibold text-[#ff2d2d] tracking-wide">Receipt Status</span>
              </div>

              <div className="space-y-3.5">
                {receipts.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setActiveReceipt(item);
                      setCurrentView('preview');
                    }}
                    className="bg-white rounded-2xl p-4 px-6 shadow-sm border border-slate-200/80 flex justify-between items-center hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm tracking-wide">{item.id} ({item.docNo})</h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Quantity : {item.quantity} items | Date: {item.date}
                      </p>
                    </div>
                    <div>
                      {item.status === 'Confirmed' ? (
                        <span className="bg-[#00a859] text-white px-5 py-1.5 rounded-lg text-xs font-bold tracking-wide inline-block min-w-[90px] text-center shadow-sm">
                          Confirmed
                        </span>
                      ) : (
                        <span className="bg-[#121858] text-white px-5 py-1.5 rounded-lg text-xs font-bold tracking-wide inline-block min-w-[90px] text-center shadow-sm">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* VIEW 2: ADD INBOUND ITEM */}
          {currentView === 'add' && (
            <div className="w-full">
              <button
                onClick={() => setCurrentView('list')}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold mb-4 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to receipts
              </button>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 mb-6 relative">
                <span className="text-xs font-bold text-[#00a859] block mb-3">+ Inbound your item</span>

                <div className="flex gap-3 relative">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Find name of item in warehouse"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#00a859] bg-slate-50/50"
                    />

                    {isDropdownOpen && searchTerm && filteredProducts.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
                        {filteredProducts.map((p, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setSearchTerm(p.name);
                              setSelectedProduct(p);
                              setIsDropdownOpen(false);
                            }}
                            className="px-4 py-2.5 text-xs hover:bg-slate-100 cursor-pointer flex justify-between items-center text-slate-700"
                          >
                            <span className="font-medium">{p.name}</span>
                            <span className="text-[10px] text-slate-400">Multi-Inbound</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <input
                    type="number"
                    placeholder="Unit"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-24 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#00a859] bg-slate-50/50"
                  />

                  <button
                    onClick={handleAddItem}
                    className="bg-[#00a859] hover:bg-[#00944e] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    Add to list
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2.5">* กรอกชื่อเพื่อค้นหาสินค้าที่มีอยู่ในระบบ Warehouse อัตโนมัติ</p>
              </div>

              {itemList.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden mb-6">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] font-bold text-slate-600 border-b border-slate-200">
                        <th className="py-3.5 px-6">ID</th>
                        <th className="py-3.5 px-6">Product Name</th>
                        <th className="py-3.5 px-6">Quantity</th>
                        <th className="py-3.5 px-6 text-right">Total Weight (KG)</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-slate-700">
                      {itemList.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="py-3.5 px-6 font-mono text-slate-500">{item.id}</td>
                          <td className="py-3.5 px-6 font-semibold">{item.productName}</td>
                          <td className="py-3.5 px-6">{item.quantity} units</td>
                          <td className="py-3.5 px-6 text-right font-bold text-[#00a859]">{item.totalWeight} kg</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="p-4 bg-slate-50 flex justify-end">
                    <button
                      onClick={handleConfirmReceipt}
                      className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-6 py-3 rounded-xl text-xs font-bold tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> CONFIRM & GENERATE PDF RECEIPT
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: PDF RECEIPT PREVIEW */}
          {currentView === 'preview' && activeReceipt && (
            <div className="w-full">
              {/* ปุ่มควบคุม (ซ่อนตอนปริ้นท์) */}
              <div className="flex justify-between items-center mb-6 print:hidden">
                <button
                  onClick={() => setCurrentView('list')}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to receipts
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </button>
              </div>

              {/* กล่องใบเสร็จ */}
              <div id="printable-receipt" className="bg-white rounded-3xl shadow-xl border border-slate-200/90 p-10 text-slate-800 relative w-full min-h-[850px] flex flex-col justify-between" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                
                <div>
                  {/* ส่วนหัวใบเสร็จ สีน้ำเงินกรมท่า (#161d2f) */}
                  <div className="bg-[#161d2f] text-white -mx-10 -mt-10 p-10 mb-8 flex justify-between items-start rounded-t-3xl" style={{ backgroundColor: '#161d2f', color: '#ffffff', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                    <div>
                      <h1 className="text-2xl font-bold tracking-wider">WMS AUTOMATION SYSTEM</h1>
                      <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">INBOUND SHIPMENT RECEIPT</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono">Document No: {activeReceipt.docNo}</p>
                      <p className="text-xs font-mono mt-1">Date: {activeReceipt.date}</p>
                      {/* QR Code */}
                      <div className="mt-3 bg-white p-1.5 rounded-lg inline-block shadow-sm">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(activeReceipt.docNo)}`}
                          alt="QR Code Document No"
                          className="w-14 h-14 object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ตารางรายการสินค้า */}
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-xs font-bold text-slate-600 border-b border-slate-200">
                        <th className="py-4 px-6">รายการสินค้า</th>
                        <th className="py-4 px-6">รหัสสินค้า (ID)</th>
                        <th className="py-4 px-6">จำนวน</th>
                        <th className="py-4 px-6 text-right">น้ำหนัก (KG)</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-slate-700">
                      {activeReceipt.items && activeReceipt.items.length > 0 ? (
                        activeReceipt.items.map((it, i) => (
                          <tr key={i} className="border-b border-slate-100">
                            <td className="py-4 px-6 font-semibold">{it.productName}</td>
                            <td className="py-4 px-6 font-mono text-slate-500">{it.id}</td>
                            <td className="py-4 px-6">{it.quantity}</td>
                            <td className="py-4 px-6 text-right">{it.totalWeight}</td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-b border-slate-100">
                          <td className="py-4 px-6 font-semibold">Keyboard RGB</td>
                          <td className="py-4 px-6 font-mono text-slate-500">INB-1778183753347</td>
                          <td className="py-4 px-6">{activeReceipt.quantity}</td>
                          <td className="py-4 px-6 text-right">2.40</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ส่วนท้าย (ลายเซ็นและหมายเหตุ ถูกดันมาอยู่ล่างสุดเสมอ) */}
                <div className="mt-12">
                  <div className="grid grid-cols-2 gap-16 text-sm mb-8">
                    <div>
                      <p className="text-slate-500">ผู้รับสินค้า: ............................................................................</p>
                    </div>
                    <div>
                      <p className="text-slate-500">เจ้าหน้าที่คลัง: ............................................................................</p>
                    </div>
                  </div>

                  <div className="text-center pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-400">หมายเหตุ: สินค้าถูกตรวจสอบเบื้องต้นแล้ว โปรดเก็บใบเสร็จนี้ไว้เพื่อการตรวจสอบสต็อก</p>
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}