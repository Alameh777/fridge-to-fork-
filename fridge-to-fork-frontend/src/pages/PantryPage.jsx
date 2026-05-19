import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2, Pencil, AlertTriangle, ScanLine, X, Package, ChevronRight, Zap } from 'lucide-react';
import 'barcode-detector/polyfill';
import api from '../lib/axios';
import TopBar from '../components/TopBar';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const UNITS = ['pieces', 'g', 'kg', 'ml', 'L', 'cups', 'tbsp', 'tsp', 'slices', 'cans'];

const EMPTY_FORM = { name: '', quantity: '1', unit: 'pieces', expiry_date: '', barcode: '', brand: '', calories_per_100g: '' };

function expiryLabel(days) {
  if (days === null || days === undefined) return null;
  if (days < 0) return { text: 'Expired', color: 'text-red-500', bg: 'bg-red-50', dot: 'bg-red-500' };
  if (days === 0) return { text: 'Today', color: 'text-red-500', bg: 'bg-red-50', dot: 'bg-red-500' };
  if (days <= 2) return { text: `${days}d left`, color: 'text-red-500', bg: 'bg-red-50', dot: 'bg-red-500' };
  if (days <= 5) return { text: `${days}d left`, color: 'text-orange-500', bg: 'bg-orange-50', dot: 'bg-orange-400' };
  if (days <= 14) return { text: `${days}d left`, color: 'text-yellow-600', bg: 'bg-yellow-50', dot: 'bg-yellow-400' };
  return { text: `${days}d left`, color: 'text-gray-400', bg: 'bg-gray-50', dot: 'bg-gray-300' };
}

export default function PantryPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSheet, setShowSheet] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingItem, setEditingItem] = useState(null);
  const [adjustingId, setAdjustingId] = useState(null);
  const videoRef = useRef(null);
  const controlsRef = useRef(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await api.get('/pantry');
      setItems(res.data);
    } catch {
      toast.error('Failed to load pantry');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // ── Barcode scanner (native getUserMedia + BarcodeDetector) ──
  const startScanner = () => {
    setShowScanner(true);
    setScanning(true);
  };

  const stopScanner = () => {
    controlsRef.current?.();   // controlsRef holds the cleanup fn
    controlsRef.current = null;
    setShowScanner(false);
    setScanning(false);
  };

  useEffect(() => {
    if (!showScanner) return;

    let stream = null;
    let animFrame = null;
    let done = false;

    const cleanup = () => {
      done = true;
      cancelAnimationFrame(animFrame);
      stream?.getTracks().forEach(t => t.stop());
    };
    controlsRef.current = cleanup;

    const run = async () => {
      // 1. Open camera — try rear first, fall back to any camera
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (err) {
          const msg =
            err.name === 'NotAllowedError'  ? 'Allow camera access in your browser settings, then try again.' :
            err.name === 'NotReadableError' ? 'Camera is in use by another app — close it and retry.' :
            err.name === 'NotFoundError'    ? 'No camera found on this device.' :
            `Camera error: ${err.message}`;
          toast.error(msg, { duration: 5000 });
          setShowScanner(false);
          setScanning(false);
          return;
        }
      }

      const video = videoRef.current;
      if (!video || done) { cleanup(); return; }
      video.srcObject = stream;
      await video.play().catch(() => {});

      const detector = new window.BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
      });

      // 3. Poll frames
      const scan = async () => {
        if (done) return;
        try {
          const results = await detector.detect(video);
          if (results.length > 0) {
            const code = results[0].rawValue;
            cleanup();
            setShowScanner(false);
            setScanning(false);
            await lookupBarcode(code);
            return;
          }
        } catch { /* frame not ready yet */ }
        animFrame = requestAnimationFrame(scan);
      };

      animFrame = requestAnimationFrame(scan);
    };

    run();
    return cleanup;
  }, [showScanner]);

  // ── OpenFoodFacts lookup ──
  const lookupBarcode = async (barcode) => {
    setLookingUp(true);
    setShowSheet(true);
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const p = data.product;
        const cal = Math.round(p.nutriments?.['energy-kcal_100g'] ?? p.nutriments?.['energy_100g'] / 4.184 ?? 0) || '';
        setForm(f => ({
          ...f,
          barcode,
          name: p.product_name || p.product_name_en || '',
          brand: p.brands || '',
          calories_per_100g: cal.toString(),
        }));
        toast.success('Product found!');
      } else {
        setForm(f => ({ ...f, barcode }));
        toast('Product not in database — fill in manually', { icon: 'ℹ️' });
      }
    } catch {
      setForm(f => ({ ...f, barcode }));
    } finally {
      setLookingUp(false);
    }
  };

  // ── Add / Update item ──
  const sortByExpiry = (arr) => [...arr].sort((a, b) => {
    if (!a.expiry_date) return 1;
    if (!b.expiry_date) return -1;
    return new Date(a.expiry_date) - new Date(b.expiry_date);
  });

  const saveItem = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        quantity: parseFloat(form.quantity) || 1,
        unit: form.unit,
        expiry_date: form.expiry_date || null,
        barcode: form.barcode || null,
        brand: form.brand || null,
        calories_per_100g: form.calories_per_100g ? parseInt(form.calories_per_100g) : null,
      };

      if (editingItem) {
        const res = await api.put(`/pantry/${editingItem.id}`, payload);
        setItems(prev => sortByExpiry(prev.map(i => i.id === editingItem.id ? res.data : i)));
        toast.success('Updated');
      } else {
        const res = await api.post('/pantry', payload);
        setItems(prev => sortByExpiry([res.data, ...prev]));
        toast.success('Added to pantry');
      }

      setForm(EMPTY_FORM);
      setEditingItem(null);
      setShowSheet(false);
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      quantity: String(item.quantity),
      unit: item.unit,
      expiry_date: item.expiry_date ? item.expiry_date.split('T')[0] : '',
      barcode: item.barcode || '',
      brand: item.brand || '',
      calories_per_100g: item.calories_per_100g ? String(item.calories_per_100g) : '',
    });
    setShowSheet(true);
  };

  const deleteItem = async (id) => {
    try {
      await api.delete(`/pantry/${id}`);
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success('Removed');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const adjustQty = async (item, delta) => {
    if (adjustingId === item.id) return;
    const newQty = Math.round((parseFloat(item.quantity) + delta) * 10) / 10;

    setAdjustingId(item.id);
    if (newQty <= 0) {
      setItems(prev => prev.filter(i => i.id !== item.id));
    } else {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: newQty } : i));
    }

    try {
      if (newQty <= 0) {
        await api.delete(`/pantry/${item.id}`);
        toast.success('Removed from pantry');
      } else {
        const res = await api.put(`/pantry/${item.id}`, { quantity: newQty });
        setItems(prev => sortByExpiry(prev.map(i => i.id === item.id ? res.data : i)));
      }
    } catch (err) {
      console.error('adjustQty failed:', err?.response?.data ?? err);
      fetchItems();
      toast.error(err?.response?.data?.message ?? 'Failed to update quantity');
    } finally {
      setAdjustingId(null);
    }
  };

  const expiring = items.filter(i => i.days_until_expiry !== null && i.days_until_expiry <= 5);

  const useInRecipe = () => {
    const names = expiring.length > 0
      ? expiring.map(i => i.name)
      : items.slice(0, 8).map(i => i.name);
    navigate('/', { state: { pantryIngredients: names } });
  };

  return (
    <div className="min-h-screen bg-cream-50 pb-24">
      <TopBar title="Pantry" />

      {/* Expiring warning banner */}
      {expiring.length > 0 && (
        <div className="mx-4 mt-4 p-3 bg-orange-50 border border-orange-200 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={16} className="text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-orange-700">{expiring.length} item{expiring.length > 1 ? 's' : ''} expiring soon</p>
            <p className="text-xs text-orange-500 truncate">{expiring.map(i => i.name).join(', ')}</p>
          </div>
          <button
            onClick={useInRecipe}
            className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1.5 rounded-xl flex-shrink-0"
          >
            <Zap size={12} /> Cook
          </button>
        </div>
      )}

      {/* Use pantry in recipe button */}
      {items.length > 0 && (
        <button
          onClick={useInRecipe}
          className="mx-4 mt-3 w-[calc(100%-2rem)] flex items-center justify-between px-4 py-3 bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl gradient-orange flex items-center justify-center">
              <Zap size={15} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">Generate recipes from pantry</p>
              <p className="text-xs text-gray-400">Use what you already have</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-300" />
        </button>
      )}

      {/* Items list */}
      <div className="p-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Package size={28} className="text-gray-400" />
            </div>
            <p className="font-semibold text-gray-700 mb-1">Your pantry is empty</p>
            <p className="text-sm text-gray-400">Add ingredients to track what you have</p>
          </div>
        ) : (
          items.map(item => {
            const exp = expiryLabel(item.days_until_expiry);
            return (
              <div key={item.id} className="bg-white rounded-2xl px-4 py-3.5 shadow-sm flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                    {item.brand && <p className="text-xs text-gray-400">{item.brand}</p>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl px-1 py-0.5">
                      <button
                        type="button"
                        onClick={() => adjustQty(item, -1)}
                        disabled={adjustingId === item.id}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 active:bg-red-100 active:text-red-500 disabled:opacity-40"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-bold text-gray-800 min-w-[1.5rem] text-center select-none">
                        {adjustingId === item.id
                          ? <span className="inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          : (parseFloat(item.quantity) % 1 === 0 ? parseInt(item.quantity) : parseFloat(item.quantity).toFixed(1))}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustQty(item, 1)}
                        disabled={adjustingId === item.id}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 active:bg-orange-100 active:text-orange-500 disabled:opacity-40"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-xs text-gray-400">{item.unit}</span>
                    {exp && (
                      <span className={`text-[11px] font-semibold ${exp.color} ${exp.bg} px-2 py-0.5 rounded-full`}>
                        {exp.text}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-2 text-gray-300 hover:text-orange-400 transition-colors rounded-xl hover:bg-orange-50"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-2 text-gray-300 hover:text-red-400 transition-colors rounded-xl hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add button */}
      <button
        onClick={() => { setForm(EMPTY_FORM); setEditingItem(null); setShowSheet(true); }}
        className="fixed bottom-24 right-4 w-14 h-14 gradient-orange rounded-2xl flex items-center justify-center shadow-lg text-white active:scale-95 transition-transform z-40"
      >
        <Plus size={26} />
      </button>

      {/* ── Barcode Scanner overlay ── */}
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between px-4 py-4">
            <p className="text-white font-semibold">Scan barcode</p>
            <button onClick={stopScanner} className="p-2 text-white/70 hover:text-white">
              <X size={22} />
            </button>
          </div>
          <div className="flex-1 relative flex items-center justify-center">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            {/* Viewfinder overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-64 h-40">
                <div className="absolute inset-0 border-2 border-white/30 rounded-2xl" />
                {/* Corner marks */}
                {[['top-0 left-0', 'rounded-tl-2xl border-t-2 border-l-2'],
                  ['top-0 right-0', 'rounded-tr-2xl border-t-2 border-r-2'],
                  ['bottom-0 left-0', 'rounded-bl-2xl border-b-2 border-l-2'],
                  ['bottom-0 right-0', 'rounded-br-2xl border-b-2 border-r-2']].map(([pos, cls]) => (
                  <div key={pos} className={`absolute ${pos} w-8 h-8 border-orange-400 ${cls}`} />
                ))}
                {/* Scan line animation */}
                <div className="absolute left-2 right-2 top-1/2 h-0.5 bg-orange-400/70 animate-pulse" />
              </div>
            </div>
            <p className="absolute bottom-12 text-white/70 text-sm">
              {scanning ? 'Point at a barcode…' : 'Looking up product…'}
            </p>
          </div>
        </div>
      )}

      {/* ── Add item bottom sheet ── */}
      {showSheet && (
        <div className="fixed inset-0 z-[70] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSheet(false)} />

          {/* Sheet panel — flex column so footer is always pinned */}
          <form
            onSubmit={saveItem}
            className="relative bg-white rounded-t-3xl flex flex-col"
            style={{ maxHeight: '88vh' }}
          >
            {/* Drag handle */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-4 mb-0 flex-shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">{editingItem ? 'Edit item' : 'Add to pantry'}</h2>
              <button type="button" onClick={() => { setShowSheet(false); setEditingItem(null); }} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl">
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 pb-2 space-y-3">
              {/* Scan barcode button — only when adding */}
              {!editingItem && (
                <button
                  type="button"
                  onClick={() => { setShowSheet(false); startScanner(); }}
                  className="w-full flex items-center justify-center gap-2.5 py-3 border-2 border-dashed border-orange-300 rounded-2xl text-orange-500 font-semibold text-sm hover:bg-orange-50 transition-colors"
                >
                  <ScanLine size={18} />
                  Scan product barcode
                </button>
              )}

              {lookingUp && (
                <div className="flex items-center justify-center gap-2 py-2 text-sm text-gray-500">
                  <LoadingSpinner /> Looking up product…
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <p className="text-xs text-gray-400 font-medium">or enter manually</p>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Chicken breast"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 bg-gray-50/60"
                  required
                />
              </div>

              {form.brand !== '' && (
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Brand</label>
                  <input
                    value={form.brand}
                    onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                    placeholder="Brand name"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 bg-gray-50/60"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <div className="w-24">
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Qty</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.quantity}
                    onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 bg-gray-50/60"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Unit</label>
                  <select
                    value={form.unit}
                    onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 bg-gray-50/60"
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Expiry date</label>
                <input
                  type="date"
                  value={form.expiry_date}
                  onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 bg-gray-50/60"
                />
              </div>
            </div>

            {/* Pinned footer — always visible */}
            <div className="flex-shrink-0 px-5 pt-3 pb-6 border-t border-gray-100 bg-white">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #ea7c2b 0%, #c4611a 100%)' }}
              >
                {saving
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
                  : editingItem ? 'Save changes' : 'Add to pantry'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
