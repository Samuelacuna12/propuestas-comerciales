export const CATALOG = {
  salavetti: { name: 'Salavetti Coral, Turquoise & Diamond Ring', short: 'The Salavetti ring', category: 'Signed jewelry', material: '18k rose gold · coral · turquoise', ask: 12000, url: 'https://bizakco.com/product/salavetti-coral-turquoise-diamond-ring', detail: 'Confirm exact ring size, gold weight and current condition in writing.' },
  clifton: { name: 'Baume & Mercier Clifton 18K Rose Gold Automatic', short: 'The Clifton watch', category: 'Vintage timepiece', material: '18k rose gold · ref. M0A10059', ask: 5500, url: 'https://bizakco.com/product/baume-mercier-clifton-18k-rose-gold', detail: 'Confirm current condition, movement check, and the box and papers listed with this reference.' },
  opal: { name: 'Platinum Opal & Diamond Ring', short: 'The platinum opal ring', category: 'Estate jewelry', material: 'Platinum · 5.08ct opal · diamonds', ask: 4250, url: 'https://bizakco.com/product/platinum-opal-diamond-ring', detail: 'Confirm current condition and fit; the published listing identifies ring size 6.' }
};
export const INTENTS = { media: 'Photos & video', details: 'Condition & sizing', quote: 'Quote / offer discussion' };
export const CHECKS = { availability: 'Availability reviewed', details: 'Piece details reviewed', media: 'Photos / video reviewed' };
export const STAGES = { new: 'New inquiry', ready: 'Ready for review', waiting: 'Awaiting reply', replied: 'Reply received', closed: 'Stopped' };
export const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
const OPEN = ['new', 'ready', 'waiting'];
const clone = s => structuredClone(s);
const own = (o,k) => Object.hasOwn(o,k);
const finiteTime = n => Number.isFinite(n) && n > 0 && n < 8640000000000000;
function record(s,id) { const c=s.cases.find(c=>c.id===id); if(!c)throw Error('Select a valid example inquiry.'); return c; }
function event(s,c,text) { c.events.push({ at:s.clock, text }); }
export function createState(now=Date.now(), sample=true) {
  if(!finiteTime(now))throw Error('Invalid demo clock.');
  const s={version:1,clock:now,start:now,seq:0,cases:[],unavailable:[]};
  return sample?addCase(s,'salavetti','media'):s;
}
export function addCase(state,product,intent) {
  if(!own(CATALOG,product)||!own(INTENTS,intent))throw Error('Choose a listed piece and inquiry reason.');
  if(state.unavailable.includes(product))throw Error('This piece is unavailable in the demo. Reset examples to try it again.');
  if(state.cases.length>=30)throw Error('This preview supports 30 example inquiries. Export or reset to continue.');
  const s=clone(state);s.seq+=1;
  const c={id:`DEMO-${String(s.seq).padStart(3,'0')}`,product,intent,stage:'new',checks:{availability:false,details:false,media:false},draft:'',due:null,followupReviewed:false,reason:'',created:s.clock,events:[]};
  event(s,c,'Example inquiry created; no real customer or message.');s.cases.push(c);return s;
}
export function setCheck(state,id,key,value) {
  if(!own(CHECKS,key)||typeof value!=='boolean')throw Error('Invalid review step.');
  const s=clone(state),c=record(s,id);if(!['new','ready'].includes(c.stage))throw Error('Review steps are locked after the simulated handoff.');
  c.checks[key]=value;if(c.stage==='ready'){c.stage='new';c.draft='';}return s;
}
export function responseDraft(c) {
  const p=CATALOG[c.product];
  const request={media:'Please review current close-up photos and a short video of the exact piece before deciding.',details:'Let’s confirm the measurements and condition details that matter to you before you decide.',quote:'We can review your questions or an offer with the jeweler. Any final quote and offer decision require personal approval.'}[c.intent];
  return `EXAMPLE RESPONSE · NOT SENT\n\nThank you for asking about the ${p.name}.\n\n${request}\n\nPublished asking price: ${money(p.ask)} (listing checked November 2, 2026; verify before quoting).\nOfficial reference: ${p.url}\n\nJEWELER REVIEW BEFORE SENDING\n• ${p.detail}\n• Attach the actual reviewed media and written description.\n• Confirm current availability and the final price; do not promise a reservation.\n\nThis local draft is a review packet, not a quote, offer acceptance, payment link or sent message.`;
}
export function prepare(state,id) {
  const s=clone(state),c=record(s,id);
  if(!['new','ready'].includes(c.stage))throw Error('Only an open inquiry can be prepared.');
  if(s.unavailable.includes(c.product))throw Error('This piece is unavailable in the demo.');
  if(!Object.values(c.checks).every(Boolean))throw Error('Complete all 3 example review checks first.');
  c.draft=responseDraft(c);c.stage='ready';event(s,c,'Response packet prepared for human review. No quote approved or message sent.');return s;
}
export function handoff(state,id) {
  const s=clone(state),c=record(s,id);if(c.stage!=='ready')throw Error('Prepare the response packet before simulating a handoff.');
  if(s.unavailable.includes(c.product))throw Error('This piece is unavailable in the demo.');
  c.stage='waiting';c.due=s.clock+24*60*60*1000;c.followupReviewed=false;event(s,c,'Simulated handoff: one follow-up task scheduled for 24 hours later. Nothing sent.');return s;
}
export function reply(state,id) {
  const s=clone(state),c=record(s,id);if(!OPEN.includes(c.stage))throw Error('This inquiry is already stopped.');
  c.stage='replied';c.due=null;c.reason='Reply received in the demo';event(s,c,'Simulated reply received. Pending follow-up cancelled.');return s;
}
export function optOut(state,id) {
  const s=clone(state),c=record(s,id);if(!OPEN.includes(c.stage))throw Error('This inquiry is already stopped.');
  c.stage='closed';c.due=null;c.reason='Do not contact (demo)';event(s,c,'Simulated opt-out. Pending follow-up cancelled; no further task.');return s;
}
export function makeUnavailable(state,product) {
  if(!own(CATALOG,product))throw Error('Unknown piece.');const s=clone(state);if(!s.unavailable.includes(product))s.unavailable.push(product);
  s.cases.filter(c=>c.product===product&&OPEN.includes(c.stage)).forEach(c=>{c.stage='closed';c.due=null;c.reason='Piece unavailable (demo)';event(s,c,'Piece marked unavailable in this preview. All open inquiries for this piece stopped.');});return s;
}
export function advance(state,hours=48) {if(!Number.isInteger(hours)||hours<1||hours>168)throw Error('Choose 1–168 demo hours.');const s=clone(state);s.clock+=hours*3600000;return s;}
export function dueCases(state) {return state.cases.filter(c=>c.stage==='waiting'&&c.due!==null&&c.due<=state.clock&&!state.unavailable.includes(c.product)).sort((a,b)=>a.due-b.due);}
export function followupDraft(c) {const p=CATALOG[c.product];return `EXAMPLE FOLLOW-UP · NOT SENT\n\nFollowing up on your question about the ${p.name}. Would another photo or a specific detail help you decide?\n\nOfficial reference: ${p.url}\n\nBefore sending: recheck availability, previous replies and contact permission. Stop if the person has replied, opted out, or the piece is no longer available.\nThis example never sends a message.`;}
export function reviewFollowup(state,id) {if(!dueCases(state).some(c=>c.id===id))throw Error('There is no due follow-up for this inquiry.');const s=clone(state),c=record(s,id);c.due=null;c.followupReviewed=true;event(s,c,'Follow-up reviewed locally. No message sent and no repeat task scheduled.');return s;}
export function stats(s) {return {open:s.cases.filter(c=>OPEN.includes(c.stage)).length,due:dueCases(s).length,stopped:s.cases.filter(c=>!OPEN.includes(c.stage)).length};}
export function restore(raw,now=Date.now()) {
  if(!raw||raw.version!==1||!finiteTime(raw.clock)||!finiteTime(raw.start)||!Number.isInteger(raw.seq)||raw.seq<0||!Array.isArray(raw.cases)||!Array.isArray(raw.unavailable))return createState(now);
  const seen=new Set();const cases=raw.cases.filter(c=>c&&/^DEMO-\d{3,}$/.test(c.id)&&own(CATALOG,c.product)&&own(INTENTS,c.intent)&&own(STAGES,c.stage)&&c.checks&&Object.keys(CHECKS).every(k=>typeof c.checks[k]==='boolean')&&finiteTime(c.created)&&(c.due===null||finiteTime(c.due))&&Array.isArray(c.events)).filter(c=>{if(seen.has(c.id))return false;seen.add(c.id);return true}).slice(0,30).map(c=>{return {id:c.id,product:c.product,intent:c.intent,stage:c.stage,checks:{availability:c.checks.availability,details:c.checks.details,media:c.checks.media},draft:['ready','waiting','replied','closed'].includes(c.stage)?responseDraft(c):'',due:c.stage==='waiting'?c.due:null,followupReviewed:c.followupReviewed===true,reason:typeof c.reason==='string'?c.reason.slice(0,120):'',created:c.created,events:c.events.filter(e=>e&&finiteTime(e.at)&&typeof e.text==='string').slice(-40).map(e=>({at:e.at,text:e.text.slice(0,250)}))}});
  const s={version:1,clock:raw.clock,start:raw.start,seq:Math.max(raw.seq,...cases.map(c=>Number(c.id.slice(5))),0),cases,unavailable:raw.unavailable.filter(id=>own(CATALOG,id))};
  for(const id of s.unavailable){s.cases.filter(c=>c.product===id&&OPEN.includes(c.stage)).forEach(c=>{c.stage='closed';c.due=null;c.reason='Piece unavailable (demo)'})}return s;
}
export function exportRecord(state) {return {scope:'Independent local preview by Samuel Acuña. Example records only. No integration or messages sent.',exportedAt:new Date().toISOString(),catalogVerifiedAt:'2026-11-02',...clone(state)}};
