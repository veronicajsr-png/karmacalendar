import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Globe, Sun, Moon, 
  BookOpen, Coffee, Sparkles, 
  ChevronRight, ChevronLeft, ArrowLeft, 
  ExternalLink, Clock, MapPin, Search,
  Heart, Share2, Bell, User, Menu, Download, ShieldCheck
} from 'lucide-react';

const getTodayTithi = () => {
  const tithis = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami",
    "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima"
  ];
  const diff = (new Date().getTime() - new Date("1970-01-01").getTime()) / (1000 * 60 * 60 * 24);
  const tithiIndex = Math.floor((diff % 29.530588853 / 29.530588853) * 30);
  return tithis[tithiIndex] || "Shukla Paksha";
};

const stripHTML = (htmlStr) => {
  if (!htmlStr) return '';
  try {
    const doc = new DOMParser().parseFromString(htmlStr, 'text/html');
    return doc.body.textContent || '';
  } catch (e) {
    return htmlStr;
  }
};

const parseDateString = (dateStr) => {
  if (!dateStr || dateStr === "Upcoming") return null;
  const str = String(dateStr).trim();

  const isYYYYMMDD = str.length === 8 && !isNaN(Number(str));
  if (isYYYYMMDD) {
    const year = parseInt(str.slice(0, 4), 10);
    const month = parseInt(str.slice(4, 6), 10) - 1;
    const day = parseInt(str.slice(6, 8), 10);
    return new Date(year, month, day);
  }

  const parts = str.split('/');
  if (parts.length === 3) {
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }

  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? null : fallback;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMsg, setToastMsg] = useState('');
  const festivalsPerPage = 12;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [savedFestivals, setSavedFestivals] = useState([]);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=1000";
  const LOGO_URL = "https://pathofkarma.com/wp-content/uploads/2026/05/Path-of-karma-Final-Logo-1.jpg";

  useEffect(() => {
    setTodayTithi(getTodayTithi());
    fetchWordPressData();
    
    const token = localStorage.getItem('wp_token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 5000); 
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      const response = await fetch('https://pathofkarma.com/wp-json/jwt-auth/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('wp_token', data.token);
        localStorage.setItem('wp_user_name', data.user_display_name);
        setIsLoggedIn(true);
        triggerToast(lang === 'en' ? `App Linked successfully, ${data.user_display_name}!` : `ऐप सफलतापूर्वक लिंक हो गया, ${data.user_display_name}!`);
        setUsername('');
        setPassword('');
      } else {
        const cleanMsg = stripHTML(data.message);
        triggerToast(cleanMsg || (lang === 'en' ? 'Connection failed. Check your credentials.' : 'कनेक्शन विफल रहा।'));
      }
    } catch (error) {
      console.error("Login Error:", error);
      triggerToast(lang === 'en' ? 'Network error. Please try again.' : 'नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।');
    }
    
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('wp_token');
    localStorage.removeItem('wp_user_name');
    setIsLoggedIn(false);
    setSavedFestivals([]);
    triggerToast(lang === 'en' ? 'App disconnected securely.' : 'ऐप सुरक्षित रूप से डिस्कनेक्ट हो गया।');
  };

  const handleSaveFestival = (festival) => {
    if (!isLoggedIn) {
      triggerToast(lang === 'en' ? 'Please link your account to save festivals!' : 'कृपया त्योहारों को सहेजने के लिए अपना खाता लिंक करें!');
      setCurrentView('profile');
      window.scrollTo(0, 0);
      return;
    }
    
    if (savedFestivals.some(saved => saved.id === festival.id)) {
      triggerToast(lang === 'en' ? 'Festival already saved!' : 'त्योहार पहले से ही सहेजा गया है!');
      return;
    }

    setSavedFestivals([...savedFestivals, festival]);
    triggerToast(lang === 'en' ? 'Festival saved successfully!' : 'त्योहार सफलतापूर्वक सहेजा गया!');
  };

  const fetchWordPressData = async () => {
    try {
      const response = await fetch('https://pathofkarma.com/wp-json/wp/v2/festival?_embed&per_page=100');
      const wpData = await response.json();
      const today = new Date();
      today.setHours(0,0,0,0);

      const formatted = wpData.map(post => {
        const acf = post.acf || {};
        const getVal = (words) => {
          const key = Object.keys(acf).find(k => words.every(w => k.toLowerCase().includes(w)));
          const raw = key ? acf[key] : null;
          if (!raw) return '';
          const val = typeof raw === 'object' ? (raw.label || raw.value || '') : raw;
          return String(val).trim();
        };

        const northD = acf.north_indian_date || acf.festival_date_north || '';
        const parsedDate = parseDateString(northD);
        const isPast = parsedDate ? parsedDate.getTime() < today.getTime() : false;

        return {
          id: post.id,
          category: getVal(['religion']) || "Hindu",
          name: { en: post.title.rendered, hi: acf.title_hi || post.title.rendered },
          story: { en: acf.story_en || '', hi: acf.story_hi || '' },
          significance: { en: acf.significance_en || '', hi: acf.significance_hi || '' },
          rituals: { en: acf.rituals_en || '', hi: acf.rituals_hi || '' },
          foods: { en: acf.foods_en || '', hi: acf.foods_hi || '' },
          lunarMonth: getVal(['lunar', 'month']) || getVal(['month']),
          paksha: getVal(['paksha']),
          tithi: getVal(['tithi']),
          northDate: northD,
          parsedDate: parsedDate,
          isPast: isPast,
          image: acf.magazine_image_link || post._embedded?.['wp:featuredmedia']?.[0]?.source_url || FALLBACK_IMAGE
        };
      });

      formatted.sort((a, b) => {
        if (a.isPast && !b.isPast) return 1;
        if (!a.isPast && b.isPast) return -1;
        if (a.parsedDate && b.parsedDate) return a.parsedDate - b.parsedDate;
        return 0;
      });

      setFestivals(formatted);
      setIsLoading(false);
    } catch (error) {
      console.error("Data Load Error:", error);
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

  const indexOfLastFestival = currentPage * festivalsPerPage;
  const indexOfFirstFestival = indexOfLastFestival - festivalsPerPage;
  const currentFestivals = filteredFestivals.slice(indexOfFirstFestival, indexOfLastFestival);
  const totalPages = Math.ceil(filteredFestivals.length / festivalsPerPage);

  const formatDateDisplay = (f) => {
    const ruleParts = [f.lunarMonth, f.paksha, f.tithi].filter(p => p && p !== '');
    const lunarString = ruleParts.length > 0 ? ruleParts.join(' ') : (lang === 'en' ? 'Upcoming' : 'आगामी');
    if (f.isPast) return `${lunarString} (2027)`;
    if (f.parsedDate) {
      return f.parsedDate.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    return lunarString;
  };

  const Navbar = () => {
    return (
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#F5A623]/10 px-4 md:px-8 h-20 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setCurrentView('home')}>
          <img src={LOGO_URL} className="w-10 h-10 rounded-full object-cover border border-gray-100" alt="Logo" />
          <span className="font-serif text-xl font-bold text-[#2D2422] hidden sm:block">Path of <span className="text-[#DF4832]">Karma</span></span>
        </div>
        <div className="hidden md:flex items-center space-x-2 bg-[#FFFCF8] px-4 py-2 rounded-full border border-[#F5A623]/20 text-[10px] font-bold text-[#2D2422]/60 uppercase tracking-widest">
          <Moon className="w-3 h-3 mr-2 text-[#F5A623]" /> Today: {todayTithi}
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} className="px-4 py-2 rounded-full border border-[#F5A623]/20 text-xs font-bold text-[#2D2422] hover:bg-[#FFFCF8] transition-all">
            {lang === 'en' ? 'हिन्दी' : 'English'}
          </button>
          <button onClick={() => setCurrentView('home')} className="p-2.5 rounded-full text-[#2D2422] hover:bg-[#FFFCF8] transition-all">
            <Calendar className="w-5 h-5" />
          </button>
          <button onClick={() => setCurrentView('profile')} className={`p-2.5 rounded-full transition-all ${currentView === 'profile' ? 'bg-[#FFFCF8] text-[#DF4832]' : 'text-[#2D2422] hover:bg-[#FFFCF8]'}`}>
            <User className="w-5 h-5" />
          </button>
        </div>
      </nav>
    );
  };

  const HomeView = () => {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
            {['All', 'Hindu', 'Sikh', 'Buddhist'].map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${activeTab === cat ? 'bg-[#DF4832] text-white shadow-lg' : 'bg-white border border-[#F5A623]/20 text-[#2D2422]/60 hover:border-[#F5A623]'}`}>{cat}</button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder={lang === 'en' ? "Search Festivals..." : "त्योहार खोजें..."} className="w-full md:w-80 pl-11 pr-6 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 transition-all text-sm shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DF4832] mb-4"></div></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-9 flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                {currentFestivals.map(f => (
                  <div key={f.id} onClick={() => { setSelectedFestival(f); setCurrentView('festival'); window.scrollTo(0,0); }} className={`bg-white rounded-[3rem] p-5 shadow-sm border ${f.isPast ? 'border-gray-100 opacity-80' : 'border-gray-50'} hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group flex flex-col`}>
                    <div className="relative h-64 rounded-[2.5rem] overflow-hidden mb-6 bg-gray-50 shadow-inner">
                      <img src={f.image} className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ${f.isPast ? 'grayscale-[30%]' : ''}`} alt={f.name[lang]} />
                      <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-bold text-[#DF4832] uppercase tracking-widest shadow-sm">{f.category}</div>
                      {f.isPast && <div className="absolute top-5 right-5 bg-[#2D2422]/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest">Passed</div>}
                    </div>
                    <div className="px-3 flex-grow flex flex-col">
                      <div className="flex items-center text-[10px] text-[#DF4832] font-bold uppercase tracking-widest mb-3 opacity-70"><Clock className="w-3.5 h-3.5 mr-2" />{formatDateDisplay(f)}</div>
                      <h3 className="font-serif text-2xl text-[#2D2422] mb-3 group-hover:text-[#DF4832] transition-colors leading-tight">{f.name[lang]}</h3>
                      <div className="text-[#2D2422]/60 text-sm line-clamp-2 mb-8 font-light" dangerouslySetInnerHTML={{__html: f.significance[lang]}} />
                      <button className="mt-auto w-full py-4 rounded-[1.5rem] bg-[#FFFCF8] text-[#DF4832] font-bold text-[10px] uppercase tracking-widest hover:bg-[#F5A623] hover:text-white transition-all shadow-sm">Explore Details</button>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-auto">
                  <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="p-3 rounded-full border border-[#F5A623]/20 text-[#2D2422]"><ChevronLeft className="w-5 h-5" /></button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-12 h-12 rounded-full text-sm font-bold ${currentPage === i + 1 ? 'bg-[#DF4832] text-white' : 'bg-white border text-[#2D2422]/60'}`}>{i + 1}</button>
                  ))}
                  <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-3 rounded-full border border-[#F5A623]/20 text-[#2D2422]"><ChevronRight className="w-5 h-5" /></button>
                </div>
              )}
            </div>
            <aside className="lg:col-span-3 space-y-10">
               <div className="bg-white rounded-[2rem] border border-[#F5A623]/20 p-6 overflow-hidden shadow-sm">
                 <img src="https://images.unsplash.com/photo-1555580556-9a5957008779?auto=format&fit=crop&q=80&w=600" className="h-40 w-full object-cover rounded-2xl mb-4" alt="Course" />
                 <h4 className="font-serif text-lg text-[#2D2422] mb-2">Ramayana Course</h4>
                 <p className="text-xs text-[#2D2422]/60 mb-4">Animated storytelling for families.</p>
                 <button className="w-full py-3 rounded-xl bg-[#FFFCF8] border border-[#F5A623]/30 text-[#DF4832] font-bold text-[10px] uppercase tracking-widest">Join Now</button>
              </div>
            </aside>
          </div>
        )}
      </div>
    );
  };

  const FestivalDetailView = () => {
    if (!selectedFestival) return null;
    const f = selectedFestival;
    
    const detailDate = f.isPast ? "2027 Date TBD" : (f.parsedDate ? f.parsedDate.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : "TBD");
    const ruleStr = [f.lunarMonth, f.paksha, f.tithi].filter(p => p && p !== '').join(' ');

    const formatYMD = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}${m}${d}`;
    };

    const handleGoogleCalendar = (f) => {
        if (!f.parsedDate) return;
        const startStr = formatYMD(f.parsedDate);
        const endStr = formatYMD(new Date(f.parsedDate.getTime() + 24*60*60*1000));
        const title = encodeURIComponent(f.name[lang]);
        
        const cleanSig = stripHTML(f.significance[lang]);
        const details = encodeURIComponent(cleanSig.slice(0,200) + '...\n\nRead more at Path of Karma.');
        
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}`;
        window.open(url, '_blank');
    };

    const handleOutlookCalendar = (f) => {
        if (!f.parsedDate) return;
        const startStr = formatYMD(f.parsedDate);
        const endStr = formatYMD(new Date(f.parsedDate.getTime() + 24*60*60*1000));
        const title = f.name[lang];
        
        const cleanSig = stripHTML(f.significance[lang]);
        const details = cleanSig.slice(0,200) + '...';
        
        const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART;VALUE=DATE:${startStr}\nDTEND;VALUE=DATE:${endStr}\nSUMMARY:${title}\nDESCRIPTION:${details}\nEND:VEVENT\nEND:VCALENDAR`;
        
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', `${title}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
                  {f.isPast && <span className="inline-block ml-3 bg-[#2D2422]/80 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8 shadow-2xl">Passed</span>}
                  <h1 className="font-serif text-6xl md:text-8xl text-white font-bold tracking-tighter leading-[0.85]">{f.name[lang]}</h1>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 border-b border-[#F5A623]/20 pb-8">
                <button 
                  onClick={() => handleSaveFestival(f)}
                  className="flex-1 sm:flex-none flex items-center justify-center bg-[#DF4832] text-white px-8 py-4 rounded-full hover:bg-[#F5A623] hover:shadow-lg transition-all font-semibold shadow-md"
                >
                  <Heart className={`w-5 h-5 mr-2 ${savedFestivals.some(saved => saved.id === f.id) ? 'fill-current' : ''}`} />
                  {lang === 'en' 
                    ? (savedFestivals.some(saved => saved.id === f.id) ? 'Saved' : 'Save Festival') 
                    : (savedFestivals.some(saved => saved.id === f.id) ? 'सहेजा गया' : 'त्योहार सहेजें')}
                </button>
                
                <div className="relative group flex-1 sm:flex-none">
                   <button 
                     onClick={() => { if (!f.parsedDate) triggerToast(lang === 'en' ? 'Exact Gregorian date not set yet.' : 'सटीक ग्रेगोरियन तिथि अभी सेट नहीं हुई है।'); }}
                     className={`w-full flex items-center justify-center border-2 px-8 py-4 rounded-full transition-all font-semibold shadow-sm ${f.parsedDate ? 'bg-white border-[#F5A623]/20 text-[#2D2422] hover:border-[#F5A623] hover:text-[#DF4832]' : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'}`}
                   >
                     <Calendar className="w-5 h-5 mr-2" />
                     {lang === 'en' ? 'Add to Calendar' : 'कैलेंडर में जोड़ें'}
                   </button>
                   
                   {f.parsedDate && (
                       <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
                          <button onClick={() => handleGoogleCalendar(f)} className="w-full text-left px-6 py-3 text-sm text-[#2D2422] hover:bg-[#FFFCF8] hover:text-[#DF4832] transition-colors border-b border-gray-50">
                             Google Calendar
                          </button>
                          <button onClick={() => handleOutlookCalendar(f)} className="w-full text-left px-6 py-3 text-sm text-[#2D2422] hover:bg-[#FFFCF8] hover:text-[#DF4832] transition-colors">
                             Apple / Outlook (.ics)
                          </button>
                       </div>
                   )}
                </div>

                <button className="p-4 rounded-full bg-white border-2 border-gray-100 text-gray-500 hover:text-[#DF4832] hover:border-[#DF4832]/30 transition-all shadow-sm">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-12 rounded-[3.5rem] border border-[#F5A623]/20 shadow-sm flex flex-col items-center text-center">
                  <Sun className="w-8 h-8 text-[#F5A623] mb-6 opacity-30" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#2D2422]/30 mb-3">Gregorian Date</h3>
                  <p className="font-serif text-3xl text-[#2D2422]">{detailDate}</p>
                </div>
                <div className="bg-white p-12 rounded-[3.5rem] border border-[#DF4832]/20 shadow-sm flex flex-col items-center text-center">
                  <Moon className="w-8 h-8 text-[#DF4832] mb-6 opacity-30" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#2D2422]/30 mb-3">Lunar Rule</h3>
                  <p className="font-serif text-2xl text-[#2D2422]">{ruleStr || "Calculating..."}</p>
                </div>
              </section>

              <section className="bg-white p-12 md:p-20 rounded-[4.5rem] shadow-sm border border-gray-50">
                <h2 className="flex items-center font-serif text-4xl text-[#2D2422] mb-12 tracking-tight">
                  <BookOpen className="w-10 h-10 mr-6 text-[#DF4832] opacity-70" />{lang === 'en' ? 'The Story' : 'कहानी'}
                </h2>
                <div className="text-xl leading-[2] text-[#2D2422]/80 font-light" dangerouslySetInnerHTML={{__html: f.story[lang]}}></div>
              </section>

              <section className="bg-gradient-to-br from-white to-[#FFFCF8] p-12 md:p-20 rounded-[4.5rem] border border-[#F5A623]/10">
                <h2 className="flex items-center font-serif text-4xl text-[#2D2422] mb-12 tracking-tight">
                  <Sparkles className="w-10 h-10 mr-6 text-[#F5A623] opacity-70" />{lang === 'en' ? 'Significance' : 'महत्व'}
                </h2>
                <div className="text-xl leading-[2] text-[#2D2422]/70 font-light" dangerouslySetInnerHTML={{__html: f.significance[lang]}}></div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <section className="bg-white p-14 rounded-[4rem] border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2.5 h-full bg-[#F5A623]/20"></div>
                  <h2 className="font-serif text-3xl text-[#2D2422] mb-8 flex items-center italic"><MapPin className="w-7 h-7 mr-5 text-[#F5A623]" /> Rituals</h2>
                  <div className="text-lg text-[#2D2422]/70 leading-relaxed font-light" dangerouslySetInnerHTML={{__html: f.rituals[lang]}}></div>
                </section>
                <section className="bg-white p-14 rounded-[4rem] border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2.5 h-full bg-[#DF4832]/20"></div>
                  <h2 className="font-serif text-3xl text-[#2D2422] mb-8 flex items-center italic"><Coffee className="w-7 h-7 mr-5 text-[#DF4832]" /> Festive Foods</h2>
                  <div className="text-lg text-[#2D2422]/70 leading-relaxed font-light" dangerouslySetInnerHTML={{__html: f.foods[lang]}}></div>
                </section>
              </div>
            </article>

            <aside className="lg:col-span-4 space-y-12">
              <div className="sticky top-28 space-y-12">
                <div className="bg-white rounded-[3rem] p-10 border border-[#F5A623]/20 shadow-sm text-center text-gray-300 min-h-[500px] flex items-center justify-center">AdSense Space</div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  };

  const ProfileView = () => {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        <div className="bg-white rounded-[3rem] p-8 md:p-14 shadow-[0_20px_50px_rgb(0,0,0,0.05)] border border-[#F5A623]/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#DF4832]/5 to-[#F5A623]/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          
          <div className="flex flex-col items-center text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-br from-[#DF4832] to-[#F5A623] rounded-full flex items-center justify-center shadow-xl relative z-10 mb-6">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            
            {!isLoggedIn ? (
              <>
                <h2 className="font-serif text-4xl text-[#2D2422] mb-4 relative z-10">
                  {lang === 'en' ? 'Secure Account Linking' : 'सुरक्षित खाता लिंकिंग'}
                </h2>
                <p className="text-[#2D2422]/60 text-lg font-light max-w-xl relative z-10">
                  {lang === 'en' 
                    ? 'To ensure maximum security and support Two-Factor Authentication (2FA), all Path of Karma accounts are managed directly on our main website.'
                    : 'अधिकतम सुरक्षा सुनिश्चित करने और 2FA का समर्थन करने के लिए, सभी खाते सीधे हमारी मुख्य वेबसाइट पर प्रबंधित किए जाते हैं।'}
                </p>
              </>
            ) : (
              <>
                <h2 className="font-serif text-4xl text-[#2D2422] mb-4 relative z-10">
                  {lang === 'en' ? 'App Linked Successfully' : 'ऐप सफलतापूर्वक लिंक हो गया'}
                </h2>
                <p className="text-[#2D2422]/60 text-lg font-light max-w-xl relative z-10">
                  {lang === 'en' 
                    ? `Welcome, ${localStorage.getItem('wp_user_name') || 'Seeker'}! Your device is securely connected to your Path of Karma account.`
                    : `स्वागत है! आपका डिवाइस आपके खाते से सुरक्षित रूप से जुड़ा हुआ है।`}
                </p>
              </>
            )}
          </div>

          {!isLoggedIn ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
              
              {/* Step 1: Manage on Main Site */}
              <div className="bg-[#FFFCF8] p-8 rounded-[2rem] border border-[#F5A623]/20 flex flex-col justify-between">
                <div>
                  <div className="text-[#DF4832] font-black text-sm uppercase tracking-widest mb-4">Step 1</div>
                  <h3 className="font-serif text-2xl text-[#2D2422] mb-3">Manage Account</h3>
                  <p className="text-[#2D2422]/60 mb-8 text-sm">
                    {lang === 'en' 
                      ? 'Click below to open Path of Karma in a new tab. Register for a new account, manage your 2FA, or reset your password.'
                      : 'नया खाता पंजीकृत करने या अपना पासवर्ड रीसेट करने के लिए नीचे क्लिक करें।'}
                  </p>
                </div>
                <a 
                  href="https://pathofkarma.com/wp-login.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white border-2 border-[#DF4832]/20 text-[#DF4832] py-4 rounded-2xl font-bold hover:border-[#DF4832] hover:shadow-md transition-all flex items-center justify-center"
                >
                  {lang === 'en' ? 'Open Account Manager' : 'खाता प्रबंधक खोलें'}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </div>

              {/* Step 2: Link Device */}
              <div className="flex flex-col justify-center">
                <div className="text-[#F5A623] font-black text-sm uppercase tracking-widest mb-4">Step 2</div>
                <h3 className="font-serif text-2xl text-[#2D2422] mb-3">Link This App</h3>
                <p className="text-[#2D2422]/60 mb-6 text-sm">
                  {lang === 'en' 
                    ? 'Once your account is set up on the main site, enter your credentials below to securely link this device.'
                    : 'एक बार जब आपका खाता मुख्य साइट पर सेट हो जाए, तो इस डिवाइस को सुरक्षित रूप से लिंक करने के लिए नीचे अपना विवरण दर्ज करें।'}
                </p>
                
                <form className="space-y-4" onSubmit={handleLogin}>
                  <input 
                    type="text"
                    required 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={lang === 'en' ? 'Username or Email' : 'उपयोगकर्ता नाम या ईमेल'}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#F5A623] focus:bg-white transition-all text-sm"
                  />
                  <input 
                    type="password"
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={lang === 'en' ? 'Password (or App Password)' : 'पासवर्ड'}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#F5A623] focus:bg-white transition-all text-sm"
                  />
                  <button 
                    type="submit" 
                    disabled={isLoggingIn}
                    className="w-full bg-[#DF4832] text-white py-4 rounded-2xl font-bold hover:bg-[#F5A623] hover:shadow-lg transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoggingIn ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      lang === 'en' ? 'Connect Device' : 'डिवाइस कनेक्ट करें'
                    )}
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="flex justify-center relative z-10">
              <button 
                onClick={handleLogout} 
                className="px-10 py-4 rounded-full border-2 border-gray-100 text-[#2D2422] font-bold hover:border-[#DF4832] hover:text-[#DF4832] transition-colors shadow-sm bg-white"
              >
                {lang === 'en' ? 'Disconnect Device' : 'डिवाइस डिस्कनेक्ट करें'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-16">
          <h3 className="font-serif text-3xl text-[#2D2422] mb-8 px-4 flex items-center">
            <Heart className="w-6 h-6 mr-3 text-[#DF4832]" />
            {lang === 'en' ? 'Your Saved Festivals' : 'आपके सहेजे गए त्योहार'}
          </h3>
          
          {!isLoggedIn ? (
            <div className="bg-white/50 backdrop-blur-sm rounded-[2rem] border border-gray-100 p-12 text-center">
              <p className="text-[#2D2422]/50 font-light text-lg">
                {lang === 'en' ? 'Link your account above to access your personal collection.' : 'अपने व्यक्तिगत संग्रह तक पहुंचने के लिए ऊपर अपना खाता लिंक करें।'}
              </p>
            </div>
          ) : savedFestivals.length > 0 ? (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#F5A623]/20 overflow-hidden">
              <ul className="divide-y divide-[#F5A623]/10">
                {savedFestivals.map(sf => (
                  <li key={sf.id} className="p-6 hover:bg-[#FFFCF8] transition-colors flex flex-col sm:flex-row sm:items-center justify-between group cursor-pointer" onClick={() => { setSelectedFestival(sf); setCurrentView('festival'); window.scrollTo(0,0); }}>
                    <div className="flex items-center mb-4 sm:mb-0">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden mr-5 shadow-sm flex-shrink-0">
                        <img src={sf.image} alt={sf.name[lang]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#F5A623] mb-1 block">{sf.category}</span>
                        <h4 className="font-serif text-xl text-[#2D2422] group-hover:text-[#DF4832] transition-colors">{sf.name[lang]}</h4>
                        <p className="text-sm text-[#2D2422]/60 mt-1">{sf.parsedDate ? sf.parsedDate.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : (lang === 'en' ? 'Upcoming' : 'आगामी')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 mt-4 sm:mt-0 sm:ml-auto">
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           const updated = savedFestivals.filter(item => item.id !== sf.id);
                           setSavedFestivals(updated);
                           triggerToast(lang === 'en' ? 'Removed from saved list.' : 'सहेजी गई सूची से हटा दिया गया।');
                         }}
                         className="flex items-center text-xs bg-white border-2 border-gray-100 text-gray-400 px-5 py-2.5 rounded-xl hover:border-[#DF4832] hover:text-[#DF4832] transition-all font-bold"
                       >
                         {lang === 'en' ? 'Remove' : 'हटाएं'}
                       </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#F5A623]/20 p-12 text-center">
              <p className="text-[#2D2422]/60 font-light text-lg">
                {lang === 'en' ? "You haven't saved any festivals yet. Explore the calendar and click the Heart icon!" : "आपने अभी तक कोई त्योहार नहीं सहेजा है। कैलेंडर देखें और हार्ट आइकन पर क्लिक करें!"}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const Footer = () => {
    return (
      <footer className="bg-[#2D2422] py-24 mt-auto border-t border-[#F5A623]/20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex flex-col items-center space-y-12">
            <img src={LOGO_URL} className="w-24 h-24 rounded-full border-4 border-[#F5A623]/20 bg-white shadow-2xl" alt="Footer Logo" />
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
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans selection:bg-[#F5A623]/30 selection:text-[#2D2422]">
      <Navbar />
      <main className="flex-grow">
        {currentView === 'home' && <HomeView />}
        {currentView === 'festival' && <FestivalDetailView />}
        {currentView === 'profile' && <ProfileView />}
      </main>
      <Footer />
      
      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-[#2D2422] text-white px-6 py-3 rounded-full shadow-2xl z-50 transition-all duration-300">
          {toastMsg}
        </div>
      )}

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
