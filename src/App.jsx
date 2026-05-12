import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, User, Menu, Globe, Sun, Moon, 
  Share2, Heart, Bell, BookOpen, Coffee, 
  Sparkles, ChevronRight, ArrowLeft, ExternalLink, Download,
  Clock, MapPin, Search, Filter, Hash
} from 'lucide-react';

/**
 * DYNAMIC TITHI CALCULATOR
 * Demonstrates internal engine capacity.
 */
const getTodayTithi = () => {
  const tithis = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami",
    "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami",
    "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
  ];
  const diff = (new Date().getTime() - new Date("1970-01-01").getTime()) / (1000 * 60 * 60 * 24);
  const tithiIndex = Math.floor((diff % 29.530588853 / 29.530588853) * 30);
  return tithis[tithiIndex] || "Shukla Paksha";
};

const App = () => {
  const [lang, setLang] = useState('en');
  const [currentView, setCurrentView] = useState('home');
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [festivals, setFestivals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveCategory] = useState('All');
  const [todayTithi, setTodayTithi] = useState('');

  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=1000";
  const LOGO_URL = "https://pathofkarma.com/wp-content/uploads/2026/05/Path-of-karma-Final-Logo-1.jpg";

  useEffect(() => {
    setTodayTithi(getTodayTithi());
    fetchWordPressData();
  }, []);

  const fetchWordPressData = async () => {
    try {
      const response = await fetch('https://pathofkarma.com/wp-json/wp/v2/festival?_embed&per_page=100');
      const wpData = await response.json();

      const formatted = wpData.map(post => {
        const acf = post.acf || {};
        
        const getVal = (words) => {
          if (acf[words.join('_')]) return acf[words.join('_')];
          const key = Object.keys(acf).find(k => words.every(w => k.toLowerCase().includes(w)));
          return key ? acf[key] : null;
        };

        return {
          id: post.id,
          // Reading the new 'religion' field for the filter tabs
          category: acf.religion || "Hindu",
          name: { en: post.title.rendered, hi: acf.title_hi || post.title.rendered },
          story: { en: acf.story_en || '', hi: acf.story_hi || '' },
          significance: { en: acf.significance_en || '', hi: acf.significance_hi || '' },
          rituals: { en: acf.rituals_en || '', hi: acf.rituals_hi || '' },
          foods: { en: acf.foods_en || '', hi: acf.foods_hi || '' },
          // Automated Rule Data
          lunarMonth: acf.lunar_month || '',
          paksha: acf.lunar_paksha || '',
          tithi: acf.lunar_tithi || '',
          northDate: getVal(['north', 'date']) || "Upcoming",
          southDate: getVal(['south', 'date']) || "Upcoming",
          image: acf.magazine_image_link || post._embedded?.['wp:featuredmedia']?.[0]?.source_url || FALLBACK_IMAGE
        };
      });

      setFestivals(formatted);
      setIsLoading(false);
    } catch (error) {
      console.error("Scale Error:", error);
      setIsLoading(false);
    }
  };

  const filteredFestivals = useMemo(() => {
    return festivals.filter(f => {
      const matchesSearch = f.name[lang].toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'All' || f.category === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [festivals, searchQuery, activeTab, lang]);

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "Upcoming") return lang === 'en' ? 'Upcoming' : 'आगामी';
    try {
      let d = dateStr.includes('/') ? 
        new Date(dateStr.split('/')[2], dateStr.split('/')[1]-1, dateStr.split('/')[0]) : 
        new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString(lang === 'en' ? 'en-US' : 'hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch { return dateStr; }
  };

  const Navbar = () => (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#F5A623]/10 px-4 md:px-8 h-20 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('home')}>
          <img src={LOGO_URL} className="w-10 h-10 rounded-full object-cover border border-gray-100" alt="Logo" />
          <span className="font-serif text-xl font-bold text-[#2D2422] hidden sm:block">Path of <span className="text-[#DF4832]">Karma</span></span>
        </div>
      </div>

      <div className="hidden md:flex items-center space-x-2 bg-[#FFFCF8] px-4 py-2 rounded-full border border-[#F5A623]/20 text-[10px] font-bold text-[#2D2422]/60 uppercase tracking-widest">
        <Moon className="w-3 h-3 mr-2 text-[#F5A623]" />
        Today: {todayTithi}
      </div>

      <div className="flex items-center space-x-4">
        <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} className="px-4 py-2 rounded-full border border-[#F5A623]/20 text-xs font-bold text-[#2D2422] hover:bg-[#FFFCF8] transition-all">
          {lang === 'en' ? 'हिन्दी' : 'English'}
        </button>
        <button onClick={() => setCurrentView('home')} className="p-2.5 rounded-full text-[#2D2422] hover:bg-[#FFFCF8]"><Calendar className="w-5 h-5" /></button>
      </div>
    </nav>
  );

  const HomeView = () => (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
          {['All', 'Hindu', 'Sikh', 'Buddhist'].map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${activeTab === cat ? 'bg-[#DF4832] text-white shadow-lg' : 'bg-white border border-[#F5A623]/20 text-[#2D2422]/60 hover:border-[#F5A623]'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder={lang === 'en' ? "Search 700+ Festivals..." : "700+ त्योहार खोजें..."}
            className="w-full md:w-80 pl-11 pr-6 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 transition-all text-sm shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DF4832] mb-4"></div></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-10">
            {filteredFestivals.map(f => (
              <div key={f.id} onClick={() => { setSelectedFestival(f); setCurrentView('festival'); window.scrollTo(0,0); }} className="bg-white rounded-[3rem] p-5 shadow-sm border border-gray-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group flex flex-col">
                <div className="relative h-60 rounded-[2.5rem] overflow-hidden mb-6 bg-gray-50">
                  <img src={f.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={f.name[lang]} />
                  <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-bold text-[#DF4832] uppercase tracking-widest shadow-sm">{f.category}</div>
                </div>
                <div className="px-3 flex-grow flex flex-col">
                  <div className="flex items-center text-[10px] text-[#DF4832] font-bold uppercase tracking-widest mb-3 opacity-70"><Clock className="w-3.5 h-3.5 mr-2" />{formatDate(f.northDate)}</div>
                  <h3 className="font-serif text-2xl text-[#2D2422] mb-3 group-hover:text-[#DF4832] transition-colors">{f.name[lang]}</h3>
                  <div className="text-[#2D2422]/60 text-sm line-clamp-2 mb-8 font-light" dangerouslySetInnerHTML={{__html: f.significance[lang]}} />
                  <button className="mt-auto w-full py-4 rounded-[1.5rem] bg-[#FFFCF8] text-[#DF4832] font-bold text-[10px] uppercase tracking-widest hover:bg-[#F5A623] hover:text-white transition-all shadow-sm">Read More</button>
                </div>
              </div>
            ))}
          </div>
          <aside className="lg:col-span-3 space-y-10">
            <div className="bg-gradient-to-br from-white to-[#FFFCF8] border border-gray-100 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center space-y-4">
              <Sparkles className="w-6 h-6 text-[#F5A623] opacity-40" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">AdSense Space</span>
            </div>
            <div className="bg-white rounded-[2rem] border border-[#F5A623]/20 p-6 overflow-hidden">
               <img src="https://images.unsplash.com/photo-1555580556-9a5957008779?auto=format&fit=crop&q=80&w=600" className="h-40 w-full object-cover rounded-2xl mb-4" alt="Course" />
               <h4 className="font-serif text-lg text-[#2D2422] mb-2">Ramayana Course</h4>
               <p className="text-xs text-[#2D2422]/60 mb-4">Animated wisdom for kids.</p>
               <button className="w-full py-3 rounded-xl bg-[#FFFCF8] border border-[#F5A623]/30 text-[#DF4832] font-bold text-[10px] uppercase tracking-widest">Join Now</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );

  const FestivalDetailView = () => {
    if (!selectedFestival) return null;
    const f = selectedFestival;
    return (
      <div className="min-h-screen bg-[#FFFCF8] pb-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <button onClick={() => setCurrentView('home')} className="flex items-center text-[#2D2422]/40 hover:text-[#DF4832] mb-12 bg-white px-8 py-3.5 rounded-full shadow-sm font-bold text-[10px] uppercase tracking-widest transition-all">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <article className="lg:col-span-8 space-y-16">
              <div className="relative rounded-[4.5rem] overflow-hidden shadow-2xl h-[450px] md:h-[650px] border-[8px] border-white">
                <img src={f.image} className="w-full h-full object-cover" alt={f.name[lang]} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D2422] via-[#2D2422]/10 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-10 md:p-20">
                  <span className="inline-block bg-[#DF4832] text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8 shadow-2xl">{f.category}</span>
                  <h1 className="font-serif text-6xl md:text-8xl text-white font-bold tracking-tighter leading-[0.85]">{f.name[lang]}</h1>
                </div>
              </div>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-12 rounded-[3.5rem] border border-[#F5A623]/20 shadow-sm flex flex-col items-center text-center">
                  <Sun className="w-8 h-8 text-[#F5A623] mb-6 opacity-30" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#2D2422]/30 mb-3">North Indian Date</h3>
                  <p className="font-serif text-3xl text-[#2D2422]">{formatDate(f.northDate)}</p>
                </div>
                <div className="bg-white p-12 rounded-[3.5rem] border border-[#DF4832]/20 shadow-sm flex flex-col items-center text-center">
                  <Moon className="w-8 h-8 text-[#DF4832] mb-6 opacity-30" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#2D2422]/30 mb-3">South Indian Date</h3>
                  <p className="font-serif text-3xl text-[#2D2422]">{formatDate(f.southDate)}</p>
                </div>
              </section>

              <section className="bg-white p-12 md:p-20 rounded-[4.5rem] shadow-sm border border-gray-50">
                <h2 className="flex items-center font-serif text-4xl text-[#2D2422] mb-12 tracking-tight">
                  <BookOpen className="w-10 h-10 mr-6 text-[#DF4832] opacity-70" />
                  {lang === 'en' ? 'The Story' : 'कहानी'}
                </h2>
                <div className="text-xl leading-[2] text-[#2D2422]/80 font-light prose-p:mb-10" dangerouslySetInnerHTML={{__html: f.story[lang]}}></div>
              </section>

              <section className="bg-gradient-to-br from-white to-[#FFFCF8] p-12 md:p-20 rounded-[4.5rem] border border-[#F5A623]/10">
                <h2 className="flex items-center font-serif text-4xl text-[#2D2422] mb-12 tracking-tight">
                  <Sparkles className="w-10 h-10 mr-6 text-[#F5A623] opacity-70" />
                  {lang === 'en' ? 'Significance' : 'महत्व'}
                </h2>
                <div className="text-xl leading-[2] text-[#2D2422]/70 font-light" dangerouslySetInnerHTML={{__html: f.significance[lang]}}></div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <section className="bg-white p-14 rounded-[4rem] border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2.5 h-full bg-[#F5A623]/20"></div>
                  <h2 className="font-serif text-3xl text-[#2D2422] mb-8 flex items-center italic"><MapPin className="w-7 h-7 mr-5 text-[#F5A623]" />Rituals</h2>
                  <div className="text-lg text-[#2D2422]/70 font-light" dangerouslySetInnerHTML={{__html: f.rituals[lang]}}></div>
                </section>
                <section className="bg-white p-14 rounded-[4rem] border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2.5 h-full bg-[#DF4832]/20"></div>
                  <h2 className="font-serif text-3xl text-[#2D2422] mb-8 flex items-center italic"><Coffee className="w-7 h-7 mr-5 text-[#DF4832]" />Festive Foods</h2>
                  <div className="text-lg text-[#2D2422]/70 font-light" dangerouslySetInnerHTML={{__html: f.foods[lang]}}></div>
                </section>
              </div>
            </article>

            <aside className="lg:col-span-4 space-y-12">
              <div className="sticky top-28 space-y-12">
                <div className="bg-white rounded-[3rem] p-10 border border-[#F5A623]/20 shadow-sm text-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 block mb-6">Sponsored Space</span>
                  <div className="h-[500px] bg-gray-50 rounded-3xl flex items-center justify-center border border-dashed border-gray-200 text-gray-400">AdSense Space</div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  };

  const Footer = () => (
    <footer className="bg-[#2D2422] py-24 mt-auto border-t border-[#F5A623]/20">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex flex-col items-center space-y-12">
          <img src={LOGO_URL} className="w-24 h-24 rounded-full border-4 border-[#F5A623]/20 bg-white" alt="Footer Logo" />
          <a href="https://pathofkarma.com" target="_blank" rel="noopener noreferrer" className="text-white font-serif text-3xl hover:text-[#F5A623] transition-colors flex items-center">
             pathofkarma.com <ExternalLink className="w-6 h-6 ml-4 opacity-30" />
          </a>
          <div className="space-y-4">
            <p className="text-white/40 text-[11px] tracking-[0.5em] uppercase font-black">Wisdom for the Modern World</p>
            <p className="text-white/20 text-xs font-light">© {new Date().getFullYear()} Path of Karma. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans selection:bg-[#F5A623]/30 selection:text-[#2D2422]">
      <Navbar />
      <main className="flex-grow">
        {currentView === 'home' && <HomeView />}
        {currentView === 'festival' && <FestivalDetailView />}
      </main>
      <Footer />
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        :root { --font-serif: 'Playfair Display', serif; --font-sans: 'Plus Jakarta Sans', sans-serif; }
        .font-serif { font-family: var(--font-serif); }
        .font-sans { font-family: var(--font-sans); }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
};

export default App;
