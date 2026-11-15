import React, {useEffect, useRef} from 'react';
import {BadgeCheck, MapPin, Star, Trophy, UserRound, X} from 'lucide-react';
import './member-profile.css';
import {frameMilestones, maxProfileLevel, profileProgress, starMilestones} from './profile-progression.mjs';
import bronzeFrame from './assets/profile-frames/bronze.webp';
import silverFrame from './assets/profile-frames/silver.webp';
import goldFrame from './assets/profile-frames/gold.webp';
import diamondFrame from './assets/profile-frames/diamond.webp';
import emeraldFrame from './assets/profile-frames/emerald.webp';

const frameImages = {
  bronze: bronzeFrame, silver: silverFrame, gold: goldFrame,
  diamond: diamondFrame, emerald: emeraldFrame,
};

export function ReputationBadge({reputation, isAr}) {
  const progress = profileProgress(reputation?.completed_tasks);
  if (!progress?.frame) return null;
  const {frame, level} = progress;
  return <span className={`member-badge member-${frame.tier}`}>
    {isAr ? `المستوى ${level}` : `Level ${level}`} · {frame.names[Number(isAr)]}
  </span>;
}

export function MemberAvatar({url, reputation, staffTier}) {
  const tier = profileProgress(reputation?.completed_tasks)?.frame?.tier || staffTier;
  const frame = frameImages[tier];
  return <span className={`member-avatar${frame ? ' member-avatar-framed' : ''}`}>
    {url ? <img className="member-avatar-photo" src={url} alt=""/> : <UserRound className="member-avatar-photo" aria-hidden="true"/>}
    {frame && <img className="member-avatar-frame" src={frame} alt=""/>}
  </span>;
}

function ProfileProgress({progress, isAr, onEdit}) {
  return <section className="member-card member-section member-progress">
    <h2>{isAr ? 'تقدم الملف الشخصي' : 'Profile progress'}</h2>
    <p>{progress.level
      ? (isAr ? `المستوى ${progress.level} من ${maxProfileLevel}` : `Level ${progress.level} of ${maxProfileLevel}`)
      : (isAr ? 'أكمل أول مهمة للوصول إلى المستوى 1.' : 'Complete your first task to reach Level 1.')}</p>
    <progress value={progress.level} max={maxProfileLevel} aria-label={isAr ? 'تقدم المستوى' : 'Level progress'}/>
    <p>{isAr ? `المهام المكتملة: ${progress.tasks}` : `Completed tasks: ${progress.tasks}`}</p>
    {progress.stars > 0 && <div className="member-stars">
      <span className="member-star-icons" aria-hidden="true">
        {Array.from({length: progress.stars}, (_, index) => <Star key={index} size={16} fill="currentColor"/>)}
      </span>
      <span>{isAr ? `نجوم الإنجاز: ${progress.stars} من 7` : `Task stars: ${progress.stars} of 7`}</span>
    </div>}
    {progress.trusted && <p className="member-progress-award">
      <Trophy size={17} aria-hidden="true"/>
      <strong>{isAr ? 'جائزة إكمال 50 مهمة' : '50-task achievement award'}</strong>
    </p>}
    {onEdit && <details className="member-tier-guide">
      <summary>{isAr ? 'مستويات الإطارات والنجوم' : 'Frame and star milestones'}</summary>
      <p>{isAr ? 'تُحسب كل مهمة مكتملة مرة واحدة لكل من العميل والمحترف.' : 'Each completed task counts once for the client and once for the professional.'}</p>
      <ul>
        {frameMilestones.map((frame, index) => {
          const last = (frameMilestones[index + 1]?.level ?? maxProfileLevel + 1) - 1;
          return <li key={frame.tier}>{frame.names[Number(isAr)]} · {isAr ? 'المستويات' : 'Levels'} {frame.level}–{last}</li>;
        })}
      </ul>
      <p>{isAr ? 'عتبات النجوم من 1 إلى 7 حسب المهام المكتملة' : 'Stars 1 through 7 unlock at these completed-task totals'} · {starMilestones.join(' / ')}</p>
    </details>}
  </section>;
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
  const progress = profileProgress(reputation?.completed_tasks);
  const staffFrame = frameMilestones.find(frame => frame.tier === distinctions?.tier);
  return <article className="member-profile">
    <section className="member-card">
      <div className="member-cover">{person.cover_url && <img src={person.cover_url} alt=""/>}</div>
      <div className="member-identity">
        <div className="member-identity-actions">
          <MemberAvatar url={person.avatar_url} reputation={reputation} staffTier={distinctions?.tier}/>
          {onEdit && <button type="button" className="saudi-outline" onClick={onEdit}>{isAr?'تعديل الملف':'Edit profile'}</button>}
        </div>
        <h1>{person.display_name || person.full_name || (isAr ? 'عضو نسقرا' : 'NUSQRA member')}</h1>
        {professional?.headline && <p className="member-headline">{professional.headline}</p>}
        {(professional?.city || country) && <p className="member-location"><MapPin size={15} aria-hidden="true"/>{[professional?.city, country].filter(Boolean).join(' · ')}</p>}
        <div className="member-badges">
          {distinctions?.verified && <VerifiedBadge isAr={isAr}/>}
          {progress?.trusted && <span className="member-verified"><BadgeCheck size={17} aria-hidden="true"/>{isAr?'عضو موثوق · 50 مهمة مكتملة':'Trusted member · 50 tasks completed'}</span>}
          {staffFrame && <span className={`member-badge member-${staffFrame.tier}`}>{isAr?'إطار من فريق نسقرا':'Staff-awarded frame'} · {staffFrame.names[Number(isAr)]}</span>}
          <ReputationBadge reputation={reputation} isAr={isAr}/>
        </div>
        {distinctions?.stars && <div className="member-stars" aria-label={isAr?`نجوم نسقرا ${distinctions.stars} من 5`:`NUSQRA staff award, ${distinctions.stars} out of 5 stars`}>
          <span className="member-star-icons" aria-hidden="true">{[1,2,3,4,5].map(value => <Star key={value} size={16} fill={value<=distinctions.stars?'currentColor':'none'}/>)}</span>
          <span>{isAr?'نجوم نسقرا':'NUSQRA staff stars'}</span>
        </div>}
        {professional && <SkillStars reputation={reputation} isAr={isAr}/>}
      </div>
    </section>
    {progress && (onEdit || progress.level > 0) && <ProfileProgress progress={progress} isAr={isAr} onEdit={onEdit}/>}
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
    <p>{isAr?'بعد اكتمال المشروع، يؤكد العميل الدفع ويؤكد المحترف الاستلام. يُحدّث سجل الدفع بعد تأكيد الطرفين.':'After a project is complete, the client confirms payment and the professional confirms receipt. The payment record updates once both parties confirm.'}</p>
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
  return <dialog ref={dialog} className={`member-profile-dialog${accountEditor ? " member-editor-dialog" : ""}`} aria-label={accountEditor ? (isAr ? "إعدادات الحساب" : "Account settings") : (isAr ? "الملف الشخصي" : "Member profile")} onClose={onClose}>
    <ProfileCloseButton isAr={isAr} onClose={() => dialog.current.close()}/>
    {children}
  </dialog>;
}

export function ProfileCloseButton({isAr, onClose}) {
  const label = isAr ? 'إغلاق والعودة' : 'Close and go back';
  return <div className="member-close-bar">
    <button type="button" className="member-close saudi-outline" onClick={onClose} aria-label={label} title={label}>
      <X size={22} aria-hidden="true"/>
    </button>
  </div>;
}
