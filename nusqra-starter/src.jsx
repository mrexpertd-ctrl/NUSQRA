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
    marketplace:'Marketplace',myJobsAndOpenJobs:'My posts and open jobs',postJob:'Post a job',browseJobs:'Open jobs',myJobs:'My job posts',jobTitle:'Job title',jobDescription:'Describe the work (20 characters minimum)',category:'Category',selectCategory:'Select category',minBudget:'Minimum budget',maxBudget:'Maximum budget',currency:'Currency',cityLabel:'City / area',publishJob:'Publish job',submitProposal:'Submit proposal',proposalText:'Explain why you are right for this job (20 characters minimum)',proposedPrice:'Your price',deliveryDays:'Delivery days',sendProposal:'Send proposal',viewProposals:'View proposals',noJobs:'No open jobs yet.',noOwnJobs:'You have not posted any jobs yet.',noProposals:'No proposals yet.',jobPosted:'Your job has been published.',proposalSent:'Your proposal was sent.',duplicateProposal:'You have already submitted a proposal for this job.',proposalSubmitted:'Proposal submitted',proposalAccepted:'Proposal accepted',proposalRejected:'Proposal rejected',accept:'Accept',reject:'Reject',closeJob:'Close job',reopenJob:'Reopen job',cancelJob:'Cancel job',completeJob:'Mark completed',messageProfessional:'Message professional',messages:'Messages',noConversations:'No conversations yet. Customers can start a conversation from a proposal.',sendMessage:'Send message',messagePlaceholder:'Write a message…',you:'You',jobStatusUpdated:'Job status updated.',decisionSaved:'Proposal decision saved.',budget:'Budget',jobError:'Could not load marketplace data.',ownJob:'You cannot apply to your own job.',
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
    marketplace:'سوق نسقرا',myJobsAndOpenJobs:'طلباتي والطلبات المفتوحة',postJob:'انشر طلب خدمة',browseJobs:'الطلبات المفتوحة',myJobs:'طلباتي المنشورة',jobTitle:'عنوان الطلب',jobDescription:'اشرح العمل المطلوب (20 حرفاً على الأقل)',category:'التصنيف',selectCategory:'اختر التصنيف',minBudget:'الميزانية الدنيا',maxBudget:'الميزانية القصوى',currency:'العملة',cityLabel:'المدينة / المنطقة',publishJob:'نشر الطلب',submitProposal:'تقديم عرض',proposalText:'اشرح لماذا أنت مناسب لهذا العمل (20 حرفاً على الأقل)',proposedPrice:'السعر المقترح',deliveryDays:'مدة التنفيذ بالأيام',sendProposal:'إرسال العرض',viewProposals:'عرض العروض',noJobs:'لا توجد طلبات مفتوحة حالياً.',noOwnJobs:'لم تنشر أي طلبات بعد.',noProposals:'لا توجد عروض بعد.',jobPosted:'تم نشر طلبك بنجاح.',proposalSent:'تم إرسال عرضك.',duplicateProposal:'لقد قدمت عرضاً لهذا الطلب مسبقاً.',proposalSubmitted:'تم تقديم العرض',proposalAccepted:'تم قبول العرض',proposalRejected:'تم رفض العرض',accept:'قبول',reject:'رفض',closeJob:'إغلاق الطلب',reopenJob:'إعادة فتح الطلب',cancelJob:'إلغاء الطلب',completeJob:'تحديد كمكتمل',messageProfessional:'مراسلة المحترف',messages:'الرسائل',noConversations:'لا توجد محادثات بعد. يمكن للعميل بدء محادثة من أحد العروض.',sendMessage:'إرسال الرسالة',messagePlaceholder:'اكتب رسالة…',you:'أنت',jobStatusUpdated:'تم تحديث حالة الطلب.',decisionSaved:'تم حفظ قرار العرض.',budget:'الميزانية',jobError:'تعذر تحميل بيانات السوق.',ownJob:'لا يمكنك تقديم عرض على طلبك الخاص.',
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
  const [categories,setCategories] = useState([]);
  const [jobs,setJobs] = useState([]);
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

  async function loadMarketplace() {
    if (!supabase) return;
    const [c,j,mp] = await Promise.all([
      supabase.from('categories').select('id,name_en,name_ar').eq('is_active',true).order('sort_order'),
      supabase.from('jobs').select('id,customer_id,category_id,title,description,budget_min,budget_max,currency,country_code,city,status,created_at').order('created_at',{ascending:false}).limit(60),
      roles.includes('professional') ? supabase.from('proposals').select('id,job_id,status').eq('professional_id',session.user.id) : Promise.resolve({data:[],error:null})
    ]);
    if(c.error || j.error || mp.error){setError(c.error?.message || j.error?.message || mp.error?.message || t.jobError);return;}
    setCategories(c.data || []);setJobs(j.data || []);setMyProposals(Object.fromEntries((mp.data||[]).map(p=>[p.job_id,p])));
  }

  useEffect(()=>{if(session && supabase) loadMarketplace();else{setCategories([]);setJobs([]);setJobProposals({});setMyProposals({});}},[session,roles]);

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
      await loadMarketplace();if(expandedJob){const job=jobs.find(j=>j.id===expandedJob);if(job)await toggleProposals(job);}
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
      {session && <section className="section marketplace-section" id="marketplace">
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
            <h3>{isProfessional?t.myJobsAndOpenJobs:t.myJobs}</h3>
            {jobs.filter(j=>(isProfessional&&j.status==='open'&&j.customer_id!==session.user.id)||(j.customer_id===session.user.id)).length===0
              ? <p className="market-empty">{isProfessional?t.noJobs:t.noOwnJobs}</p>
              : <div className="job-list">{jobs.filter(j=>isProfessional?j.status==='open'&&j.customer_id!==session.user.id:j.customer_id===session.user.id).map(job=>{
                const category=categories.find(c=>c.id===job.category_id);
                const v=proposalForms[job.id]||{cover_letter:'',proposed_price:'',delivery_days:''};
                return <article className="job-card" key={job.id}>
                  <div className="job-card-top"><span className="job-status">{job.status}</span><span className="job-date">{new Date(job.created_at).toLocaleDateString(lang==='ar'?'ar-SA':'en-US')}</span></div>
                  <h4>{job.title}</h4><p className="job-category">{category?(isAr?category.name_ar:category.name_en):t.marketplace} · {job.city||job.country_code}</p>
                  <p className="job-description">{job.description}</p>
                  <div className="job-meta"><strong>{t.budget}: {job.budget_min??'—'} – {job.budget_max??'—'} {job.currency}</strong></div>
                  {isProfessional&&job.status==='open'&&job.customer_id!==session.user.id&&<form className="market-form proposal-form" onSubmit={e=>submitProposal(e,job)}>
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
      {session && <section className="section marketplace-section messaging-section" id="messages"><div className="section-label">NUSQRA · PRIVATE</div><h2>{t.messages}</h2><div className="messaging-layout"><aside className="conversation-list">{conversations.length===0?<p className="market-empty">{t.noConversations}</p>:conversations.map(c=><button type="button" className={'conversation-item'+(selectedConversation?.id===c.id?' active':'')} key={c.id} onClick={()=>setSelectedConversation(c)}><strong>{c.job?.title||t.marketplace}</strong><span>{session.user.id===c.customer_id?(c.professional?.full_name||t.professional):(c.customer?.full_name||t.customer)}</span></button>)}</aside><div className="chat-panel">{selectedConversation?<><div className="chat-heading"><strong>{selectedConversation.job?.title||conversations.find(c=>c.id===selectedConversation.id)?.job?.title||t.marketplace}</strong><span>{session.user.id===selectedConversation.customer_id?(conversations.find(c=>c.id===selectedConversation.id)?.professional?.full_name||t.professional):(conversations.find(c=>c.id===selectedConversation.id)?.customer?.full_name||t.customer)}</span></div><div className="message-list">{messages.map(m=><div key={m.id} className={'message-bubble'+(m.sender_id===session.user.id?' mine':'')}><p>{m.body}</p><time>{new Date(m.created_at).toLocaleString(lang==='ar'?'ar-SA':'en-US')}</time></div>)}</div><form className="message-compose" onSubmit={sendMessage}><textarea rows="2" maxLength="4000" required placeholder={t.messagePlaceholder} value={messageDraft} onChange={e=>setMessageDraft(e.target.value)}/><button className="btn primary" type="submit" disabled={busy||!messageDraft.trim()}><Send size={16}/>{t.sendMessage}</button></form></>:<p className="market-empty">{t.noConversations}</p>}</div></div></section>}
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
