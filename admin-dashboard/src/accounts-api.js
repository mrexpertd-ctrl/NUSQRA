const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const professionalStatuses = ['pending_review', 'verified', 'rejected'];
const profileTiers = ['gold', 'emerald', 'diamond'];

function failure(json, error, message) {
  if (error?.code === '42501') return json({error:'Super Admin permission is required for this action.'},403);
  return json({error:message},500);
}

export async function handleAccounts(request, url, ctx, json) {
  if (ctx.staff.staff_role !== 'supreme_admin') return json({error:'Super Admin permission is required.'},403);

  if (request.method === 'GET') {
    const search = (url.searchParams.get('q') || '').trim();
    const offset = Number(url.searchParams.get('offset') || 0);
    const view = url.searchParams.get('view') || 'accounts';
    if (search.length > 120 || !Number.isSafeInteger(offset) || offset < 0 || offset > 1000000 || !['accounts','visits'].includes(view)) {
      return json({error:'Invalid account filters.'},400);
    }
    const {data,error} = await ctx.service.rpc('staff_marketplace_accounts',{
      actor_id:ctx.user.id, search_term:search, recent_visits:view==='visits', page_offset:offset,
    });
    if (error) return failure(json,error,'Accounts could not be loaded.');
    return json({accounts:data.slice(0,20),hasMore:data.length>20});
  }

  if (request.method !== 'POST') return json({error:'Method not allowed.'},405);
  const body = await request.json().catch(() => null);
  const reason = typeof body?.reason === 'string' ? body.reason.trim() : '';
  if (!uuid.test(body?.targetId || '') || !reason || reason.length > 1000) {
    return json({error:'Choose an account and enter a reason of up to 1,000 characters.'},400);
  }
  const actorAndTarget = {actor_id:ctx.user.id,target_id:body.targetId,reason};
  if (body.action === 'distinctions') {
    if (typeof body.verified !== 'boolean' ||
      (body.stars !== null && (!Number.isInteger(body.stars) || body.stars < 1 || body.stars > 5)) ||
      (body.tier !== null && !profileTiers.includes(body.tier)) ||
      (body.professionalReview !== null && !professionalStatuses.includes(body.professionalReview)) ||
      (body.updatedAt !== null && (typeof body.updatedAt !== 'string' || !Number.isFinite(Date.parse(body.updatedAt))))) {
      return json({error:'Choose a valid badge, star count and frame.'},400);
    }
    const {data,error} = await ctx.service.rpc('staff_save_profile_distinctions',{
      ...actorAndTarget,new_verified:body.verified,new_stars:body.stars,new_tier:body.tier,professional_review:body.professionalReview,expected_updated_at:body.updatedAt,
    });
    if (error) return failure(json,error,'Profile changes could not be saved.');
    if (data === 'missing') return json({error:'This profile no longer exists.'},404);
    if (data === 'conflict') return json({error:'The profile changed. Refresh the account list and try again.'},409);
    return json({success:true});
  }

  if (body.action !== 'delete' || typeof body.confirmedAccount !== 'string' || body.confirmedAccount.length > 254) {
    return json({error:'Type the account email or ID to confirm deletion.'},400);
  }
  const removeAccount = () => ctx.service.rpc('staff_delete_marketplace_account',{
    ...actorAndTarget, confirmed_account:body.confirmedAccount,
  });
  for (let batch=0; batch<=5; batch++) {
    const {data,error} = await removeAccount();
    if (error) return failure(json,error,'The account could not be deleted. Refresh before retrying.');
    if (['deleted','missing'].includes(data.status)) return json({success:true});
    if (data.status === 'mismatch') return json({error:'The confirmation did not match the selected account.'},409);
    if (data.status !== 'storage') return json({error:'The account could not be deleted.'},500);
    if (batch === 5) break;
    const filesByBucket = Map.groupBy(data.files, file => file.bucket_id);
    for (const [bucket,files] of filesByBucket) {
      const {error:storageError} = await ctx.service.storage.from(bucket).remove(files.map(file => file.name));
      if (storageError) return json({error:'File removal stopped. The account still exists. Retry to continue.'},502);
    }
  }
  return json({error:'Some files were removed. Retry deletion to finish removing this account.'},409);
}
