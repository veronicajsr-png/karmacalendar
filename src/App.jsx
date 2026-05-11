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
  
  // State to hold your live WordPress data
  const [festivals, setFestivals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // The Bridge connecting to your WordPress API
  useEffect(() => {
    const fetchWordPressData = async () => {
      try {
        // Fetching up to 100 festivals from your live site
        const response = await fetch('https://pathofkarma.com/wp-json/wp/v2/festival?per_page=100');
        const wpData = await response.json();

        // Translating WordPress data into the format our React app understands
        const formattedFestivals = wpData.map(post => ({
          id: post.id,
          name: {
            en: post.title.rendered,
            hi: post.title.rendered
          },
          // Pulling directly from your ACF boxes (with fallbacks just in case)
          story: {
            en: post.acf?.story_en || 'Story not updated yet.',
            hi: post.acf?.story_hi || 'कहानी अभी अपडेट नहीं हुई है।'
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
          // Pulling your Unsplash image link
          image: post.acf?.magazine_image_link || "https://images.unsplash.com/photo-1605369661445-5d41512f45ea?auto=format&fit=crop&q=80&w=1000",
          date: post.acf?.north_indian_date || "Upcoming",
          type: "Hindu" 
        }));

        setFestivals(formattedFestivals);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching from Path of Karma:", error);
        setIsLoading(false);
      }
    };

    fetchWordPressData();
  }, []);

  const toggleLang = () => setLang(lang === 'en' ? 'hi' : 'en');

  // AdSense Placeholder Component
  const AdSensePlaceholder = ({ className = "" }) => (
    <div className={`relative overflow-hidden bg-gradient-to-br from-white to-[#FFFCF8] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-3xl flex flex-col items-center justify-center p-6 text-gray-400 group transition-all hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] ${className}`}>
      <div className="absolute top-3 right-4 text-[0.65rem] font-bold uppercase tracking-widest text-gray-300">Sponsored</div>
      <Sparkles className="w-6 h-6 text-gray-200 mb-2 group-hover:text-[#F5A623] transition-colors duration-500" />
      <span className="text-xs font-medium text-gray-400 text-center">AdSense Space</span>
    </div>
  );

  // Widget for Courses, Puzzles, and Books
  const PromoWidget = ({ category, title, description, image, buttonText }) => (
    <div className="bg-white rounded-[2rem] border border-[#F5A623]/20 shadow-[0_10px_30px_rgb(0,0,0,0.03)] overflow-hidden group hover:border-[#F5A623]/40 transition-colors">
      <div className="h-48 overflow-hidden relative p-2">
        <img src={image} alt={title} className="w-full h-full object-cover rounded-[1.5rem] group-hover:scale-105 transition-transform duration-700 ease-in-out" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-70 rounded-[1.5rem] m-2"></div>
        <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[0.65rem] font-bold text-[#DF4832] uppercase tracking-widest shadow-sm flex items-center">
          <Sparkles className="w-3 h-3 mr-1.5" />
          {category}
        </div>
      </div>
      <div className="p-6 pt-3">
        <h4 className="font-serif text-xl text-[#2D2422] mb-2 leading-tight">{title}</h4>
        <p className="text-sm text-[#2D2422]/60 mb-5 leading-relaxed font-light">{description}</p>
        <button className="w-full py-3 rounded-xl bg-[#FFFCF8] border border-[#F5A623]/30 text-[#DF4832] font-semibold text-sm hover:bg-[#F5A623] hover:text-white transition-all flex items-center justify-center shadow-sm">
          {buttonText} <ExternalLink className="w-4 h-4 ml-2 opacity-80" />
        </button>
      </div>
    </div>
  );

  const Navbar = () => (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#F5A623]/10 px-4 md:px-8 h-20 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-[#FFFCF8] rounded-full transition-colors lg:hidden text-[#2D2422]">
          <Menu className="w-6 h-6" />
        </button>
        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => setCurrentView('home')}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-[#DF4832] to-[#F5A623] rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:rotate-12">
            <Sun className="w-6 h-6 text-white" />
          </div>
          <span className="font-serif text-2xl font-bold text-[#2D2422] hidden sm:block tracking-tight">
            Path of <span className="text-[#DF4832]">Karma</span>
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-4">
        <button 
          onClick={toggleLang}
          className="flex items-center space-x-2 px-3 md:px-4 py-2 rounded-full border border-[#F5A623]/20 hover:bg-[#FFFCF8] hover:border-[#F5A623] transition-all text-[#2D2422] font-medium text-sm"
        >
          <Globe className="w-4 h-4 text-[#DF4832]" />
          <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
        </button>
        <button 
          onClick={() => setCurrentView('home')}
          className={`p-2.5 rounded-full transition-all ${currentView === 'home' || currentView === 'festival' ? 'bg-[#FFFCF8] text-[#DF4832] shadow-inner' : 'text-[#2D2422] hover:bg-gray-50'}`}
        >
          <Calendar className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setCurrentView('profile')}
          className={`p-2.5 rounded-full transition-all ${currentView === 'profile' ? 'bg-[#FFFCF8] text-[#DF4832] shadow-inner' : 'text-[#2D2422] hover:bg-gray-50'}`}
        >
          <User className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );

  const HomeView = () => (
    <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-64 text-[#F5A623]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DF4832] mb-4"></div>
          <p className="font-serif text-lg text-[#2D2422]">
            {lang === 'en' ? 'Awakening the Calendar...' : 'कैलेंडर जागृत हो रहा है...'}
          </p>
        </div>
      )}

      {/* Render your live festivals */}
      {!isLoading && festivals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {festivals.map(festival => (
            <div 
              key={festival.id}
              onClick={() => {
                setSelectedFestival(festival);
                setCurrentView('festival');
                window.scrollTo(0, 0);
              }}
              className="bg-white rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F5A623]/10 hover:shadow-[0_20px_40px_rgb(245,166,35,0.1)] hover:-translate-y-1 transition-all duration-500 cursor-pointer group flex flex-col"
            >
              <div className="relative h-64 rounded-[2rem] overflow-hidden mb-6">
                <img 
                  src={festival.image} 
                  alt={festival.name[lang]}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-80"></div>
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-[#DF4832] uppercase tracking-wider shadow-sm">
                  {festival.type}
                </div>
              </div>
              <div className="px-4 pb-4 flex flex-col flex-grow">
                <h3 className="font-serif text-2xl text-[#2D2422] mb-2 group-hover:text-[#DF4832] transition-colors">
                  {festival.name[lang]}
                </h3>
                {/* Dynamically stripping HTML tags if ACF sends them */}
                <p className="text-[#2D2422]/60 text-sm font-light line-clamp-2 leading-relaxed mb-6"
                   dangerouslySetInnerHTML={{__html: festival.significance[lang]}} 
                />
                <button className="mt-auto w-full py-3.5 rounded-2xl bg-[#FFFCF8] text-[#DF4832] font-bold text-sm group-hover:bg-[#F5A623] group-hover:text-white transition-all shadow-sm flex items-center justify-center">
                  {lang === 'en' ? 'Read Story' : 'कहानी पढ़ें'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && festivals.length === 0 && (
        <div className="text-center py-20">
          <p className="text-[#2D2422]/60 font-serif text-xl">No festivals found. Please check your WordPress API.</p>
        </div>
      )}
    </div>
  );

  const FestivalDetailView = () => {
    if (!selectedFestival) return null;

    return (
      <div className="min-h-screen bg-[#FFFCF8] pb-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button 
            onClick={() => setCurrentView('home')}
            className="flex items-center text-[#2D2422]/60 hover:text-[#DF4832] transition-colors font-medium text-sm mb-6 bg-white px-4 py-2 rounded-full shadow-sm w-fit"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {lang === 'en' ? 'Back to Calendar' : 'कैलेंडर पर वापस'}
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <article className="lg:col-span-8 space-y-12 text-lg text-[#2D2422]/80 leading-relaxed font-light">
              
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl h-[400px] md:h-[500px]">
                <img 
                  src={selectedFestival.image} 
                  alt={selectedFestival.name[lang]}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D2422] via-[#2D2422]/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                  <div className="flex gap-3 mb-4">
                    <span className="bg-[#DF4832] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                      {selectedFestival.type}
                    </span>
                    <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center">
                      <Calendar className="w-3 h-3 mr-1.5" /> {selectedFestival.date}
                    </span>
                  </div>
                  <h1 className="font-serif text-5xl md:text-6xl text-white font-bold mb-4 tracking-tight drop-shadow-md">
                    {selectedFestival.name[lang]}
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 border-b border-[#F5A623]/20 pb-8">
                <button className="flex-1 sm:flex-none flex items-center justify-center bg-[#DF4832] text-white px-8 py-4 rounded-full hover:bg-[#F5A623] hover:shadow-lg transition-all font-semibold shadow-md">
                  <Heart className="w-5 h-5 mr-2" />
                  {lang === 'en' ? 'Save Festival' : 'त्योहार सहेजें'}
                </button>
                <button className="flex-1 sm:flex-none flex items-center justify-center bg-white border-2 border-[#F5A623]/20 text-[#2D2422] px-8 py-4 rounded-full hover:border-[#F5A623] hover:text-[#DF4832] transition-all font-semibold shadow-sm">
                  <Bell className="w-5 h-5 mr-2" />
                  {lang === 'en' ? 'Notify Me' : 'मुझे सूचित करें'}
                </button>
                <button className="p-4 rounded-full bg-white border-2 border-gray-100 text-gray-500 hover:text-[#DF4832] hover:border-[#DF4832]/30 transition-all shadow-sm">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              <section>
                <h2 className="flex items-center font-serif text-3xl text-[#2D2422] mb-6 tracking-tight">
                  <BookOpen className="w-6 h-6 mr-3 text-[#DF4832]" />
                  {lang === 'en' ? 'The Story' : 'कहानी'}
                </h2>
                <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-gray-100 text-lg leading-loose" dangerouslySetInnerHTML={{__html: selectedFestival.story[lang]}}>
                </div>
              </section>

              <section>
                <h2 className="flex items-center font-serif text-3xl text-[#2D2422] mb-6 tracking-tight">
                  <Sparkles className="w-6 h-6 mr-3 text-[#F5A623]" />
                  {lang === 'en' ? 'Spiritual Significance' : 'आध्यात्मिक महत्व'}
                </h2>
                <div className="bg-gradient-to-br from-[#FFF5E6] to-white p-8 md:p-10 rounded-[2rem] border border-[#F5A623]/20 text-lg leading-loose" dangerouslySetInnerHTML={{__html: selectedFestival.significance[lang]}}>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:border-[#F5A623]/30 transition-colors">
                  <h2 className="font-serif text-2xl text-[#2D2422] mb-4 flex items-center">
                    <Moon className="w-5 h-5 mr-3 text-[#F5A623]" />
                    {lang === 'en' ? 'Observances & Fasting' : 'अनुष्ठान और उपवास'}
                  </h2>
                  <div className="text-base" dangerouslySetInnerHTML={{__html: selectedFestival.rituals[lang]}}></div>
                </section>

                <section className="bg-[#FFFCF8] p-8 rounded-[2rem] border border-gray-100 relative overflow-hidden group hover:border-[#DF4832]/20 transition-colors">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[#DF4832]/5 rounded-full -mr-20 -mt-20 blur-3xl transition-all group-hover:bg-[#DF4832]/10"></div>
                  <h2 className="font-serif text-2xl text-[#2D2422] mb-4 relative z-10 flex items-center">
                    <Coffee className="w-5 h-5 mr-3 text-[#DF4832]" />
                    {lang === 'en' ? 'Festive Foods' : 'उत्सव के खाद्य पदार्थ'}
                  </h2>
                  <div className="relative z-10 text-base" dangerouslySetInnerHTML={{__html: selectedFestival.foods[lang]}}></div>
                </section>
              </div>
            </article>

            {/* Sticky Sidebar Column */}
            <aside className="lg:col-span-4 space-y-8 relative">
              <div className="sticky top-28 space-y-8">
                
                {/* Educational Course Widget */}
                <PromoWidget 
                  category={lang === 'en' ? "Online Course" : "ऑनलाइन कोर्स"}
                  title={lang === 'en' ? "The Ramayana Masterclass" : "रामायण मास्टरक्लास"}
                  description={lang === 'en' ? "An interactive, animated video course teaching kids the epic tale of Lord Rama." : "बच्चों को भगवान राम की महाकाव्य कहानी सिखाने वाला एक इंटरैक्टिव, एनिमेटेड वीडियो कोर्स।"}
                  image="https://images.unsplash.com/photo-1555580556-9a5957008779?auto=format&fit=crop&q=80&w=600"
                  buttonText={lang === 'en' ? "Start Learning" : "सीखना शुरू करें"}
                />

                {/* Puzzle/Game Widget */}
                <PromoWidget 
                  category={lang === 'en' ? "Kids Corner" : "किड्स कॉर्नर"}
                  title={lang === 'en' ? "Dharma Puzzles" : "धर्म पहेलियाँ"}
                  description={lang === 'en' ? "Fun, educational jigsaw puzzles featuring Hindu deities and ancient Vedic stories." : "हिंदू देवताओं और प्राचीन वैदिक कहानियों की विशेषता वाली मजेदार, शैक्षिक पहेलियाँ।"}
                  image="https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=600"
                  buttonText={lang === 'en' ? "Play Now" : "अभी खेलें"}
                />

                {/* Vertical AdSense space for sidebar */}
                <AdSensePlaceholder className="w-full h-96" />
                
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  };

  const ProfileView = () => (
    <div className="max-w-3xl mx-auto px-4 py-12 relative z-10">
      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_20px_50px_rgb(0,0,0,0.05)] border border-[#F5A623]/10 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#DF4832]/5 to-[#F5A623]/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        
        <div className="w-24 h-24 bg-gradient-to-br from-[#DF4832] to-[#F5A623] rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl relative z-10">
          <User className="w-10 h-10 text-white" />
        </div>
        <h2 className="font-serif text-3xl text-[#2D2422] mb-3 relative z-10">
          {lang === 'en' ? 'Join Path of Karma' : 'कर्म के पथ से जुड़ें'}
        </h2>
        <p className="text-[#2D2422]/60 mb-8 font-light max-w-md mx-auto relative z-10">
          {lang === 'en' 
            ? 'Create a unified account to save your favorite festivals, get email reminders, and access our courses and books.'
            : 'अपने पसंदीदा त्योहारों को सहेजने, ईमेल अनुस्मारक प्राप्त करने और हमारे पाठ्यक्रमों और पुस्तकों तक पहुंचने के लिए एक एकीकृत खाता बनाएं।'}
        </p>
        
        <form className="space-y-4 max-w-sm mx-auto relative z-10" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="email" 
            placeholder={lang === 'en' ? 'Email Address' : 'ईमेल पता'}
            className="w-full px-5 py-4 bg-[#FFFCF8] border border-gray-200 rounded-2xl focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] transition-all"
          />
          <button className="w-full bg-[#DF4832] text-white py-4 rounded-2xl font-bold hover:bg-[#F5A623] hover:shadow-lg transition-all shadow-md">
            {lang === 'en' ? 'Sign Up / Log In' : 'साइन अप / लॉग इन'}
          </button>
        </form>
      </div>

      <div className="mt-12">
        <h3 className="font-serif text-2xl text-[#2D2422] mb-6 px-4">
          {lang === 'en' ? 'Saved Festivals' : 'सहेजे गए त्योहार'}
        </h3>
        {festivals.length > 0 && (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            {/* Show just the first item from the live DB as a placeholder for "saved" festivals */}
            <ul className="divide-y divide-gray-50">
              <li className="p-6 hover:bg-[#FFFCF8] transition-colors flex items-center justify-between group cursor-pointer" onClick={() => { setSelectedFestival(festivals[0]); setCurrentView('festival'); }}>
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-xl overflow-hidden mr-4">
                    <img src={festivals[0].image} alt={festivals[0].name[lang]} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2D2422] group-hover:text-[#DF4832] transition-colors">{festivals[0].name[lang]}</h4>
                    <p className="text-sm text-[#2D2422]/60">{festivals[0].date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                   <button 
                     className="flex items-center text-xs bg-white border border-gray-200 text-[#2D2422] px-4 py-2 rounded-xl hover:border-[#F5A623] hover:text-[#DF4832] transition-colors font-bold shadow-sm"
                   >
                     <Download className="w-4 h-4 mr-1.5" />
                     {lang === 'en' ? 'Export' : 'निर्यात'}
                   </button>
                </div>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  const Footer = () => (
    <footer className="bg-[#2D2422] py-12 mt-auto border-t border-[#F5A623]/20 relative z-20">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-white/50 text-sm mb-6 font-light">
          {lang === 'en' ? 'Discover more spiritual insights and wisdom at' : 'अधिक आध्यात्मिक अंतर्दृष्टि और ज्ञान की खोज करें'}
        </p>
        <a 
          href="https://pathofkarma.com" 
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-full transition-all group shadow-[0_4px_20px_rgb(0,0,0,0.2)]"
        >
          <span className="font-serif text-xl md:text-2xl tracking-tight mr-3">pathofkarma.com</span>
          <ExternalLink className="w-5 h-5 text-[#F5A623] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </a>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans selection:bg-[#F5A623]/30 selection:text-[#2D2422]">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] z-0" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}}></div>
      
      <div className="relative z-10 flex flex-col flex-grow">
        <Navbar />
        
        <main className="flex-grow">
          {currentView === 'home' && <HomeView />}
          {currentView === 'festival' && <FestivalDetailView />}
          {currentView === 'profile' && <ProfileView />}
        </main>

        <Footer />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        
        :root {
          --font-serif: 'Playfair Display', serif;
          --font-sans: 'Plus Jakarta Sans', sans-serif;
        }
        
        .font-serif { font-family: var(--font-serif); }
        .font-sans { font-family: var(--font-sans); }

        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #FFFCF8;
        }
        ::-webkit-scrollbar-thumb {
          background: #F5A623;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #DF4832;
        }
      `}} />
    </div>
  );
};

export default App;
