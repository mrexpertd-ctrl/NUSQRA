import React from 'react';
import {
  ArrowDownRight, BriefcaseBusiness, Car, CodeXml, Factory, GraduationCap,
  Grid2X2, Hammer, HardHat, HeartPulse, Megaphone, Monitor, PartyPopper,
  Search, ShieldCheck, Truck, UserRound, Users, Wallet, FileText, Zap
} from 'lucide-react';
import skyline from './riyadh-skyline.webp';

const services = [
  ['business-services', 'Professional consulting', 'الاستشارات المهنية', Users],
  ['design-creative', 'Design and creative', 'التصميم والإبداع', Monitor],
  ['web-technology', 'Technology and software', 'التقنية وتطوير البرمجيات', CodeXml],
  ['marketing-sales', 'Digital marketing', 'التسويق الرقمي', Megaphone],
  ['writing-translation', 'Writing and translation', 'الكتابة والترجمة', FileText],
  ['finance-administration', 'Business and administration', 'الأعمال والإدارة', BriefcaseBusiness],
  ['construction-engineering', 'Engineering and construction', 'الهندسة والتشييد', HardHat],
  ['home-maintenance', 'Home maintenance', 'الصيانة المنزلية', Hammer],
  ['automotive-services', 'Automotive services', 'خدمات السيارات', Car],
  ['education-training', 'Education and training', 'التعليم والتدريب', GraduationCap],
  ['healthcare-wellness', 'Health and wellness', 'الصحة والعافية', HeartPulse],
  ['transport-logistics', 'Transport and logistics', 'النقل والخدمات اللوجستية', Truck],
  ['hospitality-events', 'Hospitality and events', 'الضيافة والفعاليات', PartyPopper],
  ['hr-recruitment', 'HR and recruitment', 'الموارد البشرية والتوظيف', UserRound],
  ['industrial-manufacturing', 'Industry and manufacturing', 'الصناعة والتصنيع', Factory],
  ['investors-opportunities', 'Investor opportunities', 'فرص المستثمرين', Wallet],
];

export function ServiceIcon({ slug, size = 25 }) {
  const Icon = services.find(service => service[0] === slug)?.[3] || Grid2X2;
  return <Icon size={size} strokeWidth={1.6} aria-hidden="true" />;
}

export function Wordmark() {
  return <span className="saudi-wordmark" dir="ltr">
    <span><strong>NUSQRA</strong><small lang="ar" dir="rtl">نُسقرا</small></span>
    <span className="saudi-monogram" aria-hidden="true">U</span>
  </span>;
}

export function SaudiHero({ isAr, onBrowse, onJoin }) {
  return <>
    <section className="saudi-hero">
      <div className="saudi-hero-inner">
        <div className="saudi-hero-copy">
          <h1>{isAr ? 'منصة الخدمات المهنية في المملكة العربية السعودية' : 'Professional services in Saudi Arabia'}</h1>
          <p>{isAr ? 'تواصل مع المحترفين، وقارن العروض، واعثر على الخدمة المناسبة لمشروعك.' : 'Connect with professionals, compare proposals, and find the right service for your project.'}</p>
          <div className="saudi-hero-actions">
            <button className="saudi-primary" type="button" onClick={onBrowse}><Search size={19}/>{isAr ? 'ابحث عن خدمة' : 'Find a service'}</button>
            <button className="saudi-outline" type="button" onClick={onJoin}><UserRound size={19}/>{isAr ? 'انضم كمحترف' : 'Join as a professional'}</button>
          </div>
        </div>
        <div className="saudi-city"><img src={skyline} width="353" height="394" alt={isAr ? 'أفق مدينة الرياض وبرج المملكة' : 'Riyadh skyline and Kingdom Centre'} fetchPriority="high"/></div>
      </div>
    </section>
    <div className="saudi-benefits" aria-label={isAr ? 'مزايا نسقرا' : 'NUSQRA benefits'}>
      {[
        [ShieldCheck, 'Private conversations', 'محادثات خاصة', 'Discuss your project directly', 'ناقش تفاصيل مشروعك مباشرة'],
        [Users, 'Professional profiles', 'ملفات مهنية', 'Review experience and work samples', 'اطّلع على الخبرات ونماذج الأعمال'],
        [Zap, 'Clear proposals', 'عروض واضحة', 'Compare price and delivery time', 'قارن الأسعار ومدد التنفيذ'],
        [ArrowDownRight, 'Direct agreements', 'اتفاق مباشر', 'Choose terms that suit both sides', 'اتفق على الشروط مع الطرف الآخر'],
      ].map(([Icon, en, ar, descEn, descAr]) => <div key={en}>
        <Icon size={25} strokeWidth={1.6} aria-hidden="true"/>
        <span><strong>{isAr ? ar : en}</strong><small>{isAr ? descAr : descEn}</small></span>
      </div>)}
    </div>
  </>;
}

export function ServicesGrid({ isAr, categories, directory, query, setQuery, onBrowse, onSelect }) {
  const search = query.trim().toLowerCase();
  const entries = directory
    ? (categories.length ? categories.map(c => [c.slug, c.name_en, c.name_ar, c.description_en, c.description_ar]) : services.map(([slug, en, ar]) => [slug, en, ar]))
    : services.slice(0, 7);
  const shown = entries.filter(entry => !directory || entry.filter(Boolean).join(' ').toLowerCase().includes(search));
  return <section className={directory ? 'saudi-services directory' : 'saudi-services'} id="entry-categories">
    {directory ? <h1>{isAr ? 'استكشف الخدمات' : 'Explore services'}</h1> : <h2>{isAr ? 'استكشف الخدمات' : 'Explore services'}</h2>}
    {directory && <label className="saudi-search"><Search size={20} aria-hidden="true"/><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={isAr ? 'ابحث عن تصنيف' : 'Search categories'} aria-label={isAr ? 'ابحث عن تصنيف' : 'Search categories'}/></label>}
    <div className="saudi-service-grid">
      {shown.map(([slug, en, ar, descEn, descAr]) => <button className="saudi-service" type="button" key={slug} onClick={() => onSelect(slug)}>
        <ServiceIcon slug={slug}/><strong>{isAr ? ar : en}</strong>
        {directory && (isAr ? descAr : descEn) && <small>{isAr ? descAr : descEn}</small>}
      </button>)}
      {!directory && <button className="saudi-service" type="button" onClick={onBrowse}>
        <Grid2X2 size={25} strokeWidth={1.6}/><strong>{isAr ? 'المزيد من الخدمات' : 'All services'}</strong>
      </button>}
    </div>
    {directory && !shown.length && <p role="status">{isAr ? 'لا توجد تصنيفات مطابقة.' : 'No matching categories.'}</p>}
  </section>;
}

export function ProfessionalBanner({ isAr, onJoin }) {
  return <section className="saudi-banner">
    <div><h2>{isAr ? 'قدّم خدماتك على نسقرا' : 'Offer your services on NUSQRA'}</h2>
      <p>{isAr ? 'اعرض خبراتك وقدّم عروضاً على المشاريع التي تناسب مهاراتك.' : 'Show your experience and send proposals for projects that match your skills.'}</p></div>
    <button type="button" className="saudi-outline" onClick={onJoin}><UserRound size={19}/>{isAr ? 'سجّل كمحترف' : 'Join as a professional'}</button>
  </section>;
}
