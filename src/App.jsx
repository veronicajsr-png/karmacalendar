import React, { useState, useEffect } from 'react';
import { 
  Calendar, User, Menu, Globe, Sun, Moon, 
  Share2, Heart, Bell, BookOpen, Coffee, 
  Sparkles, ChevronRight, ArrowLeft, ExternalLink, Download,
  Clock, MapPin
} from 'lucide-react';

/**
 * INTERNAL PANCHANG LOGIC
 * Calculates the Lunar Day (Tithi) locally to ensure the app is "Automatic".
 */
const getTodayTithi = () => {
  const tithis = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami",
    "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami",
    "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
  ];
  const epoch = new Date("1970-01-01").getTime();
  const now = new Date().getTime();
  const diff = (now - epoch) / (1000 * 60 * 60 * 24);
  const lunarMonth = 29.530588853;
  const daysIntoCycle = diff % lunarMonth;
  const tithiIndex = Math.floor((daysIntoCycle / lunarMonth) * 30);
  return tithis[tithiIndex] || "Shukla Paksha";
};

const App = () => {
  const [lang, setLang] = useState('en');
  const [currentView, setCurrentView] = useState('home');
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [festivals, setFestivals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todayTithi, setTodayTithi] = useState('');

  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=1000";
  const LOGO_URL = "https://pathofkarma.com/wp-content/uploads/2026/05/Path-of-karma-Final-Logo-1.jpg";

  useEffect(() => {
    setTodayTithi(getTodayTithi());
  }, []);

  /**
   * ROBUST DATE FORMATTER
   * Corrected to handle 'd/m/Y' (11/05/2026) or 'YYYYMMDD' or ISO strings.
   */
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "Upcoming" || dateStr === "") return lang === 'en' ? 'Upcoming' : 'आगामी';
    
    try {
      let dateObj;
      const cleanStr = String(dateStr).trim();
      
      // Check for d/m/Y format (Day/Month/Year)
      if (cleanStr.includes('/')) {
        const parts = cleanStr.split('/');
        if (parts.length === 3) {
          // JS Months are 0-indexed (Jan is 0)
          dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
      } 
      // Check for YYYYMMDD format
      else if (cleanStr.length === 8 && !isNaN(cleanStr)) {
        dateObj = new Date(cleanStr.substring(0, 4), cleanStr.substring(4, 6) - 1, cleanStr.substring(6, 8));
      } else {
        dateObj = new Date(cleanStr);
      }

      if (!dateObj || isNaN(dateObj.getTime())) return dateStr;

      return dateObj.toLocaleDateString(lang === 'en' ? 'en-US' : 'hi-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  useEffect(() => {
    const fetchWordPressData = async () => {
      try {
        const response = await fetch('https://pathofkarma.com/wp-json/wp/v2/festival?_embed&per_page=100');
        const wpData = await response.json();

        const formattedFestivals = wpData.map(post => {
          // Accessing the ACF data. We also check meta just in case.
          const acf = post.acf || post.meta || {};
          
          // Debugging: If dates are still missing, check your Browser Console (F12)
          console.log(`Extracting data for ${post.title.rendered}:`, acf);

          // SUPER-EXTRACTOR: Scans all keys for matching keywords
          const extractField = (searchWords) => {
            // First try exact matches from our guide
            const preferred = searchWords.join('_'); 
            if (acf[preferred]) return acf[preferred];

            // If not found, scan all keys for a partial match
            const foundKey = Object.keys(acf).find(k => 
              searchWords.every(word => k.toLowerCase().includes(word.toLowerCase()))
            );
            return foundKey ? acf[foundKey] : null;
          };

          return {
            id: post.id,
            name: {
              en: post.title.rendered,
              hi: acf.title_hi || post.title.rendered
            },
            story: {
              en: acf.story_en || 'Full story coming soon...',
              hi: acf.story_hi || 'पूरी कहानी जल्द ही आ रही है...'
            },
            significance: {
              en: acf.significance_en || '',
              hi: acf.significance_hi || ''
            },
            rituals: {
              en: acf.rituals_en || '',
              hi: acf.rituals_hi || ''
            },
            foods: {
              en: acf.foods_en || '',
              hi: acf.foods_hi || ''
            },
            // Searching for 'north' + 'date' and 'south' + 'date'
            northDate: extractField(['north', 'date']) || "Upcoming",
            southDate: extractField(['south', 'date']) || "Upcoming",
            image: acf.magazine_image_link || 
                   post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 
                   FALLBACK_IMAGE,
            type: "Hindu" 
          };
        });

        setFestivals(formattedFestivals);
        setIsLoading(false);
      } catch (error) {
        console.error("API Fetch Error:", error);
        setIsLoading(false);
      }
    };

    fetchWordPressData();
  }, [lang]);

  const toggleLang = () => setLang(lang === 'en' ? 'hi' : 'en');

  const handleImageError = (e) => {
    e.target.src = LOGO_URL;
    e.target.className = "w-full h-full object-contain p-12 bg-gray-50 opacity-30 shadow-inner";
  };

  const AdSensePlaceholder = ({ className = "" }) => (
    <div className={`relative overflow-hidden bg-white border border-gray-100 shadow-sm rounded-[2.5rem] flex flex-col items-center justify-center p-6 text-gray-300 group hover:shadow-md transition-all ${className}`}>
      <div className="absolute top-5 right-6 text-[0.6rem] font-bold uppercase tracking-[0.3em] text-gray-200">Ad</div>
      <Sparkles className="w-6 h-6 mb-3 opacity-40 text-[#F5A623]" />
      <span className="text-[10px] font-black uppercase tracking-widest text-center text-gray-400">Sponsored Space</span>
    </div>
  );

  const PromoWidget = ({ category, title, description, image, buttonText }) => (
    <div className="bg-white rounded-[2.5rem] border border-[#F5A623]/20 shadow-sm overflow-hidden group hover:border-[#F5A623]/40 transition-colors">
      <div className="h-44 overflow-hidden relative">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition-all"></div>
        <div className="absolute top-5 left-5 bg-white/90 px-3 py-1.5 rounded-full text-[10px] font-bold text-[#DF4832] uppercase tracking-widest shadow-sm">
          {category}
        </div>
      </div>
      <div className="p-7">
        <h4 className="font-serif text-xl text-[#2D2422] mb-2">{title}</h4>
        <p className="text-xs text-[#2D2422]/60 mb-5 leading-relaxed line-clamp-2">{description}</p>
        <button className="w-full py-4 rounded-2xl bg-[#FFFCF8] border border-[#F5A623]/30 text-[#DF4832] font-bold text-[10px] uppercase tracking-widest hover:bg-[#F5A623] hover:text-white transition-all shadow-sm">
          {buttonText}
        </button>
      </div>
    </div>
  );

  const Navbar = () => (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#F5A623]/10 px-4 md:px-8 h-20 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setCurrentView('home')}>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden flex items-center justify-center shadow-sm border border-gray-100 bg-white">
             <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-serif text-2xl font-bold text-[#2D2422] hidden sm:block tracking-tight">
            Path of <span className="text-[#DF4832]">Karma</span>
          </span>
        </div>
      </div>

      <div className="hidden lg:flex items-center px-5 py-2.5 bg-[#FFFCF8] border border-[#F5A623]/20 rounded-full text-[10px] font-bold text-[#2D2422]/70 uppercase tracking-widest">
        <Moon className="w-3.5 h-3.5 mr-2.5 text-[#F5A623]" />
        Today: {todayTithi}
      </div>

      <div className="flex items-center space-x-4">
        <button onClick={toggleLang} className="flex items-center space-x-2 px-4 py-2 rounded-full border border-[#F5A623]/20 hover:bg-[#FFFCF8] text-[#2D2422] font-bold text-xs uppercase transition-all shadow-sm">
          <Globe className="w-4 h-4 text-[#DF4832]" />
          <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
        </button>
        <button onClick={() => setCurrentView('home')} className="p-2.5 rounded-full text-[#2D2422] hover:bg-[#FFFCF8] transition-colors">
          <Calendar className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );

  const HomeView = () => (
    <div className="max-w-7xl mx-auto px-4 py-10 relative z-10">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-80 text-[#F5A623]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#DF4832] mb-4"></div>
          <p className="font-serif text-sm text-[#2D2422] opacity-40 tracking-[0.2em] uppercase font-bold text-center">
            {lang === 'en' ? 'Synchronizing with the Heavens...' : 'स्वर्ग के साथ तालमेल बिठा रहे हैं...'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-10">
            {festivals.map(festival => (
              <div key={festival.id} onClick={() => { setSelectedFestival(festival); setCurrentView('festival'); window.scrollTo(0, 0); }} className="bg-white rounded-[3.5rem] p-5 shadow-sm border border-[#F5A623]/5 hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 cursor-pointer group flex flex-col">
                <div className="relative h-64 rounded-[2.5rem] overflow-hidden mb-6 bg-gray-50 shadow-inner">
                  <img src={festival.image} alt={festival.name[lang]} onError={handleImageError} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                  <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-bold text-[#DF4832] uppercase tracking-[0.3em] shadow-sm">{festival.type}</div>
                </div>
                <div className="px-3 flex-grow flex flex-col">
                  <div className="flex items-center text-[10px] text-[#DF4832] font-bold uppercase tracking-widest mb-4 opacity-70">
                    <Clock className="w-3.5 h-3.5 mr-2" />
                    {formatDate(festival.northDate)}
                  </div>
                  <h3 className="font-serif text-2xl text-[#2D2422] mb-3 group-hover:text-[#DF4832] transition-colors leading-tight">{festival.name[lang]}</h3>
                  <div className="text-[#2D2422]/60 text-sm line-clamp-2 mb-8 font-light leading-relaxed" dangerouslySetInnerHTML={{__html: festival.significance[lang]}} />
                  <button className="mt-auto w-full py-4 rounded-[1.5rem] bg-[#FFFCF8] text-[#DF4832] font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-[#F5A623] hover:text-white transition-all shadow-sm">
                    {lang === 'en' ? 'Open Story' : 'कहानी खोलें'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <aside className="lg:col-span-3 space-y-12">
            <AdSensePlaceholder className="h-64" />
            <PromoWidget 
              category={lang === 'en' ? "Kids Corner" : "किड्स कॉर्नर"}
              title={lang === 'en' ? "Dharma Puzzles" : "धर्म पहेलियाँ"}
              description={lang === 'en' ? "Educational puzzles featuring ancient stories." : "प्राचीन कहानियों वाले शैक्षिक पहेलियाँ।"}
              image="https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=600"
              buttonText={lang === 'en' ? "Play Now" : "अभी खेलें"}
            />
            <AdSensePlaceholder className="h-96" />
          </aside>
        </div>
      )}
    </div>
  );

  const FestivalDetailView = () => {
    if (!selectedFestival) return null;
    return (
      <div className="min-h-screen bg-[#FFFCF8] pb-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <button onClick={() => setCurrentView('home')} className="flex items-center text-[#2D2422]/40 hover:text-[#DF4832] mb-12 bg-white px-8 py-3.5 rounded-full shadow-sm font-bold text-[10px] uppercase tracking-widest transition-all">
            <ArrowLeft className="w-4 h-4 mr-2" /> {lang === 'en' ? 'Back' : 'वापस'}
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <article className="lg:col-span-8 space-y-16">
              <div className="relative rounded-[4.5rem] overflow-hidden shadow-2xl h-[450px] md:h-[650px] border-[8px] border-white">
                <img src={selectedFestival.image} alt={selectedFestival.name[lang]} onError={handleImageError} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D2422] via-[#2D2422]/10 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-10 md:p-20">
                  <span className="inline-block bg-[#DF4832] text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-[0.3em] mb-8 shadow-2xl">{selectedFestival.type}</span>
                  <h1 className="font-serif text-6xl md:text-8xl text-white font-bold tracking-tighter leading-[0.85]">{selectedFestival.name[lang]}</h1>
                </div>
              </div>

              {/* DUAL AUTOMATIC DATES SECTION */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-12 rounded-[3.5rem] border border-[#F5A623]/20 shadow-sm flex flex-col items-center text-center group hover:border-[#F5A623] transition-colors">
                  <Sun className="w-8 h-8 text-[#F5A623] mb-6 opacity-30 group-hover:opacity-100 transition-opacity" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#2D2422]/30 mb-3">{lang === 'en' ? 'North Indian Date' : 'उत्तर भारतीय तिथि'}</h3>
                  <p className="font-serif text-3xl text-[#2D2422]">{formatDate(selectedFestival.northDate)}</p>
                </div>
                <div className="bg-white p-12 rounded-[3.5rem] border border-[#DF4832]/20 shadow-sm flex flex-col items-center text-center group hover:border-[#DF4832] transition-colors">
                  <Moon className="w-8 h-8 text-[#DF4832] mb-6 opacity-30 group-hover:opacity-100 transition-opacity" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#2D2422]/30 mb-3">{lang === 'en' ? 'South Indian Date' : 'दक्षिण भारतीय तिथि'}</h3>
                  <p className="font-serif text-3xl text-[#2D2422]">{formatDate(selectedFestival.southDate)}</p>
                </div>
              </section>

              <section className="bg-white p-12 md:p-20 rounded-[4.5rem] shadow-sm border border-gray-50">
                <h2 className="flex items-center font-serif text-4xl text-[#2D2422] mb-12 tracking-tight">
                  <BookOpen className="w-10 h-10 mr-6 text-[#DF4832] opacity-70" />
                  {lang === 'en' ? 'The Story' : 'कहानी'}
                </h2>
                <div className="text-xl leading-[2] text-[#2D2422]/80 font-light prose-p:mb-10" dangerouslySetInnerHTML={{__html: selectedFestival.story[lang]}}></div>
              </section>

              <section className="bg-gradient-to-br from-white to-[#FFFCF8] p-12 md:p-20 rounded-[4.5rem] border border-[#F5A623]/10">
                <h2 className="flex items-center font-serif text-4xl text-[#2D2422] mb-12 tracking-tight">
                  <Sparkles className="w-10 h-10 mr-6 text-[#F5A623] opacity-70" />
                  {lang === 'en' ? 'Significance' : 'महत्व'}
                </h2>
                <div className="text-xl leading-[2] text-[#2D2422]/70 font-light" dangerouslySetInnerHTML={{__html: selectedFestival.significance[lang]}}></div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <section className="bg-white p-14 rounded-[4rem] border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2.5 h-full bg-[#F5A623]/20"></div>
                  <h2 className="font-serif text-3xl text-[#2D2422] mb-8 flex items-center italic">
                    <MapPin className="w-7 h-7 mr-5 text-[#F5A623]" />
                    {lang === 'en' ? 'Rituals' : 'अनुष्ठान'}
                  </h2>
                  <div className="text-lg text-[#2D2422]/70 leading-relaxed font-light" dangerouslySetInnerHTML={{__html: selectedFestival.rituals[lang]}}></div>
                </section>
                <section className="bg-white p-14 rounded-[4rem] border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2.5 h-full bg-[#DF4832]/20"></div>
                  <h2 className="font-serif text-3xl text-[#2D2422] mb-8 flex items-center italic">
                    <Coffee className="w-7 h-7 mr-5 text-[#DF4832]" />
                    {lang === 'en' ? 'Festive Foods' : 'उत्सव के खाद्य पदार्थ'}
                  </h2>
                  <div className="text-lg text-[#2D2422]/70 leading-relaxed font-light" dangerouslySetInnerHTML={{__html: selectedFestival.foods[lang]}}></div>
                </section>
              </div>
            </article>

            <aside className="lg:col-span-4 space-y-12">
              <div className="sticky top-28 space-y-12">
                <PromoWidget 
                  category={lang === 'en' ? "Masterclass" : "मास्टरक्लास"}
                  title={lang === 'en' ? "The Ramayana Course" : "रामायण कोर्स"}
                  description={lang === 'en' ? "Animated wisdom for your whole family." : "आपके पूरे परिवार के लिए एनिमेटेड ज्ञान।"}
                  image="https://images.unsplash.com/photo-1555580556-9a5957008779?auto=format&fit=crop&q=80&w=600"
                  buttonText={lang === 'en' ? "Join Journey" : "यात्रा में शामिल हों"}
                />
                <AdSensePlaceholder className="h-[600px]" />
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  };

  const Footer = () => (
    <footer className="bg-[#2D2422] py-24 mt-auto border-t border-[#F5A623]/20 relative z-20">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex flex-col items-center space-y-12">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#F5A623]/20 p-1.5 bg-white shadow-2xl">
            <img src={LOGO_URL} alt="Path of Karma" className="w-full h-full object-cover rounded-full" />
          </div>
          <a href="https://pathofkarma.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-white px-12 py-6 rounded-full transition-all group shadow-2xl">
            <span className="font-serif text-3xl mr-6 tracking-tight">pathofkarma.com</span>
            <ExternalLink className="w-7 h-7 text-[#F5A623] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>
          <div className="space-y-6">
            <p className="text-white/40 text-xs tracking-[0.6em] uppercase font-black">{lang === 'en' ? 'Wisdom for the Modern World' : 'आधुनिक विश्व के लिए ज्ञान'}</p>
            <div className="pt-6 border-t border-white/5">
              <p className="text-white/20 text-xs font-light">© {new Date().getFullYear()} Path of Karma. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans selection:bg-[#F5A623]/30 selection:text-[#2D2422]">
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] z-0" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}}></div>
      <div className="relative z-10 flex flex-col flex-grow">
        <Navbar />
        <main className="flex-grow">
          {currentView === 'home' && <HomeView />}
          {currentView === 'festival' && <FestivalDetailView />}
        </main>
        <Footer />
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        :root { --font-serif: 'Playfair Display', serif; --font-sans: 'Plus Jakarta Sans', sans-serif; }
        .font-serif { font-family: var(--font-serif); }
        .font-sans { font-family: var(--font-sans); }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}} />
    </div>
  );
};

export default App;
