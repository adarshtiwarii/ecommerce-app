// src/components/AddProduct.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../utils/api';
import { getErrorMessage } from '../utils/errorMessage';
import CloudinaryUploadWidget from './CloudinaryUploadWidget';


// ── Category-specific field configs ───────────────────────
const CATEGORY_FIELDS = {
  mobiles: {
    label: '📱 Mobiles & Tablets',
    specs: [
      { name: 'os',                label: 'Operating System',      placeholder: 'e.g. Android 14' },
      { name: 'processorBrand',    label: 'Processor Brand',       placeholder: 'e.g. Snapdragon, Dimensity' },
      { name: 'processorName',     label: 'Processor Name',        placeholder: 'e.g. Snapdragon 8 Gen 3' },
      { name: 'ram',               label: 'RAM',                   placeholder: 'e.g. 8 GB' },
      { name: 'storage',           label: 'Internal Storage',      placeholder: 'e.g. 256 GB' },
      { name: 'expandableStorage', label: 'Expandable Storage',    placeholder: 'e.g. Up to 1 TB / Not Supported' },
      { name: 'displaySize',       label: 'Display Size',          placeholder: 'e.g. 6.7 inches' },
      { name: 'displayType',       label: 'Display Type',          placeholder: 'e.g. Super AMOLED, IPS LCD' },
      { name: 'displayResolution', label: 'Display Resolution',    placeholder: 'e.g. 2340 x 1080 pixels' },
      { name: 'refreshRate',       label: 'Refresh Rate',          placeholder: 'e.g. 120 Hz' },
      { name: 'rearCamera',        label: 'Rear Camera',           placeholder: 'e.g. 50 MP + 12 MP + 10 MP' },
      { name: 'frontCamera',       label: 'Front Camera',          placeholder: 'e.g. 12 MP' },
      { name: 'batteryCapacity',   label: 'Battery',               placeholder: 'e.g. 5000 mAh' },
      { name: 'chargingSpeed',     label: 'Charging Speed',        placeholder: 'e.g. 45W Fast Charging' },
      { name: 'networkType',       label: 'Network',               placeholder: 'e.g. 5G / 4G / Wi-Fi 6' },
      { name: 'simType',           label: 'SIM Type',              placeholder: 'e.g. Dual SIM (Nano + eSIM)' },
      { name: 'color',             label: 'Color',                 placeholder: 'e.g. Phantom Black' },
      { name: 'dimensions',        label: 'Dimensions',            placeholder: 'e.g. 163.3 x 78.1 x 8.9 mm' },
      { name: 'weight',            label: 'Weight',                placeholder: 'e.g. 225 g' },
    ],
  },

  fashion: {
    label: '👗 Clothing & Fashion',
    specs: [
      { name: 'gender',          label: 'Ideal For',           placeholder: 'e.g. Men / Women / Boys / Girls / Unisex' },
      { name: 'fabricType',      label: 'Fabric / Material',   placeholder: 'e.g. 100% Cotton, Polyester Blend' },
      { name: 'fitType',         label: 'Fit Type',            placeholder: 'e.g. Regular Fit, Slim Fit, Oversized' },
      { name: 'neckType',        label: 'Neck Type',           placeholder: 'e.g. Round Neck, V-Neck, Collar' },
      { name: 'sleeveType',      label: 'Sleeve Type',         placeholder: 'e.g. Full Sleeve, Half Sleeve, Sleeveless' },
      { name: 'occasion',        label: 'Occasion',            placeholder: 'e.g. Casual, Formal, Party, Sports' },
      { name: 'pattern',         label: 'Pattern',             placeholder: 'e.g. Solid, Striped, Printed, Checked' },
      { name: 'color',           label: 'Color',               placeholder: 'e.g. Charcoal Black' },
      { name: 'availableSizes',  label: 'Available Sizes',     placeholder: 'e.g. XS, S, M, L, XL, XXL' },
      { name: 'washCare',        label: 'Wash Care',           placeholder: 'e.g. Machine Wash Cold, Do Not Bleach' },
      { name: 'closure',         label: 'Closure Type',        placeholder: 'e.g. Button, Zipper, Drawstring' },
      { name: 'packOf',          label: 'Pack Of',             placeholder: 'e.g. 1 / 2 / 3' },
      { name: 'countryOfOrigin', label: 'Country of Origin',   placeholder: 'e.g. India' },
    ],
  },

  beauty: {
    label: '💄 Beauty & Personal Care',
    specs: [
      { name: 'skinType',           label: 'Skin Type',              placeholder: 'e.g. All Skin Types, Oily, Dry, Sensitive' },
      { name: 'formulation',        label: 'Formulation',            placeholder: 'e.g. Cream, Gel, Serum, Lotion, Foam' },
      { name: 'concern',            label: 'Skin / Hair Concern',    placeholder: 'e.g. Anti-Aging, Moisturizing, Dandruff' },
      { name: 'keyIngredients',     label: 'Key Ingredients',        placeholder: 'e.g. Hyaluronic Acid, Niacinamide, SPF 50' },
      { name: 'netQuantity',        label: 'Net Quantity / Volume',  placeholder: 'e.g. 100 ml / 50 g' },
      { name: 'shade',              label: 'Shade / Color',          placeholder: 'e.g. 01 Ivory, Rose Pink (or N/A)' },
      { name: 'finish',             label: 'Finish',                 placeholder: 'e.g. Matte, Dewy, Glossy, Natural' },
      { name: 'coverage',           label: 'Coverage',               placeholder: 'e.g. Full, Medium, Light (or N/A)' },
      { name: 'spf',                label: 'SPF',                    placeholder: 'e.g. SPF 30 / SPF 50+ / No SPF' },
      { name: 'suitableFor',        label: 'Suitable For',           placeholder: 'e.g. Face, Hair, Body, Lips' },
      { name: 'applicationMethod',  label: 'How To Use',             placeholder: 'e.g. Apply 2-3 drops on cleansed face' },
      { name: 'isVegan',            label: 'Vegan / Cruelty Free',   placeholder: 'e.g. Yes / No' },
      { name: 'expiryInfo',         label: 'Best Before',            placeholder: 'e.g. 24 months from manufacture' },
    ],
  },

  appliances: {
    label: '🏠 Home Appliances & Electronics',
    specs: [
      { name: 'powerConsumption', label: 'Power Consumption',   placeholder: 'e.g. 1500 W' },
      { name: 'voltage',          label: 'Voltage',             placeholder: 'e.g. 220-240 V, 50 Hz' },
      { name: 'capacity',         label: 'Capacity',            placeholder: 'e.g. 7 kg / 260 L / 1.5 Ton' },
      { name: 'starRatingBEE',    label: 'Energy Star Rating',  placeholder: 'e.g. 5 Star BEE Rated' },
      { name: 'color',            label: 'Color',               placeholder: 'e.g. Silver, White, Black' },
      { name: 'material',         label: 'Material / Body',     placeholder: 'e.g. Stainless Steel, ABS Plastic' },
      { name: 'dimensions',       label: 'Dimensions (W×H×D)',  placeholder: 'e.g. 60 × 85 × 60 cm' },
      { name: 'weight',           label: 'Weight',              placeholder: 'e.g. 12 kg' },
      { name: 'installationType', label: 'Installation Type',   placeholder: 'e.g. Free-standing, Built-in, Wall-mount' },
      { name: 'noiseLevel',       label: 'Noise Level',         placeholder: 'e.g. 42 dB (Low Noise)' },
      { name: 'controlType',      label: 'Control Type',        placeholder: 'e.g. Touch Panel, Remote, Smart App' },
      { name: 'connectivity',     label: 'Connectivity',        placeholder: 'e.g. Wi-Fi, Bluetooth, None' },
      { name: 'smartFeatures',    label: 'Smart Features',      placeholder: 'e.g. Voice Control, Auto Mode, Timer' },
      { name: 'cordLength',       label: 'Cord / Pipe Length',  placeholder: 'e.g. 1.5 m (or Not Applicable)' },
    ],
  },
};

const CATEGORIES = [
  { value: '',           label: '— Select Category —' },
  { value: 'mobiles',    label: '📱 Mobiles & Tablets' },
  { value: 'fashion',    label: '👗 Clothing & Fashion' },
  { value: 'beauty',     label: '💄 Beauty & Personal Care' },
  { value: 'appliances', label: '🏠 Home Appliances' },
  { value: 'other',      label: '📦 Other' },
];

// ── Helpers ────────────────────────────────────────────────
// Humanise a camelCase spec key into a readable label
const humanise = key =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim();

// ── Main Component ─────────────────────────────────────────
const AddProduct = () => {
  const { user } = useApp();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const [form, setForm] = useState({
    name:          '',
    description:   '',
    price:         '',
    mrp:           '',
    stockQuantity: '',
    category:      '',
    brand:         '',
    images:        [],
    highlights:    ['', '', '', ''],
    inTheBox:      '',

    // category-specific specs (dynamic)
    categorySpecs: {},

    // custom key-value specs
    specifications: [{ key: '', value: '' }],

    // warranty
    warrantyType:          '',
    warrantySummary:       '',
    warrantyServiceType:   '',
    warrantyCoveredInfo:   '',
    warrantyNotCoveredInfo:'',

    // manufacturer
    manufacturerName:    '',
    manufacturerAddress: '',
    manufacturerContact: '',
    countryOfOrigin:     'India',
    marketedBy:          '',
  });

  // ── Helpers ────────────────────────────────────────────
  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const handleChange = e => set(e.target.name, e.target.value);

  const handleCategoryChange = e => {
    setForm(f => ({ ...f, category: e.target.value, categorySpecs: {} }));
  };

  const handleCategorySpec = (name, value) => {
    setForm(f => ({ ...f, categorySpecs: { ...f.categorySpecs, [name]: value } }));
  };

  const updateHighlight = (idx, val) => {
    const h = [...form.highlights]; h[idx] = val; set('highlights', h);
  };
  const addHighlight    = ()    => set('highlights', [...form.highlights, '']);
  const removeHighlight = idx  => set('highlights', form.highlights.filter((_, i) => i !== idx));

  const updateSpec = (idx, field, val) => {
    const s = [...form.specifications]; s[idx][field] = val; set('specifications', s);
  };
  const addSpec    = ()    => set('specifications', [...form.specifications, { key: '', value: '' }]);
  const removeSpec = idx  => set('specifications', form.specifications.filter((_, i) => i !== idx));

  // ── Submit ─────────────────────────────────────────────
  const handleSubmit = async e => {
    e.preventDefault();
    if (form.images.length === 0) { setError('Please upload at least one product image'); return; }
    setLoading(true); setError('');

    // Merge categorySpecs into specifications array for backend
    const catSpecsArray = Object.entries(form.categorySpecs)
      .filter(([, v]) => v.trim())
      .map(([key, value]) => ({ key: humanise(key), value }));

    const payload = {
      name:          form.name,
      description:   form.description,
      price:         parseFloat(form.price),
      mrp:           parseFloat(form.mrp || form.price),
      stockQuantity: parseInt(form.stockQuantity),
      category:      form.category,
      brand:         form.brand,
      imageUrl:      form.images[0] || '',
      images:        form.images,
      highlights:    form.highlights.filter(h => h.trim()),
      inTheBox:      form.inTheBox,
      specifications: [
        ...catSpecsArray,
        ...form.specifications.filter(s => s.key.trim() && s.value.trim()),
      ],
      warranty: {
        type:        form.warrantyType,
        summary:     form.warrantySummary,
        serviceType: form.warrantyServiceType,
        covered:     form.warrantyCoveredInfo,
        notCovered:  form.warrantyNotCoveredInfo,
      },
      manufacturer: {
        name:            form.manufacturerName,
        address:         form.manufacturerAddress,
        contact:         form.manufacturerContact,
        countryOfOrigin: form.countryOfOrigin,
        marketedBy:      form.marketedBy,
      },
      sellerId: user?.id || localStorage.getItem('userId'),
    };

    try {
      await api.post('/products', payload);
      alert('Product added successfully!');
      navigate('/admin');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to add product'));
    } finally {
      setLoading(false);
    }
  };

  // ── Styles ─────────────────────────────────────────────
  const inputClass  = 'w-full rounded-xl border border-orange-100 bg-[#161616] px-4 py-3 text-sm text-white shadow-sm outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100';
  const labelClass  = 'block text-white/80 text-xs font-black uppercase tracking-wide mb-1.5';
  const sectionCard = 'bg-[#161616] rounded-2xl shadow-xl shadow-orange-100/70 border border-orange-100 p-5 sm:p-6 space-y-5';

  const catConfig = CATEGORY_FIELDS[form.category];

  const sections = [
    { id: 'basic',        label: '📦 Basic' },
    { id: 'images',       label: '🖼️ Images' },
    { id: 'highlights',   label: '✨ Highlights' },
    { id: 'catspecs',     label: '🔧 Details', show: !!catConfig },
    { id: 'specs',        label: '📋 Specs' },
    { id: 'warranty',     label: '🛡️ Warranty' },
    { id: 'manufacturer', label: '🏭 Manufacturer' },
  ].filter(s => s.show !== false);

  const currentIdx  = sections.findIndex(s => s.id === activeSection);
  const nextSection = sections[currentIdx + 1]?.id;
  const prevSection = sections[currentIdx - 1]?.id;

  const NavButtons = () => (
    <div className="flex justify-between gap-3 pt-2">
      {prevSection ? (
        <button type="button" onClick={() => setActiveSection(prevSection)}
          className="rounded-xl border border-orange-100 bg-[#161616] px-5 py-2.5 text-sm font-bold text-white/70 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:text-orange-600">
          ← Back
        </button>
      ) : <div />}
      {nextSection ? (
        <button type="button" onClick={() => setActiveSection(nextSection)}
          className="rounded-xl bg-[#FF6B00] px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600">
          Next →
        </button>
      ) : (
        <button type="submit" disabled={loading}
          className="rounded-xl bg-[#FF6B00] px-8 py-2.5 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? 'Adding...' : '✓ Add Product'}
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[rgba(255,107,0,0.12)]/60 py-8">
      <div className="mb-8 bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 text-white">
        <div className="mx-auto max-w-4xl px-4 py-7">
          <p className="text-sm font-black uppercase tracking-wide text-orange-100">Marketplace catalog</p>
          <h1 className="mt-2 text-3xl font-black">Add New Product</h1>
          <p className="mt-2 max-w-2xl text-sm text-orange-50">Fill in all sections for better discovery, richer detail pages, and stronger buyer confidence.</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4">

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Progress tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {sections.map((s, idx) => (
            <button key={s.id} type="button" onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black shadow-sm transition hover:-translate-y-0.5 ${
                activeSection === s.id
                  ? 'bg-[#FF6B00] text-white shadow-orange-200'
                  : idx < currentIdx
                    ? 'border border-green-200 bg-green-50 text-green-700'
                    : 'border border-orange-100 bg-[#161616] text-white/50 hover:border-orange-300 hover:text-orange-600'
              }`}>
              {idx < currentIdx && <span>✓</span>}
              {s.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>

          {/* ── BASIC INFO ────────────────────────────── */}
          {activeSection === 'basic' && (
            <div className={sectionCard}>
              <h2 className="border-b border-orange-100 pb-3 text-lg font-black text-white">Basic Information</h2>

              {/* Category first — drives other sections */}
              <div>
                <label className={labelClass}>Category *</label>
                <select value={form.category} onChange={handleCategoryChange}
                  className={`${inputClass} cursor-pointer`} required>
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value} className="bg-gray-900">{c.label}</option>
                  ))}
                </select>
                {catConfig && (
                  <p className="mt-1.5 text-xs font-semibold text-orange-600">
                    ✓ Category-specific fields unlocked in "🔧 Details" tab
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>Product Name *</label>
                <input type="text" name="name" placeholder="Full product name"
                  onChange={handleChange} value={form.name} required className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Brand</label>
                <input type="text" name="brand" placeholder="e.g. Samsung, H&M, Lakme, LG"
                  onChange={handleChange} value={form.brand} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea name="description" placeholder="Describe the product in detail..." rows="4"
                  onChange={handleChange} value={form.description} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>In The Box</label>
                <input type="text" name="inTheBox"
                  placeholder='e.g. "1 Phone, 1 Type-C Cable, 1 Quick Charger, 1 SIM Ejector"'
                  onChange={handleChange} value={form.inTheBox} className={inputClass} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Selling Price (₹) *</label>
                  <input type="number" step="0.01" name="price" placeholder="0.00"
                    onChange={handleChange} value={form.price} required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>MRP (₹)</label>
                  <input type="number" step="0.01" name="mrp" placeholder="0.00"
                    onChange={handleChange} value={form.mrp} className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Stock Quantity *</label>
                <input type="number" name="stockQuantity" placeholder="0"
                  onChange={handleChange} value={form.stockQuantity} required className={inputClass} />
              </div>

              <NavButtons />
            </div>
          )}

          {/* ── IMAGES ──────────────────────────────── */}
          {activeSection === 'images' && (
            <div className={sectionCard}>
              <h2 className="border-b border-orange-100 pb-3 text-lg font-black text-white">
                Product Images <span className="text-sm font-semibold text-white/50">({form.images.length}/6)</span>
              </h2>
              <p className="-mt-2 text-xs text-white/50">
                Upload clear images on white/neutral background. First image = main display.
              </p>

              <div className="flex flex-wrap gap-3">
                {form.images.map((img, idx) => (
                  <div key={idx} className="relative w-28 h-28 rounded-xl overflow-hidden border border-orange-100 bg-[#161616] shadow-sm group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button type="button"
                      onClick={() => set('images', form.images.filter((_, i) => i !== idx))}
                      className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xl">
                      ✕
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-[#FF6B00] text-white text-[9px] px-1.5 py-0.5 rounded font-bold">MAIN</span>
                    )}
                  </div>
                ))}
                {form.images.length < 6 && (
                  <div className="w-28 h-28 border-2 border-dashed border-orange-200 bg-[rgba(255,107,0,0.12)]/70 rounded-xl flex items-center justify-center">
                    <CloudinaryUploadWidget
                      onUpload={url => setForm(p => ({ ...p, images: [...p.images, url] }))}
                      buttonText="+ Add"
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-white/50">Max 6 images • Max 5 MB each • JPG, PNG, WebP supported</p>
              <NavButtons />
            </div>
          )}

          {/* ── HIGHLIGHTS ──────────────────────────── */}
          {activeSection === 'highlights' && (
            <div className={sectionCard}>
              <h2 className="border-b border-orange-100 pb-3 text-lg font-black text-white">Product Highlights</h2>
              <p className="-mt-2 text-xs text-white/50">These appear as bullet points near the product title — keep them short & impactful</p>

              <div className="space-y-2.5">
                {form.highlights.map((h, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <span className="text-orange-500 text-sm flex-shrink-0">▸</span>
                    <input
                      type="text"
                      placeholder={[
                        'e.g. 6.7" Dynamic AMOLED 2X Display, 120Hz',
                        'e.g. 200MP Main Camera with Nightography',
                        'e.g. 5000mAh Battery + 45W Super Fast Charging',
                        'e.g. Snapdragon 8 Gen 2 — blazing fast performance',
                      ][idx] || `Highlight ${idx + 1}`}
                      value={h}
                      onChange={e => updateHighlight(idx, e.target.value)}
                      className={inputClass}
                    />
                    {form.highlights.length > 1 && (
                      <button type="button" onClick={() => removeHighlight(idx)}
                        className="text-red-400 hover:text-red-300 px-1.5 text-lg">✕</button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addHighlight}
                className="text-sm font-bold text-orange-600 hover:underline">
                + Add Highlight
              </button>
              <NavButtons />
            </div>
          )}

          {/* ── CATEGORY-SPECIFIC DETAILS ───────────── */}
          {activeSection === 'catspecs' && catConfig && (
            <div className={sectionCard}>
              <h2 className="border-b border-orange-100 pb-3 text-lg font-black text-white">
                {catConfig.label} — Product Details
              </h2>
              <p className="-mt-2 text-xs text-white/50">Flipkart-style category fields. Fill as many as possible.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {catConfig.specs.map(field => (
                  <div key={field.name}>
                    <label className={labelClass}>{field.label}</label>
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={form.categorySpecs[field.name] || ''}
                      onChange={e => handleCategorySpec(field.name, e.target.value)}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
              <NavButtons />
            </div>
          )}

          {/* ── CUSTOM SPECIFICATIONS ───────────────── */}
          {activeSection === 'specs' && (
            <div className={sectionCard}>
              <h2 className="border-b border-orange-100 pb-3 text-lg font-black text-white">Additional Specifications</h2>
              <p className="-mt-2 text-xs text-white/50">Add any extra specs not covered above</p>

              <div className="space-y-2.5">
                {form.specifications.map((spec, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input type="text" placeholder="Feature (e.g. NFC)" value={spec.key}
                      onChange={e => updateSpec(idx, 'key', e.target.value)}
                      className={`${inputClass} w-2/5`} />
                    <input type="text" placeholder="Value (e.g. Yes)" value={spec.value}
                      onChange={e => updateSpec(idx, 'value', e.target.value)}
                      className={`${inputClass} flex-1`} />
                    {form.specifications.length > 1 && (
                      <button type="button" onClick={() => removeSpec(idx)}
                        className="text-red-400 hover:text-red-300 px-1.5 text-lg">✕</button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addSpec}
                className="text-sm font-bold text-orange-600 hover:underline">
                + Add Row
              </button>
              <NavButtons />
            </div>
          )}

          {/* ── WARRANTY ────────────────────────────── */}
          {activeSection === 'warranty' && (
            <div className={sectionCard}>
              <h2 className="border-b border-orange-100 pb-3 text-lg font-black text-white">Warranty Information</h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Warranty Type</label>
                  <input type="text" name="warrantyType" placeholder="e.g. Manufacturer Warranty"
                    onChange={handleChange} value={form.warrantyType} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Warranty Period</label>
                  <input type="text" name="warrantySummary" placeholder="e.g. 1 Year"
                    onChange={handleChange} value={form.warrantySummary} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Service Type</label>
                <input type="text" name="warrantyServiceType"
                  placeholder="e.g. Carry-in / On-site / Pick & Drop"
                  onChange={handleChange} value={form.warrantyServiceType} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>What's Covered</label>
                <textarea name="warrantyCoveredInfo"
                  placeholder="e.g. Manufacturing defects, Hardware failures" rows="2"
                  onChange={handleChange} value={form.warrantyCoveredInfo} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>What's NOT Covered</label>
                <textarea name="warrantyNotCoveredInfo"
                  placeholder="e.g. Physical damage, Water damage, Screen cracks" rows="2"
                  onChange={handleChange} value={form.warrantyNotCoveredInfo} className={inputClass} />
              </div>
              <NavButtons />
            </div>
          )}

          {/* ── MANUFACTURER ────────────────────────── */}
          {activeSection === 'manufacturer' && (
            <div className={sectionCard}>
              <h2 className="border-b border-orange-100 pb-3 text-lg font-black text-white">Manufacturer / Brand Info</h2>
              <p className="-mt-2 text-xs text-white/50">Required by consumer protection guidelines</p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Manufacturer Name</label>
                  <input type="text" name="manufacturerName" placeholder="e.g. Samsung India Pvt. Ltd."
                    onChange={handleChange} value={form.manufacturerName} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Marketed By</label>
                  <input type="text" name="marketedBy" placeholder="e.g. Samsung India Electronics"
                    onChange={handleChange} value={form.marketedBy} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Manufacturer Address</label>
                <textarea name="manufacturerAddress" placeholder="Full registered address" rows="2"
                  onChange={handleChange} value={form.manufacturerAddress} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Contact (Phone / Email)</label>
                  <input type="text" name="manufacturerContact" placeholder="e.g. 1800-40-7267864"
                    onChange={handleChange} value={form.manufacturerContact} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Country of Origin</label>
                  <input type="text" name="countryOfOrigin"
                    onChange={handleChange} value={form.countryOfOrigin} className={inputClass} />
                </div>
              </div>
              <NavButtons />
            </div>
          )}

        </form>
      </div>
    </div>
  );
};

export default AddProduct;


