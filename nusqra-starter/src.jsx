import React, { useEffect, useState } from 'react';
import nusqraLogo from './nusqra-mark.svg';
import nusqraLogoDark from './nusqra-mark-dark.svg';
import nusqraSymbol from './nusqra-symbol.svg';
import { createRoot } from 'react-dom/client';
import {
  Globe2, ShieldCheck, Users, ArrowRight, ArrowLeft, Crown, Menu, X,
  BriefcaseBusiness, LogOut, UserRound, CheckCircle2, LoaderCircle,
  MessageCircle, Send, Check, XCircle, RefreshCw, Eye, EyeOff
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
  const [lang, setLang] = useState(() => window.localStorage.getItem('nusqra-language') || 'ar');
  const [selectedRole, setSelectedRole] = useState(null);
  const [entryStep, setEntryStep] = useState('role');
  const [activeRole, setActiveRole] = useState(() => window.localStorage.getItem('nusqra-active-role') || 'customer');
  const [menu, setMenu] = useState(false);
  const [page, setPage] = useState(() => window.location.hash.replace('#','') || 'home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileTab, setProfileTab] = useState('identity');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const [roles, setRoles] = useState([]);
  const [professional, setProfessional] = useState(null);
  const [form, setForm] = useState({full_name:'',email:'',password:'',account_type:'customer',country_code:'SA'});
  const [authMethod,setAuthMethod] = useState('email');
  const [showPassword,setShowPassword] = useState(false);
  const [phone,setPhone] = useState('');
  const [otp,setOtp] = useState('');
  const [otpSent,setOtpSent] = useState(false);
  const [photoFiles,setPhotoFiles] = useState({avatar:null,cover:null});
  const [profileForm, setProfileForm] = useState({full_name:'',bio:'',country_code:'SA',headline:'',about:'',years_experience:'',city:'',avatar_url:'',cover_url:'',profile_style:'simple',profile_template:'classic',phone_number:'',profile_level:'entry',availability_status:'unavailable',age:'',can_travel_to_jobs:'',identity_name_confirmed:false,verification_status:'pending_review'});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [categories,setCategories] = useState([]);
  const [categoryAudience,setCategoryAudience] = useState('all');
  const [jobs,setJobs] = useState([]);
  const [professionalDirectory,setProfessionalDirectory] = useState([]);
  const [selectedCategoryId,setSelectedCategoryId] = useState('');
  const [professionalCategoryIds,setProfessionalCategoryIds] = useState([]);
  const [signupCategoryId,setSignupCategoryId] = useState('');
  const [professionalCredentials,setProfessionalCredentials] = useState([]);
  const [professionalPortfolio,setProfessionalPortfolio] = useState([]);
  const [accountControl,setAccountControl] = useState(null);
  const [supportSubject,setSupportSubject] = useState('');
  const [supportBody,setSupportBody] = useState('');
  const [mySupportTickets,setMySupportTickets] = useState([]);
  const [mySupportMessages,setMySupportMessages] = useState([]);
  const [mySelectedTicket,setMySelectedTicket] = useState(null);
  const [mySupportReply,setMySupportReply] = useState('');
  const [credentialForm,setCredentialForm] = useState({category_id:'',title:'',issuer:'',credential_number:'',file:null});
  const [portfolioForm,setPortfolioForm] = useState({category_id:'',title:'',description:'',project_url:'',file:null});
  const [jobForm,setJobForm] = useState({title:'',description:'',category_id:'',budget_min:'',budget_max:'',currency:'SAR',country_code:'SA',city:''});
  const [proposalForms,setProposalForms] = useState({});
  const [skillRatingForms,setSkillRatingForms] = useState({});
  const [jobProposals,setJobProposals] = useState({});
  const [myProposals,setMyProposals] = useState({});
  const [expandedJob,setExpandedJob] = useState(null);
  const [conversations,setConversations] = useState([]);
  const [selectedConversation,setSelectedConversation] = useState(null);
  const [messages,setMessages] = useState([]);
  const [messageDraft,setMessageDraft] = useState('');
  const t = dictionary[lang];
  const isAr = lang === 'ar';

  useEffect(() => {
    if (!session) {
      if (!window.history.state?.nusqraEntryStep) {
        window.history.replaceState({ ...(window.history.state || {}), nusqraEntryStep: 'role' }, '', window.location.href);
      }
      const handleEntryBack = (event) => {
        if (event.state?.nusqraEntryStep === 'role') {
          setEntryStep('role');
          setAuthMode(null);
          setError('');
          setNotice('');
        } else if (event.state?.nusqraEntryStep === 'auth') {
          setEntryStep('auth');
        }
      };
      window.addEventListener('popstate', handleEntryBack);
      return () => window.removeEventListener('popstate', handleEntryBack);
    }
  }, [session]);
  const isProfessional = roles.includes('professional') && activeRole === 'professional';
  const isCustomer = roles.includes('customer') && activeRole === 'customer';
  const canPostJobs = !accountControl || accountControl.account_status!=='restricted' || accountControl.restrictions?.can_post_jobs!==false;
  const canSubmitProposals = !accountControl || accountControl.account_status!=='restricted' || accountControl.restrictions?.can_submit_proposals!==false;
  const canMessage = !accountControl || accountControl.account_status!=='restricted' || accountControl.restrictions?.can_message!==false;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    window.localStorage.setItem('nusqra-language', lang);
  }, [lang]);

  useEffect(() => {
    const syncPage = () => { const next = window.location.hash.replace('#','') || 'home'; setPage(next); setSettingsOpen(next === 'settings'); setMenu(false); window.scrollTo(0,0); };
    window.addEventListener('hashchange', syncPage);
    return () => window.removeEventListener('hashchange', syncPage);
  }, []);

  const navigatePage = (next) => { setPage(next); setSettingsOpen(next === 'settings'); setMenu(false); window.location.hash = next; window.scrollTo(0,0); };

  useEffect(() => {
    if (!supabase) { setAuthReady(true); return undefined; }
    let alive = true;
    supabase.auth.getSession().then(({data}) => {
      if (alive) { setSession(data.session); setAuthReady(true); }
    }).catch(() => { if (alive) setAuthReady(true); });
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
    });
    return () => { alive = false; subscription.unsubscribe(); };
  }, []);

  useEffect(()=>{
    if(!session||!supabase){setAccountControl(null);return;}
    let alive=true;
    (async()=>{
      const {data,error:e}=await supabase.from('account_controls').select('account_status,restrictions,reason,expires_at').eq('user_id',session.user.id).maybeSingle();
      if(!alive)return;
      if(e){setError(e.message);return;}
      setAccountControl(data||null);
      if(data&&['banned','deletion_requested'].includes(data.account_status)&&(!data.expires_at||new Date(data.expires_at)>new Date())){
        setError('This account is currently suspended. Contact NUSQRA support for assistance.');
        await supabase.auth.signOut();
        setSession(null);
      }
    })();
    return()=>{alive=false;};
  },[session]);

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
        supabase.from('professional_profiles').select('headline,about,years_experience,city,country_code,profile_level,identity_name_confirmed,verification_status,age,can_travel_to_jobs').eq('user_id',session.user.id).maybeSingle()
      ]);
      if (!alive) return;
      if (p.error || r.error) { setError(p.error?.message || r.error?.message || t.authError); return; }
      setProfile(p.data || {});
      const availableRoles = (r.data || []).map(x => x.role);
      setRoles(availableRoles);
      const preferredRole = window.localStorage.getItem('nusqra-active-role');
      const restoredRole = (preferredRole === 'customer' || preferredRole === 'professional') && availableRoles.includes(preferredRole)
        ? preferredRole
        : (availableRoles.includes('customer') ? 'customer' : 'professional');
      setActiveRole(restoredRole);
      window.localStorage.setItem('nusqra-active-role',restoredRole);
      setProfessional(pp.data || null);
      setProfileForm({
        full_name:p.data?.full_name || '', bio:p.data?.bio || '',
        country_code:p.data?.country_code || 'SA', avatar_url:p.data?.avatar_url || '', cover_url:p.data?.cover_url || '', profile_style:p.data?.profile_style || 'simple', profile_template:p.data?.profile_template || 'classic', phone_number:p.data?.phone_number || '',
        headline:pp.data?.headline || '', about:pp.data?.about || '',
        years_experience:pp.data?.years_experience ?? '', city:pp.data?.city || '', age:pp.data?.age ?? '', can_travel_to_jobs:pp.data?.can_travel_to_jobs===true?'true':pp.data?.can_travel_to_jobs===false?'false':'', profile_level:pp.data?.profile_level || 'entry', availability_status:pp.data?.availability_status || 'unavailable', identity_name_confirmed:pp.data?.identity_name_confirmed || false, verification_status:pp.data?.verification_status || 'pending_review'
      });
    })();
    return () => { alive = false; };
  }, [session, t.authError]);

  useEffect(() => {
    if (!session || !supabase || profile === null) return;
    const pendingRole = window.localStorage.getItem('nusqra-pending-role');
    if (pendingRole !== 'customer' && pendingRole !== 'professional') return;
    let alive = true;
    (async () => {
      const {error:roleError} = await supabase.from('user_roles').insert({user_id:session.user.id,role:pendingRole});
      if (roleError && !roleError.message.toLowerCase().includes('duplicate')) { if (alive) setError(roleError.message); return; }
      if (pendingRole === 'professional') {
        const {error:profileError} = await supabase.from('professional_profiles').insert({user_id:session.user.id,country_code:'SA'});
        if (profileError && !profileError.message.toLowerCase().includes('duplicate')) { if (alive) setError(profileError.message); return; }
      }
      if (!alive) return;
      setRoles(old => [...new Set([...old,pendingRole])]);
      if (pendingRole === 'professional') setProfessional({country_code:'SA'});
      setActiveRole(pendingRole);
      window.localStorage.removeItem('nusqra-pending-role');
      const destination = 'categories';
      setPage(destination); window.location.hash = destination;
    })();
    return () => { alive = false; };
  }, [session, profile]);

  const setField = (key,value) => setForm(old => ({...old,[key]:value}));
  const setProfileField = (key,value) => setProfileForm(old => ({...old,[key]:value}));

  async function saveProfessionalOnboarding(event){
    event.preventDefault();
    if(!supabase||!session||!isProfessional)return;
    if(!professionalCategoryIds.length){setError(isAr?'اختر تصنيفاً مهنياً واحداً على الأقل.':'Choose at least one professional category.');return;}
    setBusy(true);setError('');setNotice('');
    try{
      const age=Number(profileForm.age),years=Number(profileForm.years_experience);
      if(!Number.isInteger(age)||age<18||age>100)throw new Error(isAr?'يجب أن يكون العمر 18 عاماً أو أكثر.':'Age must be 18 or older.');
      if(!Number.isInteger(years)||years<0||years>60)throw new Error(isAr?'أدخل سنوات خبرة صحيحة.':'Enter valid years of experience.');
      if(!profileForm.city.trim()||!profileForm.phone_number.trim()||!['true','false'].includes(String(profileForm.can_travel_to_jobs)))throw new Error(isAr?'أكمل المدينة ورقم الهاتف وإجابة الانتقال إلى مواقع العمل.':'Complete your city, phone number and job-site travel preference.');
      const {error:profileError}=await supabase.from('profiles').update({phone_number:profileForm.phone_number.trim(),country_code:profileForm.country_code,updated_at:new Date().toISOString()}).eq('id',session.user.id);
      if(profileError)throw profileError;
      const {error:professionalError}=await supabase.from('professional_profiles').update({age,years_experience:years,city:profileForm.city.trim(),country_code:profileForm.country_code,can_travel_to_jobs:profileForm.can_travel_to_jobs==='true',updated_at:new Date().toISOString()}).eq('user_id',session.user.id);
      if(professionalError)throw professionalError;
      const {error:deleteError}=await supabase.from('professional_categories').delete().eq('professional_user_id',session.user.id);
      if(deleteError)throw deleteError;
      const {error:insertError}=await supabase.from('professional_categories').insert(professionalCategoryIds.map(category_id=>({professional_user_id:session.user.id,category_id})));
      if(insertError)throw insertError;
      setProfile(old=>({...old,phone_number:profileForm.phone_number.trim(),country_code:profileForm.country_code}));
      setNotice(isAr?'تم حفظ بياناتك المهنية وتصنيفاتك بنجاح.':'Your professional details and categories have been saved.');
    }catch(e){setError(e.message||t.authError);}
    finally{setBusy(false);}
  }

  async function signInWithGoogle() {
    if (busy) return;
    if (!supabase || !isSupabaseConfigured) { setError(t.noConfig); return; }
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (!selectedRole) { setError(isAr ? 'اختر طريقة استخدام نسقرا أولاً.' : 'Choose how you want to use NUSQRA first.'); setBusy(false); return; }
      window.localStorage.setItem('nusqra-pending-role', selectedRole);
      window.localStorage.setItem('nusqra-active-role', selectedRole);
      const {error:oauthError} = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (oauthError) throw oauthError;
    } catch (e) {
      setError(e.message || t.authError);
      setBusy(false);
    }
  }

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
          const {error:e}=await supabase.auth.signInWithOtp({phone:fullPhone,options:{channel:'sms',shouldCreateUser:authMode==='register',data:{full_name:form.full_name.trim(),account_type:form.account_type,country_code:form.country_code,preferred_language:lang,professional_category_id:form.account_type==='professional'?signupCategoryId:null}}});
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
        const {data,error:signUpError} = await supabase.auth.signUp({email:form.email.trim(),password:form.password,options:{data:{full_name:form.full_name.trim(),account_type:form.account_type,country_code:form.country_code,preferred_language:lang,professional_category_id:form.account_type==='professional'?signupCategoryId:null}}});
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

  useEffect(()=>{
    if(!session||!supabase||!isProfessional)return;
    let alive=true;
    (async()=>{const [cr,po]=await Promise.all([supabase.from('professional_credentials').select('id,category_id,title,issuer,credential_number,status,review_note,created_at').eq('professional_user_id',session.user.id).order('created_at',{ascending:false}),supabase.from('professional_portfolio').select('id,category_id,title,description,media_url,project_url,created_at').eq('professional_user_id',session.user.id).order('created_at',{ascending:false})]);if(!alive)return;if(cr.error||po.error){setError(cr.error?.message||po.error?.message);return;}setProfessionalCredentials(cr.data||[]);setProfessionalPortfolio(po.data||[]);})();
    return()=>{alive=false;};
  },[session,isProfessional]);

  useEffect(()=>{
    if(page!=='support'||!session||!supabase)return;
    let alive=true;
    (async()=>{const {data,error:e}=await supabase.from('support_tickets').select('id,subject,category,priority,status,created_at,updated_at').eq('requester_id',session.user.id).order('updated_at',{ascending:false});if(!alive)return;if(e){setError(e.message);return;}setMySupportTickets(data||[]);})();
    return()=>{alive=false;};
  },[page,session]);
  async function openMySupportTicket(ticket){
    setMySelectedTicket(ticket);
    const {data,error:e}=await supabase.from('support_messages').select('id,sender_id,body,created_at').eq('ticket_id',ticket.id).eq('is_internal_note',false).order('created_at');
    if(e){setError(e.message);return;}setMySupportMessages(data||[]);
  }
  async function createSupportTicket(event){
    event.preventDefault();if(!session||!supportSubject.trim()||!supportBody.trim())return;
    setBusy(true);setError('');
    try{
      const {data,error:e}=await supabase.from('support_tickets').insert({requester_id:session.user.id,subject:supportSubject.trim(),category:'general'}).select('id,subject,category,priority,status,created_at,updated_at').single();
      if(e)throw e;
      const {error:me}=await supabase.from('support_messages').insert({ticket_id:data.id,sender_id:session.user.id,body:supportBody.trim()});
      if(me)throw me;
      setSupportSubject('');setSupportBody('');setMySupportTickets(old=>[data,...old]);setMySelectedTicket(data);setMySupportMessages([{id:crypto.randomUUID(),sender_id:session.user.id,body:supportBody.trim(),created_at:new Date().toISOString()}]);setNotice(isAr?'تم إرسال طلب الدعم.':'Your support request has been submitted.');
    }catch(e){setError(e.message||t.authError);}finally{setBusy(false);}
  }
  async function replyMySupportTicket(event){
    event.preventDefault();if(!mySelectedTicket||!mySupportReply.trim())return;
    const {error:e}=await supabase.from('support_messages').insert({ticket_id:mySelectedTicket.id,sender_id:session.user.id,body:mySupportReply.trim()});
    if(e){setError(e.message);return;}setMySupportReply('');await openMySupportTicket(mySelectedTicket);
  }

  async function submitSkillRating(event,job,proposal){
    event.preventDefault();
    const value=skillRatingForms[proposal.id]||{skill_name:'',rating:5,comment:''};
    if(!value.skill_name.trim())return;
    const {error:e}=await supabase.from('professional_skill_ratings').insert({job_id:job.id,category_id:job.category_id,reviewer_id:session.user.id,professional_id:proposal.professional_id,skill_name:value.skill_name.trim(),rating:Number(value.rating),comment:value.comment.trim()||null});
    if(e){setError(e.message);return;}
    setNotice(isAr?'تم إرسال تقييم المهارة.':'Skill rating submitted.');setSkillRatingForms(old=>({...old,[proposal.id]:{...value,submitted:true}}));
  }

  async function addProfessionalCredential(event){event.preventDefault();if(!supabase||!session||!credentialForm.category_id||!credentialForm.file)return;setBusy(true);setError('');setNotice('');try{const file=credentialForm.file;if(!['application/pdf','image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024)throw new Error(isAr?'ارفع شهادة PDF أو صورة حتى 10 ميجابايت.':'Upload a PDF or image certificate up to 10 MB.');const ext=file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g,'')||'pdf';const path=session.user.id+'/certificate-'+crypto.randomUUID()+'.'+ext;const {error:uploadError}=await supabase.storage.from('professional-documents').upload(path,file,{contentType:file.type,upsert:false});if(uploadError)throw uploadError;const {data,error:insertError}=await supabase.from('professional_credentials').insert({professional_user_id:session.user.id,category_id:credentialForm.category_id,title:credentialForm.title.trim(),issuer:credentialForm.issuer.trim(),credential_number:credentialForm.credential_number.trim()||null,document_path:path}).select('id,category_id,title,issuer,credential_number,status,review_note,created_at').single();if(insertError)throw insertError;setProfessionalCredentials(old=>[data,...old]);setCredentialForm({category_id:'',title:'',issuer:'',credential_number:'',file:null});setNotice(isAr?'تم رفع الشهادة وهي بانتظار المراجعة.':'Certificate uploaded and waiting for review.');}catch(e){setError(e.message||t.authError);}finally{setBusy(false);}}

  async function addPortfolioHighlight(event){event.preventDefault();if(!supabase||!session||!portfolioForm.category_id)return;setBusy(true);setError('');setNotice('');try{let mediaUrl=null;if(portfolioForm.file){const file=portfolioForm.file;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw new Error(isAr?'استخدم صورة JPG أو PNG أو WEBP حتى 5 ميجابايت.':'Use a JPG, PNG or WEBP project image up to 5 MB.');const ext=file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';const path=session.user.id+'/work-'+crypto.randomUUID()+'.'+ext;const {error:uploadError}=await supabase.storage.from('profile-media').upload(path,file,{contentType:file.type,upsert:false});if(uploadError)throw uploadError;mediaUrl=supabase.storage.from('profile-media').getPublicUrl(path).data.publicUrl;}const {data,error:insertError}=await supabase.from('professional_portfolio').insert({professional_user_id:session.user.id,category_id:portfolioForm.category_id,title:portfolioForm.title.trim(),description:portfolioForm.description.trim(),project_url:portfolioForm.project_url.trim()||null,media_url:mediaUrl}).select('id,category_id,title,description,media_url,project_url,created_at').single();if(insertError)throw insertError;setProfessionalPortfolio(old=>[data,...old]);setPortfolioForm({category_id:'',title:'',description:'',project_url:'',file:null});setNotice(isAr?'تمت إضافة إنجازك إلى ملفك.':'Work highlight added to your profile.');}catch(e){setError(e.message||t.authError);}finally{setBusy(false);}}

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
          years_experience:profileForm.years_experience === '' ? null : Number(profileForm.years_experience),age:profileForm.age===''?null:Number(profileForm.age),can_travel_to_jobs:profileForm.can_travel_to_jobs==='true',
          city:profileForm.city.trim() || null,country_code:profileForm.country_code,profile_level:profileForm.profile_level,availability_status:profileForm.availability_status,identity_name_confirmed:profileForm.identity_name_confirmed,updated_at:new Date().toISOString()
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
    if (!session || !supabase) return;
    const [c,j,mp] = await Promise.all([
      supabase.from('categories').select('id,slug,name_en,name_ar,description_en,description_ar').eq('is_active',true).order('sort_order'),
      supabase.from('jobs').select('id,customer_id,category_id,title,description,budget_min,budget_max,currency,country_code,city,status,created_at').order('created_at',{ascending:false}).limit(60),
      roles.includes('professional') ? supabase.from('proposals').select('id,job_id,status').eq('professional_id',session.user.id) : Promise.resolve({data:[],error:null})
    ]);
    if(c.error || j.error || mp.error){setError(c.error?.message || j.error?.message || mp.error?.message || t.jobError);return;}
    setCategories(c.data || []);setJobs(j.data || []);setMyProposals(Object.fromEntries((mp.data||[]).map(p=>[p.job_id,p])));
  }

  useEffect(()=>{if(session && supabase) loadMarketplace();else if(!session){setCategories([]);setJobs([]);setJobProposals({});setMyProposals({});}},[session,roles,page]);

  useEffect(()=>{
    if(!session||!supabase||!isProfessional){setProfessionalCategoryIds([]);return;}
    let alive=true;
    supabase.from('professional_categories').select('category_id').eq('professional_user_id',session.user.id).then(({data,error:e})=>{if(!alive)return;if(e){setError(e.message);return;}setProfessionalCategoryIds((data||[]).map(x=>x.category_id));});
    return()=>{alive=false;};
  },[session,isProfessional]);

  useEffect(()=>{
    if(!session||page!=='professionals'||!supabase)return;
    if(!selectedCategoryId){setProfessionalDirectory([]);return undefined;}
    let alive=true;
    (async()=>{
      let categoryRows=[];
      if(selectedCategoryId){const {data,error:e}=await supabase.from('professional_categories').select('professional_user_id,category_id').eq('category_id',selectedCategoryId);if(e){if(alive)setError(e.message);return;}categoryRows=data||[];}
      else {const {data,error:e}=await supabase.from('professional_categories').select('professional_user_id,category_id');if(e){if(alive)setError(e.message);return;}categoryRows=data||[];}
      const categoryUserIds=[...new Set(categoryRows.map(x=>x.professional_user_id))];
      if(selectedCategoryId&&!categoryUserIds.length){if(alive)setProfessionalDirectory([]);return;}
      let query=supabase.from('professional_profiles').select('user_id,headline,about,years_experience,city,country_code,profile_level,availability_status,verification_status,can_travel_to_jobs').eq('is_public',true).limit(60);
      if(selectedCategoryId)query=query.in('user_id',categoryUserIds);
      const {data:proRows,error:proError}=await query;
      if(proError){if(alive)setError(proError.message);return;}
      const ids=(proRows||[]).map(p=>p.user_id);
      if(!ids.length){if(alive)setProfessionalDirectory([]);return;}
      const {data:profilesRows,error:profilesError}=await supabase.from('profiles').select('id,full_name,display_name,country_code,bio,avatar_url').in('id',ids);
      if(!alive)return;
      if(profilesError){setError(profilesError.message);return;}
      const [portfolioResult,ratingsResult]=await Promise.all([
        supabase.from('professional_portfolio').select('id,professional_user_id,category_id,title,description,media_url,project_url').eq('review_status','approved').in('professional_user_id',ids),
        supabase.from('professional_skill_ratings').select('professional_id,skill_name,rating').in('professional_id',ids)
      ]);
      if(portfolioResult.error||ratingsResult.error){if(alive)setError(portfolioResult.error?.message||ratingsResult.error?.message);return;}
      const byId=Object.fromEntries((profilesRows||[]).map(p=>[p.id,p]));
      const portfolioByUser={};(portfolioResult.data||[]).forEach(x=>{(portfolioByUser[x.professional_user_id] ||= []).push(x);});
      const tagsByUser={};categoryRows.forEach(x=>{(tagsByUser[x.professional_user_id] ||= []).push(x.category_id);});
      const ratingsByUser={};(ratingsResult.data||[]).forEach(x=>{const rows=(ratingsByUser[x.professional_id] ||= {});(rows[x.skill_name] ||= []).push(x.rating);});
      const skillScores=Object.fromEntries(Object.entries(ratingsByUser).map(([uid,skills])=>[uid,Object.entries(skills).map(([skill,values])=>({skill,average:values.reduce((a,b)=>a+b,0)/values.length,count:values.length}))]));
      setProfessionalDirectory((proRows||[]).map(p=>({...p,profile:byId[p.user_id],categoryIds:tagsByUser[p.user_id]||[],portfolio:portfolioByUser[p.user_id]||[],skillScores:skillScores[p.user_id]||[]})).filter(p=>p.profile));
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
    if(!supabase || !session || !isCustomer) return;
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

  if (!authReady) {
    return <div className="access-gate" dir={isAr ? 'rtl' : 'ltr'}><section className="access-gate-card" aria-live="polite"><div className="access-gate-mark"><img src={nusqraSymbol} alt="NUSQRA نُسقرا" /></div><h1>NUSQRA</h1><p>{isAr?'جارٍ التحقق من جلسة الدخول…':'Checking your secure sign-in…'}</p><LoaderCircle className="spin access-gate-loader" size={24}/></section></div>;
  }

  if (!session) {
    return <div className="access-gate marketplace-entry" dir={isAr ? 'rtl' : 'ltr'}>
      <header className="entry-header">
        <a className="entry-brand" href="#home" aria-label="NUSQRA home">
          <img src={nusqraLogo} alt="نُسقرا NUSQRA" />
        </a>
        <div className="entry-nav"><span>{isAr?'سوق الخدمات المهنية':'Professional marketplace'}</span><span>{isAr?'للأفراد والشركات':'For individuals & businesses'}</span></div>
        <button type="button" className="entry-language" onClick={()=>setLang(isAr?'en':'ar')}><Globe2 size={16}/>{isAr?'English':'العربية'}</button>
      </header>
      <main className={'entry-layout '+(entryStep==='auth'?'entry-layout-auth':'entry-layout-role')}>
        {entryStep==='role' && <section className="entry-hero">
          <div className="entry-kicker"><span className="entry-kicker-mark"/> {isAr?'سوق واحد · فرص أكثر':'ONE MARKETPLACE · MORE OPPORTUNITY'}</div>
          <h1>{isAr?'اكتشف المحترفين، واستكشف الفرص، وابدأ الآن.':'Find Professionals, Explore Opportunities, Get Started.'}</h1>
          <p>{isAr?'منصة حديثة تربط العملاء بالمحترفين والشركات لإنجاز الأعمال وتنمية الفرص.':'A modern marketplace connecting clients, professionals and businesses for smarter work and better opportunities.'}</p>
          <div className="entry-hero-points">
            <div><Users size={20}/><span>{isAr?'اعثر على المحترفين':'Find professionals'}</span></div>
            <div><BriefcaseBusiness size={20}/><span>{isAr?'استكشف الفرص':'Explore opportunities'}</span></div>
            <div><Globe2 size={20}/><span>{isAr?'نمُ معاً':'Grow together'}</span></div>
          </div>
        </section>}
        <section className="entry-auth-wrap">
          <div className="entry-auth-card">
            {entryStep==='role' ? <div className="entry-choice-heading"><span className="entry-auth-eyebrow">{isAr?'ابدأ من هنا':'GET STARTED'}</span><h2>{isAr?'اختر طريقة استخدام نسقرا':'Choose your NUSQRA experience'}</h2></div> : <div className="entry-auth-eyebrow">{isAr?'تسجيل الدخول الآمن':'SECURE ACCOUNT ACCESS'}</div>}
            {entryStep==='role' && <div className="entry-role-picker" role="group" aria-label={isAr?'اختر نوع الحساب':'Choose account type'}>
              <button type="button" className={'entry-role-card '+(selectedRole==='customer'?'selected':'')} onClick={()=>{setSelectedRole('customer');setActiveRole('customer');setForm(x=>({...x,account_type:'customer'}));window.localStorage.setItem('nusqra-active-role','customer');window.localStorage.setItem('nusqra-pending-role','customer');setError('');window.history.pushState({ ...(window.history.state || {}), nusqraEntryStep: 'auth' }, '', '#login');setEntryStep('auth');}}>
                <span className="entry-role-icon"><Users size={24}/></span><strong>{isAr?'أبحث عن محترف':'I want to hire'}</strong><small>{isAr?'تصفح الملفات المهنية والتوفر، وقارن الخبرات، وانشر طلبك.':'Browse professional profiles and availability, compare skills and post a job.'}</small>
              </button>
              <button type="button" className={'entry-role-card '+(selectedRole==='professional'?'selected':'')} onClick={()=>{setSelectedRole('professional');setActiveRole('professional');setForm(x=>({...x,account_type:'professional'}));window.localStorage.setItem('nusqra-active-role','professional');window.localStorage.setItem('nusqra-pending-role','professional');setError('');window.history.pushState({ ...(window.history.state || {}), nusqraEntryStep: 'auth' }, '', '#login');setEntryStep('auth');}}>
                <span className="entry-role-icon"><BriefcaseBusiness size={24}/></span><strong>{isAr?'أنا محترف وأبحث عن عمل':'I am a professional'}</strong><small>{isAr?'اكتشف فرص العمل، وقدّم العروض، وأدر مشاريعك وعملاءك.':'Find jobs, submit proposals and manage your projects and clients.'}</small>
              </button>
            </div>}
            {!selectedRole || entryStep==='role' ? null : !authMode ? <>

              <h2 id="access-gate-title">{isAr?'مرحباً بك في نسقرا':'Welcome to NUSQRA'}</h2>
              <p>{isAr?'تم اختيار نوع الاستخدام. تابع الآن باستخدام Google أو البريد الإلكتروني.':'Your role is selected. Now continue with Google or email.'}</p>
              {!isSupabaseConfigured && <p className="auth-warning" role="alert">{t.noConfig}</p>}
              {error && <p className="auth-error" role="alert">{error}</p>}
              <button type="button" className="google-auth access-gate-google" disabled={busy || !selectedRole} onClick={signInWithGoogle} aria-label={isAr?"تسجيل الدخول باستخدام Google":"Sign in with Google"}>
                <span className="google-g" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.33 3.36v2.8h3.77c2.2-2.03 3.61-5.02 3.61-8.19z"/><path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.95-2.92l-3.77-2.8c-1.05.7-2.4 1.12-4.18 1.12-3.21 0-5.93-2.17-6.9-5.09H1.2v2.89C3.18 21.16 7.27 24 12 24z"/><path fill="#FBBC05" d="M5.1 14.31A7.2 7.2 0 0 1 4.72 12c0-.8.14-1.58.38-2.31V6.8H1.2A12 12 0 0 0 0 12c0 1.94.46 3.77 1.2 5.2l3.9-2.89z"/><path fill="#EA4335" d="M12 4.6c1.77 0 3.36.61 4.61 1.8l3.45-3.45C17.95 1.12 15.24 0 12 0 7.27 0 3.18 2.84 1.2 6.8l3.9 2.89C6.07 6.77 8.79 4.6 12 4.6z"/></svg></span>
                {busy ? (isAr?'جارٍ الاتصال بـ Google…':'Connecting to Google…') : (isAr?'المتابعة باستخدام Google':'Continue with Google')}
              </button>
              <div className="entry-google-divider" role="separator" aria-label={isAr?'أو':'or'}><span>{isAr?'أو':'or'}</span></div>
              <button type="button" className="entry-email-action" disabled={!selectedRole} onClick={()=>{window.localStorage.setItem('nusqra-pending-role',selectedRole);window.localStorage.setItem('nusqra-active-role',selectedRole);setForm(x=>({...x,account_type:selectedRole}));setAuthMode('register');setError('');setNotice('');}}>{isAr?'إنشاء حساب بالبريد الإلكتروني':'Create account with email'}</button>
              <button type="button" className="entry-login-action" disabled={!selectedRole} onClick={()=>{window.localStorage.setItem('nusqra-pending-role',selectedRole);window.localStorage.setItem('nusqra-active-role',selectedRole);setForm(x=>({...x,account_type:selectedRole}));setAuthMode('login');setError('');setNotice('');}}>{isAr?'لديك حساب بالفعل؟ تسجيل الدخول':'Already have an account? Log in'}</button>
              <div className="entry-auth-divider"><span>{isAr?'دخول آمن':'SECURE ACCESS'}</span></div>
              <div className="access-gate-security"><ShieldCheck size={17}/><span>{isAr?'بياناتك محمية وآمنة':'Your data is secure and private'}</span></div>
            </> : <>
              <h2>{authMode==='register'?t.create:t.welcome}</h2>
              {!isSupabaseConfigured && <p className="auth-warning">{t.noConfig}</p>}
              {authMode==='register' && <>
                <button type="button" className="google-auth access-gate-google register-google" disabled={busy} onClick={signInWithGoogle}>
                  <span className="google-g" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.33 3.36v2.8h3.77c2.2-2.03 3.61-5.02 3.61-8.19z"/><path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.95-2.92l-3.77-2.8c-1.05.7-2.4 1.12-4.18 1.12-3.21 0-5.93-2.17-6.9-5.09H1.2v2.89C3.18 21.16 7.27 24 12 24z"/><path fill="#FBBC05" d="M5.1 14.31A7.2 7.2 0 0 1 4.72 12c0-.8.14-1.58.38-2.31V6.8H1.2A12 12 0 0 0 0 12c0 1.94.46 3.77 1.2 5.2l3.9-2.89z"/><path fill="#EA4335" d="M12 4.6c1.77 0 3.36.61 4.61 1.8l3.45-3.45C17.95 1.12 15.24 0 12 0 7.27 0 3.18 2.84 1.2 6.8l3.9 2.89C6.07 6.77 8.79 4.6 12 4.6z"/></svg></span>
                  {isAr?'المتابعة باستخدام Google':'Continue with Google'}
                </button>
                <div className="entry-google-divider" role="separator" aria-label={isAr?'أو':'or'}><span>{isAr?'أو':'or'}</span></div>
              </>}
              <form className="entry-register-form" onSubmit={submitAuth}>
                {authMode==='register' && <label className="entry-form-field"><span>{t.fullName}</span><input required autoComplete="name" value={form.full_name} onChange={e=>setField('full_name',e.target.value)}/></label>}
                <label className="entry-form-field"><span>{t.email}</span><input type="email" required autoComplete="email" value={form.email} onChange={e=>setField('email',e.target.value)}/></label>
                <label className="entry-form-field"><span>{t.password}</span><span className="entry-password-control"><input type={showPassword?'text':'password'} required minLength="8" autoComplete={authMode==='register'?'new-password':'current-password'} value={form.password} onChange={e=>setField('password',e.target.value)}/><button type="button" className="entry-password-toggle" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?(isAr?'إخفاء كلمة المرور':'Hide password'):(isAr?'إظهار كلمة المرور':'Show password')} aria-pressed={showPassword}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></span></label>
                {authMode==='register' && <label className="entry-form-field"><span>{t.country}</span><select value={form.country_code} onChange={e=>setField('country_code',e.target.value)}>{countryCodes.map(code=><option key={code} value={code}>{t.countries[code]}</option>)}</select></label>}
                {authMode==='register' && form.account_type==='professional' && <label className="entry-form-field"><span>{isAr?'التخصص المهني الأساسي':'Primary professional category'}</span><select required value={signupCategoryId} onChange={e=>setSignupCategoryId(e.target.value)}><option value="">{t.selectCategory}</option>{categories.filter(c=>c.slug!=='investors-opportunities').map(c=><option key={c.id} value={c.id}>{isAr?c.name_ar:c.name_en}</option>)}</select></label>}
                {authMode==='register' && <p className="entry-password-hint">{isAr?'يجب ألا تقل كلمة المرور عن 8 أحرف.':'Password must be at least 8 characters.'}</p>}
                {error && <p className="auth-error" role="alert">{error}</p>}
                {notice && <p className="auth-success" role="status">{notice}</p>}
                <button className="btn primary entry-submit" type="submit" disabled={busy||!isSupabaseConfigured}>{busy?t.working:authMode==='register'?t.signup:t.login}</button>
                {authMode==='register' && <button type="button" className="entry-signin-link" onClick={()=>{setAuthMode('login');setError('');setNotice('');}}>{isAr?'لديك حساب بالفعل؟ تسجيل الدخول':'Already have an account? Sign in'}</button>}
              </form>

            </>}
          </div>
          <div className="entry-auth-note">{isAr?'حساب واحد للوصول إلى خدمات وفرص نسقرا':'One account for the NUSQRA services marketplace'}</div>
        </section>
      </main>
      {entryStep==='role' && <div className="entry-home-sections">
        <section className="entry-category-strip" aria-label={isAr?'استكشف التصنيفات':'Explore categories'}>
          <div className="entry-section-heading"><span>{isAr?'استكشف السوق':'EXPLORE THE MARKETPLACE'}</span><h2>{isAr?'مجالات وخبرات متنوعة':'Explore services and opportunities'}</h2></div>
          <div className="entry-category-track">
            <a className="entry-category-tile" href="#categories" onClick={e=>{e.preventDefault();window.location.hash='categories';}}><img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=640&q=76" loading="lazy" alt="Technology and web"/><span>{isAr?'التقنية والويب':'Technology & Web'}</span></a>
            <a className="entry-category-tile" href="#categories" onClick={e=>{e.preventDefault();window.location.hash='categories';}}><img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=640&q=76" loading="lazy" alt="Marketing and sales"/><span>{isAr?'التسويق والمبيعات':'Marketing & Sales'}</span></a>
            <a className="entry-category-tile" href="#categories" onClick={e=>{e.preventDefault();window.location.hash='categories';}}><img src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=640&q=76" loading="lazy" alt="Automotive services"/><span>{isAr?'خدمات السيارات':'Automotive Services'}</span></a>
            <a className="entry-category-tile" href="#categories" onClick={e=>{e.preventDefault();window.location.hash='categories';}}><img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=640&q=76" loading="lazy" alt="Construction and engineering"/><span>{isAr?'البناء والهندسة':'Construction & Engineering'}</span></a>
          </div>
        </section>
        <section className="entry-how-section">
          <div className="entry-section-heading"><span>{isAr?'بكل بساطة':'HOW IT WORKS'}</span><h2>{isAr?'من احتياجك إلى إنجازك في ثلاث خطوات':'A simple path from need to opportunity'}</h2></div>
          <div className="entry-how-grid">
            <article><b>01</b><h3>{isAr?'انشر طلبك':'Post a request'}</h3><p>{isAr?'وضّح ما تحتاجه والخبرة المطلوبة.':'Describe what you need and the skills required.'}</p></article>
            <article><b>02</b><h3>{isAr?'استقبل العروض':'Receive proposals'}</h3><p>{isAr?'راجع عروض المحترفين وتفاصيلها.':'Review proposals from interested professionals.'}</p></article>
            <article><b>03</b><h3>{isAr?'اختر واتفق':'Choose and agree'}</h3><p>{isAr?'اختر العرض المناسب وابدأ العمل.':'Choose the right proposal and get started.'}</p></article>
          </div>
        </section>
        <section className="entry-closing-cta"><div><span>{isAr?'فرصتك تبدأ هنا':'YOUR NEXT STEP STARTS HERE'}</span><h2>{isAr?'ابدأ رحلتك مع نسقرا':'Make your next move with NUSQRA'}</h2></div><button type="button" onClick={()=>{setSelectedRole('customer');setActiveRole('customer');setForm(x=>({...x,account_type:'customer'}));window.localStorage.setItem('nusqra-active-role','customer');window.localStorage.setItem('nusqra-pending-role','customer');window.history.pushState({...window.history.state,nusqraEntryStep:'auth'},'','#login');setEntryStep('auth');setAuthMode('register');}}>{isAr?'أنشئ حسابك':'Create your account'} <ArrowRight size={18}/></button></section>
      </div>}
      <footer className="entry-footer"><img src={nusqraSymbol} alt="" aria-hidden="true"/><span>NUSQRA · نُسقرا</span><nav><a href="#categories" onClick={e=>{e.preventDefault();window.location.hash='categories';}}>{isAr?'التصنيفات':'Categories'}</a><a href="#how-it-works" onClick={e=>e.preventDefault()}>{isAr?'كيف تعمل':'How it works'}</a><button type="button" onClick={()=>setLang(isAr?'en':'ar')}>{isAr?'English':'العربية'}</button></nav><small>© {new Date().getFullYear()} NUSQRA · {isAr?'سوق الخدمات والفرص':'The marketplace for services & opportunities'}</small></footer>
    </div>;
  }

  return <div dir={isAr ? 'rtl' : 'ltr'}>
    <header className="header">
      <a className="brand brand-lockup" href="#home" aria-label="NUSQRA home" onClick={()=>{setSettingsOpen(false);setPage('home');setMenu(false);}}><img className="nusqra-header-symbol" src={nusqraSymbol} alt="" aria-hidden="true" /><span className="nusqra-wordmark" dir="ltr"><span>NUSQRA</span><span className="nusqra-wordmark-divider" aria-hidden="true">|</span><span lang="ar" dir="rtl">نُسقرا</span></span></a>
      <nav className={menu ? 'nav open' : 'nav'} aria-label={isAr?'التنقل الرئيسي':'Main navigation'}>
        <button type="button" className="navlink" onClick={()=>navigatePage('explore')}>{t.nav[0]}</button>
        <button type="button" className="navlink" onClick={()=>navigatePage('categories')}>{t.nav[1]}</button>
        <button type="button" className="navlink" onClick={()=>navigatePage('how-it-works')}>{t.nav[2]}</button>
        <button type="button" className="navlink" onClick={()=>{setActiveRole('professional');window.localStorage.setItem('nusqra-active-role','professional');navigatePage('categories');}}>{t.nav[3]}</button>
        {session && <><button type="button" className="navlink" onClick={()=>navigatePage('marketplace')}>{isAr?'السوق':'Marketplace'}</button><button type="button" className="navlink" onClick={()=>navigatePage('messages')}>{t.messages}</button></>}
      </nav>
      <div className="actions">
        {session ? <button className={'navlink '+(settingsOpen?'active':'')} aria-expanded={settingsOpen} onClick={()=>setSettingsOpen(v=>!v)}><UserRound size={15}/>{t.account}</button> :
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
            <button className="btn primary" onClick={()=>{setActiveRole('customer');window.localStorage.setItem('nusqra-active-role','customer');navigatePage('categories');}}>{t.hire}{isAr?<ArrowLeft size={18}/>:<ArrowRight size={18}/>}</button>
            <button className="btn secondary" onClick={()=>{setActiveRole('professional');window.localStorage.setItem('nusqra-active-role','professional');navigatePage('categories');}}>{t.work}</button>
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
        <section className="home-steps section" id="how-it-works"><div className="section-label">{isAr?'ابدأ في ثلاث خطوات':'GET STARTED IN THREE STEPS'}</div><h2>{isAr?'كيف تعمل نسقرا':'A simple path from need to opportunity'}</h2><div className="home-step-grid"><article><b>01</b><h3>{isAr?'أنشئ حسابك':'Create your account'}</h3><p>{isAr?'أنشئ ملفك كعميل أو محترف.':'Join as a customer or professional.'}</p></article><article><b>02</b><h3>{isAr?'اكتشف أو انشر':'Discover or post'}</h3><p>{isAr?'ابحث عن خدمة أو انشر طلبك.':'Find a service or publish a job request.'}</p></article><article><b>03</b><h3>{isAr?'تواصل وابدأ':'Connect and begin'}</h3><p>{isAr?'راجع العروض وتواصل مباشرة.':'Review proposals and connect directly.'}</p></article></div><div className="home-final-cta"><div><h2>{isAr?'مستعد للخطوة التالية؟':'Ready for your next opportunity?'}</h2><p>{isAr?'انضم إلى مجتمع نسقرا اليوم.':'Join the NUSQRA community today.'}</p></div><button className="btn primary" onClick={()=>{if(session)setSettingsOpen(true);else{setForm(x=>({...x,account_type:'customer'}));setAuthMode('register');}}}>{isAr?'أنشئ حسابك':'Get started'} <ArrowRight size={17}/></button></div></section>
      </>}
      {page === 'categories' && <section className="section category-section" id="categories">
        <div className="section-label">NUSQRA · SERVICES DIRECTORY</div>
        <h2>{isProfessional?(isAr?'اختر تخصصاتك المهنية':'Choose your professional categories'):t.categoriesTitle}</h2>
        <p className="section-intro category-intro">{isProfessional?(isAr?'حدد الخدمات التي تستطيع تقديمها، ثم أكمل بياناتك المهنية للظهور للعملاء المناسبين.':'Choose the services you can provide, then complete your professional details so customers can find you.'):t.categoriesIntro}</p>
        <div className="category-flow-note">{isProfessional?(isAr?'اختر تخصصاتك المهنية، ثم أكمل بيانات خبرتك وموقعك ووسيلة التواصل.':'Select your service categories, then complete your professional details.'):(isAr?'اختر الخدمة لعرض المحترفين المسجلين في التصنيف نفسه.':'Choose a service category to see professionals who offer that exact service.')}</div>
        {!isProfessional&&<div className="audience-tabs" role="group" aria-label="Browse categories by audience">
          <button type="button" className={categoryAudience==='all'?'active':''} onClick={()=>setCategoryAudience('all')}>{t.audienceAll}</button>
          <button type="button" className={categoryAudience==='individuals'?'active':''} onClick={()=>setCategoryAudience('individuals')}>{t.audienceIndividuals}</button>
          <button type="button" className={categoryAudience==='companies'?'active':''} onClick={()=>setCategoryAudience('companies')}>{t.audienceCompanies}</button>
          <button type="button" className={categoryAudience==='investors'?'active':''} onClick={()=>setCategoryAudience('investors')}>{t.audienceInvestors}</button>
        </div>}
        {categories.length>0 && <div className="category-grid">
          {categories.filter(c=>{if(isProfessional&&c.slug==='investors-opportunities')return false;const individualSlugs=['automotive-services','design-creative','education-training','healthcare-wellness','home-maintenance','hospitality-events','transport-logistics','web-technology','writing-translation'];const companySlugs=['business-services','construction-engineering','design-creative','finance-administration','hr-recruitment','industrial-manufacturing','marketing-sales','transport-logistics','web-technology'];if(categoryAudience==='all')return true;if(categoryAudience==='investors')return c.slug==='investors-opportunities';if(categoryAudience==='individuals')return individualSlugs.includes(c.slug);return companySlugs.includes(c.slug);}).map(c=>{
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
            return <button type="button" className={'category-card category-select-card '+(isProfessional&&professionalCategoryIds.includes(c.id)?'is-selected':'')} key={c.id} onClick={()=>{
              setSelectedCategoryId(c.id);
              if(isProfessional){
                setSignupCategoryId(c.id);
                setProfessionalCategoryIds(old=>old.includes(c.id)?old:[...old,c.id]);
              }else{
                setJobForm(v=>({...v,category_id:c.id}));
                navigatePage('professionals');
              }
            }}>
              <div className="category-image"><img src={images[c.slug]||images['business-services']} alt={isAr?c.name_ar:c.name_en} loading="lazy" decoding="async"/><span className="category-symbol">{symbols[c.slug]||'✧'}</span></div>
              <h3>{isAr?c.name_ar:c.name_en}</h3>
              <p className="category-description">{isAr?(c.description_ar||''): (c.description_en||'')}</p>
              <span className="category-audience">{c.slug==='investors-opportunities'?t.audienceInvestors:(isProfessional?(isAr?'اختر هذا التخصص لإضافته إلى ملفك':'Choose this category for your profile'):(isAr?'عرض المحترفين في هذا التصنيف':'View professionals in this category'))}</span>
              {isProfessional&&professionalCategoryIds.includes(c.id)&&<span className="category-selected-mark">{isAr?'تم الاختيار':'Selected'}</span>}
              {c.slug==='investors-opportunities'&&<small className="investor-disclaimer">{t.investorDisclaimer}</small>}
            </button>;
          })}
        </div>}
        {isProfessional&&selectedCategoryId&&<form className="professional-onboarding-card" onSubmit={saveProfessionalOnboarding}>
          <div className="professional-onboarding-heading"><div><span className="section-label">{isAr?'إعداد الملف المهني':'PROFESSIONAL SETUP'}</span><h3>{isAr?'أكمل بياناتك المهنية':'Complete your professional details'}</h3><p>{isAr?'ستساعد هذه المعلومات العملاء على فهم خبرتك وموقع عملك ومدى قدرتك على الوصول إلى مواقع المشاريع.':'This helps customers understand your experience, work location and ability to travel to assigned job sites.'}</p></div></div>
          <div className="professional-onboarding-grid">
            <label>{isAr?'العمر':'Age'}<input type="number" min="18" max="100" required value={profileForm.age} onChange={e=>setProfileField('age',e.target.value)} placeholder={isAr?'العمر بالسنوات':'Your age in years'}/></label>
            <label>{isAr?'سنوات الخبرة':'Years of experience'}<input type="number" min="0" max="60" required value={profileForm.years_experience} onChange={e=>setProfileField('years_experience',e.target.value)} placeholder={isAr?'عدد سنوات الخبرة':'Years working in this field'}/></label>
            <label>{isAr?'المدينة / موقع العمل':'City / work location'}<input required maxLength="100" value={profileForm.city} onChange={e=>setProfileField('city',e.target.value)} placeholder={isAr?'مثال: المدينة المنورة':'e.g. Madinah'}/></label>
            <label>{isAr?'رقم الهاتف للتواصل':'Contact phone number'}<input type="tel" inputMode="tel" autoComplete="tel" required maxLength="30" value={profileForm.phone_number} onChange={e=>setProfileField('phone_number',e.target.value)} placeholder="+966 5X XXX XXXX"/></label>
            <label>{isAr?'هل تستطيع الانتقال إلى موقع العمل المحدد عند الحاجة؟':'Can you travel to assigned job locations when needed?'}<select required value={profileForm.can_travel_to_jobs} onChange={e=>setProfileField('can_travel_to_jobs',e.target.value)}><option value="">{isAr?'اختر إجابتك':'Select an answer'}</option><option value="true">{isAr?'نعم، أستطيع الانتقال':'Yes, I can travel'}</option><option value="false">{isAr?'لا، أفضّل العمل في موقعي':'No, I prefer working at my location'}</option></select></label>
            <label>{isAr?'الدولة':'Country'}<select value={profileForm.country_code} onChange={e=>setProfileField('country_code',e.target.value)}>{countryCodes.map(code=><option key={code} value={code}>{t.countries[code]}</option>)}</select></label>
          </div>
          <div className="professional-onboarding-categories"><strong>{isAr?'التصنيفات التي تقدم خدمات فيها':'Categories you provide services in'}</strong><div className="professional-category-options">{categories.filter(c=>c.slug!=='investors-opportunities').map(c=><label key={c.id}><input type="checkbox" checked={professionalCategoryIds.includes(c.id)} onChange={e=>setProfessionalCategoryIds(old=>e.target.checked?[...old,c.id]:old.filter(id=>id!==c.id))}/><span>{isAr?c.name_ar:c.name_en}</span></label>)}</div></div>
          <p className="professional-onboarding-privacy">{isAr?'سيبقى عمرك ورقم هاتفك خاصين. سيظهر للعملاء موقعك وحالة قدرتك على الانتقال فقط.':'Your age and phone number stay private. Customers can see your city and whether you can travel to assigned locations.'}</p>
          {error&&<p className="auth-error" role="alert">{error}</p>}{notice&&<p className="auth-success" role="status">{notice}</p>}
          <div className="professional-onboarding-actions"><button className="btn primary" type="submit" disabled={busy}>{busy?t.working:(isAr?'حفظ البيانات المهنية':'Save professional details')}</button><button className="btn secondary" type="button" onClick={()=>navigatePage('marketplace')}>{isAr?'المتابعة إلى الفرص':'Continue to opportunities'}</button></div>
        </form>}
      </section>}


      {page === 'support' && session && <section className="section marketplace-section customer-support-page">
        <div className="section-label">NUSQRA · CUSTOMER CARE</div><h2>Customer support</h2><p className="section-intro">Send a message to the NUSQRA support team and follow your case.</p>
        <div className="support-layout"><div className="support-panel"><h3>Open a support request</h3><form className="market-form" onSubmit={createSupportTicket}><label>Subject<input required maxLength="160" value={supportSubject} onChange={e=>setSupportSubject(e.target.value)}/></label><label>How can we help?<textarea required rows="5" maxLength="5000" value={supportBody} onChange={e=>setSupportBody(e.target.value)}/></label><button className="btn primary" type="submit" disabled={busy}>Send to support</button></form><h3>Your requests</h3>{mySupportTickets.length===0?<p className="market-empty">You have no support requests yet.</p>:mySupportTickets.map(ticket=><button type="button" className={'support-ticket '+(mySelectedTicket?.id===ticket.id?'active':'')} key={ticket.id} onClick={()=>openMySupportTicket(ticket)}><strong>{ticket.subject}</strong><span>{ticket.status}</span><small>{new Date(ticket.updated_at).toLocaleString()}</small></button>)}</div><div className="support-panel support-ticket-detail">{mySelectedTicket?<><h3>{mySelectedTicket.subject}</h3><p>{mySelectedTicket.status}</p><div className="support-messages">{mySupportMessages.map(m=><div key={m.id} className={m.sender_id===session.user.id?'support-own':''}><p>{m.body}</p><small>{new Date(m.created_at).toLocaleString()}</small></div>)}</div>{!['resolved','closed'].includes(mySelectedTicket.status)&&<form onSubmit={replyMySupportTicket}><textarea rows="3" required value={mySupportReply} onChange={e=>setMySupportReply(e.target.value)} placeholder="Write a reply…"/><button className="btn primary" type="submit">Send reply</button></form>}</>:<p className="market-empty">Select one of your support requests to see replies.</p>}</div></div>
      </section>}

      {page === 'professionals' && <section className="section professional-directory"><div className="section-label">NUSQRA · PROFESSIONAL DIRECTORY</div><h2>{isAr?'المحترفون حسب التصنيف':'Professionals by category'}</h2><p className="section-intro">{selectedCategoryId?(isAr?'المحترفون الذين يقدمون الخدمة في التصنيف المحدد.':'Professionals who offer services in your selected category.'):(isAr?'اختر تصنيفاً أولاً لعرض المحترفين المناسبين.':'Choose a service category first to see matching professionals.')}</p><div className="professional-directory-toolbar">{selectedCategoryId&&<strong>{(()=>{const c=categories.find(x=>x.id===selectedCategoryId);return c?(isAr?c.name_ar:c.name_en):'';})()}</strong>}<button className="btn secondary" type="button" onClick={()=>navigatePage('categories')}>{isAr?'تغيير التصنيف':'Change category'}</button>{selectedCategoryId&&<button className="btn primary" type="button" onClick={()=>{setJobForm(v=>({...v,category_id:selectedCategoryId}));navigatePage('marketplace');}}>{isAr?'انشر طلباً بهذا التصنيف':'Post a job in this category'}</button>}</div>{error&&<p className="auth-error" role="alert">{error}</p>}{professionalDirectory.length===0?<p className="market-empty">{selectedCategoryId?(isAr?'لا يوجد محترفون مسجلون في هذا التصنيف بعد.':'No professionals have selected this category yet.'):(isAr?'اختر تصنيفاً لعرض المحترفين.':'Select a category to view professionals.')}</p>:<div className="professional-directory-grid">{professionalDirectory.map(p=><article className="professional-directory-card" key={p.user_id}>{p.profile.avatar_url?<img src={p.profile.avatar_url} alt=""/>:<div className="professional-avatar">{(p.profile.display_name||p.profile.full_name||'N').slice(0,1).toUpperCase()}</div>}<div className="professional-directory-copy"><h3>{p.profile.display_name||p.profile.full_name||t.professional}</h3><strong>{p.headline|| (isAr?'محترف في نسقرا':'NUSQRA professional')}</strong><span className="professional-level-badge">{p.profile_level==='expert'?(isAr?'خبير':'Expert'):p.profile_level==='experienced'?(isAr?'ذو خبرة':'Experienced'):(isAr?'مبتدئ':'Entry level')} · {isAr?'مستوى معلن':'Self-declared level'}</span>{p.can_travel_to_jobs&&<span className="travel-ready-badge">{isAr?'يستطيع الانتقال إلى مواقع العمل':'Can travel to job locations'}</span>}<span className={'availability-badge availability-'+(p.availability_status||'unavailable')}>{p.availability_status==='available'?(isAr?'متاح للعمل':'Available for work'):p.availability_status==='busy'?(isAr?'مشغول حالياً':'Currently busy'):(isAr?'غير متاح حالياً':'Not currently available')}</span><span className="verified-profile-badge">✓ {isAr?'ملف موثق':'Verified profile'}</span>{p.skillScores?.length>0&&<div className="professional-skill-scores"><strong>{isAr?'تقييمات المهارات':'Skill ratings'}</strong>{p.skillScores.map(score=><span key={score.skill}><b>{score.skill}</b><em>{'★'.repeat(Math.round(score.average))}{'☆'.repeat(5-Math.round(score.average))}</em><small>{score.average.toFixed(1)} ({score.count})</small></span>)}</div>}<p>{p.about||p.profile.bio||''}</p><small>{[p.city,p.country_code||p.profile.country_code].filter(Boolean).join(' · ')}{p.years_experience?` · ${p.years_experience} ${isAr?'سنوات خبرة':'years experience'}`:''}</small><div className="professional-category-tags">{(p.categoryIds||[]).map(id=>{const c=categories.find(x=>x.id===id);return c?<span key={id}>{isAr?c.name_ar:c.name_en}</span>:null;})}</div>{p.portfolio?.length>0&&<div className="directory-work-highlights"><strong>{isAr?'أبرز الأعمال':'Work highlights'}</strong>{p.portfolio.slice(0,3).map(item=><div key={item.id}>{item.media_url&&<img src={item.media_url} alt={item.title}/>}<b>{item.title}</b><p>{item.description}</p>{item.project_url&&<a href={item.project_url} target="_blank" rel="noreferrer">{isAr?'عرض المشروع':'View project'}</a>}</div>)}</div>}</div></article>)}</div>}<div className="buttons"><button className="btn secondary" onClick={()=>navigatePage('marketplace')}>{isAr?'استكشف فرص العمل':'Explore opportunities'}</button></div></section>}
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
          {isCustomer && <div className="marketplace-panel">
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
              <button className="btn primary" type="submit" disabled={busy||!canPostJobs}>{t.publishJob}</button>
            </form>
          </div>}
          <div className="marketplace-panel">
            <h3>{!session?(isAr?'فرص العمل المتاحة':'Available opportunities'):isProfessional?t.myJobsAndOpenJobs:t.myJobs}</h3>
            {jobs.filter(j=>(!session&&j.status==='open')||(session&&isProfessional&&j.customer_id!==session.user.id&&(j.status==='open'||myProposals[j.id]))||(session&&isCustomer&&j.customer_id===session.user.id)).length===0
              ? <p className="market-empty">{!session?(isAr?'لا توجد فرص منشورة حالياً.':'No opportunities have been posted yet.'):isProfessional?t.noJobs:t.noOwnJobs}</p>
              : <div className="job-list">{jobs.filter(j=>(!session&&j.status==='open')||(session&&isProfessional&&j.customer_id!==session.user.id&&(j.status==='open'||myProposals[j.id]))||(session&&isCustomer&&j.customer_id===session.user.id)).map(job=>{
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
                    <button className="btn primary" type="submit" disabled={busy||!canSubmitProposals}>{t.sendProposal}</button>
                  </form>}
                  {job.customer_id===session.user.id&&<div className="job-management">{job.status==='open'&&<><button className="btn secondary" type="button" disabled={busy} onClick={()=>updateJobStatus(job,'closed')}>{t.closeJob}</button><button className="btn secondary" type="button" disabled={busy} onClick={()=>updateJobStatus(job,'cancelled')}>{t.cancelJob}</button></>}{job.status==='closed'&&<><button className="btn secondary" type="button" disabled={busy} onClick={()=>updateJobStatus(job,'open')}>{t.reopenJob}</button><button className="btn secondary" type="button" disabled={busy} onClick={()=>updateJobStatus(job,'cancelled')}>{t.cancelJob}</button></>}{job.status==='in_progress'&&<button className="btn primary" type="button" disabled={busy} onClick={()=>updateJobStatus(job,'completed')}>{t.completeJob}</button>}</div>}
                  {isProfessional&&myProposals[job.id]&&<p className="my-proposal-status">{t.proposalSubmitted}: <strong>{myProposals[job.id].status==='accepted'?t.proposalAccepted:myProposals[job.id].status==='rejected'?t.proposalRejected:myProposals[job.id].status}</strong></p>}
                  {job.customer_id===session.user.id&&<div className="proposal-review">
                    <button className="btn secondary" type="button" onClick={()=>toggleProposals(job)}>{t.viewProposals}</button>
                    {expandedJob===job.id&&<div className="proposal-list">
                      {(jobProposals[job.id]||[]).length===0?<p className="market-empty">{t.noProposals}</p>:(jobProposals[job.id]||[]).map(p=><div className="proposal-card" key={p.id}>
                        <strong>{p.professional?.full_name||t.professional}</strong><p>{p.cover_letter}</p>
                        <small>{p.proposed_price??'—'} {p.currency} · {p.delivery_days??'—'} {t.deliveryDays} · {p.status}</small>
                        <div className="proposal-actions">{p.status==='submitted'&&job.status==='open'&&<><button className="btn primary" type="button" disabled={busy} onClick={()=>decideProposal(p,'accepted')}>{t.accept}</button><button className="btn secondary" type="button" disabled={busy} onClick={()=>decideProposal(p,'rejected')}>{t.reject}</button></>}{(p.status==='submitted'||p.status==='accepted')&&<button className="btn secondary" type="button" disabled={busy||!canMessage} onClick={()=>openConversation(job,p.professional_id)}><MessageCircle size={15}/>{t.messageProfessional}</button>}</div>{job.status==='completed'&&p.status==='accepted'&&<form className="skill-rating-form" onSubmit={e=>submitSkillRating(e,job,p)}><strong>Rate professional skills</strong>{skillRatingForms[p.id]?.submitted?<span>Rating submitted ✓</span>:<><input required maxLength="80" placeholder="Skill (e.g. diagnostic accuracy)" value={skillRatingForms[p.id]?.skill_name||''} onChange={e=>setSkillRatingForms(old=>({...old,[p.id]:{...(old[p.id]||{rating:5}),skill_name:e.target.value}}))}/><div className="skill-star-picker">{[1,2,3,4,5].map(n=><button type="button" key={n} aria-label={n+' stars'} className={(skillRatingForms[p.id]?.rating||5)>=n?'selected':''} onClick={()=>setSkillRatingForms(old=>({...old,[p.id]:{...(old[p.id]||{skill_name:''}),rating:n}}))}>★</button>)}</div><textarea rows="2" placeholder="Optional feedback" value={skillRatingForms[p.id]?.comment||''} onChange={e=>setSkillRatingForms(old=>({...old,[p.id]:{...(old[p.id]||{rating:5}),comment:e.target.value}}))}/><button className="btn secondary" type="submit">Submit skill rating</button></>}</form>}
                      </div>)}
                    </div>}
                  </div>}
                </article>;
              })}</div>}
          </div>
        </div>
      </section>}
      {page === 'messages' && session && <section className="section marketplace-section messaging-section" id="messages"><div className="section-label">NUSQRA · PRIVATE</div><h2>{t.messages}</h2><div className="messaging-layout"><aside className="conversation-list">{conversations.length===0?<p className="market-empty">{t.noConversations}</p>:conversations.map(c=><button type="button" className={'conversation-item'+(selectedConversation?.id===c.id?' active':'')} key={c.id} onClick={()=>setSelectedConversation(c)}><strong>{c.job?.title||t.marketplace}</strong><span>{session.user.id===c.customer_id?(c.professional?.full_name||t.professional):(c.customer?.full_name||t.customer)}</span></button>)}</aside><div className="chat-panel">{selectedConversation?<><div className="chat-heading"><strong>{selectedConversation.job?.title||conversations.find(c=>c.id===selectedConversation.id)?.job?.title||t.marketplace}</strong><span>{session.user.id===selectedConversation.customer_id?(conversations.find(c=>c.id===selectedConversation.id)?.professional?.full_name||t.professional):(conversations.find(c=>c.id===selectedConversation.id)?.customer?.full_name||t.customer)}</span></div><div className="message-list">{messages.map(m=><div key={m.id} className={'message-bubble'+(m.sender_id===session.user.id?' mine':'')}><p>{m.body}</p><time>{new Date(m.created_at).toLocaleString(lang==='ar'?'ar-SA':'en-US')}</time></div>)}</div><form className="message-compose" onSubmit={sendMessage}><textarea rows="2" maxLength="4000" required placeholder={t.messagePlaceholder} value={messageDraft} onChange={e=>setMessageDraft(e.target.value)}/><button className="btn primary" type="submit" disabled={busy||!messageDraft.trim()||!canMessage}><Send size={16}/>{t.sendMessage}</button></form></>:<p className="market-empty">{t.noConversations}</p>}</div></div></section>}
      {settingsOpen && session && <section className="section account-section settings-page settings-popover-panel" id="account">
        <div className="settings-popover-heading"><div><span>NUSQRA ACCOUNT</span><h2>{t.dashboard}</h2></div><button type="button" aria-label="Close settings" onClick={()=>setSettingsOpen(false)}><X size={19}/></button></div>
        <div className="account-card">
          <div className="account-heading"><div><h3>{profileForm.full_name || session.user.email}</h3><p>{session.user.email}</p></div><div className="settings-actions"><button className="btn secondary" type="button" onClick={()=>setSettingsOpen(false)}>{isAr?"إغلاق":"Close"}</button><button className="btn secondary" onClick={signOut}><LogOut size={16}/>{t.logout}</button></div></div>
          <div className="language-preference"><label htmlFor="nusqra-language-setting">{isAr?'لغة المنصة':'Website language'}</label><select id="nusqra-language-setting" value={lang} onChange={e=>setLang(e.target.value)}><option value="ar">العربية</option><option value="en">English</option></select></div>
          {roles.length>1 && <div className="language-preference"><label htmlFor="nusqra-role-setting">{isAr?'طريقة استخدام نسقرا':'NUSQRA experience'}</label><select id="nusqra-role-setting" value={activeRole} onChange={e=>{const next=e.target.value;setActiveRole(next);window.localStorage.setItem('nusqra-active-role',next);navigatePage(next==='professional'?'marketplace':'professionals');}}>{roles.includes('customer')&&<option value="customer">{isAr?'أبحث عن محترف':'Hire a professional'}</option>}{roles.includes('professional')&&<option value="professional">{isAr?'أنا محترف':'Find work as a professional'}</option>}</select></div>}
          <div className="role-list"><strong>{t.roles}:</strong>{roles.map(role=><span className={"role-chip"+(role===activeRole?" selected":"")} key={role}>{role==='customer'?t.customer:t.professional}</span>)}<button className="btn secondary" type="button" onClick={()=>navigatePage('support')}>{isAr?'دعم العملاء':'Customer support'}</button></div>
          {!roles.includes('professional') && <button className="btn secondary enable-pro" disabled={busy} onClick={enableProfessional}><BriefcaseBusiness size={16}/>{t.enablePro}</button>}
          <form className="profile-form profile-studio" onSubmit={saveProfile}>
            <div className="profile-studio-heading"><div><span className="profile-studio-kicker">{isAr?'استوديو الهوية الشخصية':'NUSQRA · PROFILE DESIGN STUDIO'}</span><h3>{isAr?'صمّم حضورك المهني':'Build a profile that stands out'}</h3><p>{isAr?'خصص صورتك ومعلوماتك ومظهرك، ثم راجع النتيجة قبل النشر.':'Personalize your identity, details and visual style, then preview before saving.'}</p></div><button className="btn secondary preview-open" type="button" onClick={()=>setPreviewOpen(true)}>{isAr?'معاينة الملف':'Live preview'}</button></div>
            <div className="profile-editor-tabs" role="tablist" aria-label="Profile editor sections">
              <button type="button" role="tab" aria-selected={profileTab==='identity'} className={profileTab==='identity'?'active':''} onClick={()=>setProfileTab('identity')}>{isAr?'الهوية':'Profile'}</button>
              {isProfessional && <button type="button" role="tab" aria-selected={profileTab==='professional'} className={profileTab==='professional'?'active':''} onClick={()=>setProfileTab('professional')}>{isAr?'المعلومات المهنية':'Professional'}</button>}
              <button type="button" role="tab" aria-selected={profileTab==='appearance'} className={profileTab==='appearance'?'active':''} onClick={()=>setProfileTab('appearance')}>{isAr?'المظهر والقوالب':'Appearance & templates'}</button>
            </div>
            {profileTab==='identity' && <div className="profile-tab-panel">
              <div className="profile-upload-grid">
                <label className="profile-upload-card"><span className="upload-icon">◎</span><strong>{isAr?'الصورة الشخصية':'Profile photo'}</strong><small>{isAr?'صورة واضحة للوجه في منتصف الإطار · JPG/PNG/WEBP حتى 5MB':'Clear face, centered in frame · JPG/PNG/WEBP up to 5MB'}</small><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setPhotoFiles(v=>({...v,avatar:e.target.files?.[0]||null}))}/></label>
                <label className="profile-upload-card"><span className="upload-icon">▱</span><strong>{isAr?'صورة الغلاف':'Cover image'}</strong><small>{isAr?'صورة عريضة اختيارية':'Optional wide banner image'}</small><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setPhotoFiles(v=>({...v,cover:e.target.files?.[0]||null}))}/></label>
              </div>
              <label>{t.fullName}<input required maxLength="100" value={profileForm.full_name} onChange={e=>setProfileField('full_name',e.target.value)} /></label>{isProfessional&&<p className="profile-guidance">{isAr?'يجب استخدام الاسم الحقيقي المطابق لوثائقك. ستتم مراجعته قبل التوصية بملفك.':'Use your real legal name as shown on your identity documents. It will be reviewed before your profile can be recommended.'}</p>}
              <label>{t.country}<select value={profileForm.country_code} onChange={e=>setProfileField('country_code',e.target.value)}>{countryCodes.map(code=><option key={code} value={code}>{t.countries[code]}</option>)}</select></label>
              <label>{t.bio}<textarea rows="4" maxLength="500" value={profileForm.bio} onChange={e=>setProfileField('bio',e.target.value)}/></label>
            </div>}
            {profileTab==='professional' && isProfessional && <div className="profile-tab-panel professional-fields">
              <label>{isAr?'حالة التوفر للعمل':'Work availability'}<select value={profileForm.availability_status} onChange={e=>setProfileField('availability_status',e.target.value)}><option value="available">{isAr?'متاح للعمل':'Available for work'}</option><option value="busy">{isAr?'مشغول حالياً':'Currently busy'}</option><option value="unavailable">{isAr?'غير متاح حالياً':'Not currently available'}</option></select></label><p className="profile-guidance">{isAr?'ستظهر هذه الحالة للعملاء في ملفك العام.':'Customers will see this status on your public professional profile.'}</p><label>{t.headline}<input maxLength="120" value={profileForm.headline} onChange={e=>setProfileField('headline',e.target.value)}/></label>
              <label>{t.city}<input maxLength="100" value={profileForm.city} onChange={e=>setProfileField('city',e.target.value)}/></label>
              <label>{t.experience}<input type="number" min="0" max="60" value={profileForm.years_experience} onChange={e=>setProfileField('years_experience',e.target.value)}/></label><label>{isAr?'العمر':'Age'}<input type="number" min="18" max="100" value={profileForm.age} onChange={e=>setProfileField('age',e.target.value)}/></label><label>{isAr?'هل تستطيع الانتقال إلى مواقع العمل؟':'Can you travel to assigned job locations?'}<select value={profileForm.can_travel_to_jobs} onChange={e=>setProfileField('can_travel_to_jobs',e.target.value)}><option value="">{isAr?'اختر':'Choose'}</option><option value="true">{isAr?'نعم':'Yes'}</option><option value="false">{isAr?'لا':'No'}</option></select></label>
              <label>{isAr?'نبذة مهنية':'Professional summary'}<textarea rows="5" maxLength="3000" value={profileForm.about} onChange={e=>setProfileField('about',e.target.value)}/></label>
              <div className="professional-category-editor"><strong>{isAr?'التصنيفات التي تقدم خدماتها':'Your exact service categories'}</strong><p>{isAr?'حدد كل خدمة بدقة. احفظ الملف قبل رفع شهادات كل تصنيف.':'Select the exact services you offer. Save your profile before uploading a certificate for each category.'}</p><div className="professional-category-options">{categories.filter(c=>c.slug!=='investors-opportunities').map(c=><label key={c.id}><input type="checkbox" checked={professionalCategoryIds.includes(c.id)} onChange={e=>setProfessionalCategoryIds(old=>e.target.checked?[...old,c.id]:old.filter(id=>id!==c.id))}/><span>{isAr?c.name_ar:c.name_en}</span></label>)}</div><label>{isAr?'مستوى الخبرة':'Professional level'}<select value={profileForm.profile_level} onChange={e=>setProfileField('profile_level',e.target.value)}><option value="entry">{isAr?'مبتدئ':'Entry level'}</option><option value="experienced">{isAr?'ذو خبرة':'Experienced'}</option><option value="expert">{isAr?'خبير':'Expert'}</option></select></label><label className="identity-confirm-row"><input type="checkbox" checked={profileForm.identity_name_confirmed} onChange={e=>setProfileField('identity_name_confirmed',e.target.checked)}/><span>{isAr?'أؤكد أن الاسم المعروض هو اسمي الحقيقي وأن معلوماتي المهنية صحيحة.':'I confirm this is my real name and my professional information is accurate.'}</span></label><div className="verification-status-panel"><strong>{isAr?'حالة المراجعة':'Verification status'}: {profileForm.verification_status==='verified'?(isAr?'موثق':'Verified'):profileForm.verification_status==='rejected'?(isAr?'يحتاج إلى تعديل':'Needs changes'):(isAr?'قيد المراجعة':'Pending review')}</strong><p>{isAr?'لن يظهر ملفك ضمن التوصيات حتى تكتمل المتطلبات وتتم مراجعة الهوية والشهادات من فريق نسقرا.':'Your profile will not be recommended until the required details, category certificates and work highlights are reviewed by NUSQRA.'}</p></div></div>
<div className="professional-category-editor"><strong>{isAr?'الشهادات المهنية':'Category certificates'}</strong><p>{isAr?'ارفع شهادة لكل تصنيف اخترته. الملفات خاصة ولا تظهر للعامة.':'Upload a relevant certificate for every selected category. Documents are private and only shared with the review team.'}</p><form className="professional-subform" onSubmit={addProfessionalCredential}><label>{isAr?'التصنيف':'Category'}<select required value={credentialForm.category_id} onChange={e=>setCredentialForm(v=>({...v,category_id:e.target.value}))}><option value="">{t.selectCategory}</option>{categories.filter(c=>professionalCategoryIds.includes(c.id)).map(c=><option key={c.id} value={c.id}>{isAr?c.name_ar:c.name_en}</option>)}</select></label><label>{isAr?'اسم الشهادة':'Certificate title'}<input required minLength="3" maxLength="160" value={credentialForm.title} onChange={e=>setCredentialForm(v=>({...v,title:e.target.value}))}/></label><label>{isAr?'الجهة المانحة':'Issuing organization'}<input required minLength="2" maxLength="160" value={credentialForm.issuer} onChange={e=>setCredentialForm(v=>({...v,issuer:e.target.value}))}/></label><label>{isAr?'رقم الشهادة (اختياري)':'Certificate number (optional)'}<input value={credentialForm.credential_number} onChange={e=>setCredentialForm(v=>({...v,credential_number:e.target.value}))}/></label><label>{isAr?'ملف الشهادة':'Certificate file'}<input required type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={e=>setCredentialForm(v=>({...v,file:e.target.files?.[0]||null}))}/></label><button className="btn secondary" type="submit" disabled={busy||!professionalCategoryIds.includes(credentialForm.category_id)}>{isAr?'رفع الشهادة':'Upload certificate'}</button></form><div className="submitted-document-list">{professionalCredentials.map(cr=><div key={cr.id}><span>{cr.title} · {categories.find(c=>c.id===cr.category_id)?.[isAr?'name_ar':'name_en']||''}</span><small>{cr.status==='approved'?(isAr?'تمت الموافقة':'Approved'):cr.status==='rejected'?(isAr?'مرفوضة':'Rejected'):(isAr?'قيد المراجعة':'Pending review')}</small>{cr.review_note&&<p>{cr.review_note}</p>}</div>)}</div></div>
<div className="professional-category-editor"><strong>{isAr?'أبرز الأعمال والمشاريع':'Work highlights & portfolio'}</strong><p>{isAr?'أضف أمثلة حقيقية على أعمالك لكل تصنيف. يجب إضافة إنجاز واحد على الأقل قبل التوصية بملفك.':'Show real examples of your work for each category. A relevant work highlight is required for every selected category before recommendation.'}</p><form className="professional-subform" onSubmit={addPortfolioHighlight}><label>{isAr?'التصنيف':'Category'}<select required value={portfolioForm.category_id} onChange={e=>setPortfolioForm(v=>({...v,category_id:e.target.value}))}><option value="">{t.selectCategory}</option>{categories.filter(c=>professionalCategoryIds.includes(c.id)).map(c=><option key={c.id} value={c.id}>{isAr?c.name_ar:c.name_en}</option>)}</select></label><label>{isAr?'عنوان المشروع':'Project title'}<input required minLength="3" maxLength="160" value={portfolioForm.title} onChange={e=>setPortfolioForm(v=>({...v,title:e.target.value}))}/></label><label>{isAr?'وصف العمل':'What did you do?'}<textarea required minLength="10" maxLength="3000" rows="3" value={portfolioForm.description} onChange={e=>setPortfolioForm(v=>({...v,description:e.target.value}))}/></label><label>{isAr?'رابط المشروع (اختياري)':'Project link (optional)'}<input type="url" value={portfolioForm.project_url} onChange={e=>setPortfolioForm(v=>({...v,project_url:e.target.value}))}/></label><label>{isAr?'صورة العمل (اختياري)':'Project image (optional)'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setPortfolioForm(v=>({...v,file:e.target.files?.[0]||null}))}/></label><button className="btn secondary" type="submit" disabled={busy||!professionalCategoryIds.includes(portfolioForm.category_id)}>{isAr?'إضافة إلى الملف':'Add work highlight'}</button></form><div className="submitted-document-list">{professionalPortfolio.map(item=><div key={item.id}><strong>{item.title}</strong><p>{item.description}</p></div>)}</div></div>
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
              <div className="profile-style-row"><label><span>{isAr?'نمط اللون':'Profile accent'}</span><select value={profileForm.profile_style} onChange={e=>setProfileField('profile_style',e.target.value)}><option value="simple">{isAr?'أخضر بسيط':'Simple emerald'}</option><option value="premium">{isAr?'ذهبي مميز':'Premium emerald & gold'}</option><option value="purple_gold">{isAr?'أخضر ملكي وذهبي':'Royal forest green & gold'}</option></select></label></div>
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
    <footer><div className="brand brand-lockup"><img className="nusqra-lockup" src={nusqraLogo} alt="NUSQRA نسقرا" /></div><p>{t.footer}</p><span>© {new Date().getFullYear()} NUSQRA · {t.join}</span></footer>
    {authMode && <div className="auth-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget){setAuthMode(null);setError('')}}}>
      <section className="auth-dialog" role="dialog" aria-modal="true" aria-label={authMode==='register'?t.create:t.welcome}>
        <button className="auth-close" aria-label="Close" onClick={()=>setAuthMode(null)}><X size={22}/></button>
        <div className="brand brand-lockup"><img className="nusqra-lockup" src={nusqraLogo} alt="NUSQRA نسقرا" /></div>
        <h2>{authMode==='register'?t.create:t.welcome}</h2>
        {!isSupabaseConfigured && <p className="auth-warning">{t.noConfig}</p>}
        <div className="auth-method-tabs">
          <button type="button" className={authMethod==='email'?'active':''} onClick={()=>{setAuthMethod('email');setError('');}}>Email</button>
          <button type="button" className={authMethod==='phone'?'active':''} onClick={()=>{setAuthMethod('phone');setError('');}}>Phone</button>
        </div>
        <button type="button" className="google-auth" disabled={busy||!isSupabaseConfigured} onClick={async()=>{setAuthMethod('google');setError('');setBusy(true);try{const {error:e}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:'https://nusqra.mrexpertd.workers.dev'}});if(e)throw e;}catch(e){setError(e.message||t.authError);setBusy(false);}}}><span className="google-g" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.33 3.36v2.8h3.77c2.2-2.03 3.61-5.02 3.61-8.19z"/><path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.95-2.92l-3.77-2.8c-1.05.7-2.4 1.12-4.18 1.12-3.21 0-5.93-2.17-6.9-5.09H1.2v2.89C3.18 21.16 7.27 24 12 24z"/><path fill="#FBBC05" d="M5.1 14.31A7.2 7.2 0 0 1 4.72 12c0-.8.14-1.58.38-2.31V6.8H1.2A12 12 0 0 0 0 12c0 1.94.46 3.77 1.2 5.2l3.9-2.89z"/><path fill="#EA4335" d="M12 4.6c1.77 0 3.36.61 4.61 1.8l3.45-3.45C17.95 1.12 15.24 0 12 0 7.27 0 3.18 2.84 1.2 6.8l3.9 2.89C6.07 6.77 8.79 4.6 12 4.6z"/></svg></span> Continue with Google</button>
        <div className="auth-divider"><span>or continue with</span></div>
        <form onSubmit={submitAuth}>
          {authMode==='register' && <>
            <label>{t.fullName}<input required autoComplete="name" value={form.full_name} onChange={e=>setField('full_name',e.target.value)} /></label>
            <label>{t.country}<select value={form.country_code} onChange={e=>setField('country_code',e.target.value)}>{countryCodes.map(code=><option key={code} value={code}>{t.countries[code]}</option>)}</select></label>
            <label>{t.roles}<select value={form.account_type} onChange={e=>setField('account_type',e.target.value)}><option value="customer">{t.customer}</option><option value="professional">{t.professional}</option></select></label>{form.account_type==='professional'&&<label>{isAr?'التخصص المهني الأساسي':'Primary professional category'}<select required value={signupCategoryId} onChange={e=>setSignupCategoryId(e.target.value)}><option value="">{t.selectCategory}</option>{categories.filter(c=>c.slug!=='investors-opportunities').map(c=><option key={c.id} value={c.id}>{isAr?c.name_ar:c.name_en}</option>)}</select></label>}
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
