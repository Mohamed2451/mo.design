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
export async function getPublicContent() {
  if (!connected) return readDemo();
  const db = await getClient();
  const [s,p,v] = await Promise.all([
    db.from('site_settings').select('*').eq('id',1).single(),
    db.from('projects').select('*').eq('is_published', true).order('sort_order'),
    db.from('services').select('*').eq('is_published', true).order('sort_order')
  ]);
  if (s.error || p.error || v.error) throw new Error(s.error?.message || p.error?.message || v.error?.message);
  const reviews=await db.from('testimonials').select('*').eq('is_published',true).eq('is_verified',true).order('sort_order');
  if(reviews.error)console.warn('Testimonials table not installed; run migration if needed:',reviews.error.message);
  return {settings:s.data || seed.settings,projects:p.data || [],services:v.data || [],testimonials:reviews.data || []};
}
export async function sendInquiry(details) {
  if (!connected) return {mode:'email'};
  const db = await getClient();
  const {error} = await db.from('inquiries').insert({
    sender_name: details.name.trim(), sender_email:details.email.trim(),
    service_type:details.service.trim(), message:details.message.trim()
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
  const reviews=await db.from('testimonials').select('*').order('sort_order');
  if(reviews.error)console.warn('Testimonials table not installed:',reviews.error.message);
  return {settings:s.data,projects:p.data,services:v.data,testimonials:reviews.data||[],messages:m.data};
}
