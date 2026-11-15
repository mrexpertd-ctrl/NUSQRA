import React, {useEffect, useRef} from 'react';
import {BadgeCheck, BriefcaseBusiness, MapPin, Star, UserRound, X} from 'lucide-react';
import './member-profile.css';

const tierNames = {
  gold: ['Gold', 'ذهبي'], emerald: ['Emerald', 'زمردي'], diamond: ['Diamond', 'ماسي'],
};

function tierFor(reputation, customer, years = 0) {
  const count = Number(customer ? reputation?.confirmed_paid_projects : reputation?.completed_projects) || 0;
  if (count >= 15 && (customer || years >= 7)) return 'diamond';
  if (count >= 5 && (customer || years >= 3)) return 'emerald';
  if (count >= 1) return 'gold';
  return null;
}

export function ReputationBadge({reputation, isAr, customer = false, years}) {
  const tier = tierFor(reputation, customer, years);
  if (!tier) return null;
  const title = tierNames[tier][Number(isAr)];
  return <span className={`member-badge member-${tier}${customer ? ' member-patron' : ''}`}>
    {customer && <BriefcaseBusiness size={14} aria-hidden="true"/>}
    {customer ? (isAr ? `عميل ${title}` : `${title} client`) : (isAr ? `محترف ${title}` : `${title} professional`)}
  </span>;
}

export function MemberAvatar({url, reputation, customer, years, staffTier}) {
  const tier = staffTier || tierFor(reputation, customer, years);
  return <span className={`member-avatar${tier ? ` member-${tier}` : ''}${tier && customer ? ' member-patron' : ''}`}>
    {url ? <img src={url} alt=""/> : <UserRound aria-hidden="true"/>}
  </span>;
}

export function VerifiedBadge({isAr}) {
  return <span className="member-verified"><BadgeCheck size={17} aria-hidden="true"/>{isAr?'موثّق من نسقرا':'Verified by NUSQRA'}</span>;
}

function SkillStars({reputation, isAr}) {
  if (!reputation?.rating_count) return null;
  const rating = Number(reputation.skill_rating);
  return <div className="member-stars" aria-label={isAr ? `تقييم المهارات ${rating} من 5` : `Skill rating ${rating} out of 5`}>
    <span className="member-star-icons" aria-hidden="true">
      {[1,2,3,4,5].map(value => <Star key={value} size={16} fill={value <= Math.round(rating) ? 'currentColor' : 'none'}/>)}
    </span>
    <strong>{rating.toFixed(1)}</strong>
    <span>{isAr ? `(${reputation.rating_count} تقييم مهارة)` : `(${reputation.rating_count} skill ratings)`}</span>
  </div>;
}

export function MemberProfile({person, reputation, isAr, country, professional, customer, portfolio = [], skills = [], onEdit}) {
  const distinctions = person.profile_distinctions;
  const years = professional?.years_experience;
  const professionalTier = tierFor(reputation, false, years);
  const useClientFrame = Boolean(customer && tierFor(reputation, true));
  return <article className="member-profile">
    <section className="member-card">
      <div className="member-cover">{person.cover_url && <img src={person.cover_url} alt=""/>}</div>
      <div className="member-identity">
        <div className="member-identity-actions">
          <MemberAvatar url={person.avatar_url} reputation={reputation} customer={useClientFrame} years={years} staffTier={distinctions?.tier}/>
          {onEdit && <button type="button" className="saudi-outline" onClick={onEdit}>{isAr?'تعديل الملف':'Edit profile'}</button>}
        </div>
        <h1>{person.display_name || person.full_name || (isAr ? 'عضو نسقرا' : 'NUSQRA member')}</h1>
        {professional?.headline && <p className="member-headline">{professional.headline}</p>}
        {(professional?.city || country) && <p className="member-location"><MapPin size={15} aria-hidden="true"/>{[professional?.city, country].filter(Boolean).join(' · ')}</p>}
        <div className="member-badges">
          {distinctions?.verified && <VerifiedBadge isAr={isAr}/>}
          {distinctions?.tier && <span className={`member-badge member-${distinctions.tier}`}>{isAr?'إطار نسقرا':'NUSQRA frame'} · {tierNames[distinctions.tier][Number(isAr)]}</span>}
          {professionalTier && <ReputationBadge reputation={reputation} years={years} isAr={isAr}/>}
          {customer && <ReputationBadge reputation={reputation} customer isAr={isAr}/>}
        </div>
        {distinctions?.stars && <div className="member-stars" aria-label={isAr?`نجوم نسقرا ${distinctions.stars} من 5`:`NUSQRA staff award, ${distinctions.stars} out of 5 stars`}>
          <span className="member-star-icons" aria-hidden="true">{[1,2,3,4,5].map(value => <Star key={value} size={16} fill={value<=distinctions.stars?'currentColor':'none'}/>)}</span>
          <span>{isAr?'نجوم نسقرا':'NUSQRA staff stars'}</span>
        </div>}
        {professional && <SkillStars reputation={reputation} isAr={isAr}/>}
      </div>
    </section>
    {(professional?.about || person.bio) && <section className="member-card member-section">
      <h2>{isAr?'نبذة':'About'}</h2><p>{professional?.about || person.bio}</p>
    </section>}
    {(professional || customer) && <section className="member-card member-section">
      <h2>{isAr?'الخبرة وسجل المشاريع':'Experience and project record'}</h2>
      <dl className="member-stats">
        {professional && years != null && years !== '' && <div><dt>{isAr?'سنوات الخبرة المعلنة':'Years of experience (self-reported)'}</dt><dd>{years}</dd></div>}
        {professional && <div><dt>{isAr?'مشاريع مكتملة':'Completed projects'}</dt><dd>{reputation?.completed_projects ?? '–'}</dd></div>}
        {customer && <div><dt>{isAr?'مشاريع مدفوعة أكدها الطرفان':'Paid projects confirmed by both parties'}</dt><dd>{reputation?.confirmed_paid_projects ?? '–'}</dd></div>}
      </dl>
      {onEdit && <details className="member-tier-guide">
        <summary>{isAr?'كيف تُكتسب الإطارات؟':'How frames are earned'}</summary>
        {professional && <p>{isAr?'ذهبي بعد مشروع مكتمل واحد. زمردي بعد 5 مشاريع و3 سنوات خبرة معلنة. ماسي بعد 15 مشروعاً و7 سنوات خبرة معلنة.':'Gold after 1 completed project. Emerald after 5 completed projects and 3 years of reported experience. Diamond after 15 completed projects and 7 years of reported experience.'}</p>}
        {customer && <p>{isAr?'إطارات العملاء الذهبية والزمردية والماسية عند تأكيد الطرفين دفع 1 و5 و15 مشروعاً على التوالي.':'Client frames reach Gold, Emerald and Diamond after 1, 5 and 15 projects with payment confirmed by both parties.'}</p>}
      </details>}
    </section>}
    {portfolio.length > 0 && <section className="member-card member-section">
      <h2>{isAr?'أبرز المشاريع':'Featured projects'}</h2>
      <div className="member-portfolio">{portfolio.map(item => <article key={item.id}>
        {item.media_url && <img src={item.media_url} alt="" loading="lazy"/>}
        <h3>{item.title}</h3><p>{item.description}</p>
        {/^https?:\/\//i.test(item.project_url || '') && <a href={item.project_url} target="_blank" rel="noreferrer">{isAr?'عرض المشروع':'View project'}</a>}
      </article>)}</div>
    </section>}
    {skills.length > 0 && <section className="member-card member-section">
      <h2>{isAr?'المهارات والخدمات':'Skills and services'}</h2>
      <ul className="member-skills">{skills.map(skill => <li key={skill}>{skill}</li>)}</ul>
    </section>}
  </article>;
}

export function PaymentConfirmations({projects, pending, error, isAr, onConfirm}) {
  return <section className="member-card member-section">
    <h2>{isAr?'تأكيد دفع المشاريع':'Project payment confirmations'}</h2>
    <p>{isAr?'بعد اكتمال المشروع، يؤكد العميل الدفع ويؤكد المحترف الاستلام. يُحتسب المشروع بعد تأكيد الطرفين.':'After a project is complete, the client confirms payment and the professional confirms receipt. Both confirmations count toward the client’s frame.'}</p>
    {error && <p className="member-error" role="alert">{error}</p>}
    {projects === null ? <p>{isAr?'جارٍ تحميل المشاريع…':'Loading projects…'}</p> :
      projects.length === 0 ? <p>{isAr?'لا توجد مشاريع مكتملة للتأكيد.':'No completed projects to confirm yet.'}</p> :
      <ul className="member-payments">{projects.map(project => {
        const complete = project.confirmed_by_me && project.confirmed_by_other;
        const status = complete ? (isAr?'أكد الطرفان الدفع':'Both parties confirmed') :
          project.confirmed_by_me ? (isAr?'بانتظار الطرف الآخر':'Waiting for the other party') :
          project.confirmed_by_other ? (isAr?'أكد الطرف الآخر':'Other party confirmed') :
          (isAr?'بانتظار التأكيد':'Awaiting confirmation');
        return <li key={project.job_id}>
          <div><strong>{project.title}</strong><small>{status}</small></div>
          <button type="button" className={project.confirmed_by_me ? 'saudi-outline' : 'saudi-primary'} disabled={Boolean(pending)} onClick={() => onConfirm(project)}>
            {project.confirmed_by_me ? (isAr?'إلغاء تأكيدي':'Withdraw my confirmation') : project.as_customer ? (isAr?'أؤكد أنني دفعت':'I paid') : (isAr?'أؤكد أنني استلمت الدفع':'I received payment')}
          </button>
        </li>;
      })}</ul>}
  </section>;
}

export function MemberProfileDialog({onClose, isAr, children, accountEditor = false}) {
  const dialog = useRef(null);
  useEffect(() => { dialog.current.showModal(); }, []);
  return <dialog ref={dialog} className={`member-profile-dialog${accountEditor ? " member-editor-dialog" : ""}`} aria-label={accountEditor ? (isAr ? "إعدادات الحساب" : "Account settings") : (isAr ? "الملف المهني" : "Professional profile")} onClose={onClose}>
    <button type="button" className="member-close saudi-outline" onClick={() => dialog.current.close()} aria-label={isAr?'إغلاق':'Close'}><X size={20}/></button>
    {children}
  </dialog>;
}
