import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Globe2, ShieldCheck, Users, ArrowRight, ArrowLeft, Crown, Menu, X,
  BriefcaseBusiness, LogOut, UserRound, CheckCircle2, LoaderCircle
} from 'lucide-react';
import './style.css';
import { isSupabaseConfigured, supabase } from './supabaseClient';

const dictionary = {
  en: {
    nav: ['Explore', 'How it works', 'For professionals'],
    hero: 'Where Gulf talent meets opportunity.',
    sub: 'Hire trusted professionals, showcase your expertise, and grow your business in one bilingual marketplace.',
    hire: 'Find a professional', work: 'Explore opportunities', trust: 'Built for confidence',
    features: ['Verified expertise', 'One account, two roles', 'Premium growth tools', 'Arabic & English'],
    featureText: ['Credentials can be reviewed before verification is awarded.','Hire professionals and bid on jobs from one account.','Professional profiles and tools designed to help talent grow.','An accessible experience for customers and professionals across the Gulf.'],
    steps: 'How NUSQRA works', step: ['Create your profile','Find or post work','Connect and grow'],
    stepText: ['Choose your account type and build your profile.','Browse professionals or post a job.','Connect directly and manage your work.'],
    login: 'Log in', signup: 'Create account', customer: 'Customer', professional: 'Professional',
    welcome: 'Welcome back', create: 'Create your NUSQRA account', email: 'Email address',
    password: 'Password', fullName: 'Full name', country: 'Country', chooseCountry: 'Choose country',
    save: 'Save profile', logout: 'Sign out', account: 'My account', bio: 'About you',
    headline: 'Professional headline', experience: 'Years of experience', city: 'City',
    dashboard: 'Account dashboard', roles: 'Account roles', proDetails: 'Professional details',
    enablePro: 'Enable professional profile', noConfig: 'Supabase is not configured yet. Add the project URL and publishable key to the environment variables.',
    missing: 'Please complete all required fields.', working: 'Please wait…', saved: 'Your profile was saved.',
    signedUp: 'Account created. Check your email to confirm your address, then sign in.',
    signedIn: 'You are signed in.', switched: 'Professional profile enabled.',
    authError: 'Something went wrong. Please try again.', signInPrompt: 'Already have an account? Log in',
    signUpPrompt: 'New to NUSQRA? Create an account', join: 'Join the marketplace',
    footer: 'A better services marketplace for the Gulf.',
    countries: {SA:'Saudi Arabia',AE:'United Arab Emirates',BH:'Bahrain',KW:'Kuwait',OM:'Oman',QA:'Qatar'}
  },
  ar: {
    nav: ['استكشف','كيف تعمل','للمحترفين'],
    hero: 'حيث تلتقي المواهب الخليجية بالفرص.',
    sub: 'وظّف محترفين موثوقين، واعرض خبراتك، وطوّر أعمالك في سوق خدمات ثنائي اللغة.',
    hire: 'ابحث عن محترف', work: 'استكشف الفرص', trust: 'الثقة أساسنا',
    features: ['خبرات موثوقة','حساب واحد ودوران','أدوات نمو مميزة','العربية والإنجليزية'],
    featureText: ['يمكن مراجعة المؤهلات قبل منح التوثيق.','وظّف المحترفين وتقدّم للوظائف من حساب واحد.','ملفات وأدوات مهنية تساعد أصحاب المهارات على النمو.','تجربة سهلة للعملاء والمحترفين في الخليج.'],
    steps: 'كيف تعمل نسقرا', step: ['أنشئ ملفك','ابحث أو انشر عملاً','تواصل وتطوّر'],
    stepText: ['اختر نوع حسابك وأنشئ ملفك.','تصفّح المحترفين أو انشر طلب خدمة.','تواصل مباشرة وأدر أعمالك.'],
    login: 'تسجيل الدخول', signup: 'إنشاء حساب', customer: 'عميل', professional: 'محترف',
    welcome: 'مرحباً بعودتك', create: 'أنشئ حسابك في نسقرا', email: 'البريد الإلكتروني',
    password: 'كلمة المرور', fullName: 'الاسم الكامل', country: 'الدولة', chooseCountry: 'اختر الدولة',
    save: 'حفظ الملف', logout: 'تسجيل الخروج', account: 'حسابي', bio: 'نبذة عنك',
    headline: 'المسمى المهني', experience: 'سنوات الخبرة', city: 'المدينة',
    dashboard: 'لوحة الحساب', roles: 'أدوار الحساب', proDetails: 'التفاصيل المهنية',
    enablePro: 'تفعيل الملف المهني', noConfig: 'لم يتم إعداد Supabase بعد. أضف رابط المشروع ومفتاح النشر إلى متغيرات البيئة.',
    missing: 'يرجى إكمال الحقول المطلوبة.', working: 'يرجى الانتظار…', saved: 'تم حفظ ملفك.',
    signedUp: 'تم إنشاء الحساب. تحقق من بريدك لتأكيد العنوان ثم سجّل الدخول.',
    signedIn: 'تم تسجيل الدخول.', switched: 'تم تفعيل الملف المهني.',
    authError: 'حدث خطأ. يرجى المحاولة مرة أخرى.', signInPrompt: 'لديك حساب؟ سجّل الدخول',
    signUpPrompt: 'جديد في نسقرا؟ أنشئ حساباً', join: 'انضم إلى السوق',
    footer: 'سوق خدمات أفضل للخليج.',
    countries: {SA:'السعودية',AE:'الإمارات',BH:'البحرين',KW:'الكويت',OM:'عُمان',QA:'قطر'}
  }
};
const countryCodes = ['SA','AE','BH','KW','OM','QA'];

function App() {
  const [lang, setLang] = useState('en');
  const [menu, setMenu] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [roles, setRoles] = useState([]);
  const [professional, setProfessional] = useState(null);
  const [form, setForm] = useState({full_name:'',email:'',password:'',account_type:'customer',country_code:'SA'});
  const [profileForm, setProfileForm] = useState({full_name:'',bio:'',country_code:'SA',headline:'',about:'',years_experience:'',city:''});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const t = dictionary[lang];
  const isAr = lang === 'ar';
  const isProfessional = roles.includes('professional');

  useEffect(() => {
    if (!supabase) return undefined;
    let alive = true;
    supabase.auth.getSession().then(({data}) => { if (alive) setSession(data.session); });
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => { alive = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session || !supabase) {
      setProfile(null); setRoles([]); setProfessional(null);
      return;
    }
    let alive = true;
    (async () => {
      const [p,r,pp] = await Promise.all([
        supabase.from('profiles').select('id,full_name,display_name,country_code,preferred_language,bio').eq('id',session.user.id).maybeSingle(),
        supabase.from('user_roles').select('role').eq('user_id',session.user.id),
        supabase.from('professional_profiles').select('headline,about,years_experience,city,country_code').eq('user_id',session.user.id).maybeSingle()
      ]);
      if (!alive) return;
      if (p.error || r.error) { setError(p.error?.message || r.error?.message || t.authError); return; }
      setProfile(p.data || {});
      setRoles((r.data || []).map(x => x.role));
      setProfessional(pp.data || null);
      setProfileForm({
        full_name:p.data?.full_name || '', bio:p.data?.bio || '',
        country_code:p.data?.country_code || 'SA',
        headline:pp.data?.headline || '', about:pp.data?.about || '',
        years_experience:pp.data?.years_experience ?? '', city:pp.data?.city || ''
      });
    })();
    return () => { alive = false; };
  }, [session, t.authError]);

  const setField = (key,value) => setForm(old => ({...old,[key]:value}));
  const setProfileField = (key,value) => setProfileForm(old => ({...old,[key]:value}));

  async function submitAuth(event) {
    event.preventDefault(); setError(''); setNotice('');
    if (!isSupabaseConfigured || !supabase) { setError(t.noConfig); return; }
    if (!form.email || !form.password || (authMode === 'register' && !form.full_name.trim())) { setError(t.missing); return; }
    setBusy(true);
    try {
      if (authMode === 'register') {
        if (form.password.length < 8) throw new Error(isAr ? 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.' : 'Password must be at least 8 characters.');
        const {data,error:signUpError} = await supabase.auth.signUp({
          email:form.email.trim(),
          password:form.password,
          options:{data:{
            full_name:form.full_name.trim(),
            account_type:form.account_type,
            country_code:form.country_code,
            preferred_language:lang
          }}
        });
        if (signUpError) throw signUpError;
        if (data.session) { setSession(data.session); setAuthMode(null); setNotice(t.signedIn); }
        else { setNotice(t.signedUp); setAuthMode('login'); }
      } else {
        const {data,error:signInError} = await supabase.auth.signInWithPassword({email:form.email.trim(),password:form.password});
        if (signInError) throw signInError;
        setSession(data.session); setAuthMode(null); setNotice(t.signedIn);
      }
    } catch (e) { setError(e.message || t.authError); }
    finally { setBusy(false); }
  }

  async function saveProfile(event) {
    event.preventDefault(); if (!supabase || !session) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const {error:pError} = await supabase.from('profiles').update({
        full_name:profileForm.full_name.trim(), bio:profileForm.bio.trim() || null,
        country_code:profileForm.country_code, updated_at:new Date().toISOString()
      }).eq('id',session.user.id);
      if (pError) throw pError;
      if (isProfessional) {
        const {error:ppError} = await supabase.from('professional_profiles').update({
          headline:profileForm.headline.trim() || null,
          about:profileForm.about.trim() || null,
          years_experience:profileForm.years_experience === '' ? null : Number(profileForm.years_experience),
          city:profileForm.city.trim() || null,
          country_code:profileForm.country_code,
          updated_at:new Date().toISOString()
        }).eq('user_id',session.user.id);
        if (ppError) throw ppError;
      }
      setNotice(t.saved);
      setProfile({...profile,full_name:profileForm.full_name,bio:profileForm.bio,country_code:profileForm.country_code});
      if (isProfessional) setProfessional({...professional,...profileForm});
    } catch (e) { setError(e.message || t.authError); }
    finally { setBusy(false); }
  }

  async function enableProfessional() {
    if (!supabase || !session || isProfessional) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const {error:roleError} = await supabase.from('user_roles').insert({user_id:session.user.id,role:'professional'});
      if (roleError && !roleError.message.toLowerCase().includes('duplicate')) throw roleError;
      const {error:profileError} = await supabase.from('professional_profiles').insert({user_id:session.user.id,country_code:profileForm.country_code || 'SA'});
      if (profileError && !profileError.message.toLowerCase().includes('duplicate')) throw profileError;
      setRoles(old => [...new Set([...old,'professional'])]);
      setProfessional({country_code:profileForm.country_code || 'SA'});
      setNotice(t.switched);
    } catch (e) { setError(e.message || t.authError); }
    finally { setBusy(false); }
  }

  async function signOut() {
    if (!supabase) return;
    setBusy(true); const {error:signOutError} = await supabase.auth.signOut(); setBusy(false);
    if (signOutError) setError(signOutError.message);
    else { setSession(null); setNotice(''); setAuthMode(null); }
  }

  return <div dir={isAr ? 'rtl' : 'ltr'}>
    <header className="header">
      <a className="brand" href="#home"><span className="mark">N</span><span>NUSQRA<small>نُسقرا</small></span></a>
      <nav className={menu ? 'nav open' : 'nav'}>
        <a href="#features" onClick={()=>setMenu(false)}>{t.nav[0]}</a>
        <a href="#steps" onClick={()=>setMenu(false)}>{t.nav[1]}</a>
        <a href="#premium" onClick={()=>setMenu(false)}>{t.nav[2]}</a>
      </nav>
      <div className="actions">
        {session ? <button className="navlink" onClick={()=>document.getElementById('account')?.scrollIntoView({behavior:'smooth'})}><UserRound size={15}/>{t.account}</button> :
          <><button className="navlink" onClick={()=>{setAuthMode('login');setError('');setNotice('')}}>{t.login}</button><button className="btn primary" onClick={()=>{setAuthMode('register');setError('');setNotice('')}}>{t.signup}</button></>}
        <button className="lang" onClick={()=>setLang(isAr?'en':'ar')}><Globe2 size={17}/>{isAr?'English':'العربية'}</button>
        {session && <button className="navlink" onClick={signOut} aria-label={t.logout}><LogOut size={16}/></button>}
        <button className="menu" aria-label="Menu" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button>
      </div>
    </header>
    <main>
      <section className="hero" id="home">
        <div className="orb orb1"/><div className="orb orb2"/>
        <div className="hero-inner">
          <div className="eyebrow"><span className="spark"/> GULF SERVICES · CUSTOMER & PROFESSIONAL</div>
          <h1>{t.hero}</h1><p>{t.sub}</p>
          <div className="buttons">
            <button className="btn primary" onClick={()=>{setForm(x=>({...x,account_type:'customer'}));setAuthMode('register')}}>{t.hire}{isAr?<ArrowLeft size={18}/>:<ArrowRight size={18}/>}</button>
            <button className="btn secondary" onClick={()=>{setForm(x=>({...x,account_type:'professional'}));setAuthMode('register')}}>{t.work}</button>
          </div>
          <div className="proof"><ShieldCheck size={18}/>{t.trust}<span className="dot"/> <span>Gulf-first · Mobile-first</span></div>
        </div>
        <div className="hero-card"><div className="card-glow"/><div className="hero-monogram">ن</div><div className="hero-card-title">نُسقرا <span>NUSQRA</span></div><div className="hero-card-caption">EXPERTISE · TRUST · OPPORTUNITY</div></div>
      </section>
      <section className="section" id="features"><div className="section-label">NUSQRA PLATFORM</div><h2>{t.trust}</h2><div className="feature-grid">
        {[ShieldCheck,Users,Crown,Globe2].map((Icon,i)=><article className="feature" key={i}><span className="iconbox"><Icon size={24}/></span><h3>{t.features[i]}</h3><p>{t.featureText[i]}</p></article>)}
      </div></section>
      <section className="section steps" id="steps"><div className="section-label">SIMPLE BY DESIGN</div><h2>{t.steps}</h2><div className="step-grid">
        {t.step.map((x,i)=><article key={i}><div className="step-num">0{i+1}</div><h3>{x}</h3><p>{t.stepText[i]}</p></article>)}
      </div></section>
      <section className="section premium" id="premium"><div><div className="section-label">NUSQRA PREMIUM</div><h2>{isAr?'أدوات أكثر، وفرص أكبر.':'More tools. More possibilities.'}</h2><p>{isAr?'ملفات احترافية ومهارات موثوقة وأدوات تساعد المهنيين على النمو.':'Professional profiles and tools designed to help Gulf talent grow.'}</p></div><div className="premium-symbol"><Crown size={65}/><span>PRO</span></div></section>
      {session && <section className="section account-section" id="account">
        <div className="section-label">NUSQRA · {t.dashboard.toUpperCase()}</div><h2>{t.dashboard}</h2>
        <div className="account-card">
          <div className="account-heading"><div><h3>{profileForm.full_name || session.user.email}</h3><p>{session.user.email}</p></div><button className="btn secondary" onClick={signOut}><LogOut size={16}/>{t.logout}</button></div>
          <div className="role-list"><strong>{t.roles}:</strong>{roles.map(role=><span className="role-chip" key={role}>{role==='customer'?t.customer:t.professional}</span>)}</div>
          {!isProfessional && <button className="btn secondary enable-pro" disabled={busy} onClick={enableProfessional}><BriefcaseBusiness size={16}/>{t.enablePro}</button>}
          <form className="profile-form" onSubmit={saveProfile}>
            <h3>{t.account}</h3>
            <label>{t.fullName}<input required value={profileForm.full_name} onChange={e=>setProfileField('full_name',e.target.value)} /></label>
            <label>{t.country}<select value={profileForm.country_code} onChange={e=>setProfileField('country_code',e.target.value)}>{countryCodes.map(code=><option key={code} value={code}>{t.countries[code]}</option>)}</select></label>
            <label>{t.bio}<textarea rows="3" value={profileForm.bio} onChange={e=>setProfileField('bio',e.target.value)}/></label>
            {isProfessional && <div className="professional-fields"><h3>{t.proDetails}</h3>
              <label>{t.headline}<input value={profileForm.headline} onChange={e=>setProfileField('headline',e.target.value)}/></label>
              <label>{t.city}<input value={profileForm.city} onChange={e=>setProfileField('city',e.target.value)}/></label>
              <label>{t.experience}<input type="number" min="0" max="60" value={profileForm.years_experience} onChange={e=>setProfileField('years_experience',e.target.value)}/></label>
              <label>{t.bio}<textarea rows="3" value={profileForm.about} onChange={e=>setProfileField('about',e.target.value)}/></label>
            </div>}
            <button className="btn primary" type="submit" disabled={busy}>{busy?<LoaderCircle className="spin" size={17}/>:<CheckCircle2 size={17}/>} {t.save}</button>
          </form>
        </div>
      </section>}
    </main>
    <footer><div className="brand"><span className="mark">N</span><span>NUSQRA<small>نُسقرا</small></span></div><p>{t.footer}</p><span>© {new Date().getFullYear()} NUSQRA · {t.join}</span></footer>
    {authMode && <div className="auth-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget){setAuthMode(null);setError('')}}}>
      <section className="auth-dialog" role="dialog" aria-modal="true" aria-label={authMode==='register'?t.create:t.welcome}>
        <button className="auth-close" aria-label="Close" onClick={()=>setAuthMode(null)}><X size={22}/></button>
        <div className="brand"><span className="mark">N</span><span>NUSQRA<small>نُسقرا</small></span></div>
        <h2>{authMode==='register'?t.create:t.welcome}</h2>
        {!isSupabaseConfigured && <p className="auth-warning">{t.noConfig}</p>}
        <form onSubmit={submitAuth}>
          {authMode==='register' && <>
            <label>{t.fullName}<input required autoComplete="name" value={form.full_name} onChange={e=>setField('full_name',e.target.value)} /></label>
            <label>{t.country}<select value={form.country_code} onChange={e=>setField('country_code',e.target.value)}>{countryCodes.map(code=><option key={code} value={code}>{t.countries[code]}</option>)}</select></label>
            <label>{t.roles}<select value={form.account_type} onChange={e=>setField('account_type',e.target.value)}><option value="customer">{t.customer}</option><option value="professional">{t.professional}</option></select></label>
          </>}
          <label>{t.email}<input type="email" required autoComplete="email" value={form.email} onChange={e=>setField('email',e.target.value)}/></label>
          <label>{t.password}<input type="password" required minLength="8" autoComplete={authMode==='register'?'new-password':'current-password'} value={form.password} onChange={e=>setField('password',e.target.value)}/></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          {notice && <p className="auth-success" role="status">{notice}</p>}
          <button className="btn primary" type="submit" disabled={busy || !isSupabaseConfigured}>{busy?<LoaderCircle className="spin" size={17}/>:null}{busy?t.working:authMode==='register'?t.signup:t.login}</button>
        </form>
        <button className="auth-switch" onClick={()=>{setAuthMode(authMode==='login'?'register':'login');setError('');setNotice('')}}>{authMode==='login'?t.signUpPrompt:t.signInPrompt}</button>
      </section>
    </div>}
    {notice && !authMode && <div className="site-notice" role="status">{notice}</div>}
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
