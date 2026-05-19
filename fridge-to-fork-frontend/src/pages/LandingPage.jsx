import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Zap, Users, ChefHat, Star, ArrowRight, Menu, X } from 'lucide-react';

const FOOD_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1920&q=80',
  scan: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  recipe: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
  community: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
  step1: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=600&q=80',
  step2: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=600&q=80',
  step3: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80',
};

const FEATURES = [
  {
    icon: Camera,
    title: 'Snap Your Fridge',
    desc: 'Take a photo of your fridge or ingredients. Our AI identifies everything instantly — no typing needed.',
    img: FOOD_IMAGES.scan,
    color: '#ea7c2b',
  },
  {
    icon: Zap,
    title: 'AI-Crafted Recipes',
    desc: 'Get personalized recipe suggestions in seconds, tailored to exactly what you have on hand.',
    img: FOOD_IMAGES.recipe,
    color: '#c4611a',
  },
  {
    icon: Users,
    title: 'Community Table',
    desc: 'Share your creations and discover what others cook. Every meal tells a story.',
    img: FOOD_IMAGES.community,
    color: '#9a4a10',
  },
];

const STEPS = [
  { number: '01', title: 'Open your fridge', desc: 'Photograph your ingredients or type them in manually.', img: FOOD_IMAGES.step1 },
  { number: '02', title: 'Set your preferences', desc: 'Pick dietary filters — Halal, vegetarian, or vegan.', img: FOOD_IMAGES.step2 },
  { number: '03', title: 'Cook & enjoy', desc: 'Follow the AI-generated recipe and bring everyone to the table.', img: FOOD_IMAGES.step3 },
];

const TESTIMONIALS = [
  { name: 'Layla M.', text: 'I had random leftovers and Sofretna turned them into the best pasta I\'ve ever made. Magic.', stars: 5 },
  { name: 'Ahmad K.', text: 'Finally an app that understands halal cooking. The recipes are spot-on every time.', stars: 5 },
  { name: 'Sara T.', text: 'The fridge scan feature is unreal. It detected 12 ingredients in seconds!', stars: 5 },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans" dir="ltr" lang="en">

      {/* ── Navbar ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md"
              style={{ background: 'linear-gradient(135deg, #ea7c2b, #c4611a)' }}
            >
              <ChefHat size={18} />
            </div>
            <span className={`text-xl font-bold tracking-tight ${scrolled ? 'text-gray-900' : 'text-white'}`}>
              Sofretna
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'How it works', 'Community'].map(label => (
              <a
                key={label}
                href={`#${label.toLowerCase().replace(' ', '-')}`}
                className={`text-sm font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'}`}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className={`text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${
                scrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white/90 hover:text-white'
              }`}
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm font-bold px-5 py-2.5 rounded-xl text-white shadow-md transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #ea7c2b, #c4611a)' }}
            >
              Get started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg"
            onClick={() => setMenuOpen(v => !v)}
          >
            {menuOpen
              ? <X size={22} className={scrolled ? 'text-gray-700' : 'text-white'} />
              : <Menu size={22} className={scrolled ? 'text-gray-700' : 'text-white'} />
            }
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
            {['Features', 'How it works', 'Community'].map(label => (
              <a
                key={label}
                href={`#${label.toLowerCase().replace(' ', '-')}`}
                className="block text-sm font-medium text-gray-700 py-1"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              <Link to="/login" className="text-center py-2.5 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200">
                Sign in
              </Link>
              <Link
                to="/register"
                className="text-center py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #ea7c2b, #c4611a)' }}
              >
                Get started free
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <img
          src={FOOD_IMAGES.hero}
          alt="Beautiful food spread"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, rgba(20,10,0,0.72) 0%, rgba(120,50,5,0.55) 60%, rgba(20,10,0,0.80) 100%)' }}
        />

        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
          {/* Arabic badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-8"
            style={{ background: 'rgba(234,124,43,0.25)', border: '1px solid rgba(234,124,43,0.5)', backdropFilter: 'blur(8px)' }}
          >
            <span className="text-orange-300">سفرة</span>
            <span className="w-px h-4 bg-orange-400/50" />
            <span className="text-orange-200">Your digital dining table</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6">
            From your fridge
            <br />
            <span style={{ color: '#f5a05a' }}>to the table</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed mb-10">
            Sofretna turns whatever's hiding in your fridge into delicious, personalized meals —
            powered by AI, ready in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-base shadow-xl transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #ea7c2b 0%, #c4611a 100%)' }}
            >
              Start cooking free <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-base border border-white/30 backdrop-blur-sm hover:bg-white/10 transition-all"
            >
              Sign in
            </Link>
          </div>

          {/* Floating ingredient badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-12">
            {['🥕 Carrots', '🍗 Chicken', '🧅 Onion', '🥚 Eggs', '🧀 Cheese', '🍅 Tomatoes'].map((item, i) => (
              <div
                key={i}
                className="px-4 py-2 rounded-full text-sm font-medium text-white/90"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.20)', backdropFilter: 'blur(8px)' }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
          <div className="w-5 h-8 border-2 border-white/30 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-white/50 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-3">What Sofretna does</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Everything you need, nothing you don't</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Three powerful features, one seamless experience.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, title, desc, img, color }) => (
              <div
                key={title}
                className="group rounded-3xl overflow-hidden border border-gray-100 hover:border-orange-200 transition-all hover:shadow-xl"
              >
                <div className="relative h-52 overflow-hidden">
                  <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
                  <div
                    className="absolute bottom-4 left-4 w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg"
                    style={{ background: color }}
                  >
                    <Icon size={20} />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Banner ── */}
      <div style={{ background: 'linear-gradient(135deg, #ea7c2b 0%, #c4611a 100%)' }} className="py-14 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {[
            { value: '50+', label: 'Ingredients detected' },
            { value: '3', label: 'Dietary modes' },
            { value: 'AI', label: 'Powered by Gemini' },
            { value: '∞', label: 'Recipe possibilities' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-4xl font-bold mb-1">{value}</div>
              <div className="text-white/70 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 px-6 bg-orange-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-3">Simple process</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Three steps to dinner</h2>
            <p className="text-gray-500 text-lg">No meal planning. No grocery lists. Just open Sofretna.</p>
          </div>

          <div className="space-y-16">
            {STEPS.map(({ number, title, desc, img }, i) => (
              <div
                key={number}
                className={`flex flex-col md:flex-row items-center gap-10 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
              >
                <div className="flex-1 relative">
                  <div className="rounded-3xl overflow-hidden shadow-2xl aspect-video">
                    <img src={img} alt={title} className="w-full h-full object-cover" />
                  </div>
                  <div
                    className="absolute -top-4 -left-4 w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #ea7c2b, #c4611a)' }}
                  >
                    {number}
                  </div>
                </div>
                <div className="flex-1 max-w-md">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">{title}</h3>
                  <p className="text-gray-500 text-lg leading-relaxed">{desc}</p>
                  {i === 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {['📸 Photo scan', '⌨️ Manual entry', '🔍 AI detection'].map(tag => (
                        <span key={tag} className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">{tag}</span>
                      ))}
                    </div>
                  )}
                  {i === 1 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {['🥩 Halal', '🥗 Vegetarian', '🌱 Vegan'].map(tag => (
                        <span key={tag} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="community" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-3">Loved by cooks</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Real meals, real stories</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, text, stars }) => (
              <div key={name} className="p-6 rounded-3xl border border-gray-100 bg-gray-50 hover:border-orange-200 hover:bg-orange-50/50 transition-all">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} size={14} className="text-orange-400 fill-orange-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg, #ea7c2b, #c4611a)' }}
                  >
                    {name[0]}
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dietary filters showcase ── */}
      <div className="py-16 px-6 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-sm font-medium mb-6">Dietary preferences fully supported</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { emoji: '🥩', label: 'Halal', color: '#ea7c2b' },
              { emoji: '🥗', label: 'Vegetarian', color: '#4a7c59' },
              { emoji: '🌱', label: 'Vegan', color: '#2d5c3a' },
            ].map(({ emoji, label, color }) => (
              <div
                key={label}
                className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl shadow-sm border border-gray-100"
              >
                <span className="text-2xl">{emoji}</span>
                <div className="text-left">
                  <p className="font-bold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400">AI-filtered recipes</p>
                </div>
                <div className="w-2 h-2 rounded-full ml-2" style={{ background: color }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Final CTA ── */}
      <section
        className="relative py-28 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #ea7c2b 0%, #c4611a 50%, #9a4a10 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, #fff 0%, transparent 50%), radial-gradient(circle at 80% 20%, #fff 0%, transparent 50%)',
          }}
        />
        <div className="relative z-10 text-center text-white max-w-2xl mx-auto">
          <div className="text-6xl mb-6">🍽️</div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">Ready to set the table?</h2>
          <p className="text-white/75 text-lg mb-10 leading-relaxed">
            Join thousands of home cooks who never run out of recipe ideas. It's free to start.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-orange-600 bg-white text-base shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              Create free account <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-base border border-white/30 hover:bg-white/10 transition-all"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-6 bg-gray-900 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #ea7c2b, #c4611a)' }}
          >
            <ChefHat size={14} className="text-white" />
          </div>
          <span className="text-white font-bold">Sofretna</span>
          <span className="text-gray-500 text-sm">· سفرة</span>
        </div>
        <p className="text-gray-500 text-xs">Powered by Gemini AI · Built with Laravel & React</p>
      </footer>
    </div>
  );
}
