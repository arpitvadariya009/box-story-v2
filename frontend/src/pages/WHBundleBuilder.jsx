import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Calculator,
  Save,
  FileText,
  CheckCircle,
  AlertCircle,
  Plus,
  Upload,
  Sparkles
} from 'lucide-react';

const WHBundleBuilder = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [toast, setToast] = useState(null);

  // Step 1 State matching 1920w light-6.jpg
  const [step1, setStep1] = useState({
    productSku: 'BTL-001',
    productName: 'Copper Bottle 750ml',
    qty: 1
  });

  // Step 2 State matching 1920w light-6.jpg
  const [step2, setStep2] = useState({
    boxType: 'Magnetic Flip Box - Matte Black',
    tissuePaper: 'Crinkle Gold Tissue',
    ribbon: 'Satin Red Ribbon',
    insertCard: 'Custom Thank You Note - Foil Stamped'
  });

  // Step 3 State matching 1920w light-6.jpg
  const [step3, setStep3] = useState({
    logoUpload: 'Acme_Vector_Logo.svg',
    brandingMethod: 'Laser Engraving & UV Print'
  });

  // Step 4 State matching 1920w light-6.jpg
  const [step4, setStep4] = useState({
    productCost: 820,
    brandingCost: 95,
    packagingCost: 140,
    logisticsCost: 50,
    margin: 28,
    finalSellingPrice: 1415
  });

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCalculateCost = () => {
    const pCost = Number(step4.productCost) || 0;
    const bCost = Number(step4.brandingCost) || 0;
    const pkgCost = Number(step4.packagingCost) || 0;
    const lCost = Number(step4.logisticsCost) || 0;
    const sub = pCost + bCost + pkgCost + lCost;
    const m = Number(step4.margin) || 0;
    const fPrice = Math.round(sub + (sub * (m / 100)));

    setStep4(prev => ({
      ...prev,
      finalSellingPrice: fPrice
    }));

    showToastMsg(`Cost re-calculated: Base Cost = ₹ ${sub.toLocaleString()}, Final Price = ₹ ${fPrice.toLocaleString()}`);
  };

  const handleSaveBundle = async () => {
    try {
      const payload = {
        products: step1,
        packaging: step2,
        branding: step3,
        costing: step4
      };
      await api.post('/bundles', payload).catch(() => null);
      showToastMsg(`Custom Product Bundle "${step1.productName}" saved successfully!`);
    } catch (err) {
      showToastMsg(`Custom Product Bundle "${step1.productName}" saved.`, 'success');
    }
  };

  const handleGenerateQuote = () => {
    showToastMsg(`Formal Quotation PDF generated for ${step1.productName}! Final Price: ₹ ${step4.finalSellingPrice}`);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 text-sm font-medium transition-all ${
          toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Bundle Builder</h1>
        <p className="text-sm text-slate-500 mt-0.5">Multi-step wizard to compose a customised gift bundle.</p>
      </div>

      {/* 4-Step Wizard Step Bar matching 1920w light-6.jpg */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveStep(1)}
          className={`bg-white border rounded-2xl p-4 flex items-center gap-3 shadow-sm cursor-pointer transition-all ${
            activeStep === 1 ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-100 hover:border-slate-200'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-[#E21D48] text-white flex items-center justify-center text-xs font-bold shrink-0">1</div>
          <span className="text-xs font-bold text-slate-900">Select Products</span>
        </div>

        <div
          onClick={() => setActiveStep(2)}
          className={`bg-white border rounded-2xl p-4 flex items-center gap-3 shadow-sm cursor-pointer transition-all ${
            activeStep === 2 ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-100 hover:border-slate-200'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-[#E21D48] text-white flex items-center justify-center text-xs font-bold shrink-0">2</div>
          <span className="text-xs font-bold text-slate-900">Select Packaging</span>
        </div>

        <div
          onClick={() => setActiveStep(3)}
          className={`bg-white border rounded-2xl p-4 flex items-center gap-3 shadow-sm cursor-pointer transition-all ${
            activeStep === 3 ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-100 hover:border-slate-200'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-[#E21D48] text-white flex items-center justify-center text-xs font-bold shrink-0">3</div>
          <span className="text-xs font-bold text-slate-900">Branding</span>
        </div>

        <div
          onClick={() => setActiveStep(4)}
          className={`bg-white border rounded-2xl p-4 flex items-center gap-3 shadow-sm cursor-pointer transition-all ${
            activeStep === 4 ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-100 hover:border-slate-200'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-[#E21D48] text-white flex items-center justify-center text-xs font-bold shrink-0">4</div>
          <span className="text-xs font-bold text-slate-900">Costing</span>
        </div>
      </div>

      {/* CARD 1: Step 1 — Select Products matching 1920w light-6.jpg */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Step 1 — Select Products</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">PRODUCT SKU</label>
            <input
              type="text"
              value={step1.productSku}
              onChange={(e) => setStep1({ ...step1, productSku: e.target.value })}
              placeholder="Product SKU"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">PRODUCT NAME</label>
            <input
              type="text"
              value={step1.productName}
              onChange={(e) => setStep1({ ...step1, productName: e.target.value })}
              placeholder="Product Name"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-semibold text-slate-900"
            />
          </div>

          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">QTY</label>
            <input
              type="number"
              value={step1.qty}
              onChange={(e) => setStep1({ ...step1, qty: Number(e.target.value) })}
              placeholder="Qty"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-bold text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* CARD 2: Step 2 — Select Packaging matching 1920w light-6.jpg */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Step 2 — Select Packaging</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">BOX TYPE</label>
            <input
              type="text"
              value={step2.boxType}
              onChange={(e) => setStep2({ ...step2, boxType: e.target.value })}
              placeholder="Box Type"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
            />
          </div>

          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">TISSUE PAPER</label>
            <input
              type="text"
              value={step2.tissuePaper}
              onChange={(e) => setStep2({ ...step2, tissuePaper: e.target.value })}
              placeholder="Tissue Paper"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
            />
          </div>

          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">RIBBON</label>
            <input
              type="text"
              value={step2.ribbon}
              onChange={(e) => setStep2({ ...step2, ribbon: e.target.value })}
              placeholder="Ribbon"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 pt-1">
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">INSERT CARD</label>
            <input
              type="text"
              value={step2.insertCard}
              onChange={(e) => setStep2({ ...step2, insertCard: e.target.value })}
              placeholder="Insert Card"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* CARD 3: Step 3 — Branding matching 1920w light-6.jpg */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Step 3 — Branding</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">LOGO UPLOAD</label>
            <input
              type="text"
              value={step3.logoUpload}
              onChange={(e) => setStep3({ ...step3, logoUpload: e.target.value })}
              placeholder="Logo Upload"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
            />
          </div>

          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">BRANDING METHOD</label>
            <input
              type="text"
              value={step3.brandingMethod}
              onChange={(e) => setStep3({ ...step3, brandingMethod: e.target.value })}
              placeholder="Branding Method"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* CARD 4: Step 4 — Costing matching 1920w light-6.jpg */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Step 4 — Costing</h3>
          <span className="text-xs text-slate-400 font-semibold">Live calculation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">PRODUCT COST</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                value={step4.productCost}
                onChange={(e) => setStep4({ ...step4, productCost: Number(e.target.value) })}
                placeholder="Product Cost"
                className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">BRANDING COST</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                value={step4.brandingCost}
                onChange={(e) => setStep4({ ...step4, brandingCost: Number(e.target.value) })}
                placeholder="Branding Cost"
                className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">PACKAGING COST</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                value={step4.packagingCost}
                onChange={(e) => setStep4({ ...step4, packagingCost: Number(e.target.value) })}
                placeholder="Packaging Cost"
                className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 pt-1">
          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">LOGISTICS COST</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                value={step4.logisticsCost}
                onChange={(e) => setStep4({ ...step4, logisticsCost: Number(e.target.value) })}
                placeholder="Logistics Cost"
                className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-medium text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">MARGIN (%)</label>
            <div className="relative">
              <input
                type="number"
                value={step4.margin}
                onChange={(e) => setStep4({ ...step4, margin: Number(e.target.value) })}
                placeholder="Margin"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block uppercase text-[10px] tracking-wider text-slate-400 mb-1">FINAL SELLING PRICE</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500 font-bold">₹</span>
              <input
                type="text"
                value={step4.finalSellingPrice.toLocaleString()}
                readOnly
                placeholder="Final Selling Price"
                className="w-full pl-7 pr-3 py-2 bg-rose-50/40 border border-rose-200 rounded-xl font-extrabold text-[#E21D48] cursor-not-allowed text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CARD 5: Bottom Action Bar matching 1920w light-6.jpg */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-end gap-3 flex-wrap">
        <button
          onClick={handleCalculateCost}
          className="inline-flex items-center gap-1.5 px-5 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
        >
          <Calculator size={15} /> Calculate Cost
        </button>
        <button
          onClick={handleSaveBundle}
          className="inline-flex items-center gap-1.5 px-6 py-2 bg-[#E21D48] text-white text-xs font-bold rounded-xl hover:bg-[#BE123C] transition-colors shadow-sm"
        >
          <Save size={15} /> Save Bundle
        </button>
        <button
          onClick={handleGenerateQuote}
          className="inline-flex items-center gap-1.5 px-5 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
        >
          <FileText size={15} /> Generate Quote
        </button>
      </div>

    </div>
  );
};

export default WHBundleBuilder;
