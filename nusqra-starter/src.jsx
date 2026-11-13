import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Globe2, ShieldCheck, Users, ArrowRight, ArrowLeft, Crown, Menu, X,
  BriefcaseBusiness, LogOut, UserRound, CheckCircle2, LoaderCircle,
  MessageCircle, Send, Check, XCircle, RefreshCw
} from 'lucide-react';
import './style.css';
import { isSupabaseConfigured, supabase } from './supabaseClient';

const dictionary = {
  en: {
    nav: ['Explore', 'Categories', 'How it works', 'For professionals'],
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
    save: 'Save profile', logout: 'Sign out', account: 'Settings', bio: 'About you',
    headline: 'Professional headline', experience: 'Years of experience', city: 'City',
    dashboard: 'Account dashboard', roles: 'Account roles', proDetails: 'Professional details',
    enablePro: 'Enable professional profile', noConfig: 'Supabase is not configured yet. Add the project URL and publishable key to the environment variables.',
    missing: 'Please complete all required fields.', working: 'Please wait…', saved: 'Your profile was saved.',
    signedUp: 'Account created. Check your email to confirm your address, then sign in.',
    signedIn: 'You are signed in.', switched: 'Professional profile enabled.',
    authError: 'Something went wrong. Please try again.', signInPrompt: 'Already have an account? Log in',
    signUpPrompt: 'New to NUSQRA? Create an account', join: 'Join the marketplace',
    footer: 'A better services marketplace for the Gulf.',
    categoriesTitle:'Explore all services and opportunities',categoriesIntro:'A broad marketplace for individuals and companies across the Gulf, with a dedicated space for investors and founders.',audienceAll:'All categories',audienceIndividuals:'For individuals',audienceCompanies:'For companies',audienceInvestors:'Investors',audienceBoth:'For individuals & companies',investorDisclaimer:'Connect with founders and explore opportunities. NUSQRA does not handle investments or promise returns.',
    marketplace:'Marketplace',myJobsAndOpenJobs:'My posts and open jobs',postJob:'Post a job',browseJobs:'Open jobs',myJobs:'My job posts',jobTitle:'Job title',jobDescription:'Describe the work (20 characters minimum)',category:'Category',selectCategory:'Select category',minBudget:'Minimum budget',maxBudget:'Maximum budget',currency:'Currency',cityLabel:'City / area',publishJob:'Publish job',submitProposal:'Submit proposal',proposalText:'Explain why you are right for this job (20 characters minimum)',proposedPrice:'Your price',deliveryDays:'Delivery days',sendProposal:'Send proposal',viewProposals:'View proposals',noJobs:'No open jobs yet.',noOwnJobs:'You have not posted any jobs yet.',noProposals:'No proposals yet.',jobPosted:'Your job has been published.',proposalSent:'Your proposal was sent.',duplicateProposal:'You have already submitted a proposal for this job.',proposalSubmitted:'Proposal submitted',proposalAccepted:'Proposal accepted',proposalRejected:'Proposal rejected',accept:'Accept',reject:'Reject',closeJob:'Close job',reopenJob:'Reopen job',cancelJob:'Cancel job',completeJob:'Mark completed',messageProfessional:'Message professional',messages:'Messages',noConversations:'No conversations yet. Customers can start a conversation from a proposal.',sendMessage:'Send message',messagePlaceholder:'Write a message…',you:'You',jobStatusUpdated:'Job status updated.',decisionSaved:'Proposal decision saved.',budget:'Budget',jobError:'Could not load marketplace data.',ownJob:'You cannot apply to your own job.',
    countries: {SA:'Saudi Arabia',AE:'United Arab Emirates',BH:'Bahrain',KW:'Kuwait',OM:'Oman',QA:'Qatar'}
  },
  ar: {
    nav: ['استكشف','التصنيفات','كيف تعمل','للمحترفين'],
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
    save: 'حفظ الملف', logout: 'تسجيل الخروج', account: 'الإعدادات', bio: 'نبذة عنك',
    headline: 'المسمى المهني', experience: 'سنوات الخبرة', city: 'المدينة',
    dashboard: 'لوحة الحساب', roles: 'أدوار الحساب', proDetails: 'التفاصيل المهنية',
    enablePro: 'تفعيل الملف المهني', noConfig: 'لم يتم إعداد Supabase بعد. أضف رابط المشروع ومفتاح النشر إلى متغيرات البيئة.',
    missing: 'يرجى إكمال الحقول المطلوبة.', working: 'يرجى الانتظار…', saved: 'تم حفظ ملفك.',
    signedUp: 'تم إنشاء الحساب. تحقق من بريدك لتأكيد العنوان ثم سجّل الدخول.',
    signedIn: 'تم تسجيل الدخول.', switched: 'تم تفعيل الملف المهني.',
    authError: 'حدث خطأ. يرجى المحاولة مرة أخرى.', signInPrompt: 'لديك حساب؟ سجّل الدخول',
    signUpPrompt: 'جديد في نسقرا؟ أنشئ حساباً', join: 'انضم إلى السوق',
    footer: 'سوق خدمات أفضل للخليج.',
    categoriesTitle:'اكتشف جميع الخدمات والفرص',categoriesIntro:'سوق شامل للأفراد والشركات في الخليج، مع مساحة مخصصة للمستثمرين ورواد الأعمال.',audienceAll:'جميع التصنيفات',audienceIndividuals:'للأفراد',audienceCompanies:'للشركات',audienceInvestors:'للمستثمرين',audienceBoth:'للأفراد والشركات',investorDisclaimer:'تواصل مع المؤسسين واستكشف الفرص. لا تدير نسقرا الاستثمارات ولا تضمن العوائد.',
    marketplace:'سوق نسقرا',myJobsAndOpenJobs:'طلباتي والطلبات المفتوحة',postJob:'انشر طلب خدمة',browseJobs:'الطلبات المفتوحة',myJobs:'طلباتي المنشورة',jobTitle:'عنوان الطلب',jobDescription:'اشرح العمل المطلوب (20 حرفاً على الأقل)',category:'التصنيف',selectCategory:'اختر التصنيف',minBudget:'الميزانية الدنيا',maxBudget:'الميزانية القصوى',currency:'العملة',cityLabel:'المدينة / المنطقة',publishJob:'نشر الطلب',submitProposal:'تقديم عرض',proposalText:'اشرح لماذا أنت مناسب لهذا العمل (20 حرفاً على الأقل)',proposedPrice:'السعر المقترح',deliveryDays:'مدة التنفيذ بالأيام',sendProposal:'إرسال العرض',viewProposals:'عرض العروض',noJobs:'لا توجد طلبات مفتوحة حالياً.',noOwnJobs:'لم تنشر أي طلبات بعد.',noProposals:'لا توجد عروض بعد.',jobPosted:'تم نشر طلبك بنجاح.',proposalSent:'تم إرسال عرضك.',duplicateProposal:'لقد قدمت عرضاً لهذا الطلب مسبقاً.',proposalSubmitted:'تم تقديم العرض',proposalAccepted:'تم قبول العرض',proposalRejected:'تم رفض العرض',accept:'قبول',reject:'رفض',closeJob:'إغلاق الطلب',reopenJob:'إعادة فتح الطلب',cancelJob:'إلغاء الطلب',completeJob:'تحديد كمكتمل',messageProfessional:'مراسلة المحترف',messages:'الرسائل',noConversations:'لا توجد محادثات بعد. يمكن للعميل بدء محادثة من أحد العروض.',sendMessage:'إرسال الرسالة',messagePlaceholder:'اكتب رسالة…',you:'أنت',jobStatusUpdated:'تم تحديث حالة الطلب.',decisionSaved:'تم حفظ قرار العرض.',budget:'الميزانية',jobError:'تعذر تحميل بيانات السوق.',ownJob:'لا يمكنك تقديم عرض على طلبك الخاص.',
    countries: {SA:'السعودية',AE:'الإمارات',BH:'البحرين',KW:'الكويت',OM:'عُمان',QA:'قطر'}
  }
};
const countryCodes = ['SA','AE','BH','KW','OM','QA'];

function App() {
  const [lang, setLang] = useState('en');
  const [menu, setMenu] = useState(false);
  const [page, setPage] = useState(() => window.location.hash.replace('#','') || 'home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileTab, setProfileTab] = useState('identity');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [roles, setRoles] = useState([]);
  const [professional, setProfessional] = useState(null);
  const [form, setForm] = useState({full_name:'',email:'',password:'',account_type:'customer',country_code:'SA'});
  const [authMethod,setAuthMethod] = useState('email');
  const [phone,setPhone] = useState('');
  const [otp,setOtp] = useState('');
  const [otpSent,setOtpSent] = useState(false);
  const [photoFiles,setPhotoFiles] = useState({avatar:null,cover:null});
  const [profileForm, setProfileForm] = useState({full_name:'',bio:'',country_code:'SA',headline:'',about:'',years_experience:'',city:'',avatar_url:'',cover_url:'',profile_style:'simple',profile_template:'classic',phone_number:''});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [categories,setCategories] = useState([]);
  const [categoryAudience,setCategoryAudience] = useState('all');
  const [jobs,setJobs] = useState([]);
  const [professionalDirectory,setProfessionalDirectory] = useState([]);
  const [selectedCategoryId,setSelectedCategoryId] = useState('');
  const [professionalCategoryIds,setProfessionalCategoryIds] = useState([]);
  const [jobForm,setJobForm] = useState({title:'',description:'',category_id:'',budget_min:'',budget_max:'',currency:'SAR',country_code:'SA',city:''});
  const [proposalForms,setProposalForms] = useState({});
  const [jobProposals,setJobProposals] = useState({});
  const [myProposals,setMyProposals] = useState({});
  const [expandedJob,setExpandedJob] = useState(null);
  const [conversations,setConversations] = useState([]);
  const [selectedConversation,setSelectedConversation] = useState(null);
  const [messages,setMessages] = useState([]);
  const [messageDraft,setMessageDraft] = useState('');
  const t = dictionary[lang];
  const isAr = lang === 'ar';
  const isProfessional = roles.includes('professional');

  useEffect(() => {
    const syncPage = () => { const next = window.location.hash.replace('#','') || 'home'; setPage(next); setSettingsOpen(next === 'settings'); setMenu(false); window.scrollTo(0,0); };
    window.addEventListener('hashchange', syncPage);
    return () => window.removeEventListener('hashchange', syncPage);
  }, []);

  const navigatePage = (next) => { setPage(next); setSettingsOpen(next === 'settings'); setMenu(false); window.location.hash = next; window.scrollTo(0,0); };

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
        supabase.from('profiles').select('id,full_name,display_name,country_code,preferred_language,bio,avatar_url,cover_url,profile_style,profile_template,phone_number').eq('id',session.user.id).maybeSingle(),
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
        country_code:p.data?.country_code || 'SA', avatar_url:p.data?.avatar_url || '', cover_url:p.data?.cover_url || '', profile_style:p.data?.profile_style || 'simple', profile_template:p.data?.profile_template || 'classic', phone_number:p.data?.phone_number || '',
        headline:pp.data?.headline || '', about:pp.data?.about || '',
        years_experience:pp.data?.years_experience ?? '', city:pp.data?.city || ''
      });
    })();
    return () => { alive = false; };
  }, [session, t.authError]);

  const setField = (key,value) => setForm(old => ({...old,[key]:value}));
  const setProfileField = (key,value) => setProfileForm(old => ({...old,[key]:value}));

  const gulfDialCodes = [{code:'SA',dial:'+966',name:'Saudi Arabia'},{code:'AE',dial:'+971',name:'UAE'},{code:'BH',dial:'+973',name:'Bahrain'},{code:'KW',dial:'+965',name:'Kuwait'},{code:'OM',dial:'+968',name:'Oman'},{code:'QA',dial:'+974',name:'Qatar'}];
  const selectedDial = gulfDialCodes.find(x=>x.code===form.country_code)?.dial || '+966';
  function normalizedPhone(){const digits=phone.replace(/[^0-9]/g,'').replace(/^0+/,'');return selectedDial+digits;}
  async function submitAuth(event) {
    event.preventDefault(); setError(''); setNotice('');
    if (!isSupabaseConfigured || !supabase) { setError(t.noConfig); return; }
    setBusy(true);
    try {
      if (authMethod === 'google') {
        const {error:e}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:'https://nusqra.mrexpertd.workers.dev'}});
        if(e) throw e;
        return;
      }
      if (authMethod === 'phone') {
        const fullPhone=normalizedPhone();
        if(phone.replace(/[^0-9]/g,'').length<7) throw new Error(isAr?'أدخل رقم هاتف صحيحاً.':'Enter a valid Gulf mobile number.');
        if(!otpSent){
          const {error:e}=await supabase.auth.signInWithOtp({phone:fullPhone,options:{channel:'sms',shouldCreateUser:authMode==='register',data:{full_name:form.full_name.trim(),account_type:form.account_type,country_code:form.country_code,preferred_language:lang}}});
          if(e) throw e;
          setOtpSent(true);setNotice(isAr?'أرسلنا رمز التحقق عبر الرسائل النصية.':'We sent an SMS verification code.');
        } else {
          if(!otp.trim()) throw new Error(isAr?'أدخل رمز التحقق.':'Enter the verification code.');
          const {data,error:e}=await supabase.auth.verifyOtp({phone:fullPhone,token:otp.trim(),type:'sms'});
          if(e) throw e;
          setSession(data.session);setAuthMode(null);setOtpSent(false);setOtp('');
          setNotice(isAr?'تم التحقق وتسجيل الدخول.':'Phone verified. You are signed in.');
        }
        return;
      }
      if (!form.email || (authMode==='register' && !form.full_name.trim())) { setError(t.missing); return; }
      if (authMode === 'register') {
        if (form.password.length < 8) throw new Error(isAr ? 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.' : 'Password must be at least 8 characters.');
        const {data,error:signUpError} = await supabase.auth.signUp({email:form.email.trim(),password:form.password,options:{data:{full_name:form.full_name.trim(),account_type:form.account_type,country_code:form.country_code,preferred_language:lang}}});
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
      const upload = async (file,kind) => {
        if(!file) return profileForm[kind==='avatar'?'avatar_url':'cover_url'] || null;
        if(!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size>5*1024*1024) throw new Error(isAr?'استخدم صورة JPG أو PNG أو WEBP بحجم أقل من 5 ميجابايت.':'Use JPG, PNG or WEBP images up to 5 MB.');
        const ext=file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';
        const path=session.user.id+'/'+kind+'-'+Date.now()+'.'+ext;
        const {error:e}=await supabase.storage.from('profile-media').upload(path,file,{upsert:true,contentType:file.type});
        if(e) throw e;
        return supabase.storage.from('profile-media').getPublicUrl(path).data.publicUrl;
      };
      const avatarUrl=await upload(photoFiles.avatar,'avatar');
      const coverUrl=await upload(photoFiles.cover,'cover');
      const {error:pError} = await supabase.from('profiles').update({
        full_name:profileForm.full_name.trim(), bio:profileForm.bio.trim() || null,
        country_code:profileForm.country_code, avatar_url:avatarUrl, cover_url:coverUrl,
        profile_style:profileForm.profile_style, profile_template:profileForm.profile_template, phone_number:profileForm.phone_number || null,
        updated_at:new Date().toISOString()
      }).eq('id',session.user.id);
      if (pError) throw pError;
      if (isProfessional) {
        const {error:ppError} = await supabase.from('professional_profiles').update({
          headline:profileForm.headline.trim() || null,about:profileForm.about.trim() || null,
          years_experience:profileForm.years_experience === '' ? null : Number(profileForm.years_experience),
          city:profileForm.city.trim() || null,country_code:profileForm.country_code,updated_at:new Date().toISOString()
        }).eq('user_id',session.user.id);
        if (ppError) throw ppError;
        const {error:deleteCategoriesError}=await supabase.from('professional_categories').delete().eq('professional_user_id',session.user.id);
        if(deleteCategoriesError)throw deleteCategoriesError;
        if(professionalCategoryIds.length){const {error:insertCategoriesError}=await supabase.from('professional_categories').insert(professionalCategoryIds.map(category_id=>({professional_user_id:session.user.id,category_id})));if(insertCategoriesError)throw insertCategoriesError;}
      }
      setPhotoFiles({avatar:null,cover:null});
      setProfile({...profile,full_name:profileForm.full_name,bio:profileForm.bio,country_code:profileForm.country_code,avatar_url:avatarUrl,cover_url:coverUrl,profile_style:profileForm.profile_style,profile_template:profileForm.profile_template});
      setProfileForm(v=>({...v,avatar_url:avatarUrl||'',cover_url:coverUrl||''}));
      if (isProfessional) setProfessional({...professional,...profileForm});
      setNotice(t.saved);
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

  useEffect(() => {
    if (!supabase) return undefined;
    let alive = true;
    supabase.from('categories').select('id,slug,name_en,name_ar,description_en,description_ar').eq('is_active',true).order('sort_order')
      .then(({data,error:categoryError}) => { if (alive && !categoryError) setCategories(data || []); });
    return () => { alive = false; };
  }, []);

  async function loadMarketplace() {
    if (!supabase) return;
    const [c,j,mp] = await Promise.all([
      supabase.from('categories').select('id,slug,name_en,name_ar,description_en,description_ar').eq('is_active',true).order('sort_order'),
      supabase.from('jobs').select('id,customer_id,category_id,title,description,budget_min,budget_max,currency,country_code,city,status,created_at').order('created_at',{ascending:false}).limit(60),
      roles.includes('professional') ? supabase.from('proposals').select('id,job_id,status').eq('professional_id',session.user.id) : Promise.resolve({data:[],error:null})
    ]);
    if(c.error || j.error || mp.error){setError(c.error?.message || j.error?.message || mp.error?.message || t.jobError);return;}
    setCategories(c.data || []);setJobs(j.data || []);setMyProposals(Object.fromEntries((mp.data||[]).map(p=>[p.job_id,p])));
  }

  useEffect(()=>{if(supabase && (session || page==='marketplace')) loadMarketplace();else if(!session){setCategories([]);setJobs([]);setJobProposals({});setMyProposals({});}},[session,roles,page]);

  useEffect(()=>{
    if(!session||!supabase||!isProfessional){setProfessionalCategoryIds([]);return;}
    let alive=true;
    supabase.from('professional_categories').select('category_id').eq('professional_user_id',session.user.id).then(({data,error:e})=>{if(!alive)return;if(e){setError(e.message);return;}setProfessionalCategoryIds((data||[]).map(x=>x.category_id));});
    return()=>{alive=false;};
  },[session,isProfessional]);

  useEffect(()=>{
    if(page!=='professionals'||!supabase)return;
    if(!selectedCategoryId){setProfessionalDirectory([]);return undefined;}
    let alive=true;
    (async()=>{
      let categoryRows=[];
      if(selectedCategoryId){const {data,error:e}=await supabase.from('professional_categories').select('professional_user_id,category_id').eq('category_id',selectedCategoryId);if(e){if(alive)setError(e.message);return;}categoryRows=data||[];}
      else {const {data,error:e}=await supabase.from('professional_categories').select('professional_user_id,category_id');if(e){if(alive)setError(e.message);return;}categoryRows=data||[];}
      const categoryUserIds=[...new Set(categoryRows.map(x=>x.professional_user_id))];
      if(selectedCategoryId&&!categoryUserIds.length){if(alive)setProfessionalDirectory([]);return;}
      let query=supabase.from('professional_profiles').select('user_id,headline,about,years_experience,city,country_code').limit(60);
      if(selectedCategoryId)query=query.in('user_id',categoryUserIds);
      const {data:proRows,error:proError}=await query;
      if(proError){if(alive)setError(proError.message);return;}
      const ids=(proRows||[]).map(p=>p.user_id);
      if(!ids.length){if(alive)setProfessionalDirectory([]);return;}
      const {data:profilesRows,error:profilesError}=await supabase.from('profiles').select('id,full_name,display_name,country_code,bio,avatar_url').in('id',ids);
      if(!alive)return;
      if(profilesError){setError(profilesError.message);return;}
      const byId=Object.fromEntries((profilesRows||[]).map(p=>[p.id,p]));
      const tagsByUser={};categoryRows.forEach(x=>{(tagsByUser[x.professional_user_id] ||= []).push(x.category_id);});
      setProfessionalDirectory((proRows||[]).map(p=>({...p,profile:byId[p.user_id],categoryIds:tagsByUser[p.user_id]||[]})).filter(p=>p.profile));
    })();
    return()=>{alive=false;};
  },[page,selectedCategoryId]);

  async function loadConversations(){
    if(!supabase||!session)return;
    const {data,error:e}=await supabase.from('conversations').select('id,job_id,customer_id,professional_id,created_at,job:jobs!conversations_job_id_fkey(title),customer:profiles!conversations_customer_id_fkey(full_name),professional:profiles!conversations_professional_id_fkey(full_name)').order('created_at',{ascending:false});
    if(e){setError(e.message);return;}setConversations(data||[]);
  }
  useEffect(()=>{if(session&&supabase)loadConversations();else{setConversations([]);setSelectedConversation(null);setMessages([]);}},[session]);

  useEffect(()=>{
    if(!selectedConversation||!supabase){setMessages([]);return undefined;}
    let alive=true;
    const channel=supabase.channel('nusqra-conversation-'+selectedConversation.id)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:'conversation_id=eq.'+selectedConversation.id},payload=>{
        const row=payload.new;
        setMessages(old=>old.some(m=>m.id===row.id)?old:[...old,row]);
      }).subscribe();
    (async()=>{
      const {data,error:e}=await supabase.from('messages').select('id,conversation_id,sender_id,body,created_at').eq('conversation_id',selectedConversation.id).order('created_at',{ascending:true});
      if(!alive)return;if(e){setError(e.message);return;}setMessages(data||[]);
    })();
    return()=>{alive=false;supabase.removeChannel(channel);};
  },[selectedConversation?.id]);

  async function publishJob(event){
    event.preventDefault();
    if(!supabase || !session || !roles.includes('customer')) return;
    setBusy(true);setError('');setNotice('');
    try{
      const payload={customer_id:session.user.id,category_id:jobForm.category_id||null,title:jobForm.title.trim(),description:jobForm.description.trim(),budget_min:jobForm.budget_min===''?null:Number(jobForm.budget_min),budget_max:jobForm.budget_max===''?null:Number(jobForm.budget_max),currency:jobForm.currency,country_code:profileForm.country_code||'SA',city:jobForm.city.trim()||null,status:'open'};
      if(payload.title.length<5||payload.title.length>160||payload.description.length<20||payload.description.length>8000) throw new Error(t.missing);
      if(payload.budget_min!==null&&payload.budget_max!==null&&payload.budget_max<payload.budget_min) throw new Error(t.missing);
      const {error:e}=await supabase.from('jobs').insert(payload);if(e) throw e;
      setJobForm({title:'',description:'',category_id:'',budget_min:'',budget_max:'',currency:'SAR',country_code:'SA',city:''});
      await loadMarketplace();setNotice(t.jobPosted);
    }catch(e){setError(e.message||t.authError);}finally{setBusy(false);}
  }

  async function submitProposal(event,job){
    event.preventDefault();
    if(!supabase||!session||!isProfessional) return;
    if(job.customer_id===session.user.id){setError(t.ownJob);return;}
    const v=proposalForms[job.id]||{cover_letter:'',proposed_price:'',delivery_days:''};
    setBusy(true);setError('');setNotice('');
    try{
      if(v.cover_letter.trim().length<20||v.cover_letter.trim().length>5000) throw new Error(t.missing);
      const {error:e}=await supabase.from('proposals').insert({job_id:job.id,professional_id:session.user.id,cover_letter:v.cover_letter.trim(),proposed_price:v.proposed_price===''?null:Number(v.proposed_price),currency:job.currency,delivery_days:v.delivery_days===''?null:Number(v.delivery_days)});
      if(e){if(e.code==='23505') throw new Error(t.duplicateProposal);throw e;}
      setProposalForms(old=>({...old,[job.id]:{cover_letter:'',proposed_price:'',delivery_days:''}}));setNotice(t.proposalSent);
    }catch(e){setError(e.message||t.authError);}finally{setBusy(false);}
  }

  async function toggleProposals(job){
    if(expandedJob===job.id){setExpandedJob(null);return;}
    setExpandedJob(job.id);if(!supabase)return;
    const {data,error:e}=await supabase.from('proposals').select('id,professional_id,cover_letter,proposed_price,currency,delivery_days,status,professional:profiles!proposals_professional_id_fkey(full_name)').eq('job_id',job.id).order('created_at',{ascending:false});
    if(e){setError(e.message);return;}setJobProposals(old=>({...old,[job.id]:data||[]}));
  }

  async function decideProposal(proposal,status){
    if(!supabase||!session)return;setBusy(true);setError('');setNotice('');
    try{
      const {data,error:e}=await supabase.from('proposals').update({status,updated_at:new Date().toISOString()}).eq('id',proposal.id).eq('status','submitted').select('id,status').maybeSingle();
      if(e)throw e;if(!data)throw new Error(isAr?'تعذر اتخاذ القرار؛ قد يكون العرض قد تغير بالفعل.':'Could not update this proposal; it may already have changed.');
      await loadMarketplace();
      if(expandedJob){const {data,error:refreshError}=await supabase.from('proposals').select('id,professional_id,cover_letter,proposed_price,currency,delivery_days,status,professional:profiles!proposals_professional_id_fkey(full_name)').eq('job_id',expandedJob).order('created_at',{ascending:false});if(refreshError)throw refreshError;setJobProposals(old=>({...old,[expandedJob]:data||[]}));}
      setNotice(t.decisionSaved);
    }catch(e){setError(e.message||t.authError);}finally{setBusy(false);}
  }

  async function updateJobStatus(job,status){
    if(!supabase||!session)return;setBusy(true);setError('');setNotice('');
    try{const {error:e}=await supabase.from('jobs').update({status,updated_at:new Date().toISOString()}).eq('id',job.id);if(e)throw e;await loadMarketplace();setNotice(t.jobStatusUpdated);}
    catch(e){setError(e.message||t.authError);}finally{setBusy(false);}
  }

  async function openConversation(job,professionalId){
    if(!supabase||!session)return;setBusy(true);setError('');
    try{
      let {data,error:e}=await supabase.from('conversations').select('id,job_id,customer_id,professional_id,created_at').eq('job_id',job.id).eq('customer_id',session.user.id).eq('professional_id',professionalId).maybeSingle();
      if(e)throw e;
      if(!data){const result=await supabase.from('conversations').insert({job_id:job.id,customer_id:session.user.id,professional_id:professionalId}).select('id,job_id,customer_id,professional_id,created_at').single();
        if(result.error&&result.error.code==='23505'){const retry=await supabase.from('conversations').select('id,job_id,customer_id,professional_id,created_at').eq('job_id',job.id).eq('customer_id',session.user.id).eq('professional_id',professionalId).single();if(retry.error)throw retry.error;data=retry.data;}
        else if(result.error)throw result.error;else data=result.data;
      }
      setSelectedConversation(data);await loadConversations();
    }catch(e){setError(e.message||t.authError);}finally{setBusy(false);}
  }

  async function sendMessage(event){
    event.preventDefault();const body=messageDraft.trim();if(!supabase||!session||!selectedConversation||!body)return;
    if(body.length>4000){setError(isAr?'الرسالة طويلة جداً.':'Message is too long.');return;}
    setBusy(true);setError('');
    try{const {error:e}=await supabase.from('messages').insert({conversation_id:selectedConversation.id,sender_id:session.user.id,body});if(e)throw e;setMessageDraft('');
      const {data,error:loadError}=await supabase.from('messages').select('id,conversation_id,sender_id,body,created_at').eq('conversation_id',selectedConversation.id).order('created_at',{ascending:true});if(loadError)throw loadError;setMessages(data||[]);await loadConversations();
    }catch(e){setError(e.message||t.authError);}finally{setBusy(false);}
  }

  async function signOut() {
    if (!supabase) return;
    setBusy(true); const {error:signOutError} = await supabase.auth.signOut(); setBusy(false);
    if (signOutError) setError(signOutError.message);
    else { setSession(null); setNotice(''); setAuthMode(null); }
  }

  return <div dir={isAr ? 'rtl' : 'ltr'}>
    <header className="header">
      <a className="brand" href="#home" onClick={()=>{setSettingsOpen(false);setPage('home');setMenu(false);}}><span className="mark" aria-label="NUSQRA logo"><svg className="brand-symbol" viewBox="0 0 64 64" role="img" aria-hidden="true"><path d="M14 49V15h7l29 34V15" fill="none" stroke="#F0D59A" strokeWidth="6" strokeLinecap="square" strokeLinejoin="miter"/><path d="M49 15h-8" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="square"/><path d="M14 15h8" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="square"/></svg></span><span>NUSQRA<small>نُسقرا</small></span></a>
      <nav className={menu ? 'nav open' : 'nav'}>
        <a href="#explore" onClick={()=>setMenu(false)}>{t.nav[0]}</a>
        <a href="#categories" onClick={()=>setMenu(false)}>{t.nav[1]}</a>
        <a href="#how-it-works" onClick={()=>setMenu(false)}>{t.nav[2]}</a>
        <a href="#professionals" onClick={()=>setMenu(false)}>{t.nav[3]}</a>
        {session && <><a href="#marketplace" onClick={()=>setMenu(false)}>{isAr?'السوق':'Marketplace'}</a><a href="#messages" onClick={()=>setMenu(false)}>{t.messages}</a></>}
      </nav>
      <div className="actions">
        {session ? <button className="navlink" onClick={()=>navigatePage('settings')}><UserRound size={15}/>{t.account}</button> :
          <><button className="navlink" onClick={()=>{setAuthMode('login');setError('');setNotice('')}}>{t.login}</button><button className="btn primary" onClick={()=>{setAuthMode('register');setError('');setNotice('')}}>{t.signup}</button></>}
        <button className="lang" onClick={()=>setLang(isAr?'en':'ar')}><Globe2 size={17}/>{isAr?'English':'العربية'}</button>
        {session && <button className="navlink" onClick={signOut} aria-label={t.logout}><LogOut size={16}/></button>}
        <button className="menu" aria-label="Menu" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button>
      </div>
    </header>
    <main>
      {page === 'home' && <section className="hero" id="home">
        <div className="orb orb1"/><div className="orb orb2"/>
        <div className="hero-inner">
          <div className="eyebrow"><span className="spark"/> GULF SERVICES · CUSTOMER & PROFESSIONAL</div>
          <h1>{t.hero}</h1><p>{t.sub}</p>
          <div className="buttons">
            <button className="btn primary" onClick={()=>navigatePage('professionals')}>{t.hire}{isAr?<ArrowLeft size={18}/>:<ArrowRight size={18}/>}</button>
            <button className="btn secondary" onClick={()=>navigatePage('marketplace')}>{t.work}</button>
          </div>
          <div className="proof"><ShieldCheck size={18}/>{t.trust}<span className="dot"/> <span>Gulf-first · Mobile-first</span></div>
        </div>
        <div className="hero-visual"><img src="https://cdn.salla.sa/PlrKO/fef5aac3-88f4-405a-a41c-075fb4d60beb-1000x666.66666666667-b3Y1S8P9MjvhziT4PUproprjtiSKU3TU33XLNBnh.png" alt={isAr?'رجل سعودي يستخدم جهازاً لوحياً في بيئة عمل حديثة':'A Saudi man in traditional attire using a tablet in a modern workplace'} /><div className="hero-visual-caption"><strong>نُسقرا · NUSQRA</strong><span>{isAr?'خبرات · ثقة · فرص':'Expertise · Trust · Opportunity'}</span></div></div>
      </section>}
      {page === 'home' && <>
        <section className="home-intro section">
          <div className="section-label">{isAr?'منصة نسقرا للخدمات':'THE NUSQRA MARKETPLACE'}</div>
          <div className="home-intro-heading"><div><h2>{isAr?'كل الخدمات والمهارات في مكان واحد':'One marketplace. Every skill. More opportunity.'}</h2><p className="section-intro">{isAr?'اكتشف خدمات الأفراد والشركات، وتواصل مع المحترفين، وابدأ فرصتك القادمة في الخليج.':'Discover services for individuals and businesses, connect with skilled professionals, and find your next opportunity across the Gulf.'}</p></div><button className="btn home-outline" onClick={()=>navigatePage('categories')}>{isAr?'استكشف جميع التصنيفات':'Explore all categories'} <ArrowRight size={17}/></button></div>
          <div className="home-category-grid">
            <button className="home-category-card" onClick={()=>navigatePage('categories')}><img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=82" alt="Web development workspace" loading="lazy"/><span>{isAr?'التقنية والويب':'Technology & Web'}</span></button>
            <button className="home-category-card" onClick={()=>navigatePage('categories')}><img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=82" alt="Marketing analytics dashboard" loading="lazy"/><span>{isAr?'التسويق والمبيعات':'Marketing & Sales'}</span></button>
            <button className="home-category-card" onClick={()=>navigatePage('categories')}><img src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=82" alt="Automotive workshop" loading="lazy"/><span>{isAr?'خدمات السيارات':'Automotive Services'}</span></button>
            <button className="home-category-card" onClick={()=>navigatePage('categories')}><img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=82" alt="Architecture and engineering" loading="lazy"/><span>{isAr?'البناء والهندسة':'Construction & Engineering'}</span></button>
          </div>
        </section>
        <section className="home-trust-band"><div><span className="section-label">{isAr?'مصممة للخليج':'BUILT FOR THE GULF'}</span><h2>{isAr?'فرص أوضح. تواصل أسهل. نمو أقوى.':'A clearer way to find work and get work done.'}</h2></div><div className="home-trust-points"><span><ShieldCheck size={19}/>{isAr?'تواصل بثقة':'Connect with confidence'}</span><span><Globe2 size={19}/>{isAr?'العربية والإنجليزية':'Arabic & English'}</span><span><Users size={19}/>{isAr?'للأفراد والشركات':'For people & businesses'}</span></div></section>
        <section className="home-steps section"><div className="section-label">{isAr?'ابدأ في ثلاث خطوات':'GET STARTED IN THREE STEPS'}</div><h2>{isAr?'كيف تعمل نسقرا':'A simple path from need to opportunity'}</h2><div className="home-step-grid"><article><b>01</b><h3>{isAr?'أنشئ حسابك':'Create your account'}</h3><p>{isAr?'أنشئ ملفك كعميل أو محترف.':'Join as a customer or professional.'}</p></article><article><b>02</b><h3>{isAr?'اكتشف أو انشر':'Discover or post'}</h3><p>{isAr?'ابحث عن خدمة أو انشر طلبك.':'Find a service or publish a job request.'}</p></article><article><b>03</b><h3>{isAr?'تواصل وابدأ':'Connect and begin'}</h3><p>{isAr?'راجع العروض وتواصل مباشرة.':'Review proposals and connect directly.'}</p></article></div><div className="home-final-cta"><div><h2>{isAr?'مستعد للخطوة التالية؟':'Ready for your next opportunity?'}</h2><p>{isAr?'انضم إلى مجتمع نسقرا اليوم.':'Join the NUSQRA community today.'}</p></div><button className="btn primary" onClick={()=>{if(session)navigatePage('settings');else{setForm(x=>({...x,account_type:'customer'}));setAuthMode('register');}}}>{isAr?'أنشئ حسابك':'Get started'} <ArrowRight size={17}/></button></div></section>
      </>}
      {page === 'categories' && <section className="section category-section" id="categories">
        <div className="section-label">NUSQRA · SERVICES DIRECTORY</div>
        <h2>{t.categoriesTitle}</h2>
        <p className="section-intro category-intro">{t.categoriesIntro}</p>
        <div className="audience-tabs" role="group" aria-label="Browse categories by audience">
          <button type="button" className={categoryAudience==='all'?'active':''} onClick={()=>setCategoryAudience('all')}>{t.audienceAll}</button>
          <button type="button" className={categoryAudience==='individuals'?'active':''} onClick={()=>setCategoryAudience('individuals')}>{t.audienceIndividuals}</button>
          <button type="button" className={categoryAudience==='companies'?'active':''} onClick={()=>setCategoryAudience('companies')}>{t.audienceCompanies}</button>
          <button type="button" className={categoryAudience==='investors'?'active':''} onClick={()=>setCategoryAudience('investors')}>{t.audienceInvestors}</button>
        </div>
        {categories.length>0 && <div className="category-grid">
          {categories.filter(c=>{const individualSlugs=['automotive-services','design-creative','education-training','healthcare-wellness','home-maintenance','hospitality-events','transport-logistics','web-technology','writing-translation'];const companySlugs=['business-services','construction-engineering','design-creative','finance-administration','hr-recruitment','industrial-manufacturing','marketing-sales','transport-logistics','web-technology'];if(categoryAudience==='all')return true;if(categoryAudience==='investors')return c.slug==='investors-opportunities';if(categoryAudience==='individuals')return individualSlugs.includes(c.slug);return companySlugs.includes(c.slug);}).map(c=>{
            const symbols={'web-technology':'⌘','design-creative':'✦','marketing-sales':'↗','business-services':'▤','automotive-services':'⚙','education-training':'◎','home-maintenance':'⌂','writing-translation':'✎','construction-engineering':'⌁','transport-logistics':'⇢','finance-administration':'＄','hr-recruitment':'♙','healthcare-wellness':'＋','hospitality-events':'◇','industrial-manufacturing':'▦','investors-opportunities':'◈'};
            const images={
              'web-technology':'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=82',
              'design-creative':'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=900&q=82',
              'marketing-sales':'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=82',
              'business-services':'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=82',
              'automotive-services':'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=82',
              'education-training':'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=82',
              'home-maintenance':'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=82',
              'writing-translation':'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=82',
              'construction-engineering':'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=82',
              'transport-logistics':'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=82',
              'finance-administration':'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=82',
              'hr-recruitment':'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=82',
              'healthcare-wellness':'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=82',
              'hospitality-events':'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=82',
              'industrial-manufacturing':'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=82',
              'investors-opportunities':'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=900&q=82'
            };
            return <button type="button" className="category-card category-select-card" key={c.id} onClick={()=>{setSelectedCategoryId(c.id);navigatePage('professionals');}}>
              <div className="category-image"><img src={images[c.slug]||images['business-services']} alt={isAr?c.name_ar:c.name_en} loading="lazy" decoding="async"/><span className="category-symbol">{symbols[c.slug]||'✧'}</span></div>
              <h3>{isAr?c.name_ar:c.name_en}</h3>
              <p>{isAr?(c.description_ar||''): (c.description_en||'')}</p>
              <span className="category-audience">{c.slug==='investors-opportunities'?t.audienceInvestors:(isAr?'اختر لعرض المحترفين':'Select to view professionals')}</span>
              {c.slug==='investors-opportunities'&&<small className="investor-disclaimer">{t.investorDisclaimer}</small>}
            </button>;
          })}
        </div>}
      </section>}
      {page === 'professionals' && <section className="section professional-directory"><div className="section-label">NUSQRA · PROFESSIONAL DIRECTORY</div><h2>{isAr?'المحترفون حسب التصنيف':'Professionals by category'}</h2><p className="section-intro">{selectedCategoryId?(isAr?'المحترفون الذين يقدمون الخدمة في التصنيف المحدد.':'Professionals who offer services in your selected category.'):(isAr?'اختر تصنيفاً أولاً لعرض المحترفين المناسبين.':'Choose a service category first to see matching professionals.')}</p><div className="professional-directory-toolbar">{selectedCategoryId&&<strong>{(()=>{const c=categories.find(x=>x.id===selectedCategoryId);return c?(isAr?c.name_ar:c.name_en):'';})()}</strong>}<button className="btn secondary" type="button" onClick={()=>navigatePage('categories')}>{isAr?'تغيير التصنيف':'Change category'}</button>{selectedCategoryId&&<button className="btn primary" type="button" onClick={()=>{setJobForm(v=>({...v,category_id:selectedCategoryId}));navigatePage('marketplace');}}>{isAr?'انشر طلباً بهذا التصنيف':'Post a job in this category'}</button>}</div>{error&&<p className="auth-error" role="alert">{error}</p>}{professionalDirectory.length===0?<p className="market-empty">{selectedCategoryId?(isAr?'لا يوجد محترفون مسجلون في هذا التصنيف بعد.':'No professionals have selected this category yet.'):(isAr?'اختر تصنيفاً لعرض المحترفين.':'Select a category to view professionals.')}</p>:<div className="professional-directory-grid">{professionalDirectory.map(p=><article className="professional-directory-card" key={p.user_id}>{p.profile.avatar_url?<img src={p.profile.avatar_url} alt=""/>:<div className="professional-avatar">{(p.profile.display_name||p.profile.full_name||'N').slice(0,1).toUpperCase()}</div>}<div className="professional-directory-copy"><h3>{p.profile.display_name||p.profile.full_name||t.professional}</h3><strong>{p.headline|| (isAr?'محترف في نسقرا':'NUSQRA professional')}</strong><p>{p.about||p.profile.bio||''}</p><small>{[p.city,p.country_code||p.profile.country_code].filter(Boolean).join(' · ')}{p.years_experience?` · ${p.years_experience} ${isAr?'سنوات خبرة':'years experience'}`:''}</small><div className="professional-category-tags">{(p.categoryIds||[]).map(id=>{const c=categories.find(x=>x.id===id);return c?<span key={id}>{isAr?c.name_ar:c.name_en}</span>:null;})}</div></div></article>)}</div>}<div className="buttons"><button className="btn secondary" onClick={()=>navigatePage('marketplace')}>{isAr?'استكشف فرص العمل':'Explore opportunities'}</button></div></section>}
      {page === 'explore' && <section className="section" id="explore"><div className="section-label">NUSQRA PLATFORM</div><h2>{t.trust}</h2><div className="feature-grid">
        {[ShieldCheck,Users,Crown,Globe2].map((Icon,i)=><article className="feature" key={i}><span className="iconbox"><Icon size={24}/></span><h3>{t.features[i]}</h3><p>{t.featureText[i]}</p></article>)}
      </div></section>}
      {page === 'how-it-works' && <section className="section steps" id="how-it-works"><div className="section-label">SIMPLE BY DESIGN</div><h2>{t.steps}</h2><div className="step-grid">
        {t.step.map((x,i)=><article key={i}><div className="step-num">0{i+1}</div><h3>{x}</h3><p>{t.stepText[i]}</p></article>)}
      </div></section>}
      {page === 'marketplace' && <section className="section marketplace-section" id="marketplace">
        <div className="section-label">NUSQRA · MARKETPLACE</div><h2>{t.marketplace}</h2>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <div className="marketplace-layout">
          {roles.includes('customer') && <div className="marketplace-panel">
            <h3>{t.postJob}</h3>
            <form className="market-form" onSubmit={publishJob}>
              <label>{t.jobTitle}<input required minLength="5" maxLength="160" value={jobForm.title} onChange={e=>setJobForm(v=>({...v,title:e.target.value}))}/></label>
              <label>{t.category}<select value={jobForm.category_id} onChange={e=>setJobForm(v=>({...v,category_id:e.target.value}))}><option value="">{t.selectCategory}</option>{categories.map(c=><option key={c.id} value={c.id}>{isAr?c.name_ar:c.name_en}</option>)}</select></label>
              <label>{t.jobDescription}<textarea required minLength="20" maxLength="8000" rows="5" value={jobForm.description} onChange={e=>setJobForm(v=>({...v,description:e.target.value}))}/></label>
              <div className="market-form-grid">
                <label>{t.minBudget}<input type="number" min="0" step="0.01" value={jobForm.budget_min} onChange={e=>setJobForm(v=>({...v,budget_min:e.target.value}))}/></label>
                <label>{t.maxBudget}<input type="number" min="0" step="0.01" value={jobForm.budget_max} onChange={e=>setJobForm(v=>({...v,budget_max:e.target.value}))}/></label>
                <label>{t.currency}<select value={jobForm.currency} onChange={e=>setJobForm(v=>({...v,currency:e.target.value}))}>{['SAR','AED','BHD','KWD','OMR','QAR'].map(x=><option key={x}>{x}</option>)}</select></label>
                <label>{t.cityLabel}<input value={jobForm.city} onChange={e=>setJobForm(v=>({...v,city:e.target.value}))}/></label>
              </div>
              <button className="btn primary" type="submit" disabled={busy}>{t.publishJob}</button>
            </form>
          </div>}
          <div className="marketplace-panel">
            <h3>{!session?(isAr?'فرص العمل المتاحة':'Available opportunities'):isProfessional?t.myJobsAndOpenJobs:t.myJobs}</h3>
            {jobs.filter(j=>(!session&&j.status==='open')||(session&&isProfessional&&j.customer_id!==session.user.id&&(j.status==='open'||myProposals[j.id]))||(session&&roles.includes('customer')&&j.customer_id===session.user.id)).length===0
              ? <p className="market-empty">{!session?(isAr?'لا توجد فرص منشورة حالياً.':'No opportunities have been posted yet.'):isProfessional?t.noJobs:t.noOwnJobs}</p>
              : <div className="job-list">{jobs.filter(j=>(!session&&j.status==='open')||(session&&isProfessional&&j.customer_id!==session.user.id&&(j.status==='open'||myProposals[j.id]))||(session&&roles.includes('customer')&&j.customer_id===session.user.id)).map(job=>{
                const category=categories.find(c=>c.id===job.category_id);
                const v=proposalForms[job.id]||{cover_letter:'',proposed_price:'',delivery_days:''};
                return <article className="job-card" key={job.id}>
                  <div className="job-card-top"><span className="job-status">{job.status}</span><span className="job-date">{new Date(job.created_at).toLocaleDateString(lang==='ar'?'ar-SA':'en-US')}</span></div>
                  <h4>{job.title}</h4><p className="job-category">{category?(isAr?category.name_ar:category.name_en):t.marketplace} · {job.city||job.country_code}</p>
                  <p className="job-description">{job.description}</p>
                  <div className="job-meta"><strong>{t.budget}: {job.budget_min??'—'} – {job.budget_max??'—'} {job.currency}</strong></div>
                  {!session&&job.status==='open'&&<button className="btn primary" type="button" onClick={()=>{setForm(x=>({...x,account_type:'professional'}));setAuthMode('login');}}>{isAr?'سجّل الدخول لتقديم عرض':'Log in to submit a proposal'}</button>}
                  {session&&!isProfessional&&job.status==='open'&&job.customer_id!==session.user.id&&<button className="btn secondary" type="button" disabled={busy} onClick={enableProfessional}>{isAr?'تفعيل الملف المهني للتقديم':'Enable professional profile to apply'}</button>}
                  {isProfessional&&job.status==='open'&&job.customer_id!==session.user.id&&!myProposals[job.id]&&<form className="market-form proposal-form" onSubmit={e=>submitProposal(e,job)}>
                    <h5>{t.submitProposal}</h5>
                    <label>{t.proposalText}<textarea required minLength="20" maxLength="5000" rows="4" value={v.cover_letter} onChange={e=>setProposalForms(old=>({...old,[job.id]:{...v,cover_letter:e.target.value}}))}/></label>
                    <div className="market-form-grid">
                      <label>{t.proposedPrice}<input type="number" min="0" step="0.01" value={v.proposed_price} onChange={e=>setProposalForms(old=>({...old,[job.id]:{...v,proposed_price:e.target.value}}))}/></label>
                      <label>{t.deliveryDays}<input type="number" min="1" max="365" value={v.delivery_days} onChange={e=>setProposalForms(old=>({...old,[job.id]:{...v,delivery_days:e.target.value}}))}/></label>
                    </div>
                    <button className="btn primary" type="submit" disabled={busy}>{t.sendProposal}</button>
                  </form>}
                  {job.customer_id===session.user.id&&<div className="job-management">{job.status==='open'&&<><button className="btn secondary" type="button" disabled={busy} onClick={()=>updateJobStatus(job,'closed')}>{t.closeJob}</button><button className="btn secondary" type="button" disabled={busy} onClick={()=>updateJobStatus(job,'cancelled')}>{t.cancelJob}</button></>}{job.status==='closed'&&<><button className="btn secondary" type="button" disabled={busy} onClick={()=>updateJobStatus(job,'open')}>{t.reopenJob}</button><button className="btn secondary" type="button" disabled={busy} onClick={()=>updateJobStatus(job,'cancelled')}>{t.cancelJob}</button></>}{job.status==='in_progress'&&<button className="btn primary" type="button" disabled={busy} onClick={()=>updateJobStatus(job,'completed')}>{t.completeJob}</button>}</div>}
                  {isProfessional&&myProposals[job.id]&&<p className="my-proposal-status">{t.proposalSubmitted}: <strong>{myProposals[job.id].status==='accepted'?t.proposalAccepted:myProposals[job.id].status==='rejected'?t.proposalRejected:myProposals[job.id].status}</strong></p>}
                  {job.customer_id===session.user.id&&<div className="proposal-review">
                    <button className="btn secondary" type="button" onClick={()=>toggleProposals(job)}>{t.viewProposals}</button>
                    {expandedJob===job.id&&<div className="proposal-list">
                      {(jobProposals[job.id]||[]).length===0?<p className="market-empty">{t.noProposals}</p>:(jobProposals[job.id]||[]).map(p=><div className="proposal-card" key={p.id}>
                        <strong>{p.professional?.full_name||t.professional}</strong><p>{p.cover_letter}</p>
                        <small>{p.proposed_price??'—'} {p.currency} · {p.delivery_days??'—'} {t.deliveryDays} · {p.status}</small>
                        <div className="proposal-actions">{p.status==='submitted'&&job.status==='open'&&<><button className="btn primary" type="button" disabled={busy} onClick={()=>decideProposal(p,'accepted')}>{t.accept}</button><button className="btn secondary" type="button" disabled={busy} onClick={()=>decideProposal(p,'rejected')}>{t.reject}</button></>}{(p.status==='submitted'||p.status==='accepted')&&<button className="btn secondary" type="button" disabled={busy} onClick={()=>openConversation(job,p.professional_id)}><MessageCircle size={15}/>{t.messageProfessional}</button>}</div>
                      </div>)}
                    </div>}
                  </div>}
                </article>;
              })}</div>}
          </div>
        </div>
      </section>}
      {page === 'messages' && session && <section className="section marketplace-section messaging-section" id="messages"><div className="section-label">NUSQRA · PRIVATE</div><h2>{t.messages}</h2><div className="messaging-layout"><aside className="conversation-list">{conversations.length===0?<p className="market-empty">{t.noConversations}</p>:conversations.map(c=><button type="button" className={'conversation-item'+(selectedConversation?.id===c.id?' active':'')} key={c.id} onClick={()=>setSelectedConversation(c)}><strong>{c.job?.title||t.marketplace}</strong><span>{session.user.id===c.customer_id?(c.professional?.full_name||t.professional):(c.customer?.full_name||t.customer)}</span></button>)}</aside><div className="chat-panel">{selectedConversation?<><div className="chat-heading"><strong>{selectedConversation.job?.title||conversations.find(c=>c.id===selectedConversation.id)?.job?.title||t.marketplace}</strong><span>{session.user.id===selectedConversation.customer_id?(conversations.find(c=>c.id===selectedConversation.id)?.professional?.full_name||t.professional):(conversations.find(c=>c.id===selectedConversation.id)?.customer?.full_name||t.customer)}</span></div><div className="message-list">{messages.map(m=><div key={m.id} className={'message-bubble'+(m.sender_id===session.user.id?' mine':'')}><p>{m.body}</p><time>{new Date(m.created_at).toLocaleString(lang==='ar'?'ar-SA':'en-US')}</time></div>)}</div><form className="message-compose" onSubmit={sendMessage}><textarea rows="2" maxLength="4000" required placeholder={t.messagePlaceholder} value={messageDraft} onChange={e=>setMessageDraft(e.target.value)}/><button className="btn primary" type="submit" disabled={busy||!messageDraft.trim()}><Send size={16}/>{t.sendMessage}</button></form></>:<p className="market-empty">{t.noConversations}</p>}</div></div></section>}
      {page === 'settings' && session && <section className="section account-section settings-page" id="account">
        <div className="section-label">NUSQRA · {t.dashboard.toUpperCase()}</div><h2>{t.dashboard}</h2>
        <div className="account-card">
          <div className="account-heading"><div><h3>{profileForm.full_name || session.user.email}</h3><p>{session.user.email}</p></div><div className="settings-actions"><button className="btn secondary" type="button" onClick={()=>navigatePage('home')}>{isAr?"العودة للرئيسية":"Back to home"}</button><button className="btn secondary" onClick={signOut}><LogOut size={16}/>{t.logout}</button></div></div>
          <div className="role-list"><strong>{t.roles}:</strong>{roles.map(role=><span className="role-chip" key={role}>{role==='customer'?t.customer:t.professional}</span>)}</div>
          {!isProfessional && <button className="btn secondary enable-pro" disabled={busy} onClick={enableProfessional}><BriefcaseBusiness size={16}/>{t.enablePro}</button>}
          <form className="profile-form profile-studio" onSubmit={saveProfile}>
            <div className="profile-studio-heading"><div><span className="profile-studio-kicker">{isAr?'استوديو الهوية الشخصية':'NUSQRA · PROFILE DESIGN STUDIO'}</span><h3>{isAr?'صمّم حضورك المهني':'Build a profile that stands out'}</h3><p>{isAr?'خصص صورتك ومعلوماتك ومظهرك، ثم راجع النتيجة قبل النشر.':'Personalize your identity, details and visual style, then preview before saving.'}</p></div><button className="btn secondary preview-open" type="button" onClick={()=>setPreviewOpen(true)}>{isAr?'معاينة الملف':'Live preview'}</button></div>
            <div className="profile-editor-tabs" role="tablist" aria-label="Profile editor sections">
              <button type="button" role="tab" aria-selected={profileTab==='identity'} className={profileTab==='identity'?'active':''} onClick={()=>setProfileTab('identity')}>{isAr?'الهوية':'Profile'}</button>
              {isProfessional && <button type="button" role="tab" aria-selected={profileTab==='professional'} className={profileTab==='professional'?'active':''} onClick={()=>setProfileTab('professional')}>{isAr?'المعلومات المهنية':'Professional'}</button>}
              <button type="button" role="tab" aria-selected={profileTab==='appearance'} className={profileTab==='appearance'?'active':''} onClick={()=>setProfileTab('appearance')}>{isAr?'المظهر والقوالب':'Appearance & templates'}</button>
            </div>
            {profileTab==='identity' && <div className="profile-tab-panel">
              <div className="profile-upload-grid">
                <label className="profile-upload-card"><span className="upload-icon">◎</span><strong>{isAr?'الصورة الشخصية':'Profile photo'}</strong><small>{isAr?'JPG أو PNG أو WEBP · حتى 5MB':'JPG, PNG or WEBP · up to 5MB'}</small><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setPhotoFiles(v=>({...v,avatar:e.target.files?.[0]||null}))}/></label>
                <label className="profile-upload-card"><span className="upload-icon">▱</span><strong>{isAr?'صورة الغلاف':'Cover image'}</strong><small>{isAr?'صورة عريضة اختيارية':'Optional wide banner image'}</small><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setPhotoFiles(v=>({...v,cover:e.target.files?.[0]||null}))}/></label>
              </div>
              <label>{t.fullName}<input required maxLength="100" value={profileForm.full_name} onChange={e=>setProfileField('full_name',e.target.value)} /></label>
              <label>{t.country}<select value={profileForm.country_code} onChange={e=>setProfileField('country_code',e.target.value)}>{countryCodes.map(code=><option key={code} value={code}>{t.countries[code]}</option>)}</select></label>
              <label>{t.bio}<textarea rows="4" maxLength="500" value={profileForm.bio} onChange={e=>setProfileField('bio',e.target.value)}/></label>
            </div>}
            {profileTab==='professional' && isProfessional && <div className="profile-tab-panel professional-fields">
              <label>{t.headline}<input maxLength="120" value={profileForm.headline} onChange={e=>setProfileField('headline',e.target.value)}/></label>
              <label>{t.city}<input maxLength="100" value={profileForm.city} onChange={e=>setProfileField('city',e.target.value)}/></label>
              <label>{t.experience}<input type="number" min="0" max="60" value={profileForm.years_experience} onChange={e=>setProfileField('years_experience',e.target.value)}/></label>
              <label>{isAr?'نبذة مهنية':'Professional summary'}<textarea rows="5" maxLength="3000" value={profileForm.about} onChange={e=>setProfileField('about',e.target.value)}/></label>
              <div className="professional-category-editor"><strong>{isAr?'التصنيفات التي تقدم خدماتها':'Services you provide'}</strong><p>{isAr?'اختر جميع التصنيفات التي تناسب خبرتك ليظهر ملفك للعملاء المناسبين.':'Choose every category that matches your services so customers can find your profile.'}</p><div className="professional-category-options">{categories.filter(c=>c.slug!=='investors-opportunities').map(c=><label key={c.id}><input type="checkbox" checked={professionalCategoryIds.includes(c.id)} onChange={e=>setProfessionalCategoryIds(old=>e.target.checked?[...old,c.id]:old.filter(id=>id!==c.id))}/><span>{isAr?c.name_ar:c.name_en}</span></label>)}</div></div>
            </div>}
            {profileTab==='appearance' && <div className="profile-tab-panel">
              <div className="profile-template-intro"><strong>{isAr?'اختر قالب الملف':'Choose your profile template'}</strong><span>{isAr?'يمكنك تغيير القالب في أي وقت.':'You can change your template at any time.'}</span></div>
              <div className="profile-template-grid">
                {[
                  {id:'classic',name:'Classic',desc:'Balanced, clean and familiar'},
                  {id:'modern',name:'Modern',desc:'Bold header with compact details'},
                  {id:'executive',name:'Executive',desc:'Refined layout for business leaders'},
                  {id:'creative',name:'Creative',desc:'Expressive portfolio-inspired style'}
                ].map(template=><button key={template.id} type="button" className={'profile-template-option '+(profileForm.profile_template===template.id?'selected':'')} onClick={()=>setProfileField('profile_template',template.id)}>
                  <span className={'template-mini template-'+template.id}><i/><i/><i/></span><strong>{template.name}</strong><small>{template.desc}</small><span className="template-select">{profileForm.profile_template===template.id?(isAr?'محدد':'Selected'):(isAr?'اختيار':'Select')}</span>
                </button>)}
              </div>
              <div className="profile-style-row"><label><span>{isAr?'نمط اللون':'Profile accent'}</span><select value={profileForm.profile_style} onChange={e=>setProfileField('profile_style',e.target.value)}><option value="simple">{isAr?'أخضر بسيط':'Simple emerald'}</option><option value="premium">{isAr?'ذهبي مميز':'Premium emerald & gold'}</option><option value="purple_gold">{isAr?'ملكي بنفسجي وذهبي':'Royal purple & gold'}</option></select></label></div>
              <div className={'profile-preview profile-template-preview template-'+profileForm.profile_template+(profileForm.profile_style!=='simple'?' premium-profile':'')+(profileForm.profile_style==='purple_gold'?' purple-gold-profile':'')}>
                <div className="template-preview-cover">{profileForm.cover_url?<img src={profileForm.cover_url} alt=""/>:<span>NUSQRA · {profileForm.profile_template.toUpperCase()}</span>}</div>
                <div className="template-preview-identity"><div className="profile-avatar-preview">{profileForm.avatar_url?<img src={profileForm.avatar_url} alt=""/>:<UserRound size={30}/>}</div><div><strong>{profileForm.full_name||'Your name'}</strong><span>{profileForm.headline|| (isProfessional?'Professional on NUSQRA':'NUSQRA member')}</span></div></div>
                <p>{profileForm.bio||profileForm.about||'Your introduction will appear here when you add it.'}</p>
                <div className="template-preview-meta"><span>{t.countries[profileForm.country_code]||'Gulf region'}</span>{profileForm.city&&<span>{profileForm.city}</span>}</div>
              </div>
            </div>}
            {error && <p className="auth-error" role="alert">{error}</p>}
            <div className="profile-save-row"><span>{isAr?'التغييرات لا تُنشر إلا بعد الحفظ.':'Your changes are applied after you save.'}</span><button className="btn primary" type="submit" disabled={busy}>{busy?<LoaderCircle className="spin" size={17}/>:<CheckCircle2 size={17}/>} {t.save}</button></div>
          </form>
          {previewOpen && <div className="profile-preview-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setPreviewOpen(false);}}>
            <section className="profile-preview-dialog" role="dialog" aria-modal="true" aria-label="Profile preview">
              <div className="profile-preview-dialog-head"><div><strong>{isAr?'معاينة الملف الشخصي':'Profile preview'}</strong><span>{isAr?'هذا مثال لكيفية ظهور ملفك':'A preview of how your profile may appear'}</span></div><button type="button" aria-label="Close preview" onClick={()=>setPreviewOpen(false)}><X size={20}/></button></div>
              <div className={'profile-preview profile-template-preview template-'+profileForm.profile_template+(profileForm.profile_style!=='simple'?' premium-profile':'')+(profileForm.profile_style==='purple_gold'?' purple-gold-profile':'')}>
                <div className="template-preview-cover">{profileForm.cover_url?<img src={profileForm.cover_url} alt=""/>:<span>NUSQRA · {profileForm.profile_template.toUpperCase()}</span>}</div>
                <div className="template-preview-identity"><div className="profile-avatar-preview">{profileForm.avatar_url?<img src={profileForm.avatar_url} alt=""/>:<UserRound size={30}/>}</div><div><strong>{profileForm.full_name||'Your name'}</strong><span>{profileForm.headline||(isProfessional?'Professional on NUSQRA':'NUSQRA member')}</span></div></div>
                <p>{profileForm.bio||profileForm.about||'Add an introduction to complete your profile.'}</p>
                <div className="template-preview-meta"><span>{t.countries[profileForm.country_code]||'Gulf region'}</span>{profileForm.city&&<span>{profileForm.city}</span>}</div>
              </div>
              <div className="profile-preview-dialog-actions"><button className="btn secondary" type="button" onClick={()=>setPreviewOpen(false)}>{isAr?'إغلاق':'Close preview'}</button><button className="btn primary" type="button" onClick={()=>{setPreviewOpen(false);setProfileTab('appearance')}}>{isAr?'تعديل القالب':'Change template'}</button></div>
            </section>
          </div>}
        </div>
      </section>}
    </main>
    <footer><div className="brand"><span className="mark" aria-label="NUSQRA logo"><svg className="brand-symbol" viewBox="0 0 64 64" role="img" aria-hidden="true"><path d="M14 49V15h7l29 34V15" fill="none" stroke="#F0D59A" strokeWidth="6" strokeLinecap="square" strokeLinejoin="miter"/><path d="M49 15h-8" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="square"/><path d="M14 15h8" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="square"/></svg></span><span>NUSQRA<small>نُسقرا</small></span></div><p>{t.footer}</p><span>© {new Date().getFullYear()} NUSQRA · {t.join}</span></footer>
    {authMode && <div className="auth-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget){setAuthMode(null);setError('')}}}>
      <section className="auth-dialog" role="dialog" aria-modal="true" aria-label={authMode==='register'?t.create:t.welcome}>
        <button className="auth-close" aria-label="Close" onClick={()=>setAuthMode(null)}><X size={22}/></button>
        <div className="brand"><span className="mark" aria-label="NUSQRA logo"><svg className="brand-symbol" viewBox="0 0 64 64" role="img" aria-hidden="true"><path d="M14 49V15h7l29 34V15" fill="none" stroke="#F0D59A" strokeWidth="6" strokeLinecap="square" strokeLinejoin="miter"/><path d="M49 15h-8" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="square"/><path d="M14 15h8" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="square"/></svg></span><span>NUSQRA<small>نُسقرا</small></span></div>
        <h2>{authMode==='register'?t.create:t.welcome}</h2>
        {!isSupabaseConfigured && <p className="auth-warning">{t.noConfig}</p>}
        <div className="auth-method-tabs">
          <button type="button" className={authMethod==='email'?'active':''} onClick={()=>{setAuthMethod('email');setError('');}}>Email</button>
          <button type="button" className={authMethod==='phone'?'active':''} onClick={()=>{setAuthMethod('phone');setError('');}}>Phone</button>
        </div>
        <button type="button" className="google-auth" disabled={busy||!isSupabaseConfigured} onClick={async()=>{setAuthMethod('google');setError('');setBusy(true);try{const {error:e}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:'https://nusqra.mrexpertd.workers.dev'}});if(e)throw e;}catch(e){setError(e.message||t.authError);setBusy(false);}}}><span className="google-g">G</span> Continue with Google</button>
        <div className="auth-divider"><span>or continue with</span></div>
        <form onSubmit={submitAuth}>
          {authMode==='register' && <>
            <label>{t.fullName}<input required autoComplete="name" value={form.full_name} onChange={e=>setField('full_name',e.target.value)} /></label>
            <label>{t.country}<select value={form.country_code} onChange={e=>setField('country_code',e.target.value)}>{countryCodes.map(code=><option key={code} value={code}>{t.countries[code]}</option>)}</select></label>
            <label>{t.roles}<select value={form.account_type} onChange={e=>setField('account_type',e.target.value)}><option value="customer">{t.customer}</option><option value="professional">{t.professional}</option></select></label>
          </>}
          {authMethod==='phone' ? <>
            <label>Gulf country code<select value={form.country_code} onChange={e=>setField('country_code',e.target.value)}>{gulfDialCodes.map(x=><option key={x.code} value={x.code}>{x.name} ({x.dial})</option>)}</select></label>
            <label>Mobile number<input type="tel" inputMode="tel" autoComplete="tel-national" placeholder="5xxxxxxxx" value={phone} onChange={e=>setPhone(e.target.value)} required/></label>
            {otpSent && <label>SMS verification code<input inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={e=>setOtp(e.target.value)} required/></label>}
          </> : <>
            <label>{t.email}<input type="email" required autoComplete="email" value={form.email} onChange={e=>setField('email',e.target.value)}/></label>
            <label>{t.password}<input type="password" required minLength="8" autoComplete={authMode==='register'?'new-password':'current-password'} value={form.password} onChange={e=>setField('password',e.target.value)}/></label>
          </>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          {notice && <p className="auth-success" role="status">{notice}</p>}
          <button className="btn primary" type="submit" disabled={busy || !isSupabaseConfigured}>{busy?<LoaderCircle className="spin" size={17}/>:null}{busy?t.working:authMethod==='phone'?(otpSent?'Verify code':'Send SMS code'):authMode==='register'?t.signup:t.login}</button>
          {authMethod==='phone'&&otpSent&&<button className="auth-switch" type="button" onClick={()=>{setOtpSent(false);setOtp('');}}>Change phone number</button>}
        </form>
        <button className="auth-switch" onClick={()=>{setAuthMode(authMode==='login'?'register':'login');setError('');setNotice('')}}>{authMode==='login'?t.signUpPrompt:t.signInPrompt}</button>
      </section>
    </div>}
    {notice && !authMode && <div className="site-notice" role="status">{notice}</div>}
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
