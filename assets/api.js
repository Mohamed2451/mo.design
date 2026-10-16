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

  const warnings = [];
  let db;
  try {
    db = await getClient();
  } catch (error) {
    console.warn('Mo Design: Supabase client unavailable:', error);
    return {
      settings: seed.settings, projects: [], services: seed.services || [],
      testimonials: [], learning_items: [],
      _loadWarnings: ['connection']
    };
  }

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  async function safelyRead(label, query) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const result = await query();
        if (!result?.error) return result?.data ?? null;
        const error = result.error;
        // Only retry likely transient errors, not SQL, authorization or missing-table errors.
        const code = String(error.code || '');
        const status = Number(error.status || 0);
        const transient = status === 408 || status === 429 || status >= 500 ||
          /^(08|53|57P|58)/.test(code) || /fetch|network|timeout|temporar/i.test(error.message || '');
        if (transient && attempt < 2) { await wait(350); continue; }
        console.warn(`Mo Design: could not load ${label}:`, error.message);
      } catch (error) {
        if (attempt < 2) { await wait(350); continue; }
        console.warn(`Mo Design: ${label} request failed:`, error);
      }
      warnings.push(label);
      return null;
    }
    warnings.push(label);
    return null;
  }

  const [settings, projects, services, reviews, lessons] = await Promise.all([
    safelyRead('site settings', () => db.from('site_settings').select('*').eq('id',1).single()),
    safelyRead('projects', () => db.from('projects').select('*').eq('is_published', true).order('sort_order')),
    safelyRead('services', () => db.from('services').select('*').eq('is_published', true).order('sort_order')),
    safelyRead('testimonials', () => db.from('testimonials').select('*').eq('is_published',true).eq('is_verified',true).order('sort_order')),
    safelyRead('learning items', () => db.from('learning_items').select('*').eq('is_published',true).order('sort_order').order('created_at',{ascending:false}))
  ]);

  return {
    settings: settings || seed.settings,
    projects: Array.isArray(projects) ? projects : [],
    services: Array.isArray(services) ? services : (seed.services || []),
    testimonials: Array.isArray(reviews) ? reviews : [],
    learning_items: Array.isArray(lessons) ? lessons : [],
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
