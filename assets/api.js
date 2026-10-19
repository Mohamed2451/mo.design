import { seed, readDemo } from './data.js';

const cfg = window.PORTFOLIO_CONFIG || {};
export const connected = Boolean(cfg.supabaseUrl && cfg.supabasePublishableKey);
let clientPromise;

export async function getClient() {
  if (!connected) throw new Error('Supabase is not configured');
  if (!clientPromise) {
    clientPromise = import('https://esm.sh/@supabase/supabase-js@2')
      .then(({createClient}) => createClient(cfg.supabaseUrl, cfg.supabasePublishableKey, {
        auth: { persistSession:true, autoRefreshToken:true, detectSessionInUrl:true }
      })).catch(err => { clientPromise = undefined; throw err; });
  }
  return clientPromise;
}

// A temporary problem in one content table must not block other public sections.
// Keep transient network errors separate from legitimate empty published collections.
// Do not fall back to demo projects or unverified reviews on a live website.
export async function getPublicContent() {
  if (!connected) return readDemo();

  // Public visitor pages do not need the Supabase auth SDK or session.
  // Isolate each collection: one unavailable table should not hide projects.
  const warnings = [];
  const cfg = window.PORTFOLIO_CONFIG || {};
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  async function publicRead(label, table, filters = {}, limit = 500) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const endpoint = new URL('rest/v1/' + table,
          cfg.supabaseUrl.replace(/\\/+$/, '') + '/');
        endpoint.searchParams.set('select', '*');
        endpoint.searchParams.set('limit', String(limit));
        for (const [field,value] of Object.entries(filters))
          endpoint.searchParams.set(field, 'eq.' + String(value));
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        let response;
        try {
          response = await fetch(endpoint, {
            headers: {apikey:cfg.supabasePublishableKey,Accept:'application/json'},
            signal: controller.signal
          });
        } finally { clearTimeout(timer); }
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const rows = await response.json();
        if (!Array.isArray(rows)) throw new Error('Unexpected data');
        return rows;
      } catch (error) {
        if (attempt < 2) { await wait(350); continue; }
        console.warn('Mo Design: could not load ' + label, error);
        warnings.push(label);
        return null;
      }
    }
    return null;
  }

  const [settings, projects, services, reviews, lessons] = await Promise.all([
    publicRead('site settings', 'site_settings', {id:1}, 1),
    publicRead('projects', 'projects', {is_published:true}),
    publicRead('services', 'services', {is_published:true}),
    publicRead('testimonials', 'testimonials', {is_published:true,is_verified:true}),
    publicRead('learning items', 'learning_items', {is_published:true})
  ]);
  const byOrder = records => Array.isArray(records)
    ? records.sort((a,b)=>(Number(a.sort_order)||0)-(Number(b.sort_order)||0))
    : [];
  return {
    settings: settings?.[0] || seed.settings,
    projects: byOrder(projects),
    services: Array.isArray(services) ? byOrder(services) : (seed.services || []),
    testimonials: byOrder(reviews),
    learning_items: byOrder(lessons),
    _loadWarnings: warnings
  };
}

export async function sendInquiry(details) {
  if (!connected) return {mode:'email'};
  const db = await getClient();
  const {error} = await db.from('inquiries').insert({
    sender_name: details.name.trim(), sender_email:details.email.trim(),
    service_type:details.service.trim(), message:details.message.trim(),
    sender_phone:(details.phone||'').trim(), company:details.company.trim(), budget:details.budget.trim(), desired_timeline:details.timeline.trim(), reference_url:details.reference_url.trim()
  });
  if (error) throw error;
  return {mode:'sent'};
}
export async function adminAuthenticated() {
  const db = await getClient();
  const {data:{user},error} = await db.auth.getUser();
  if(error || !user) return null;
  const {data} = await db.from('admin_users').select('user_id').eq('user_id',user.id).maybeSingle();
  return data ? user : null;
}
export async function getAdminContent() {
  const db = await getClient();
  const [s,p,v,m] = await Promise.all([
    db.from('site_settings').select('*').eq('id',1).single(),
    db.from('projects').select('*').order('sort_order'),
    db.from('services').select('*').order('sort_order'),
    db.from('inquiries').select('*').order('created_at',{ascending:false}).limit(100)
  ]);
  for(const result of [s,p,v,m]) if(result.error) throw result.error;
  const [reviews,lessons] = await Promise.all([
    db.from('testimonials').select('*').order('sort_order'),
    db.from('learning_items').select('*').order('sort_order').order('created_at',{ascending:false})
  ]);
  if(reviews.error)console.warn('Testimonials table not installed:',reviews.error.message);
  if(lessons.error)console.warn('Run V10 migration 005 before using the learning studio:',lessons.error.message);
  return {settings:s.data,projects:p.data,services:v.data,testimonials:reviews.data||[],messages:m.data,learning_items:lessons.data||[],learning_error:lessons.error?.message||''};
}
