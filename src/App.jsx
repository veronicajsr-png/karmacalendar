import React, { useState, useEffect } from 'react';
import { 
  Calendar, User, Menu, Globe, Sun, Moon, 
  Share2, Heart, Bell, BookOpen, Coffee, 
  Sparkles, ChevronRight, ArrowLeft, ExternalLink, Download 
} from 'lucide-react';

const App = () => {
  const [lang, setLang] = useState('en');
  const [currentView, setCurrentView] = useState('home');
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [festivals, setFestivals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback Image: A high-quality spiritual temple photo that is verified and stable
  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=1000";
  // Secondary Fallback: Your Logo
  const LOGO_URL = "https://pathofkarma.com/wp-content/uploads/2026/05/Path-of-karma-Final-Logo-1.jpg";

  useEffect(() => {
    const fetchWordPressData = async () => {
      try {
        // _embed is critical to fetch the "Featured Image" if you set one in WP
        const response = await fetch('https://pathofkarma.com/wp-json/wp/v2/festival?_embed&per_page=100');
        const wpData = await response.json();

        const formattedFestivals = wpData.map(post => {
          // Log specific items to help you find which links are missing/broken in WP
          if (!post.acf?.magazine_image_link) {
            console.warn(`Missing image link for: ${post.title.rendered}`);
          }

          return {
            id: post.id,
            name: {
              en: post.title.rendered,
              hi: post.acf?.title_hi || post.title.rendered
            },
            story: {
              en: post.acf?.story_en || '',
              hi: post.acf?.story_hi || ''
            },
            significance: {
              en: post.acf?.significance_en || '',
              hi: post.acf?.significance_hi || ''
            },
            rituals: {
              en: post.acf?.rituals_en || '',
              hi: post.acf?.rituals_hi || ''
            },
            foods: {
              en: post.acf?.foods_en || '',
              hi: post.acf?.foods_hi || ''
            },
            // Logic: 
            // 1. ACF custom URL (The one you paste)
            // 2. WP Featured Image (Standard WP way)
            // 3. Fallback High-Quality Photo
            image: post.acf?.magazine_image_link || 
                   post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 
                   FALLBACK_IMAGE,
            date: post.acf?.north_indian_date || "Upcoming",
            type: "Hindu" 
          };
        });

        setFestivals(formattedFestivals);
        setIsLoading(false);
      } catch (error) {
        console.error("Connection Error:", error);
        setIsLoading(false);
      }
    };

    fetchWordPressData();
  }, []);

  const toggleLang = () => setLang(lang === 'en' ? 'hi' : 'en');

  // If an image link is a 404, this function swaps it for the logo so the card isn't empty
  const handleImageError = (e) => {
    e.target.src = LOGO_URL;
    e.target.className = "w-full h-full object-contain p-8 bg-gray-50 opacity-50";
  };

  const Navbar = () => (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#F5A623]/10 px-4 md:px-8 h-20 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-4">
        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => setCurrentView('home')}
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden flex items-center justify-center shadow-sm border border-gray-100 bg-white">
             <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-serif text-2xl font-bold text-[#2D2422] hidden sm:block tracking-tight">
            Path of <span className="text-[#DF4832]">Karma</span>
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button onClick={toggleLang} className="flex items-center space-x-2 px-4 py-2 rounded-full border border-[#F5A623]/20 hover:bg-[#FFFCF8] text-[#2D2422] font-semibold text-sm transition-all">
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
    <div className="max-w-7xl mx-auto px-4 py-10">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-80 text-[#F5A623]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DF4832] mb-4"></div>
          <p className="font-serif text-xl text-[#2D2422] opacity-60">
            {lang === 'en' ? 'Connecting to Path of Karma...' : 'कर्म के पथ से जुड़ रहे हैं...'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {festivals.map(festival => (
            <div 
              key={festival.id}
              onClick={() => { setSelectedFestival(festival); setCurrentView('festival'); window.scrollTo(0, 0); }}
              className="bg-white rounded-[2.5rem] p-4 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-[#F5A623]/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer group"
            >
              <div className="relative h-64 rounded-[2rem] overflow-hidden mb-6 bg-gray-50 border border-gray-50">
                <img 
                  src={festival.image} 
                  alt={festival.name[lang]}
                  onError={handleImageError}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold text-[#DF4832] uppercase tracking-widest shadow-sm">
                  {festival.type}
                </div>
              </div>
              <div className="px-4 pb-4">
                <h3 className="font-serif text-2xl text-[#2D2422] mb-3 group-hover:text-[#DF4832] transition-colors leading-tight">
                  {festival.name[lang]}
                </h3>
                <div 
                  className="text-[#2D2422]/60 text-sm line-clamp-2 mb-6 font-light leading-relaxed" 
                  dangerouslySetInnerHTML={{__html: festival.significance[lang]}} 
                />
                <button className="w-full py-4 rounded-2xl bg-[#FFFCF8] text-[#DF4832] font-bold text-xs uppercase tracking-widest hover:bg-[#F5A623] hover:text-white transition-all shadow-sm">
                  {lang === 'en' ? 'Read Full Story' : 'पूरी कहानी पढ़ें'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const FestivalDetailView = () => {
    if (!selectedFestival) return null;
    return (
      <div className="min-h-screen bg-[#FFFCF8] pb-24">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button 
            onClick={() => setCurrentView('home')} 
            className="flex items-center text-[#2D2422]/50 hover:text-[#DF4832] mb-8 bg-white px-6 py-2.5 rounded-full shadow-sm font-bold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> {lang === 'en' ? 'Back to Calendar' : 'कैलेंडर पर वापस'}
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <article className="lg:col-span-8 space-y-12">
              <div className="relative rounded-[3.5rem] overflow-hidden shadow-2xl h-[450px] md:h-[550px] border-4 border-white">
                <img 
                  src={selectedFestival.image} 
                  alt={selectedFestival.name[lang]} 
                  onError={handleImageError}
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D2422] via-[#2D2422]/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-10 md:p-16">
                  <span className="inline-block bg-[#DF4832] text-white px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 shadow-lg">
                    {selectedFestival.type}
                  </span>
                  <h1 className="font-serif text-5xl md:text-7xl text-white font-bold tracking-tighter leading-none">
                    {selectedFestival.name[lang]}
                  </h1>
                </div>
              </div>

              <section className="bg-white p-10 md:p-14 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.02)] border border-gray-50">
                <h2 className="flex items-center font-serif text-3xl text-[#2D2422] mb-8 tracking-tight">
                  <BookOpen className="w-8 h-8 mr-4 text-[#DF4832]" />
                  {lang === 'en' ? 'The Story' : 'कहानी'}
                </h2>
                <div 
                  className="text-lg leading-[1.8] text-[#2D2422]/80 font-light prose-headings:font-serif" 
                  dangerouslySetInnerHTML={{__html: selectedFestival.story[lang]}}
                ></div>
              </section>
            </article>

            <aside className="lg:col-span-4 space-y-10">
              <div className="bg-gradient-to-br from-white to-[#FFFCF8] rounded-[2.5rem] border border-[#F5A623]/20 p-10 shadow-sm sticky top-28">
                <h3 className="font-serif text-2xl mb-6 text-[#2D2422] flex items-center italic">
                  <Sparkles className="w-5 h-5 mr-3 text-[#F5A623]" />
                  {lang === 'en' ? 'Wisdom & Meaning' : 'ज्ञान और अर्थ'}
                </h3>
                <div 
                  className="text-base text-[#2D2422]/70 leading-relaxed font-light" 
                  dangerouslySetInnerHTML={{__html: selectedFestival.significance[lang]}}
                ></div>
                <hr className="my-8 border-[#F5A623]/10" />
                <div className="space-y-4">
                   <h4 className="font-bold text-xs uppercase tracking-widest text-[#DF4832]">Next Date</h4>
                   <p className="text-[#2D2422] font-serif text-xl">{selectedFestival.date}</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  };

  const Footer = () => (
    <footer className="bg-white border-t border-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-[#2D2422]/40 text-xs tracking-widest uppercase mb-4">Official Platform of</p>
        <div className="flex flex-col items-center space-y-4">
          <a href="https://pathofkarma.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[#2D2422] hover:text-[#DF4832] transition-all group">
            <span className="font-serif text-2xl mr-3 tracking-tighter">pathofkarma.com</span>
            <ExternalLink className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
          </a>
          {/* Copyright Line */}
          <p className="text-[#2D2422]/60 text-sm font-light">
            © {new Date().getFullYear()} Path of Karma. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans selection:bg-[#F5A623]/20 selection:text-[#DF4832]">
      <Navbar />
      <main className="flex-grow">
        {currentView === 'home' && <HomeView />}
        {currentView === 'festival' && <FestivalDetailView />}
      </main>
      
      <Footer />

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap');
        :root { --font-serif: 'Playfair Display', serif; --font-sans: 'Plus Jakarta Sans', sans-serif; }
        .font-serif { font-family: var(--font-serif); }
        .font-sans { font-family: var(--font-sans); }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}} />
    </div>
  );
};

export default App;
