// src/components/EditProduct.js
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { getErrorMessage } from '../utils/errorMessage';
import CloudinaryUploadWidget from './CloudinaryUploadWidget';

const CATEGORY_FIELDS = {
  mobiles: {
    label: '📱 Mobiles & Tablets',
    specs: [
      { name: 'os',               label: 'Operating System',      placeholder: 'e.g. Android 14' },
      { name: 'processorBrand',   label: 'Processor Brand',       placeholder: 'e.g. Snapdragon' },
      { name: 'processorName',    label: 'Processor Name',        placeholder: 'e.g. Snapdragon 8 Gen 3' },
      { name: 'ram',              label: 'RAM',                   placeholder: 'e.g. 8 GB' },
      { name: 'storage',          label: 'Internal Storage',      placeholder: 'e.g. 256 GB' },
      { name: 'expandableStorage',label: 'Expandable Storage',    placeholder: 'e.g. Up to 1 TB' },
      { name: 'displaySize',      label: 'Display Size',          placeholder: 'e.g. 6.7 inches' },
      { name: 'displayType',      label: 'Display Type',          placeholder: 'e.g. Super AMOLED' },
      { name: 'displayResolution',label: 'Resolution',            placeholder: 'e.g. 2340 x 1080' },
      { name: 'refreshRate',      label: 'Refresh Rate',          placeholder: 'e.g. 120 Hz' },
      { name: 'rearCamera',       label: 'Rear Camera',           placeholder: 'e.g. 50 MP + 12 MP' },
      { name: 'frontCamera',      label: 'Front Camera',          placeholder: 'e.g. 12 MP' },
      { name: 'batteryCapacity',  label: 'Battery',               placeholder: 'e.g. 5000 mAh' },
      { name: 'chargingSpeed',    label: 'Charging Speed',        placeholder: 'e.g. 45W Fast Charging' },
      { name: 'networkType',      label: 'Network',               placeholder: 'e.g. 5G / 4G' },
      { name: 'simType',          label: 'SIM Type',              placeholder: 'e.g. Dual SIM' },
      { name: 'color',            label: 'Color',                 placeholder: 'e.g. Phantom Black' },
      { name: 'dimensions',       label: 'Dimensions',            placeholder: 'e.g. 163 x 78 x 8.9 mm' },
      { name: 'weight',           label: 'Weight',                placeholder: 'e.g. 225 g' },
    ],
  },
  fashion: {
    label: '👗 Clothing & Fashion',
    specs: [
      { name: 'gender',          label: 'Ideal For',              placeholder: 'Men / Women / Unisex' },
      { name: 'fabricType',      label: 'Fabric / Material',      placeholder: 'e.g. 100% Cotton' },
      { name: 'fitType',         label: 'Fit Type',               placeholder: 'e.g. Slim Fit' },
      { name: 'neckType',        label: 'Neck Type',              placeholder: 'e.g. Round Neck' },
      { name: 'sleeveType',      label: 'Sleeve Type',            placeholder: 'e.g. Full Sleeve' },
      { name: 'occasion',        label: 'Occasion',               placeholder: 'e.g. Casual / Formal' },
      { name: 'pattern',         label: 'Pattern',                placeholder: 'e.g. Solid / Striped' },
      { name: 'color',           label: 'Color',                  placeholder: 'e.g. Charcoal Black' },
      { name: 'availableSizes',  label: 'Available Sizes',        placeholder: 'e.g. S, M, L, XL, XXL' },
      { name: 'washCare',        label: 'Wash Care',              placeholder: 'e.g. Machine Wash Cold' },
      { name: 'packOf',          label: 'Pack Of',                placeholder: 'e.g. 1 / 2' },
    ],
  },
  beauty: {
    label: '💄 Beauty & Personal Care',
    specs: [
      { name: 'skinType',           label: 'Skin Type',           placeholder: 'All / Oily / Dry / Sensitive' },
      { name: 'formulation',        label: 'Formulation',         placeholder: 'Cream / Gel / Serum' },
      { name: 'concern',            label: 'Skin Concern',        placeholder: 'e.g. Anti-Aging, Moisturizing' },
      { name: 'keyIngredients',     label: 'Key Ingredients',     placeholder: 'e.g. Hyaluronic Acid, SPF 50' },
      { name: 'netQuantity',        label: 'Net Quantity',        placeholder: 'e.g. 100 ml / 50 g' },
      { name: 'shade',              label: 'Shade / Color',       placeholder: 'e.g. Rose Pink / N/A' },
      { name: 'finish',             label: 'Finish',              placeholder: 'Matte / Dewy / Glossy' },
      { name: 'spf',                label: 'SPF',                 placeholder: 'e.g. SPF 50+ / No SPF' },
      { name: 'suitableFor',        label: 'Suitable For',        placeholder: 'Face / Hair / Body' },
      { name: 'applicationMethod',  label: 'How To Use',          placeholder: 'e.g. Apply 2-3 drops...' },
      { name: 'isVegan',            label: 'Vegan / Cruelty Free',placeholder: 'Yes / No' },
      { name: 'expiryInfo',         label: 'Best Before',         placeholder: '24 months from manufacture' },
    ],
  },
  appliances: {
    label: '🏠 Home Appliances',
    specs: [
      { name: 'powerConsumption',   label: 'Power Consumption',   placeholder: 'e.g. 1500 W' },
      { name: 'voltage',            label: 'Voltage',             placeholder: 'e.g. 220-240 V, 50 Hz' },
      { name: 'capacity',           label: 'Capacity',            placeholder: 'e.g. 7 kg / 260 L' },
      { name: 'starRatingBEE',      label: 'Energy Star Rating',  placeholder: 'e.g. 5 Star BEE' },
      { name: 'color',              label: 'Color',               placeholder: 'e.g. Silver / White' },
      { name: 'material',           label: 'Material',            placeholder: 'e.g. Stainless Steel' },
      { name: 'dimensions',         label: 'Dimensions',          placeholder: 'e.g. 60 × 85 × 60 cm' },
      { name: 'weight',             label: 'Weight',              placeholder: 'e.g. 12 kg' },
      { name: 'installationType',   label: 'Installation Type',   placeholder: 'Free-standing / Built-in' },
      { name: 'controlType',        label: 'Control Type',        placeholder: 'Touch Panel / Remote' },
      { name: 'connectivity',       label: 'Connectivity',        placeholder: 'Wi-Fi / Bluetooth / None' },
      { name: 'smartFeatures',      label: 'Smart Features',      placeholder: 'Voice Control / Auto Mode' },
    ],
  },
};

// Known preset category values — used to detect if loaded product has a custom category
const PRESET_CATEGORY_VALUES = new Set(['mobiles', 'fashion', 'beauty', 'appliances', 'other', '']);

const CATEGORIES = [
  { value: '',           label: '— Select Category —' },
  { value: 'mobiles',    label: '📱 Mobiles & Tablets' },
  { value: 'fashion',    label: '👗 Clothing & Fashion' },
  { value: 'beauty',     label: '💄 Beauty & Personal Care' },
  { value: 'appliances', label: '🏠 Home Appliances' },
  // Selecting this reveals a custom text input for the category name
  { value: 'other',      label: '📦 Other (Custom Category)' },
];

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeSection,  setActiveSection]  = useState('basic');
  const [fetchLoading,   setFetchLoading]   = useState(true);
  const [submitLoading,  setSubmitLoading]  = useState(false);
  const [error,          setError]          = useState('');

  const [form, setForm] = useState({
    name: '', description: '', price: '', mrp: '',
    stockQuantity: '', category: '',
    // Stores the custom name when "other" is selected
    customCategory: '',
    brand: '', images: [],
    highlights: [''], inTheBox: '', categorySpecs: {},
    specifications: [{ key: '', value: '' }],
    warrantyType: '', warrantySummary: '', warrantyServiceType: '',
    warrantyCoveredInfo: '', warrantyNotCoveredInfo: '',
    manufacturerName: '', manufacturerAddress: '',
    manufacturerContact: '', countryOfOrigin: 'India', marketedBy: '',
  });

  // ── Load existing product data ───────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const r = await api.get(`/products/${id}`);
        const p = r.data;

        const specs = Array.isArray(p.specifications) ? p.specifications : [];

        const catConfig   = CATEGORY_FIELDS[p.category];
        const catKeys     = catConfig ? catConfig.specs.map(s => s.name) : [];
        const catSpecs    = {};
        const customSpecs = [];

        specs.forEach(s => {
          if (catKeys.includes(s.key)) {
            catSpecs[s.key] = s.value;
          } else {
            customSpecs.push(s);
          }
        });

        // Detect if the saved category is a custom one (not in the preset list).
        // If so, set category to "other" and put the real name in customCategory.
        const isCustomCategory = p.category && !PRESET_CATEGORY_VALUES.has(p.category);

        setForm({
          name:          p.name          || '',
          description:   p.description   || '',
          price:         p.price         || '',
          mrp:           p.mrp           || '',
          stockQuantity: p.stockQuantity || '',
          // If category was custom, show "other" in the dropdown
          category:      isCustomCategory ? 'other' : (p.category || ''),
          // Pre-fill the custom category input with the saved value
          customCategory: isCustomCategory ? p.category : '',
          brand:         p.brand         || '',
          images:        p.images        || (p.imageUrl ? [p.imageUrl] : []),
          highlights:    p.highlights?.length > 0 ? p.highlights : [''],
          inTheBox:      p.inTheBox      || '',
          categorySpecs: catSpecs,
          specifications: customSpecs.length > 0 ? customSpecs : [{ key: '', value: '' }],
          warrantyType:          p.warranty?.type        || '',
          warrantySummary:       p.warranty?.summary     || '',
          warrantyServiceType:   p.warranty?.serviceType || '',
          warrantyCoveredInfo:   p.warranty?.covered     || '',
          warrantyNotCoveredInfo:p.warranty?.notCovered  || '',
          manufacturerName:     p.manufacturer?.name            || '',
          manufacturerAddress:  p.manufacturer?.address         || '',
          manufacturerContact:  p.manufacturer?.contact         || '',
          countryOfOrigin:      p.manufacturer?.countryOfOrigin || 'India',
          marketedBy:           p.manufacturer?.marketedBy      || '',
        });
      } catch {
        setError('Failed to load product. Please go back and try again.');
      } finally {
        setFetchLoading(false);
      }
    };
    load();
  }, [id]);

  // ── helpers ─────────────────────────────────────────────
  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const handleChange = e => set(e.target.name, e.target.value);

  const handleCategoryChange = e => {
    // Reset categorySpecs and customCategory when switching categories
    setForm(f => ({ ...f, category: e.target.value, categorySpecs: {}, customCategory: '' }));
  };
  const handleCatSpec = (name, value) => {
    setForm(f => ({ ...f, categorySpecs: { ...f.categorySpecs, [name]: value } }));
  };

  const updateHighlight = (i, v) => { const h = [...form.highlights]; h[i] = v; set('highlights', h); };
  const addHighlight    = ()    => set('highlights', [...form.highlights, '']);
  const removeHighlight = i    => set('highlights', form.highlights.filter((_, j) => j !== i));

  const updateSpec = (i, f2, v) => { const s = [...form.specifications]; s[i][f2] = v; set('specifications', s); };
  const addSpec    = ()         => set('specifications', [...form.specifications, { key: '', value: '' }]);
  const removeSpec = i          => set('specifications', form.specifications.filter((_, j) => j !== i));

  // Use custom category name when "other" is selected, otherwise use the preset value
  const getFinalCategory = () => {
    if (form.category === 'other' && form.customCategory.trim()) {
      return form.customCategory.trim().toLowerCase();
    }
    return form.category;
  };

  // ── submit ───────────────────────────────────────────────
  const handleSubmit = async e => {
    e.preventDefault();
    if (form.images.length === 0) { setError('Please keep at least one image'); return; }

    // Validate custom category name is provided when "other" is selected
    if (form.category === 'other' && !form.customCategory.trim()) {
      setError('Please enter a custom category name');
      setActiveSection('basic');
      return;
    }

    setSubmitLoading(true);
    setError('');

    const catSpecsArray = Object.entries(form.categorySpecs)
      .filter(([, v]) => v?.trim())
      .map(([key, value]) => ({ key, value }));

    const payload = {
      name:          form.name,
      description:   form.description,
      price:         parseFloat(form.price),
      mrp:           parseFloat(form.mrp || form.price),
      stockQuantity: parseInt(form.stockQuantity),
      // Send the resolved final category (custom name or preset value)
      category:      getFinalCategory(),
      brand:         form.brand,
      imageUrl:      form.images[0] || '',
      images:        form.images,
      highlights:    form.highlights.filter(h => h?.trim()),
      inTheBox:      form.inTheBox,
      specifications: [
        ...catSpecsArray,
        ...form.specifications.filter(s => s.key?.trim() && s.value?.trim()),
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
    };

    try {
      await api.put(`/products/${id}`, payload);
      alert('Product updated successfully!');
      navigate('/admin');
    } catch (err) {
      setError(getErrorMessage(err, 'Update failed. Please try again.'));
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── styles ───────────────────────────────────────────────
  const inputClass = 'w-full rounded-xl border border-orange-100 bg-[#161616] px-4 py-3 text-sm text-white shadow-sm outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100';
  const labelClass = 'block text-white/80 text-xs font-black uppercase tracking-wide mb-1.5';
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

  const NavButtons = ({ isLast = false }) => (
    <div className="flex justify-between gap-3 pt-2">
      {prevSection ? (
        <button type="button" onClick={() => setActiveSection(prevSection)}
          className="rounded-xl border border-orange-100 bg-[#161616] px-5 py-2.5 text-sm font-bold text-white/70 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:text-orange-600">
          ← Back
        </button>
      ) : <div />}
      {!isLast && nextSection ? (
        <button type="button" onClick={() => setActiveSection(nextSection)}
          className="rounded-xl bg-[#FF6B00] px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600">
          Next →
        </button>
      ) : isLast ? (
        <button type="submit" disabled={submitLoading}
          className="rounded-xl bg-[#FF6B00] px-8 py-2.5 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60">
          {submitLoading ? 'Saving...' : '✓ Save Changes'}
        </button>
      ) : null}
    </div>
  );

  // ── loading / error states ───────────────────────────────
  if (fetchLoading) return (
    <div className="min-h-screen bg-[rgba(255,107,0,0.12)]/60 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-white/50">Loading product...</p>
      </div>
    </div>
  );

  if (error && fetchLoading === false && !form.name) return (
    <div className="min-h-screen bg-[rgba(255,107,0,0.12)]/60 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-red-400 text-lg mb-4">{error}</p>
        <button onClick={() => navigate('/admin')} className="rounded-xl bg-[#FF6B00] px-6 py-2.5 font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600">
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[rgba(255,107,0,0.12)]/60 py-8">
      <div className="mb-8 bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 text-white">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-orange-100">Marketplace catalog</p>
            <h1 className="mt-2 text-3xl font-black">Edit Product</h1>
            <p className="mt-1 text-sm text-orange-50">ID #{id}</p>
          </div>
          <button onClick={() => navigate('/admin')} className="self-start rounded-xl border border-white/30 bg-[#161616]/15 px-4 py-2 text-sm font-bold transition hover:bg-[#161616]/25">
            ← Dashboard
          </button>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4">

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>
        )}

        {/* Tab navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
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

          {/* ── BASIC ───────────────────────────────── */}
          {activeSection === 'basic' && (
            <div className={sectionCard}>
              <h2 className="border-b border-orange-100 pb-3 text-lg font-black text-white">Basic Information</h2>

              <div>
                <label className={labelClass}>Category</label>
                <select value={form.category} onChange={handleCategoryChange} className={`${inputClass} cursor-pointer`}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value} className="bg-gray-900">{c.label}</option>)}
                </select>

                {/* Show custom category input when Other is selected */}
                {form.category === 'other' && (
                  <div className="mt-3">
                    <label className={labelClass}>Custom Category Name *</label>
                    <input
                      type="text"
                      name="customCategory"
                      placeholder="e.g. Books, Furniture, Sports, Toys, Grocery, Gaming..."
                      value={form.customCategory}
                      onChange={handleChange}
                      required
                      autoFocus
                      className={inputClass}
                    />
                    {/* Live preview of what will be saved */}
                    {form.customCategory.trim() && (
                      <p className="mt-1.5 text-xs font-semibold text-orange-400">
                        ✓ Will be saved as: "{form.customCategory.trim().toLowerCase()}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>Product Name *</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Brand</label>
                <input type="text" name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Samsung" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows="4" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>In The Box</label>
                <input type="text" name="inTheBox" value={form.inTheBox} onChange={handleChange} placeholder='e.g. "1 Phone, 1 Charger, 1 Cable"' className={inputClass} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Selling Price (₹) *</label>
                  <input type="number" step="0.01" name="price" value={form.price} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>MRP (₹)</label>
                  <input type="number" step="0.01" name="mrp" value={form.mrp} onChange={handleChange} className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Stock Quantity *</label>
                <input type="number" name="stockQuantity" value={form.stockQuantity} onChange={handleChange} required className={inputClass} />
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
              <p className="-mt-2 text-xs text-white/50">Remove old images and upload new ones via Cloudinary</p>

              <div className="flex flex-wrap gap-3">
                {form.images.map((img, idx) => (
                  <div key={idx} className="relative w-28 h-28 rounded-xl overflow-hidden border border-orange-100 bg-[#161616] shadow-sm group">
                    <img src={img} alt="" className="w-full h-full object-cover"
                      onError={e => { e.target.src = 'https://placehold.co/112x112?text=Error'; }} />
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
                      onUpload={url => setForm(prev => ({ ...prev, images: [...prev.images, url] }))}
                      buttonText="+ Add"
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-white/50">Max 6 images • Max 5MB each</p>
              <NavButtons />
            </div>
          )}

          {/* ── HIGHLIGHTS ──────────────────────────── */}
          {activeSection === 'highlights' && (
            <div className={sectionCard}>
              <h2 className="border-b border-orange-100 pb-3 text-lg font-black text-white">Product Highlights</h2>
              <div className="space-y-2.5">
                {form.highlights.map((h, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <span className="text-orange-500 text-sm flex-shrink-0">▸</span>
                    <input type="text" placeholder={`Highlight ${idx + 1}`} value={h}
                      onChange={e => updateHighlight(idx, e.target.value)} className={inputClass} />
                    {form.highlights.length > 1 && (
                      <button type="button" onClick={() => removeHighlight(idx)} className="text-red-400 hover:text-red-300 px-1.5 text-lg">✕</button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addHighlight} className="text-sm font-bold text-orange-600 hover:underline">+ Add Highlight</button>
              <NavButtons />
            </div>
          )}

          {/* ── CATEGORY-SPECIFIC DETAILS ───────────── */}
          {activeSection === 'catspecs' && catConfig && (
            <div className={sectionCard}>
              <h2 className="border-b border-orange-100 pb-3 text-lg font-black text-white">
                {catConfig.label} — Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {catConfig.specs.map(field => (
                  <div key={field.name}>
                    <label className={labelClass}>{field.label}</label>
                    <input type="text" placeholder={field.placeholder}
                      value={form.categorySpecs[field.name] || ''}
                      onChange={e => handleCatSpec(field.name, e.target.value)}
                      className={inputClass} />
                  </div>
                ))}
              </div>
              <NavButtons />
            </div>
          )}

          {/* ── CUSTOM SPECS ────────────────────────── */}
          {activeSection === 'specs' && (
            <div className={sectionCard}>
              <h2 className="border-b border-orange-100 pb-3 text-lg font-black text-white">Additional Specifications</h2>
              <div className="space-y-2.5">
                {form.specifications.map((spec, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input type="text" placeholder="Feature" value={spec.key}
                      onChange={e => updateSpec(idx, 'key', e.target.value)} className={`${inputClass} w-2/5`} />
                    <input type="text" placeholder="Value" value={spec.value}
                      onChange={e => updateSpec(idx, 'value', e.target.value)} className={`${inputClass} flex-1`} />
                    {form.specifications.length > 1 && (
                      <button type="button" onClick={() => removeSpec(idx)} className="text-red-400 hover:text-red-300 px-1.5 text-lg">✕</button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addSpec} className="text-sm font-bold text-orange-600 hover:underline">+ Add Row</button>
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
                  <input type="text" name="warrantyType" value={form.warrantyType} onChange={handleChange} placeholder="e.g. Manufacturer Warranty" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Warranty Period</label>
                  <input type="text" name="warrantySummary" value={form.warrantySummary} onChange={handleChange} placeholder="e.g. 1 Year" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Service Type</label>
                <input type="text" name="warrantyServiceType" value={form.warrantyServiceType} onChange={handleChange} placeholder="Carry-in / On-site / Pick & Drop" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>What's Covered</label>
                <textarea name="warrantyCoveredInfo" value={form.warrantyCoveredInfo} onChange={handleChange} rows="2" placeholder="Manufacturing defects, Hardware failures" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>What's NOT Covered</label>
                <textarea name="warrantyNotCoveredInfo" value={form.warrantyNotCoveredInfo} onChange={handleChange} rows="2" placeholder="Physical damage, Water damage" className={inputClass} />
              </div>
              <NavButtons />
            </div>
          )}

          {/* ── MANUFACTURER ────────────────────────── */}
          {activeSection === 'manufacturer' && (
            <div className={sectionCard}>
              <h2 className="border-b border-orange-100 pb-3 text-lg font-black text-white">Manufacturer Info</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Manufacturer Name</label>
                  <input type="text" name="manufacturerName" value={form.manufacturerName} onChange={handleChange} placeholder="e.g. Samsung India Pvt. Ltd." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Marketed By</label>
                  <input type="text" name="marketedBy" value={form.marketedBy} onChange={handleChange} placeholder="e.g. Samsung India Electronics" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <textarea name="manufacturerAddress" value={form.manufacturerAddress} onChange={handleChange} rows="2" placeholder="Full registered address" className={inputClass} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Contact</label>
                  <input type="text" name="manufacturerContact" value={form.manufacturerContact} onChange={handleChange} placeholder="Phone / Email" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Country of Origin</label>
                  <input type="text" name="countryOfOrigin" value={form.countryOfOrigin} onChange={handleChange} className={inputClass} />
                </div>
              </div>
              <NavButtons isLast={true} />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
