export const maxProfileLevel = 50;

export const frameMilestones = [
  {level: 1, tier: 'bronze', names: ['Bronze', 'برونزي']},
  {level: 4, tier: 'silver', names: ['Silver', 'فضي']},
  {level: 7, tier: 'gold', names: ['Gold', 'ذهبي']},
  {level: 15, tier: 'diamond', names: ['Diamond', 'ماسي']},
  {level: 25, tier: 'emerald', names: ['Emerald', 'زمردي']},
];

export const starMilestones = [1, 5, 15, 25, 30, 40, 50];

export function profileProgress(completedTasks) {
  const tasks = Number(completedTasks);
  if (completedTasks == null || !Number.isSafeInteger(tasks) || tasks < 0) return null;

  const level = Math.min(maxProfileLevel, tasks);
  return {
    tasks,
    level,
    frame: frameMilestones.reduce((frame, milestone) => milestone.level <= level ? milestone : frame, null),
    stars: starMilestones.filter(milestone => milestone <= level).length,
    trusted: level === maxProfileLevel,
  };
}
