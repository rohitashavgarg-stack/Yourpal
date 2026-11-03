/* YourPal admin panel prototype: Members list and Member detail.
   Structure, copy and states follow the live CRM (dev.rpmfy.com, Doli_GYM). Mock data only.
   Routes: #/members, #/members/<id>?tab=<tab>, #/members/<id>/notes. Other sidebar pages are shells. */
(function(){
'use strict';

/* ---------- helpers ---------- */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const nameCase = n => String(n || '').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
const esc = s => String(s==null?'':s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ic = (n, c='') => `<svg class="ic ${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const initials = n => n.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
const AV = ['var(--primary-60)','var(--success-70)','var(--primary-80)','var(--secondary-90)','var(--info-80)','var(--error-80)','var(--primary-50)'];
const avColor = id => AV[[...String(id)].reduce((a,c)=>a+c.charCodeAt(0),0) % AV.length];
const pad = n => String(n).padStart(2,'0');
const fmtDate = d => `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
const isoDate = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const TODAY = new Date(2026, 9, 29);
const rupee = n => '₹' + Number(n).toLocaleString('en-IN');
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>t.classList.remove('show'),2400); }
const folder = () => `<svg class="art" viewBox="0 0 160 128" aria-hidden="true"><ellipse cx="80" cy="116" rx="52" ry="8" style="fill:var(--primary-60);opacity:.12"/><path d="M24 36a8 8 0 018-8h30l10 10h56a8 8 0 018 8v58a8 8 0 01-8 8H32a8 8 0 01-8-8z" style="fill:var(--primary-70)"/><rect x="38" y="30" width="84" height="46" rx="4" style="fill:var(--white)"/><rect x="46" y="38" width="44" height="4" rx="2" style="fill:var(--primary-10)"/><rect x="46" y="48" width="60" height="4" rx="2" style="fill:var(--neutral-20)"/><rect x="46" y="58" width="52" height="4" rx="2" style="fill:var(--neutral-20)"/><path d="M24 62a8 8 0 018-8h96a8 8 0 018 8v42a8 8 0 01-8 8H32a8 8 0 01-8-8z" style="fill:var(--primary-60)"/><path d="M24 78h112v26a8 8 0 01-8 8H32a8 8 0 01-8-8z" style="fill:var(--primary-70)"/></svg>`;
const empty = (t='No Data Found', d="There's nothing to show here yet. Try adjusting your filters or check back later.", brand=false) => `<div class="empty ${brand?'brandline':''}">${folder()}<b>${t}</b>${d?`<span>${d}</span>`:''}</div>`;

/* ---------- data (copied from the Doli_GYM dev program) ---------- */
const PROGRAM = { name:'Doli_GYM', type:'Fitness Center' };
const PACKAGES = [
  {id:'p1', name:'monthly', note:'one month', amount:800, days:30, label:'1 Month', product:'Gym Membership'},
  {id:'p2', name:'3 months', note:'90 days package', amount:2000, days:90, label:'3 Months', product:'Gym Membership'},
];
const members = [
  {id:'m1', name:'alisha jian', email:'', phone:'+918977665565', created:'15/10/2026', ts:20261015, status:'Active', waiver:'Pending', tags:[], source:'', age:null},
  {id:'m2', name:'test 22', email:'', phone:'+919078665435', created:'14/10/2026', ts:20261014, status:'Active', waiver:'Pending', tags:[], source:'', age:null},
  {id:'m3', name:'aashi j', email:'', phone:'+919855443344', created:'14/10/2026', ts:20261014, status:'Active', waiver:'Pending', tags:[], source:'', age:null},
  {id:'m4', name:'test sjjkhbn', email:'', phone:'+919087665432', created:'14/10/2026', ts:20261014, status:'Active', waiver:'Pending', tags:[], source:'', age:null},
  {id:'doli', name:'doli jha', email:'', phone:'+919876361267', created:'21/09/2026', ts:20260921, status:'Active', waiver:'Pending', tags:[], source:'Google', age:null, leadId:'#158920', manager:'Doli Jha', rich:true},
  {id:'m6', name:'john deo', email:'', phone:'+917734824196', created:'18/09/2026', ts:20260918, status:'Active', waiver:'Pending', tags:[], source:'', age:null},
  {id:'m7', name:'Janak Shekhawat', email:'avYojO@sarvika.com', phone:'2216839262', created:'18/09/2026', ts:20260918, status:'Inactive', waiver:'Pending', tags:[], source:'', age:null},
  {id:'m8', name:'Rishabh Goyal', email:'oHmMbq@sarvika.com', phone:'2219970184', created:'18/09/2026', ts:20260918, status:'Inactive', waiver:'Pending', tags:[], source:'', age:null},
  {id:'m9', name:'Abeer Bedi', email:'VpltEL@sarvika.com', phone:'2259222214', created:'18/09/2026', ts:20260918, status:'Inactive', waiver:'Pending', tags:[], source:'', age:null},
  {id:'m10', name:'Ravi Sharma', email:'ravi@sharam.com', phone:'+918384956086', created:'06/10/2023', ts:20231006, status:'Inactive', waiver:'Pending', tags:[], source:'', age:null},
];
// Timeline entries: cat is the filter chip, k picks the icon.
const ACTIVITY = [
  {t:'Member status updated', time:'27 Oct · 5:35 PM', d:'Member status was changed to Active.', by:'Doli Jha', cat:'Profile Updates', k:'msg-sq', tone:''},
  {t:'Membership renewal was marked as Not Interested.', time:'22 Oct · 5:07 PM', d:'Membership renewal was marked as Not Interested.', by:'Doli Jha', cat:'Follow-ups', k:'wallet', tone:'t'},
  {t:'Member status updated', time:'21 Oct · 5:46 AM', d:'Member status was changed to Inactive.', by:'System', cat:'Profile Updates', k:'msg-sq', tone:''},
  {t:'Follow-Up Scheduled', time:'19 Oct · 3:14 PM', d:'Call follow-up was scheduled for 19/10/2026, 15:30 and assigned to doli.jha.', by:'Doli Jha', cat:'Follow-ups', k:'users', tone:'o'},
  {t:'Member status updated', time:'30 Sept · 9:50 AM', d:'Member status was changed to Active.', by:'Doli Jha', cat:'Profile Updates', k:'msg-sq', tone:''},
  {t:'Member status updated', time:'28 Sept · 2:50 PM', d:'Member status was changed to Active.', by:'Rohitashav Garg', cat:'Profile Updates', k:'msg-sq', tone:''},
  {t:'Member status updated', time:'28 Sept · 2:50 PM', d:'Member status was changed to Inactive.', by:'Rohitashav Garg', cat:'Profile Updates', k:'msg-sq', tone:''},
];
const MEMBERSHIPS = [
  {id:'ms1', name:'monthly', status:'Expired', start:'Sep 21, 2026', amount:800, dur:'1 Month', paid:800, when:'Sep 21, 2026', end:'Oct 20, 2026', daysLeft:0},
  {id:'ms2', name:'3 months', status:'Active', start:'Oct 22, 2026', amount:2000, dur:'3 Months', paid:2000, when:'Oct 22, 2026', end:'Jan 20, 2027', daysLeft:83},
  {id:'ms3', name:'monthly', status:'Frozen', start:'Aug 18, 2026', freezes:[{start:'Oct 20, 2026', end:'Oct 21, 2026', created:'Oct 20, 2026 · 4:10 PM', by:'Rohitashav Garg', days:2}], amount:800, dur:'1 Month', paid:800, when:'Aug 18, 2026', end:'Nov 10, 2026', daysLeft:12},
  {id:'ms4', name:'3 months', status:'Suspended', start:'Jun 02, 2026', amount:2000, dur:'3 Months', paid:1000, when:'Jun 02, 2026', end:'Dec 08, 2026', daysLeft:40},
];
const FOLLOWUPS = [
  {type:'Call', tag:'Renewal', state:'Missed', when:'Oct 19, 2026 · 3:30 PM', by:'doli.jha', note:''},
  {type:'Call', tag:'', state:'Completed', when:'Sep 18, 2026 · 5:00 PM', by:'doli.jha', note:'test'},
];
const DEMO = {m1:['Female','12/03/1998',28], m2:['Male','05/08/2001',25], m3:['Female','21/11/1999',26], m4:['Male','30/01/1995',31], doli:['Female','17/06/1997',29], m6:['Male','02/02/1992',34], m7:['Male','14/09/1988',38], m8:['Male','09/12/1990',35], m9:['Male','25/04/1993',33], m10:['Male','19/10/1985',41]};
members.forEach(m => { m.name = nameCase(m.name); m.memberships = []; m.activity = []; const d = DEMO[m.id]; if (d) { m.gender = d[0]; m.dob = d[1]; m.age = d[2]; } });
const genderChip = g => g ? `<span class="gen ${g==='Male'?'m':'f'}"><i>${ic(g==='Male'?'mars':'venus','sm')}</i>${g}</span>` : '';
const doliMember = members.find(x => x.id === 'doli'); doliMember.memberships = MEMBERSHIPS; doliMember.activity = ACTIVITY;
const johnMember = members.find(x => x.id === 'm6'); johnMember.memberships = [{id:'ms5', name:'monthly', status:'Active', start:'Oct 19, 2026', amount:800, dur:'1 Month', paid:800, when:'Oct 19, 2026', end:'Nov 18, 2026', daysLeft:20, ready:true}];
const ALL_COLS = [
  {k:'name', l:'Members Name', fixed:true},{k:'phone', l:'Phone Number'},{k:'provider', l:'Provider'},
  {k:'tags', l:'Tags'},{k:'waiver', l:'Waiver Status'},{k:'created', l:'Created At'},{k:'status', l:'Status'},{k:'actions', l:'Actions', fixed:true},
];
const TOGGLE_COLS = ALL_COLS.filter(c=>!c.fixed);
const STATUSES = ['Active','Inactive'];

const state = {
  q:'', tile:'all', cols:new Set(ALL_COLS.map(c=>c.k)), sortDir:'desc', rows:20, page:1,
  filters:{tags:[], date:'', ageMin:18, ageMax:100},
  popup:null, collapsed:false,
};
const detail = { actFilter:'All', fuFilter:'All', memFilter:'All', payOpen:{}, tagOpen:false };

/* ---------- shell ---------- */
const NAV = [
  {g:'Overview', items:[{k:'dashboard', l:'Dashboard', i:'grid'}]},
  {g:'CRM', items:[
    {k:'leads', l:'Leads', i:'headset', dot:true},
    {k:'members', l:'Members', i:'users', dot:true},
    {k:'attendance', l:'Attendance', i:'fingerprint', dot:true},
    {k:'payments', l:'Payments', i:'card'},
    {k:'packages', l:'Membership Packages', i:'megaphone'}]},
  {g:'Compliance', items:[{k:'assignments', l:'Assignments', i:'check-sq'},{k:'waiver', l:'Waiver Forms', i:'file'}]},
  {g:'Reporting', items:[{k:'pt', l:'PT Reporting', i:'clipboard'},{k:'exports', l:'Exports', i:'export'}]},
  {g:'Settings', items:[{k:'staff', l:'Staff', i:'staff'},{k:'settings', l:'Program Settings', i:'settings', dot:true}]},
];

function renderSide(active){
  $('#side').innerHTML = `
    <div class="sbrand"><div class="logo"><i>YP</i><b>YourPal</b></div>
      <button class="sbtn" data-act="collapse" aria-label="Collapse sidebar">${ic('sidebar')}</button></div>
    <hr>
    <div class="sprog"><button class="sback" data-go="#/programs" aria-label="Go back to programs list">${ic('back')}</button>
      <div class="spn"><b>${esc(PROGRAM.name)}</b><span>${esc(PROGRAM.type)}</span></div>
      <button class="sswap" aria-label="Switch active program">${ic('updown','sm')}</button></div>
    <hr>
    <nav class="snav">${NAV.map(g=>`<div class="grp"><span>${g.g}</span>${ic('chev-u')}</div>${g.items.map(n=>`
      <button class="nav ${n.k===active?'on':''}" data-nav="${n.k}"><span class="tile">${ic(n.i)}${n.dot?'<i class="dot"></i>':''}</span><span class="l">${n.l}</span></button>`).join('')}`).join('')}</nav>
    <div class="sfoot"><button class="nav" data-nav="account"><span class="tile">${ic('sliders')}</span><span class="l">Account & Settings</span></button></div>`;
}
function renderTop(crumbs){
  $('#top').innerHTML = `
    <button class="tbtn navbtn" data-act="navtoggle" aria-label="Open menu">${ic('crumb')}</button>
    <div class="crumb">${crumbs.map((c,i)=>{
      const lead = i===0 ? ic('crumb') : ic('chev-r');
      const txt = i<crumbs.length-1 ? `<a data-go="${c.href}">${esc(c.t)}</a>` : `<b>${esc(c.t)}</b>`;
      return `<span class="ci">${lead}${txt}</span>`; }).join('')}</div>
    <div class="gsearch">${ic('search','lg')}<input placeholder="Search programs by name, leads or members by name or number" aria-label="Search"></div>
    <div class="sp"></div>
    <button class="tbtn" aria-label="Setup wizard: 5 to set up">${ic('rocket')}<i></i></button>
    <span class="tdiv"></span>
    <div class="me" data-act="profile"><span class="av">R</span><b>Rohitashav Garg</b>${ic('chev-d')}
      ${state.popup==='profile'?`<div class="menu" style="right:0;top:48px" data-stop>
        <button class="mi">${ic('sliders')}Account & Settings</button><button class="mi">${ic('help')}Feedback</button>
        <hr class="mdiv">
        <div class="grp" style="height:24px;margin:0">Theme</div>
        <button class="mi">${ic('sun')}Light<span style="margin-left:auto;color:var(--brand)">${ic('check','sm')}</span></button>
        <button class="mi">${ic('moon')}Dark</button><button class="mi">${ic('monitor')}System</button>
        <hr class="mdiv">
        <button class="mi danger">${ic('logout')}Logout</button></div>`:''}</div>`;
}

/* ---------- reusable bits ---------- */
function stChip(m){
  const open = state.popup==='status:'+m.id;
  return `<span class="stsel"><button class="stbtn ${m.status.toLowerCase()}" data-status="${m.id}" aria-label="Change status, now ${m.status}"><span>${m.status}</span>${ic('chev-d')}</button>
    ${open?`<div class="menu" style="top:40px;left:0;min-width:128px" data-stop>${STATUSES.map(s=>`<button class="mi ${s===m.status?'sel2':''}" data-setstatus="${m.id}|${s}">${s}${s===m.status?`<span style="margin-left:auto">${ic('check','sm')}</span>`:''}</button>`).join('')}</div>`:''}</span>`;
}
/* Demo portraits from randomuser.me (made-up people, meant for mock-ups). The initial sits underneath and shows if a photo does not load. */
const PHOTOS = {m1:'women/44', m2:'men/32', m3:'women/68', m4:'men/46', doli:'women/65', m6:'men/75', m7:'men/12', m8:'men/52', m9:'men/22', m10:'men/85', l1:'women/26', l2:'women/33', l3:'women/12', l4:'women/54', l5:'women/8', l6:'men/64'};
const photoUrl = id => PHOTOS[id] ? 'https://randomuser.me/api/portraits/' + PHOTOS[id] + '.jpg' : '';
const photoImg = id => photoUrl(id) ? `<img class="pimg" src="${photoUrl(id)}" alt="" loading="lazy" onerror="this.remove()">` : '';
const personSub = (id, name, phone) => `<span class="psub"><span class="pav" style="background:${avColor(id)}">${esc(initials(name)[0])}${photoImg(id)}</span><span class="pt"><b>${esc(name)}</b><small>${esc(phoneFmt(phone))}</small></span></span>`;
const PROVIDERS = [{id:'pa', n:'Provider A', r:'Trainer', ph:'men/41'}, {id:'pb', n:'Neha Kapoor', r:'Dietitian', ph:'women/21'}, {id:'pc', n:'Karan Mehta', r:'Head Trainer', ph:'men/18'}, {id:'pd', n:'Sameer Qureshi', r:'Sales Manager', ph:'men/54'}];
PROVIDERS.forEach(p => { PHOTOS[p.id] = p.ph; });
const providerDd = m => dd('provsel', PROVIDERS.map(p => ({v:p.id, label:p.n, tag:p.r, av:avColor(p.id), img:photoUrl(p.id)})), {ph: m.provider ? 'Change' : 'Assign Provider'});
const phoneFmt = p => p.startsWith('+91') ? '+91 ' + p.slice(3) : p;
const btn = (cls, act, label, icon='', extra='') => `<button class="btn ${cls}" data-act="${act}" ${extra}>${icon?ic(icon):''}${label}</button>`;

/* ---------- members list ---------- */
function visibleMembers(){
  const q = state.q.trim().toLowerCase();
  const rows = members.filter(m => {
    if (state.tile==='active' && m.status!=='Active') return false;
    if (state.tile==='inactive' && m.status!=='Inactive') return false;
    if (q && !(m.name+' '+m.email+' '+m.phone).toLowerCase().includes(q)) return false;
    if (state.filters.tags.length && !state.filters.tags.every(t=>m.tags.includes(t))) return false;
    if (state.filters.date){ const [y,mo,d]=state.filters.date.split('-'); if (m.ts !== +(y+mo+d)) return false; }
    if (m.age!=null && (m.age<state.filters.ageMin || m.age>state.filters.ageMax)) return false;
    return true;
  });
  rows.sort((a,b)=> state.sortDir==='desc' ? b.ts-a.ts : a.ts-b.ts);
  const pin = rows.findIndex(m => m.id==='doli'); if (pin > 0) rows.unshift(rows.splice(pin, 1)[0]);   /* doli jha is the demo member, so it stays first */
  return rows;
}
function cell(m,k){
  switch(k){
    case 'name': return `<td><div class="mc"><span class="ava" style="background:${avColor(m.id)}">${esc(initials(m.name))}${photoImg(m.id)}</span><div class="nm"><a data-go="#/members/${m.id}">${esc(m.name)}</a><small>${m.email?esc(m.email):'—'}</small></div></div></td>`;
    case 'phone': return `<td>${esc(m.phone)}</td>`;
    case 'provider': return `<td><button class="chip s outlined brandtext act" data-act="assign" data-id="${m.id}">Assign Provider ${ic('plus')}</button></td>`;
    case 'tags': return `<td>${m.tags.length?m.tags.map(t=>`<span class="chip s outlined">${esc(t)}</span>`).join(' '):'<span class="chip s outlined">No Tags</span>'}</td>`;
    case 'waiver': return `<td><span class="chip s warning">${m.waiver}</span></td>`;
    case 'created': return `<td>${m.created}</td>`;
    case 'status': return `<td>${stChip(m)}</td>`;
    case 'actions': return `<td><div style="display:flex;gap:4px;align-items:center;position:relative">
      <button class="iconbtn" style="border:0" data-go="#/members/${m.id}" aria-label="View details for ${esc(m.name)}">${ic('eye','sm')}</button>
      <button class="iconbtn" style="border:0" data-menu="${m.id}" aria-label="More actions for ${esc(m.name)}">${ic('more','sm')}</button>
      ${state.popup==='menu:'+m.id?`<div class="menu" style="right:0;top:40px" data-stop><button class="mi" data-act="notes" data-id="${m.id}">${ic('note')}Notes</button><button class="mi" data-act="transfer" data-id="${m.id}">${ic('swap')}Transfer Program</button></div>`:''}</div></td>`;
  }
}
function viewMembers(){
  const rows = visibleMembers();
  const total = members.length, act = members.filter(m=>m.status==='Active').length, ina = total-act;
  const per = state.rows, pages = Math.max(1, Math.ceil(rows.length/per)); if (state.page>pages) state.page=pages;
  const slice = rows.slice((state.page-1)*per, state.page*per);
  const cols = ALL_COLS.filter(c=>state.cols.has(c.k));
  const nF = state.filters.tags.length + (state.filters.date?1:0) + ((state.filters.ageMin!==18||state.filters.ageMax!==100)?1:0);
  return `
  <div class="ph"><div class="tt"><h1 class="t-h2">Members</h1><p>Manage and track your Members</p></div>
    <div class="acts">
      ${btn('outline inherit l sqr','allmembers','Click here for all Yourpal Members')}
      <div class="tools" role="group" aria-label="Member data" style="position:relative">
        <button class="iconbtn l grey" data-act="import" aria-label="Import" title="Import members">${ic('file-in')}</button>
        <button class="iconbtn l" data-act="pagemenu" aria-label="More">${ic('more')}</button>
        ${state.popup==='page'?`<div class="menu" style="right:0;top:48px" data-stop><button class="mi" data-act="importhistory">${ic('history')}Import History</button></div>`:''}
      </div>
      <span class="vsep acts-sep"></span>
      ${btn('filled primary l sqr','add','Add Members','plus')}
    </div></div>
  <div class="tiles">
    <button class="tile2 ${state.tile==='all'?'on':''}" data-tile="all"><div class="h"><span class="ib b">${ic('users','sm')}</span>Total Members<span class="info">${ic('info','sm')}</span></div><div class="n">${total}</div></button>
    <button class="tile2 ${state.tile==='active'?'on':''}" data-tile="active"><div class="h"><span class="ib g">${ic('check-c','sm')}</span>Active Members<span class="info">${ic('info','sm')}</span></div><div class="n">${act}</div></button>
    <button class="tile2 ${state.tile==='inactive'?'on':''}" data-tile="inactive"><div class="h"><span class="ib n">${ic('clock','sm')}</span>Inactive Members<span class="info">${ic('info','sm')}</span></div><div class="n">${ina}</div></button>
  </div>
  <div class="bar">
    <div class="sbox">${ic('search','sm')}<input id="q" placeholder="Search Members by name, email or phone number" value="${esc(state.q)}" aria-label="Search members">${ic('help','sm')}</div>
    <div class="sp"></div>
    <button class="btn outline inherit l" data-act="filters">${ic('filter')}Filters${nF?` <span class="chip xs primary" style="background:var(--brand-10);color:var(--brand)">${nF}</span>`:''}</button>
    <button class="btn outline inherit l" data-act="columns">${ic('columns')}Columns</button>
    ${state.popup==='filters'?filtersPop():''}
  </div>
  <div class="tbl"><div class="tw"><table><thead><tr>${cols.map(c=>c.k==='created'
      ? `<th class="sort" data-sort>${c.l}<span class="sa">${ic(state.sortDir==='desc'?'chev-d':'chev-u','sm')}</span></th>`
      : `<th>${c.l}</th>`).join('')}</tr></thead>
    <tbody>${slice.length?slice.map(m=>`<tr>${cols.map(c=>cell(m,c.k)).join('')}</tr>`).join(''):`<tr><td colspan="${cols.length}" style="height:auto">${empty()}</td></tr>`}</tbody></table></div>
    <div class="pager"><span>Showing ${rows.length?(state.page-1)*per+1:0}–${Math.min(state.page*per,rows.length)} of ${rows.length}</span><div class="sp"></div>
      <div class="pg">${Array.from({length:pages},(_,i)=>`<button class="${i+1===state.page?'on':''}" data-page="${i+1}">${i+1}</button>`).join('')}</div>
      <span>Rows per page</span><select id="rpp">${[10,20,50].map(n=>`<option ${n===per?'selected':''}>${n}</option>`).join('')}</select></div></div>`;
}
function filtersPop(){
  const f=state.filters;
  return `<div class="pop" data-stop><h4>Filters<button class="iconbtn" data-act="closepop" style="border:0" aria-label="Close">${ic('x','sm')}</button></h4>
    <div class="field"><label>Tags</label><input class="input" id="ftag" placeholder="Type tag and press Enter"></div>
    <div class="chips" style="margin:8px 0 0">${['VIP','At-risk'].map(t=>`<span class="chip s selectable ${f.tags.includes(t)?'on':''}" data-ftag="${t}">${t}</span>`).join('')}</div>
    <div class="sec"><div class="field"><label>Created Date</label><input class="input" type="date" id="fdate" value="${esc(f.date)}"></div></div>
    <div class="sec"><div class="field"><label>Age Range</label></div>
      <div class="dual" id="dual"><span class="bub" id="bmin"></span><span class="bub" id="bmax"></span><span class="track"></span><span class="fill" id="dfill"></span>
        <input type="range" id="amin" min="18" max="100" value="${f.ageMin}" aria-label="Minimum age"><input type="range" id="amax" min="18" max="100" value="${f.ageMax}" aria-label="Maximum age"></div>
      <div class="rv"><span>18</span><span>100</span></div></div>
    <div class="foot">${btn('text inherit m','clearfilters','Clear All')}${btn('filled primary m','closepop','Apply')}</div></div>`;
}
function paintDual(){
  const lo=+$('#amin').value, hi=+$('#amax').value, p=v=>(v-18)/82*100, at=v=>`calc(${p(v)}% + ${8-p(v)*0.16}px)`;
  $('#bmin').textContent=lo; $('#bmax').textContent=hi;
  $('#bmin').style.left=at(lo); $('#bmax').style.left=at(hi);
  $('#dfill').style.left=at(lo); $('#dfill').style.right=`calc(100% - ${at(hi)})`;
}

/* ---------- notes page (row menu) ---------- */
function viewNotes(m){
  return `<div class="sub-side"><aside class="sub-nav">
      <button class="btn outline inherit s" data-go="#/members" style="justify-self:start">${ic('chev-l','sm')}Back to Members</button>
      <div class="who"><i>${esc(initials(m.name)[0])}</i>${esc(m.name)}</div><span class="chip s outlined" style="justify-self:start">N/A</span>
      <div class="gt">CLINICAL</div><button class="nav on"><span class="tile">${ic('note')}</span><span class="l">Notes</span></button>
      <div class="gt">REPORTS</div><button class="nav"><span class="tile">${ic('user')}</span><span class="l">Personal Details</span></button></aside>
    <section><div class="ph"><h1 class="t-h2">Notes</h1><div class="acts"><button class="btn filled primary m">Provider Notes${ic('chev-d','sm')}</button></div></div>
      <div class="card flush"><div style="display:flex;gap:12px;align-items:center;padding:16px;border-bottom:1px solid var(--neutral-10);flex-wrap:wrap">
        <div class="field" style="width:160px">${dd('ftype', [{v:'Type',label:'Type'}], {value:'Type'})}</div>
        <span class="lbl">Duration</span><input class="input" type="date" style="width:160px" aria-label="From"><input class="input" type="date" style="width:160px" aria-label="To">
        ${btn('filled primary l','toast:Filters applied','Apply Filters')}<button class="iconbtn l" aria-label="Clear filters">${ic('x')}</button></div>
        <div class="empty">${folder()}<b>No notes yet</b><span>Notes you add for this member will show here.</span><div style="margin-top:16px">${btn('filled primary l','toast:Opens the note editor in the live app','Add New Note','plus')}</div></div></div></section></div>`;
}

/* ---------- member detail ---------- */
const TABS = [['overview','Overview'],['profile','Profile'],['membership','Memberships'],['payment','Payments'],['providerhistory','Provider History'],['activity','Activity Timeline'],['followups','Follow-ups'],['attendance','Attendance'],['calllogs','Call Logs'],['waiver','Waiver']];

function feedItem(a){
  return `<div class="ti"><span class="tic ${a.tone}">${ic(a.k,'sm')}</span><div class="tc"><div class="th"><span class="tt">${esc(a.t)}</span><span class="tm">${ic('clock')}${a.time}</span></div>
    <div class="ds">${esc(a.d)}</div><span class="chip m outlined"><i class="av24">${esc(initials(a.by)[0])}</i>${esc(a.by)}</span></div></div>`;
}
function fuCard(x){
  return `<div class="fu"><div class="t"><span class="ib3">${ic('phone','sm')}</span><b class="t-m2">${x.type}</b>${x.tag?`<span class="chip xs outlined">${x.tag}</span>`:''}
      <span class="chip s ${x.state==='Missed'?'error':x.state==='Not Interested'?'neutral':'success'}" style="margin-left:auto">${ic(x.state==='Missed'?'alert-c':x.state==='Not Interested'?'x':'check-c')}${x.state}</span></div>
    ${x.note?`<div class="nt">${esc(x.note)}</div>`:''}<div class="meta">${ic('cal','sm')}${x.when}<span class="chip m outlined by"><i class="av24">${esc(initials(x.by)[0])}</i>${x.by}</span></div></div>`;
}
function tabOverview(m){
  const r = m.rich;
  const missed = r ? FOLLOWUPS.find(f=>f.state==='Missed') : null;
  const act = m.activity.slice(0,4);
  const kpi = (cls, icon, l, v, s) => `<div class="card kpi"><div class="l">${ic(icon,'sm')}${l}</div><div class="v">${v}${s?`<small>${s}</small>`:''}</div></div>`;
  return `
  <div class="kpis">
    ${kpi('b','card','Total Revenue', r?'₹800':'₹0', r?'Across 1 billed plan':'No billed plan')}
    ${kpi('o','cal-check','Follow-ups', r?'1':'0', r?'1 missed':'')}
    ${kpi('g','receipt','Outstanding Balance', 'No dues', r?'Across 1 billed plan':'')}
    ${kpi('r','cal','Days Left', '0', r?'of 30 days remaining on the active plan':'No active plan')}
  </div>
  <div class="grid2">
    <div class="stack">
      <div class="card"><div class="ch"><span class="hi">${ic('flag','sm')}</span><div><h3>Upcoming Follow Ups</h3><p>Next scheduled follow-ups</p></div><div class="r">${btn('outline inherit m rect','tab:followups','View follow-ups')}</div></div>
        ${missed?`${fuCard(missed)}<div class="alert error">${ic('info','sm')}<div><b>1 missed follow-ups.</b> A missed item never re-schedules itself — reopen it or close it out.</div></div>`:'<div class="muted t-b3">No follow-ups scheduled.</div>'}</div>
      <div class="card"><div class="ch"><div><h3>Recent activity</h3><p>Latest ${act.length} activites for the member</p></div><div class="r">${btn('outline inherit m rect','tab:activity','View timeline')}</div></div>
        ${act.length?`<div class="tl">${act.map(feedItem).join('')}</div>`:'<div class="muted t-b3">No activity yet.</div>'}</div>
    </div>
    <div class="stack">
      <div class="card tight"><div class="ch" style="margin-bottom:12px"><h3>Personal Details</h3><div class="r"><button class="iconbtn" style="border:0" data-act="tab:profile" aria-label="Open Profile tab">${ic('chev-r')}</button></div></div><div class="kv ov">
        <div class="r"><span>Phone</span><b>${esc(phoneFmt(m.phone))}</b></div>
        <div class="r"><span>Email</span><b>${m.email?esc(m.email):'N/A'}</b></div>
        <div class="r"><span>Assigned Provider</span><b>${m.provider?esc(m.provider):'Unassigned'}</b></div>
        <div class="r"><span>Experience Manager</span><b>${esc(m.manager||'N/A')}</b></div>
        <div class="r"><span>Lead Source</span><b>${esc(m.source||'N/A')}</b></div>
        <div class="r"><span>Lead ID</span><b>${esc(m.leadId||'N/A')} ${m.leadId?'<a>View</a>':''}</b></div></div></div>
      <div class="card tight"><div class="ch" style="margin-bottom:12px"><h3>Emergency Contact</h3></div><div class="row2" style="padding:0"><span class="sa2 av32">E</span><div class="rv2"><div class="val">N/A</div><div class="muted t-b3">N/A</div></div></div></div>
    </div>
  </div>`;
}
function tabProfile(m){
  const f = (l,v)=>`<div><div class="lbl">${l}</div><div class="val">${v||'N/A'}</div></div>`;
  const row = (icon,l,v,acts='')=>`<div class="row2"><span class="ric">${ic(icon,'sm')}</span><div class="rv2"><div class="lbl">${l}</div><div class="val">${v||'N/A'}</div></div>${acts?`<div class="ra">${acts}</div>`:''}</div>`;
  const edit = what => `<button class="iconbtn" data-act="editprofile" aria-label="Edit ${what}">${ic('pencil','sm')}</button>`;
  return `<div class="grid2"><div class="stack">
    <div class="card cd"><div class="chd"><h3>Basic Details</h3>${edit('basic details')}</div>
      <div class="cbd"><div class="fgrid2">${f('Full Name',esc(m.name))}${f('Date of Birth',m.dob||'')}<span class="div"></span>${f('Gender',m.gender||'')}${f('Age',m.age?m.age+' yrs':'NA yrs')}</div></div></div>
    <div class="card cd"><div class="chd"><h3>Contact Details</h3>${edit('contact details')}</div>
      <div class="cbd">${row('phone','Phone',esc(phoneFmt(m.phone)),`<button class="iconbtn" aria-label="Call">${ic('phone','sm')}</button><button class="iconbtn" aria-label="WhatsApp">${ic('msg','sm')}</button><button class="iconbtn" data-act="copy:${esc(m.phone)}" aria-label="Copy number">${ic('copy','sm')}</button>`)}
      ${row('mail','Email',esc(m.email))}${row('pin','Address','')}</div></div></div>
    <div class="stack">
      <div class="card cd"><div class="chd"><h3>Record</h3></div><div class="cbd"><div class="kv">
        <div class="r"><span>Lead Source</span><b>${esc(m.source||'N/A')}</b></div>
        <div class="r"><span>Lead ID</span><b>${esc(m.leadId||'N/A')} ${m.leadId?'<a>View</a>':''}</b></div>
        <div class="r"><span>Assigned Provider</span><b>${m.provider?esc(m.provider):'Unassigned'}</b></div>
        <div class="r"><span>Experience Manager</span><b>${esc(m.manager||'N/A')} <a data-act="toast:Opens the manager picker in the live app">Change</a></b></div></div></div></div>
      <div class="card cd"><div class="chd"><h3>Emergency contact</h3></div><div class="cbd"><div class="row2"><span class="sa2 av32">N</span><div class="rv2"><div class="val">N/A</div><div class="muted t-b3">N/A</div></div><div class="ra"><button class="iconbtn" disabled aria-label="Call emergency contact">${ic('phone','sm')}</button></div></div></div></div>
    </div></div>`;
}
function filterChips(list, cur, attr){ return list.map(c=>`<button class="chip m selectable ${cur===c?'on':''}" ${attr}="${c}">${c}</button>`).join(''); }
const payRow = (ms) => `<div class="pay"><span class="ib3">${ic('check','sm')}</span><div><div class="t-m2"><b>${ms&&ms.payLabel?ms.payLabel:'Initial Payment'}</b> <span class="chip xs success">Paid</span></div><div class="muted t-b3">Paid ${ms?ms.when:'Sep 21, 2026'}${ms&&ms.payMode?(ms.payMethod&&ms.payMethod!=='Online'?' · '+ms.payMethod.toLowerCase():''):' · phonepe'}</div><div class="muted t-b3">Mode: ${ms&&ms.payMode?ms.payMode.toLowerCase():'online'}</div></div><span class="amt">${rupee(ms?ms.paid:800)}</span><button class="iconbtn" data-act="toast:Opens the payment receipt in the live app" aria-label="View receipt">${ic('eye','sm')}</button></div>`;
const nrChip = ms => `<span class="nrchip" title="${esc(ms.noRenew.note||ms.noRenew.reason)}"><span class="nra">${ic('cal-x','sm')}Not interested</span><span class="nrr">${esc(ms.noRenew.reason)}</span></span>`;
const msTotal = ms => { const n = parseInt(ms.dur) || 0; return /day/i.test(ms.dur) ? n : /year/i.test(ms.dur) ? n*365 : n*30; };
const msBalance = ms => ms.settled ? 0 : Math.max(0, ms.amount - (ms.paid||0));
const MS_CHIP = {Expired:'chip s error', Active:'chip s success', Frozen:'chip s info', Suspended:'chip s warning', Transferred:'chip s primary'};
function membershipCard(ms){
  const open = state.popup==='memmenu:'+ms.id, paying = !!detail.payOpen[ms.id];
  const hasPay = ms.paid!=null, locked = ms.status==='Transferred';
  const nrNote = ms.noRenew && ms.noRenew.note ? `Reason: ${esc(ms.noRenew.note)}` : '';
  const note = nrNote ? nrNote : ms.to ? `Transferred to <a data-go="#/members/${ms.toId}?tab=membership">${esc(ms.to)}</a> on ${ms.on}`
             : ms.from ? `Transferred from <a data-go="#/members/${ms.fromId}?tab=membership">${esc(ms.from)}</a>, ${ms.daysLeft} days left` : '';
  const eligible = ms.status==='Active' && !ms.to && !ms.from;
  const nrItem = !canRenewFlag(ms) ? '' : ms.noRenew ? `<button class="mi" data-act="reopenrenew:${ms.id}">${ic('refresh')}Reopen renewal</button>` : `<button class="mi" data-act="norenew:${ms.id}">${ic('cal-x')}Mark not interested in renewal</button>`;
  const live = ms.status==='Active' || ms.status==='Frozen', total = msTotal(ms), pct = total ? Math.min(100, Math.round(ms.daysLeft/total*100)) : 0;
  const frz = ms.freezes || [], frzOpen = !!(detail.frzOpen||{})[ms.id], paused = frz.reduce((a,x)=>a+x.days,0);
  const freezeBtn = ms.status==='Active' && !locked ? btn('outline inherit m','freeze:'+ms.id,'Freeze','snowflake', ms.ready?'disabled title="Remove it from the transfer list before freezing"':'') : '';
  const readyItem = !eligible ? ''
    : ms.ready ? `<button class="mi" data-act="unready:${ms.id}">${ic('x')}Remove from transfer list</button>`
    : isPaid(ms) ? `<button class="mi" data-act="markready:${ms.id}">${ic('swap')}Mark ready for transfer</button>`
    : `<button class="mi" disabled>${ic('swap')}Mark ready for transfer</button><div class="mhint">Only fully paid memberships can be transferred.</div>`;
  const menu = open && !locked ? `<div class="menu" style="right:0;top:40px" data-stop><button class="mi" data-act="toast:Opens the invoice preview in the live app">${ic('eye')}Preview Invoice</button><button class="mi" data-act="toast:Downloads the invoice PDF in the live app">${ic('download')}Download Invoice</button><hr class="mdiv"><button class="mi" data-act="editstart">${ic('cal')}Edit Start Date</button>${(readyItem||nrItem)?`<hr class="mdiv">${readyItem}${nrItem}`:''}</div>` : '';
  return `<div class="mcard ${locked?'locked':''}"><div class="mrow"><span class="mtile">${ic('id-card','lg')}</span>
      <div class="mid"><div class="mt"><b>${ms.name}</b><span class="${MS_CHIP[ms.status]}"><i class="dot"></i>${ms.status}</span>${ms.ready?`<span class="chip s info">Ready for transfer</span>`:''}${ms.noRenew?nrChip(ms):''}</div><div class="ma"><span class="sx amt">${ic('wallet','sm')}<b>${rupee(ms.amount)}</b></span><span class="vsep"></span><span class="sx dur">${ic('clock','sm')}${ms.dur}</span></div>${note?`<div class="mnote">${note}</div>`:''}</div>
      <div class="mact">${ms.status==='Expired'?btn('outline inherit m','renew','Renew Membership','refresh'):''}${freezeBtn}${btn('outline inherit m','invoice','Invoice','receipt-text',locked?'disabled':'')}<button class="iconbtn sq" data-act="memmenu:${ms.id}" aria-label="More membership actions" ${locked?'disabled':''}>${ic('more','sm')}</button>
        ${menu}</div></div>
    <div class="mstrip"><div><small>Start Date</small><b>${ms.start||'—'}</b></div><div><small>Ends On</small><b>${ms.end}</b></div><div><small>Outstanding Balance</small><b>${rupee(msBalance(ms))}</b></div></div>
    ${live?`<div class="mdays"><span>${ms.daysLeft} of ${total} days left</span><b>${pct}%</b></div><div class="bar2 mbar"><i style="width:${pct}%"></i></div>`:''}
    <button class="phist" data-act="togglepay:${ms.id}" aria-expanded="${paying}"><span>${ic(paying?'chev-d':'chev-r')}Payment history (${hasPay?1:0})</span><b>${hasPay?'Paid '+rupee(ms.paid):'No payments'}</b></button>
    ${paying?`<div class="pbody">${hasPay?payRow(ms):`<div class="muted t-b3">Payment history stays with ${esc(ms.from||ms.to||'the original member')}.</div>`}</div>`:''}
    ${frz.length?`<button class="phist" data-act="togglefrz:${ms.id}" aria-expanded="${frzOpen}"><span>${ic(frzOpen?'chev-d':'chev-r')}Freeze history (${frz.length})</span><b>${paused} days paused total</b></button>
    ${frzOpen?`<div class="pbody"><div class="ftw"><table class="ft"><thead><tr><th>Start Date</th><th>End Date</th><th>Created At</th><th>Created By</th></tr></thead><tbody>${frz.map(x=>`<tr><td>${x.start}</td><td>${x.end}</td><td>${x.created}</td><td>${esc(x.by)}</td></tr>`).join('')}</tbody></table></div></div>`:''}`:''}</div>`;
}
function tabMembership(m){
  const list = m.memberships.filter(x=>detail.memFilter==='All'||x.status===detail.memFilter);
  return `<div class="chips">${filterChips(['All','Active','Frozen','Suspended','Expired','Transferred'],detail.memFilter,'data-memf')}<span class="sp"></span>${btn('filled primary l rect','addmembership','Add Membership','plus')}</div>
  ${list.length?`<div class="stack">${list.map(membershipCard).join('')}</div>`:`<div class="card">${empty('No memberships','There are no memberships for this filter.')}</div>`}`;
}
function tabPayment(m){
  if(!m.rich) return `<div class="card">${empty('No payments','This member has no billed plan yet.')}</div>`;
  return `<div style="display:flex;align-items:flex-end;gap:12px;margin-bottom:16px"><div class="field" style="width:240px"><label>Select Package</label>${dd('pkgsel', [{v:'m',label:'monthly · 21 Sep 2026'}], {value:'m'})}</div><span class="sp"></span><button class="iconbtn l" data-act="memmenu2" aria-label="More">${ic('more')}</button></div>
  <div class="grid2 even" style="margin-bottom:16px"><div class="card tight"><div class="lbl">Plan Total</div><div class="t-h2" style="margin-top:8px">₹800</div><div class="muted t-b3">monthly</div></div><div class="card tight"><div class="lbl">Paid</div><div class="t-h2" style="margin-top:8px;color:var(--success-80)">₹800</div><div class="muted t-b3">100% collected</div></div></div>
  <div class="card tight" style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;margin-bottom:8px"><b class="t-m3">Payment progress</b><b class="t-m3" style="color:var(--success-80)">100% Paid</b></div><div class="bar2"><i style="width:100%"></i></div><div class="muted t-b3" style="margin-top:8px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--success-60);margin-right:8px"></span>Paid ₹800</div></div>
  ${payRow()}`;
}
function tabActivity(m){
  const items = m.activity.filter(a=>detail.actFilter==='All'||a.cat===detail.actFilter);
  return `<div class="card"><div class="chips">${filterChips(['All','Payments','Tags','Follow-ups','Profile Updates','Freeze'],detail.actFilter,'data-actf')}</div>
    ${items.length?`<div class="tl">${items.map(feedItem).join('')}</div>`:empty()}</div>`;
}
function tabFollowups(m){
  const items = (m.rich?FOLLOWUPS:[]).filter(x=>detail.fuFilter==='All'||x.type===detail.fuFilter);
  return `<div class="card"><div class="chips">${filterChips(['All','Call','Email','Whatsapp','Meeting','Other'],detail.fuFilter,'data-fuf')}<span class="sp"></span>${btn('outline primary l','schedulefu','Schedule Follow-Up','plus')}</div>
    ${items.length?`<div class="stack">${items.map(fuCard).join('')}</div>`:empty()}</div>`;
}
function tabAttendance(){
  const k = (cls,icon,l,v,s)=>`<div class="card tight stat"><span class="sic ${cls}">${ic(icon)}</span><div><div class="l">${l}</div><div class="v">${v}</div><div class="s">${s}</div></div></div>`;
  return `<div class="kpis">${k('b','cal','Last Visit','—','—')}${k('g','user-check','Current Activity Status','<span class="chip s error" style="font-size:13px">Missing</span>','not visited for more than 30 days, or never visited')}${k('i','chart-col','Total Visits','0','All time')}${k('o','activity','Visits This Month','0','Oct 2026')}</div>
  <div class="card"><div class="chips">${['All','Checked out','Checked In','Auto checkout'].map((c,i)=>`<span class="chip m selectable ${i?'':'on'}">${c}</span>`).join('')}<span class="sp"></span>${['7 days','30 days','All time'].map((c,i)=>`<span class="chip m selectable ${i===2?'on':''}">${c}</span>`).join('')}<button class="iconbtn" aria-label="Pick dates">${ic('cal','sm')}</button></div>${empty('No data found')}</div>`;
}
function tabWaiver(){
  return `<div class="wbanner"><span class="bic">${ic('clock')}</span><b>Waiting for the user</b><span class="sp"></span><button class="iconbtn l rnd2" aria-label="Refresh waiver status" data-act="toast:Waiver status refreshed">${ic('refresh','sm')}</button></div>
    <div class="card tight" style="padding:20px"><h3 class="t-h3-x">Upload Offline</h3><div class="muted" style="font:var(--w-regular) 14px/20px var(--font);margin:4px 0 16px">Already have a signed copy? Upload it to mark this waiver complete.</div>
    <div class="drop up"><span class="dic big">${ic('cloud-up','lg')}</span><b>Drag & drop signed document</b><span class="t-b3">PDF, JPG or PNG · max 10MB</span><div style="margin-top:16px">${btn('outline inherit m','toast:Opens the file picker in the live app','Choose File')}</div></div></div>`;
}
function viewDetail(m, tab){
  const body = {overview:tabOverview, profile:tabProfile, membership:tabMembership, payment:tabPayment, providerhistory:()=>`<div class="card">${empty('No data found','',true)}</div>`, activity:tabActivity, followups:tabFollowups, attendance:tabAttendance, calllogs:()=>`<div class="card">${empty()}</div>`, waiver:tabWaiver}[tab](m);
  return `<div class="mh"><div class="pic">${esc(initials(m.name))}${photoImg(m.id)}</div>
    <div class="in">
      <div class="r1"><h1>${esc(m.name)}</h1>${stChip(m)}
        ${detail.tagOpen?`<input class="taginput" id="taginput" placeholder="Type tag and press Enter" aria-label="New tag">`:`<button class="tagbtn" data-act="addtag">${ic('plus')}Add Tag</button>`}${m.tags.map(t=>`<span class="chip s outlined">${esc(t)}</span>`).join('')}</div>
      <div class="r2"><span class="age">${m.gender?`${genderChip(m.gender)}<i>|</i>`:''}<span>${m.age?m.age:'NA'} yrs</span><i>|</i></span><span class="prov"><span class="q">${ic('user')}</span>${m.provider?esc(m.provider):'Unassigned'}<span class="provdd">${providerDd(m)}</span></span></div></div>
    <div class="ac"><button class="iconbtn l" aria-label="Call">${ic('phone')}</button><button class="iconbtn l" aria-label="Email" ${m.email?'':'disabled'}>${ic('mail')}</button><button class="iconbtn l" aria-label="WhatsApp">${ic('msg')}</button><button class="iconbtn l" data-act="memmenu3" aria-label="More options">${ic('more')}</button>
      ${state.popup==='hdrmenu'?`<div class="menu" style="right:0;top:48px" data-stop><button class="mi" data-act="biometric">${ic('fingerprint')}Map Biometric Code</button><button class="mi" data-act="editprofile">${ic('pencil')}Edit Profile</button></div>`:''}</div></div>
  <div class="tabsw"><button class="tarr" aria-label="Scroll tabs left" data-scroll="-1">${ic('chev-l')}</button>
    <div class="tabs" id="tabs" role="tablist">${TABS.map(([k,l])=>`<button class="tab ${k===tab?'on':''}" role="tab" data-tab="${k}">${l}</button>`).join('')}</div>
    <button class="tarr" aria-label="Scroll tabs right" data-scroll="1">${ic('chev-r')}</button></div>
  ${body}`;
}

/* ---------- dropdown ----------
   Replaces the native select. Rows can carry an avatar tile, a name, a chip and a small line, as in the live Assign list. */
function dd(id, opts, o = {}){
  const cur = opts.find(x => String(x.v) === String(o.value == null ? '' : o.value));
  const av = (x, full) => x.av ? `<span class="ddav" style="background:${x.av}">${esc(full ? initials(x.label) : initials(x.label)[0])}${x.img?`<img class="pimg" src="${esc(x.img)}" alt="" onerror="this.remove()">`:''}</span>` : '';
  const face = cur ? `${av(cur)}<span class="ddv">${esc(cur.label)}</span>` : `<span class="ddv ddph">${esc(o.ph||'Select')}</span>`;
  const rows = opts.map(x => `<button type="button" class="ddo ${cur&&x.v===cur.v?'on':''}" role="option" data-ddo="${esc(x.v)}">${av(x, true)}<span class="ddx"><b>${esc(x.label)}</b>${x.tag||x.sub?`<span class="ddmeta">${x.tag?`<span class="chip xs primary">${esc(x.tag)}</span>`:''}${x.sub?`<small>${esc(x.sub)}</small>`:''}</span>`:''}</span>${cur&&x.v===cur.v?`<span class="ddck">${ic('check','sm')}</span>`:''}</button>`).join('');
  return `<div class="dd"><input type="hidden" id="${id}" value="${esc(o.value==null?'':o.value)}"><button type="button" class="ddt ${o.err?'err':''}" data-ddt aria-haspopup="listbox" aria-expanded="false">${face}${ic('chev-d','sm')}</button><div class="ddp" role="listbox">${rows}</div></div>`;
}
const PAY_METHODS = ['Cash','UPI','Card','Bank transfer'];
const payMode = p => p==='m' ? mem.payMode : p==='cv' ? cv.payMode : xf.payMode;
function payAmt(p){
  if (p==='xf') return +xf.fee || 0;
  const k = p==='m' ? PACKAGES.find(x=>x.id===mem.pkg) : LEAD_PKGS.find(x=>x.id===cv.pkg);
  return k ? Math.round(k[p==='m'?'amount':'price']*(1-(p==='m'?mem.applied:cv.applied)/100)) : 0;
}
/* Offline: the money was taken at the desk, so ask for the date and the method. Online: the member pays through the gateway. */
function payBody(p){
  const mode = payMode(p), amt = payAmt(p);
  const tgl = (m, icon) => `<button type="button" class="${mode===m?'on':''}" data-paymode="${p}|${m}">${ic(icon,'sm')}${m}</button>`;
  const modeField = `<div class="field"><label>Mode of Payment <i>*</i></label><div class="radio">${tgl('Offline','receipt')}${tgl('Online','phone')}</div></div>`;
  const top = mode==='Offline'
    ? `<div class="g2">${modeField}<div class="field"><label for="${p}-pdate">Payment Date <i>*</i></label><input class="input" type="date" id="${p}-pdate" value="${isoDate(TODAY)}"></div></div>`
    : `${modeField}<p class="payhint">${ic('info','sm')}<span>${amt?`The member pays <b>${rupee(amt)}</b> through the payment gateway.`:'The member pays through the payment gateway.'} It is recorded when the payment succeeds.</span></p>`;
  const gst = `<div class="field"><label for="${p}-gst">GST Number</label><input class="input" id="${p}-gst" placeholder="22AAAAA0000A1Z5"></div>`;
  const bill = `<div class="field"><label for="${p}-bill">Billing Address</label><textarea class="input" id="${p}-bill" placeholder="Enter billing address"></textarea></div>`;
  const method = `<div class="field"><label>Payment Method <i>*</i></label>${dd(p+'-method', PAY_METHODS.map(x=>({v:x,label:x})), {value:'Cash'})}</div>`;
  return `${top}
    ${mode==='Offline'?`<div class="g2">${method}${gst}</div>${bill}`:`${gst}${bill}`}`;
}
const payRender = p => { const b = $('#'+p+'paybox'); if (b) b.innerHTML = payBody(p); };
const payRefresh = p => { if (payMode(p)==='Online') payRender(p); };
const payRead = p => ({ date: $('#'+p+'-pdate') && $('#'+p+'-pdate').value ? new Date($('#'+p+'-pdate').value) : TODAY, method: payMode(p)==='Online' ? 'Online' : ($('#'+p+'-method') ? $('#'+p+'-method').value : 'Cash') });
const closeDds = () => $$('.dd.open').forEach(d => { d.classList.remove('open'); d.querySelector('[data-ddt]').setAttribute('aria-expanded','false'); });
function ddPick(o){
  const d = o.closest('.dd'), inp = d.querySelector('input'), t = d.querySelector('[data-ddt]');
  inp.value = o.dataset.ddo;
  $$('.ddo', d).forEach(b => { b.classList.toggle('on', b===o); const k = b.querySelector('.ddck'); if (k) k.remove(); });
  o.insertAdjacentHTML('beforeend', `<span class="ddck">${ic('check','sm')}</span>`);
  const a = o.querySelector('.ddav');
  const im = o.querySelector('.pimg');
  t.innerHTML = `${a?`<span class="ddav" style="${a.getAttribute('style')}">${esc(a.textContent[0])}${im?im.outerHTML:''}</span>`:''}<span class="ddv">${esc(o.querySelector('b').textContent)}</span>${ic('chev-d','sm')}`;
  t.classList.remove('err'); closeDds();
  inp.dispatchEvent(new Event('change', {bubbles:true}));
}

/* ---------- overlays ---------- */
const layer = () => $('#layer');
function openLayer(html){ layer().innerHTML = html; }
function closeLayer(){ layer().innerHTML=''; }
const modal = (title, sub, body, foot, wide, icon) => icon
  ? `<div class="scrim" data-scrim><div class="modal rf ${wide?'w560':''}" role="dialog" aria-label="${esc(title)}" data-stop>
  <div class="rfh"><span class="rfi">${ic(icon)}</span><button class="iconbtn" style="border:0" data-act="closelayer" aria-label="Close">${ic('x','sm')}</button></div>
  <h3 class="rft">${esc(title)}</h3>${sub?`<div class="rfs">${sub}</div>`:''}
  <div class="rfb">${body}</div><div class="rff">${foot}</div></div></div>`
  : `<div class="scrim" data-scrim><div class="modal ${wide?'w560':''}" role="dialog" aria-label="${esc(title)}" data-stop>
  <div class="mh2"><div style="flex:1"><h3>${esc(title)}</h3>${sub?`<div class="sub">${sub}</div>`:''}</div><button class="iconbtn" style="border:0" data-act="closelayer" aria-label="Close">${ic('x','sm')}</button></div>
  <div class="mb">${body}</div><div class="mf">${foot}</div></div></div>`;
const drawerShell = (title, sub, body, foot, kind) => `<div class="scrim right ${kind==='side'?'flush':''}" data-scrim><div class="drawer ${kind==='side'?'side':'float'}" role="dialog" aria-label="${esc(title)}" data-stop>
  <div class="dh">${kind==='side'?'':`<span class="ib2">${ic('user-plus','sm')}</span>`}<div style="flex:1"><h3>${esc(title)}</h3>${sub?`<span class="sub">${sub}</span>`:''}</div><button class="iconbtn rnd" data-act="closelayer" aria-label="Close">${ic('x')}</button></div>
  <div class="db">${body}</div><div class="df">${foot.split(cancel).join(btn('text inherit m','closelayer','Cancel'))}</div></div></div>`;
const modalRaw = (cls, label, inner) => `<div class="scrim" data-scrim><div class="modal ${cls}" role="dialog" aria-label="${esc(label)}" data-stop>${inner}</div></div>`;
const cancel = btn('outline inherit m','closelayer','Cancel');
/* Confirmation popup: soft icon circle, centred title and one line, then Cancel and the action side by side. */
const confirmModal = o => modalRaw('cfm', o.title, `<button class="iconbtn cfx" data-act="closelayer" aria-label="Close">${ic('x')}</button><div class="cfb"><span class="cfi ${o.tone||''}">${ic(o.icon,'lg')}</span><h3>${esc(o.title)}</h3><p>${o.text}</p>${o.extra||''}</div><div class="cff">${cancel}${btn('filled primary l',o.act,o.ok)}</div>`);

function memberForm(errs={}, v={}){
  const f=(id,l,req,ph,type='text')=>`<div class="field"><label for="a-${id}">${l}${req?' <i>*</i>':''}</label><input class="input ${errs[id]?'err':''}" id="a-${id}" type="${type}" placeholder="${ph}" value="${esc(v[id]||'')}">${errs[id]?`<span class="err-text">${errs[id]}</span>`:''}</div>`;
  const tel=(id,l,req)=>`<div class="field"><label for="a-${id}">${l}${req?' <i>*</i>':''}</label><div class="pfxwrap"><span class="pfx">+91${ic('chev-d','sm')}</span><input class="input ${errs[id]?'err':''}" id="a-${id}" type="tel" placeholder="Enter phone number" value="${esc(v[id]||'')}"></div>${errs[id]?`<span class="err-text">${errs[id]}</span>`:''}</div>`;
  const sel=(id,l,req,opts)=>`<div class="field"><label>${l}${req?' <i>*</i>':''}</label>${dd('a-'+id, opts.map(o=>({v:o,label:o})), {value:v[id], ph:'Select '+l.toLowerCase(), err:errs[id]})}${errs[id]?`<span class="err-text">${errs[id]}</span>`:''}</div>`;
  return `
    <div class="sect">Basic Information</div>
    <div class="field"><label>Profile Image</label><div class="avup"><span class="big">${ic('user','lg')}</span><div>${btn('outline primary s','toast:Opens the image picker in the live app','Upload Image')}<div class="t-b3 muted" style="margin-top:4px">Max 5 MB. Image files only (Optional).</div></div></div></div>
    <div class="g2" style="margin-top:16px">${f('first','First Name',1,'Enter first name')}${f('last','Last Name',1,'Enter last name')}
      ${tel('phone','Phone Number',1)}${f('email','Email',0,'eg: patient@example.com','email')}
      ${sel('gender','Gender',1,['Male','Female','Other'])}${f('age','Age',1,'Age','number')}${f('dob','DOB',1,'','date')}</div>
    <div class="sect">Address Details</div>
    <div class="g2">${f('a1','Address Line 1',0,'Enter address line 1')}${f('a2','Address Line 2 (Optional)',0,'Enter address line 2')}${f('pin','Pin Code',0,'Enter Pin Code')}
      ${sel('country','Country',1,['India','United Arab Emirates','United States'])}${sel('state','State',1,['Rajasthan','Delhi','Maharashtra'])}${f('city','City',1,'Enter City')}</div>
    <div class="sect">Engagement</div>
    <div class="g2">${sel('interest','Interest',0,['Weight loss','Strength','Fitness'])}<div class="field"><label for="a-tags">Tags</label><input class="input" id="a-tags" placeholder="Type tag and press Enter" value="${esc(v.tags||'')}"><span class="t-b3 muted">0/5 tags</span></div>${f('source','Source',0,'eg: Referral, Walk-in, Website')}</div>
    <div class="sect">Health and Emergency</div>
    <div class="g2">${f('ec','Emergency Contact',0,'Enter Name')}${tel('ecp','Emergency Contact Number',0)}</div>`;
}
function drawerAdd(errs={}, v={}){ openLayer(drawerShell('Add New Members','',memberForm(errs,v), cancel+btn('filled primary m','submitadd','Submit'), 'float')); }
function drawerEdit(m){
  const [first,...rest]=m.name.split(' ');
  openLayer(drawerShell('Update Member Profile','',memberForm({},{first,last:rest.join(' '),phone:m.phone.replace(/^\+91/,''),email:m.email,source:m.source}), cancel+btn('filled primary m','updateprofile','Update'), 'float'));
}
function modalImport(){
  openLayer(modalRaw('imp','Member Data Import', `
    <div class="mh2"><div style="flex:1"><h3>Member Data Import</h3><div class="sub">Upload Excel file with Members, Payments, and Membership Package tabs up to 10MB</div></div><button class="iconbtn rnd" data-act="closelayer" aria-label="Close">${ic('x')}</button></div>
    <div class="mb"><div class="drop"><span class="dic">${ic('cloud-up','lg')}</span><b>Drag & drop your file here</b><span class="t-b3">or <a>browse</a> to choose a file</span></div>
      <div class="t-b3 muted" style="text-align:center">Not sure about the format? <a style="color:var(--primary-60);font-weight:600;cursor:pointer" data-act="toast:Downloads the sample file in the live app">${ic('download','sm')} Download sample file</a></div></div>
    <div class="mf split">${cancel}${btn('filled primary m','x','Import','','disabled')}</div>`));
}
function modalColumns(){
  const all = TOGGLE_COLS.every(c=>state.cols.has(c.k));
  openLayer(modalRaw('cols','Columns', `
    <div class="mh2 slim"><h3 style="flex:1">Columns</h3><button class="iconbtn rnd" data-act="closelayer" aria-label="Close">${ic('x')}</button></div>
    <div class="swlist"><div class="swrow head"><span class="l">Select All</span><button class="switch ${all?'on':''}" role="switch" aria-checked="${all}" aria-label="Select all columns" data-colall></button></div>
     ${TOGGLE_COLS.map(c=>`<div class="swrow"><span class="grip">${ic('grip','sm')}</span><span class="l">${c.l}</span><button class="switch ${state.cols.has(c.k)?'on':''}" role="switch" aria-checked="${state.cols.has(c.k)}" aria-label="${c.l}" data-col="${c.k}"></button></div>`).join('')}</div>`));
}
function modalAssign(id){
  const m = members.find(x=>x.id===id) || members[0];
  const providers = m.rich ? [] : [{n:'Provider A', r:'Trainer'}];
  openLayer(modalRaw('assign','Assign Provider', `
    <div class="mh2 icon"><span class="ib2 sq">${ic('user-plus','sm')}</span><h3 style="flex:1;font-size:18px;line-height:28px">Assign Provider</h3><button class="iconbtn rnd" data-act="closelayer" aria-label="Close">${ic('x')}</button></div>
    <div class="mb">
      <div class="lbl2">Assigning To</div>
      <div class="selcard"><span class="av48">${esc(initials(m.name))}${photoImg(m.id)}</span><b>${esc(m.name)}</b></div>
      <div class="lbl2">Select Provider</div>
      <div class="sbox full">${ic('search','sm')}<input placeholder="Search providers" aria-label="Search providers"></div>
      <div class="plist">${providers.length?providers.map(p=>`<button class="prow" data-pickprov><span class="av40">${esc(initials(p.n))}</span><div><b>${p.n}</b><small>${p.r}</small></div></button>`).join(''):'<div class="empty" style="padding:24px">No Provider Found</div>'}</div></div>
    <div class="mf">${cancel}${btn('filled primary m','x','Assign','','disabled id="assignbtn"')}</div>`));
}
function modalTransfer(id){
  const m = members.find(x=>x.id===id) || members[0];
  openLayer(modalRaw('transfer','Transfer Program', `
    <div class="mh2"><h3 style="flex:1">Transfer Program (${esc(m.name)})</h3><button class="iconbtn rnd" data-act="closelayer" aria-label="Close">${ic('x')}</button></div>
    <div class="mb xfer"><div class="field"><label>Current Program</label><div class="static">${PROGRAM.name}</div></div><span class="arr">${ic('chev-r')}</span>
      <div class="field"><label>Transfer To</label>${dd('tgt', [{v:'Elevate Fitness Club',label:'Elevate Fitness Club'},{v:'IAmFit',label:'IAmFit'}], {ph:'Select program'})}</div></div>
    <div class="mf">${cancel}${btn('filled primary m','dotransfer','Transfer')}</div>`));
}
function modalBiometric(){
  openLayer(modal('Map Biometric Code','Link this member to a biometric device code.', `<div class="field"><label>Biometric code</label><input class="input" placeholder="Enter code"></div><div class="t-b3 muted">Setup needed: Biometric. Mapping is a placeholder in this prototype.</div>`, cancel+btn('filled primary l','closelayer','Map'), false, 'fingerprint'));
}
function modalSimpleDate(){
  openLayer(modal('Edit Start Date','monthly · 21 Sep 2026', `<div class="field"><label>Start Date <i>*</i></label><input class="input" type="date" value="2026-09-21"></div>`, cancel+btn('filled primary l','closelayer','Save'), false, 'cal'));
}
function modalSchedule(){
  const chips = (list, cur) => `<div class="chips" style="margin:0">${list.map((c,i)=>`<button class="chip m selectable ${i===cur?'on':''}" data-pick>${c[1]?ic(c[1],'sm'):''}${c[0]}</button>`).join('')}</div>`;
  openLayer(modalRaw('sched','Schedule Follow-Up', `
    <div class="mh2 icon"><span class="ib2 sq lg">${ic('user-plus')}</span><div style="flex:1"><h3 style="font-size:20px;line-height:28px">Schedule Follow-Up</h3><div class="sub">For doli jha</div></div><button class="iconbtn rnd" data-act="closelayer" aria-label="Close">${ic('x')}</button></div>
    <div class="mb">
      <div class="field"><label>Channel</label>${chips([['Call','phone'],['Email','mail'],['Whatsapp','msg'],['Meeting','monitor'],['Other','msg-sq']],0)}</div>
      <div class="field"><label>Follow-up Type</label>${chips([['Renewal'],['Due Amount'],['Freeze/Pause Follow Up'],['Attendance Drop Off'],['Goal/Progress Check-in'],['Upsell'],['Complaint/Issue Resolution']],0)}</div>
      <div class="field"><label>Task Owner</label><div class="owner"><span class="sa2" style="background:var(--primary-60)">R</span><span style="flex:1">Rohitashav Garg</span>${ic('chev-d','sm')}</div></div>
      <div class="g2"><div class="field"><label>Select Date</label><input class="input" type="date" value="${isoDate(TODAY)}"></div>
        <div class="field"><label>Select Time Range</label><div style="display:flex;gap:8px"><input class="input" type="time" value="16:00"><input class="input" type="time" value="16:15"></div></div></div>
      <div class="field"><label>Add Note</label><textarea class="input" placeholder="Start writing here..."></textarea></div></div>
    <div class="mf">${cancel}${btn('filled primary m','closelayer','Schedule')}</div>`));
}
/* Add Membership and Renew Membership share one drawer */
const mem = { mode:'add', pkg:null, start:TODAY, applied:0, partial:false, payMode:'Offline' };
function addDays(d, n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function drawerMembership(mode, m, keep){
  if (!keep) { mem.mode=mode; mem.pkg=mode==='renew'?'p1':null; mem.start=TODAY; mem.applied=0; mem.partial=false; mem.payMode='Offline'; xfReset(); xf.ctx='add'; }
  const xfOn = mode==='add' && xf.src==='transfer';
  const pkgs = PACKAGES.map(p=>`<button class="pkg" data-pkgid="${p.id}"><span class="ck">${ic('check')}</span><div class="tags"><span class="chip xs warning">${p.label}</span><span class="chip xs info">${p.product}</span></div><b>${p.name}</b><small>${p.note}</small><span class="pr">${rupee(p.amount)}</span></button>`).join('');
  const head = mode==='renew'?`<div class="sel" style="margin-bottom:24px"><div class="c"><small>Member Selected</small><b>${esc(m.name)}</b></div><div class="c"><small>Phone Number</small><b>${esc(phoneFmt(m.phone))}</b></div><div class="c"><small>Membership Due Date</small><b>20 Oct 2026</b></div></div>`:'';
  const pkgHead = xfOn => `<div class="sect">Choose your Package<small>${xfOn?'Take over a membership another member marked ready.':'Select a package to auto-fill duration and amount.'}</small></div>`;
  const choice = mode==='add' ? `${xfHead(xfOn)}${xfOn?`<div class="fstack">${xfPanel(m.id)}</div>`:''}` : '';
  const rest = `
    ${mode==='renew'?pkgHead(false):''}
    <div class="pkgcards" id="pkgs">${pkgs}</div>
    <div class="sect">Membership Details<small>Review the details below. You can adjust the start date if needed.</small></div>
    <div class="g2"><div class="field"><label>Start Date <i>*</i></label><input class="input" type="date" id="mstart" value=""></div><div class="field"><label>End Date <i>*</i></label><input class="input" type="date" id="mend" disabled></div></div>
    <div class="note-i" id="mdur" style="margin-top:16px;display:none">${ic('clock','sm')}<span>Membership Duration: choose a package</span></div>
    <div class="field" style="margin-top:16px"><label>Base Amount</label><input class="input" id="mbase" disabled placeholder="Enter amount (₹)"></div>
    <div class="field" style="margin-top:16px"><label>Discount</label><div style="display:flex;gap:8px"><div class="dinp"><input class="input" id="mdisc" type="number" min="0" placeholder="0"><span class="dunit">${dd('munit',[{v:'%',label:'%'},{v:'₹',label:'₹'}],{value:'%'})}</span></div>${btn('filled primary l','mapply','Apply')}</div></div>
    ${mode==='renew'?`<div class="sel" style="margin-top:16px"><div class="c"><b>Final Amount</b><small>Inclusive of all Discounts</small></div><b id="mfinal" style="font-size:20px">₹ 0</b></div>
      <div class="toggle-row" style="margin-top:16px"><div><b>Is this a partial payment?</b><small>Toggle on if the member is not paying the full amount today.</small></div><button class="switch" id="mpart" role="switch" aria-checked="false" aria-label="Partial payment"></button></div>
      <div class="field" id="mpaidwrap" style="margin-top:16px;display:none"><label for="mpaid">Amount paying now <i>*</i></label><div class="cur"><span>₹</span><input class="input" id="mpaid" type="text" inputmode="decimal" autocomplete="off" placeholder="0"></div></div>`:''}
    <div class="sect">Payment Details<small>Add payment information to complete the conversion.</small></div>
    <div class="fstack" id="mpaybox">${payBody('m')}</div>`;
  const foot = cancel + (xfOn ? btn('filled primary m','xfsubmit','Transfer Membership') : btn('filled primary m','savemem', mode==='renew'?'Renew Membership':'Add Membership'));
  openLayer(drawerShell(mode==='renew'?'Renew Membership':'Add Membership', mode==='renew'?"Renew the selected member's membership by choosing a package and completing the payment.":personSub(m.id, m.name, m.phone), head+choice+(xfOn?'':rest), foot, 'side'));
  if (!xfOn) syncMem();
}
function saveMem(){
  const m = curMember(), p = PACKAGES.find(x=>x.id===mem.pkg), sv = $('#mstart').value, start = sv ? new Date(sv) : null;
  $$('.drawer .err-text').forEach(e => e.remove()); $$('.drawer .input.err').forEach(e => e.classList.remove('err'));
  const fail = (el, msg) => { el.classList.add('err'); el.insertAdjacentHTML('afterend', `<span class="err-text">${msg}</span>`); el.scrollIntoView({block:'center'}); };
  if (!p) return fail($('#pkgs'), 'Choose a package');
  if (!start || isNaN(start)) return fail($('#mstart'), 'Enter a start date');
  const final = Math.round(p.amount*(1-mem.applied/100)); let paid = final;
  if (mem.partial) { const el = $('#mpaid'), v = +el.value; if (el.value==='') return fail(el, 'Enter the amount paid now'); if (v > final) return fail(el, 'This is more than the amount to pay'); paid = v; }
  const pay = payRead('m'), end = addDays(start, p.days), renew = mem.mode==='renew';
  m.memberships.unshift({id:'ms'+Date.now(), name:p.name, status:'Active', start:fmtLong(start), amount:final, dur:p.label, paid:paid>0?paid:null, when:fmtLong(pay.date), end:fmtLong(end), daysLeft:Math.max(0,Math.round((end-TODAY)/86400000)), payMode:mem.payMode, payMethod:pay.method});
  m.activity.unshift({t:renew?'Membership renewed':'Membership added', time:'Just now', d:`${p.name} membership ${renew?'renewed':'added'}, ${rupee(paid)} of ${rupee(final)} paid (${mem.payMode==='Online'?'Online':pay.method}).`, by:'Rohitashav Garg', cat:'Payments', k:'wallet', tone:''});
  if (renew) m.memberships.forEach(x => { if (x.noRenew) delete x.noRenew; });
  closeLayer(); state.popup = null; detail.memFilter = 'All'; render(); toast(renew?'Membership renewed':'Membership added');
}
function syncMem(){
  $$('.pkg',layer()).forEach(b=>b.classList.toggle('on', b.dataset.pkgid===mem.pkg));
  const p = PACKAGES.find(x=>x.id===mem.pkg);
  if(!p) return;
  const base = p.amount, final = Math.round(base*(1-mem.applied/100));
  $('#mend').value = isoDate(addDays(mem.start, p.days)); $('#mstart').value = isoDate(mem.start);
  payRefresh('m'); $('#mdur').style.display = ''; $('#mdur').innerHTML = `${ic('clock','sm')}<span>Membership Duration: ${p.label}</span>`;
  $('#mbase').value = `₹ ${base}`;
  const fin = $('#mfinal'); if (fin) fin.textContent = `₹ ${final}`;
}

/* ---------- transfer membership ----------
   The admin does all of it in the CRM, and nothing is member-facing.
   A membership card only marks a membership as ready (Active and fully paid, and not one that arrived by transfer).
   The transfer itself happens in Add Membership and Convert to Member: choose Transferable membership, pick the member
   and the membership, set the start date and a transfer fee, then take the fee as payment.
   Payment history stays with the previous owner. No balance moves, because only fully paid memberships can be marked. */
const isPaid = ms => ms.settled || (ms.paid||0) >= ms.amount;
const canMark = ms => ms.status==='Active' && isPaid(ms) && !ms.from && !ms.to;
const findMs = id => { for (const m of members) { const ms = m.memberships.find(x=>x.id===id); if (ms) return {m, ms}; } return null; };
const readyList = m => m.memberships.filter(x=>x.ready && canMark(x));
const readyMembers = exclude => members.filter(m => m.id!==exclude && readyList(m).length);
const XF_BLANK = () => ({ src:'new', mid:'', msid:null, start:TODAY, fee:'', reason:'', payMode:'Offline', errs:{} });
const xf = Object.assign(XF_BLANK(), { ctx:'add' });
const xfReset = () => Object.assign(xf, XF_BLANK());

const msCard = (m, ms) => `<div class="subc"><span class="subt">${ic('id-card')}</span><div class="subx"><div class="subn"><b>${esc(ms.name)}</b><span class="${MS_CHIP[ms.status]}"><i class="dot"></i>${ms.status}</span></div><div class="subm"><span class="sx">${ic('clock','sm')}${esc(ms.dur)}</span><span class="vsep"></span><span class="sx">${ic('wallet','sm')}${rupee(ms.amount)}</span><span class="vsep"></span><span class="sx">${ic('cal','sm')}${ms.start||'—'} to ${ms.end}</span>${ms.status==='Active'||ms.status==='Frozen'?`<span class="vsep"></span><span class="sx">${ic('hourglass','sm')}${ms.daysLeft} days left</span>`:''}</div></div></div>`;
/* ---------- not interested in renewal ----------
   A flag on the membership, not a new status. It stays until the admin reopens it, and renewing the membership clears it too.
   Only memberships that can still be renewed carry it: Expired, or Active with 15 days or fewer left. */
const NR_REASONS = ['Price','Moving away','Health reasons','Joined another gym','Not enough time','Not seeing results','Facility or equipment','Trainer or service','Taking a break','Other'];
const canRenewFlag = ms => !ms.to && (ms.status==='Expired' || (ms.status==='Active' && ms.daysLeft<=15));
function modalNoRenew(id){
  const {m, ms} = findMs(id);
  const body = `<div class="fstack"><div class="field"><label>Reason <i>*</i></label><div class="chips" id="nr-reasons" style="margin:0">${NR_REASONS.map(x=>`<button type="button" class="chip m selectable" data-pick data-reason="${x}">${x}</button>`).join('')}</div></div>
      <div class="field" id="nr-notewrap" style="display:none"><label for="nr-note">Tell us the reason <i>*</i></label><textarea class="input" id="nr-note" placeholder="Add a note for the timeline"></textarea></div></div>`;
  openLayer(modal('Mark not interested in renewal?', `<span class="rchips"><span class="chip s neutral">${esc(ms.name)}</span><span class="${MS_CHIP[ms.status]}"><i class="dot"></i>${ms.status}</span></span>`, body, cancel+btn('filled primary l','donorenew:'+id,'Mark not interested'), true, 'cal-x'));
}
function doNoRenew(id){
  const sel = $('#nr-reasons .on'), reason = sel ? sel.dataset.reason : '', host = $('#nr-reasons');
  $$('.modal .err-text').forEach(e => e.remove());
  if (!reason) { host.insertAdjacentHTML('afterend', '<span class="err-text">Select a reason</span>'); return; }
  const note = reason==='Other' ? $('#nr-note').value.trim() : '', {m, ms} = findMs(id);
  if (reason==='Other' && !note) { $('#nr-note').classList.add('err'); $('#nr-note').insertAdjacentHTML('afterend', '<span class="err-text">Add a note for Other</span>'); return; }
  ms.noRenew = {reason, note, on:fmtLong(TODAY), by:'Rohitashav Garg'};
  if (m.rich) FOLLOWUPS.forEach(f => { if (f.tag==='Renewal' && f.state==='Missed') f.state = 'Not Interested'; });
  m.activity.unshift({t:'Membership renewal was marked as Not Interested.', time:'Just now', d:`${ms.name} membership, reason: ${reason}.${note?' '+note:''}`, by:'Rohitashav Garg', cat:'Follow-ups', k:'wallet', tone:'t'});
  closeLayer(); state.popup = null; render(); toast('Marked not interested in renewal');
}
function modalReopen(id){
  const {m, ms} = findMs(id);
  openLayer(confirmModal({icon:'undo', title:'Reopen renewal?', text:`Put <b>${esc(ms.name)}</b> back in the renewal flow.`, extra:`<span class="chip s neutral">Not interested: ${esc(ms.noRenew.reason)}</span>${ms.noRenew.note?`<span class="cfn">${esc(ms.noRenew.note)}</span>`:''}`, act:'doreopen:'+id, ok:'Reopen renewal'}));
}
function doReopen(id){
  const {m, ms} = findMs(id);
  delete ms.noRenew;
  m.activity.unshift({t:'Membership renewal was reopened.', time:'Just now', d:`${ms.name} membership is back in the renewal flow.`, by:'Rohitashav Garg', cat:'Follow-ups', k:'refresh', tone:'t'});
  closeLayer(); state.popup = null; render(); toast('Renewal reopened');
}
function modalReady(id, on){
  const {m, ms} = findMs(id);
  openLayer(confirmModal({icon:on?'swap':'list-x', tone:on?'':'warn', title:on?'Mark ready for transfer?':'Remove from transfer list?', text:on?`<b>${esc(ms.name)}</b> will show up in Add Membership and Convert to Member.`:`<b>${esc(ms.name)}</b> will no longer show up in those lists.`, act:'setready:'+id+'|'+(on?1:0), ok:on?'Mark ready':'Remove'}));
}
function modalFreeze(id){
  const {m, ms} = findMs(id);
  openLayer(modal('Freeze Membership', esc(ms.name), `<div class="fstack">
    <div class="g2"><div class="field"><label for="fz-start">Freeze From <i>*</i></label><input class="input" type="date" id="fz-start" value="${isoDate(TODAY)}"></div>
      <div class="field"><label for="fz-end">Freeze Until <i>*</i></label><input class="input" type="date" id="fz-end" value="${isoDate(addDays(TODAY,6))}"></div></div>
    <div class="field"><label for="fz-reason">Reason (optional)</label><textarea class="input" id="fz-reason" placeholder="Add a note for the timeline"></textarea></div>
    <div class="note-i" id="fz-note"></div></div>`, cancel+btn('filled primary l','freezeconfirm:'+id,'Freeze'), true, 'snowflake'));
  fzSync();
}
function fzRead(){ const s = new Date($('#fz-start').value), e = new Date($('#fz-end').value); return {s, e, days: isNaN(s)||isNaN(e) ? 0 : Math.round((e-s)/86400000)+1}; }
function fzSync(){
  const {days} = fzRead();
  $('#fz-note').innerHTML = days>0 ? `${ic('info','sm')}<span>${days} days will be paused. The end date moves out by the same number of days.</span>` : `${ic('info','sm')}<span>Freeze Until must be on or after Freeze From.</span>`;
}
function freezeConfirm(id){
  const {m, ms} = findMs(id), {s, e, days} = fzRead();
  if (days < 1) { fzSync(); return; }
  const r = $('#fz-reason').value.trim(), at = new Date().toLocaleTimeString('en-US', {hour:'numeric', minute:'2-digit'});
  (ms.freezes = ms.freezes || []).unshift({start:fmtLong(s), end:fmtLong(e), created:fmtLong(TODAY)+' · '+at, by:'Rohitashav Garg', days});
  ms.status = 'Frozen'; ms.end = fmtLong(addDays(new Date(ms.end), days));
  m.activity.unshift({t:'Membership frozen', time:'Just now', d:`${ms.name} membership was frozen from ${fmtLong(s)} to ${fmtLong(e)} (${days} days).${r?' Reason: '+r:''}`, by:'Rohitashav Garg', cat:'Profile Updates', k:'snowflake', tone:'t'});
  closeLayer(); state.popup = null; (detail.frzOpen = detail.frzOpen || {})[id] = true; render(); toast('Membership frozen');
}
function setReady(arg){
  const [id, v] = arg.split('|'), {m, ms} = findMs(id), on = v==='1';
  if (on && !canMark(ms)) { closeLayer(); toast('Only active, fully paid memberships can be transferred'); return; }
  ms.ready = on;
  m.activity.unshift({t:on?'Marked ready for transfer':'Removed from transfer list', time:'Just now', d:`${ms.name} membership was ${on?'marked ready for transfer':'removed from the transfer list'}.`, by:'Rohitashav Garg', cat:'Profile Updates', k:'swap', tone:'t'});
  closeLayer(); state.popup = null; render(); toast(on?'Marked ready for transfer':'Removed from the transfer list');
}

/* New package is the main path, so the transfer option is only a quiet link next to the heading. */
function xfHead(on){
  return `<div class="sect sectrow"><div>${on?'Transfer a membership':'Choose your Package'}<small>${on?'Take over a membership marked ready.':'Pick a package to auto-fill.'}</small></div>
    ${on?`<button type="button" class="btn outline primary m" data-xfsrc="new">${ic('chev-l')}Back to packages</button>`:`<button type="button" class="btn outline inherit m" data-xfsrc="transfer">${ic('swap')}Transfer from a member</button>`}</div>`;
}
function xfPanel(exclude){
  const e = xf.errs, list = readyMembers(exclude);
  if (!list.length) return `<div class="empty" style="padding:24px"><b>No memberships are marked ready for transfer</b><span>Mark a fully paid, active membership from its three-dots menu on the member's Memberships tab.</span></div>${e.mid?`<span class="err-text">${e.mid}</span>`:''}`;
  const opts = list.map(m => ({v:m.id, label:m.name, sub:phoneFmt(m.phone), tag:readyList(m).length+' ready for transfer', av:avColor(m.id), img:photoUrl(m.id)}));
  const src = xf.mid ? members.find(x=>x.id===xf.mid) : null;
  const rows = src ? readyList(src).map(ms=>`<button class="prow ${xf.msid===ms.id?'on':''}" data-xfms="${ms.id}"><span class="ddav lg ic-tile">${ic('id-card')}</span>
      <div class="ddx"><span class="ddmeta"><b>${esc(ms.name)}</b><span class="chip xs success">Fully paid</span></span><span class="ddmeta"><span class="dl">${ms.daysLeft} days left</span><small>Ends on ${ms.end}</small></span></div>
      <b class="pamt">${rupee(ms.amount)}</b></button>`).join('') : '';
  return `<div class="field"><label for="xf-mem">Transfer from member <i>*</i></label>${dd('xf-mem', opts, {value:xf.mid, ph:'Select member', err:e.mid})}${e.mid?`<span class="err-text">${e.mid}</span>`:''}</div>
    ${src?`<div class="field"><label>Transferable membership <i>*</i></label><div class="plist" id="xfres">${rows}</div>${e.ms?`<span class="err-text">${e.ms}</span>`:''}</div>`:`<div class="note-i">${ic('info','sm')}<span>Choose a member to see their transferable memberships.</span></div>`}
    ${xf.msid?xfDetails(findMs(xf.msid)):''}`;
}
function xfFinal(){
  const fee = +xf.fee || 0;
  return `${ic('info','sm')}<span>${fee>0?`Amount to pay: ${rupee(fee)}`:'Enter the transfer fee. The membership can only be transferred against a fee.'}</span>`;
}
function xfDetails({m, ms}){
  const e = xf.errs, end = addDays(xf.start, ms.daysLeft), fee = +xf.fee || 0;
  return `<div class="note-i">${ic('info','sm')}<span>${ms.daysLeft} days on the ${esc(ms.name)} plan move over from ${esc(m.name)}. Payment history stays with ${esc(m.name)}. The membership is fully paid, so no balance moves.</span></div>
    <div class="sect">Transfer Details<small>The start date can be changed. The end date follows the days left.</small></div>
    <div class="g2"><div class="field"><label for="xf-start">Start Date <i>*</i></label><input class="input ${e.start?'err':''}" type="date" id="xf-start" value="${isoDate(xf.start)}">${e.start?`<span class="err-text">${e.start}</span>`:''}</div>
      <div class="field"><label for="xf-end">End Date</label><input class="input" type="date" id="xf-end" value="${isoDate(end)}" disabled></div></div>
    <div class="field"><label for="xf-fee">Transfer Fee <i>*</i></label><div class="cur"><span>₹</span><input class="input ${e.fee?'err':''}" id="xf-fee" type="text" inputmode="decimal" autocomplete="off" placeholder="0" value="${esc(xf.fee)}"></div>${e.fee?`<span class="err-text">${e.fee}</span>`:''}</div>
    <div class="field"><label for="xf-reason">Reason (optional)</label><textarea class="input" id="xf-reason" placeholder="Add a note for the timeline">${esc(xf.reason)}</textarea></div>
    <div class="note-i" id="xffinal">${xfFinal()}</div>
    <div class="fstack" id="xfpay">
      <div class="sect" style="margin-bottom:0">Payment Details<small>Collect the transfer fee from the receiver.</small></div>
      <div class="fstack" id="xfpaybox">${payBody('xf')}</div></div>`;
}
function xfRead(){
  const s = $('#xf-start'); if (s && s.value) { const d = new Date(s.value); if (!isNaN(d)) xf.start = d; }
  const f = $('#xf-fee'); if (f) xf.fee = f.value;
  const r = $('#xf-reason'); if (r) xf.reason = r.value;
}
function xfSyncFee(){
  const f = $('#xf-fee'); if (!f) return;
  xf.fee = f.value;
  $('#xffinal').innerHTML = xfFinal(); payRefresh('xf');
}
function xfRedraw(){
  const body = $('.drawer .db'), top = body ? body.scrollTop : 0;
  if (xf.ctx==='convert') drawerConvert(); else drawerMembership('add', curMember(), true);
  const nb = $('.drawer .db'); if (nb) nb.scrollTop = top;
}
function xfCheck(){
  xfRead();
  const e = xf.errs = {};
  if (!readyMembers(xf.ctx==='add' ? curMember().id : '').length) e.mid = 'There is nothing to transfer yet. Mark a membership as ready first.';
  else if (!xf.mid) e.mid = 'Choose a member';
  else if (!xf.msid) e.ms = 'Choose a membership to transfer';
  if (isNaN(+xf.start)) e.start = 'Enter a valid start date';
  if (!(+xf.fee > 0)) e.fee = 'Enter the transfer fee, it must be more than zero';
  if (xf.msid) { const f = findMs(xf.msid); if (!f || !f.ms.ready || !canMark(f.ms)) e.ms = 'This membership is no longer ready for transfer'; }
  return !Object.keys(e).length;
}
/* Moves the membership to `to`. Call while the drawer is still open so the payment fields can be read. */
function xfApply(to){
  const {m:src, ms} = findMs(xf.msid), fee = +xf.fee || 0, end = addDays(xf.start, ms.daysLeft);
  const pd = payRead('xf').date;
  const why = xf.reason.trim() ? ` Reason: ${xf.reason.trim()}` : '';
  const pay = fee>0 ? ` Transfer fee ${rupee(fee)} paid (${xf.payMode}).` : ' No transfer fee.';
  ms.status = 'Transferred'; ms.ready = false; ms.to = to.name; ms.toId = to.id; ms.on = fmtLong(TODAY);
  to.memberships.unshift({id:'ms'+Date.now(), name:ms.name, status:'Active', amount:ms.amount, dur:ms.dur, paid:fee>0?fee:null, payLabel:'Transfer fee', payMode:xf.payMode, payMethod:payRead('xf').method, when:fmtLong(pd), start:fmtLong(xf.start), end:fmtLong(end), daysLeft:ms.daysLeft, from:src.name, fromId:src.id, settled:true});
  src.activity.unshift({t:'Membership transferred out', time:'Just now', d:`${ms.name} membership with ${ms.daysLeft} days left was transferred to ${to.name}.${pay}${why}`, by:'Rohitashav Garg', cat:'Profile Updates', k:'swap', tone:'t'});
  to.activity.unshift({t:'Membership transferred in', time:'Just now', d:`${ms.name} membership with ${ms.daysLeft} days left was transferred from ${src.name}, starting ${fmtLong(xf.start)}.${pay}${why}`, by:'Rohitashav Garg', cat:'Profile Updates', k:'swap', tone:'t'});
  return {src, ms};
}
function xfSubmitAdd(){
  if (!xfCheck()) { xfRedraw(); const e = $('.drawer .err-text'); if (e) e.scrollIntoView({block:'center'}); return; }
  xfApply(curMember());
  closeLayer(); state.popup = null; render(); toast('Membership assigned successfully.');
}

/* ---------- leads ----------
   List and stage tabs follow the live CRM Leads page. "Convert to Member" in the row menu opens the Convert to Member panel.
   New in the prototype: that panel starts with New package or Transferable membership. */
const STAGES = ['New','Contacted','Qualified','Gym Tour Scheduled','Gym Trial Started','Converted','Lost'];
const STAGE_CHIP = {New:'warning', Contacted:'info', Qualified:'primary', 'Gym Tour Scheduled':'primary', 'Gym Trial Started':'primary', Converted:'success', Lost:'error'};
const leads = [
  {id:'l1', name:'Diane Horne', email:'ysanders@reed.com', phone:'+919914425905', source:'Website', stage:'Contacted', assignee:'Vinita.Kumawat', owner:'Vinita.Kumawat', follow:'29-10-2026', score:2},
  {id:'l2', name:'Vinita test', email:'', phone:'+918734675623', source:'Facebook Ads', stage:'New', assignee:'Vinita.Kumawat', owner:'Vinita.Kumawat', follow:'29-10-2026', score:1},
  {id:'l3', name:'Tracy Simmons', email:'dramsey@wood.net', phone:'+916436594882', source:'Walk-in', stage:'New', assignee:'Vinita.Kumawat', owner:'Vinita.Kumawat', follow:'30-10-2026', score:1},
  {id:'l4', name:'Patricia Lin', email:'jasmine70@yahoo.com', phone:'+919956915129', source:'Instagram', stage:'New', assignee:'Vinita.Kumawat', owner:'Vinita.Kumawat', follow:'29-10-2026', score:1},
  {id:'l5', name:'Kaitlyn Pratt', email:'christian43@parker.com', phone:'+916176491906', source:'Instagram', stage:'New', assignee:'Vinita.Kumawat', owner:'Vinita.Kumawat', follow:'30-10-2026', score:1},
  {id:'l6', name:'Aditya Sharma', email:'aditya.sharma.10002@example.com', phone:'+917000000003', source:'', stage:'Converted', assignee:'Unassigned', owner:'Unassigned', follow:'', score:10},
];
leads.forEach(l => { l.name = nameCase(l.name); });
const lv = { q:'', stage:'All' };
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmtLong = d => `${MONTHS[d.getMonth()]} ${pad(d.getDate())}, ${d.getFullYear()}`;
const LEAD_PKGS = [
  {id:'g1', name:'GYM Package1', label:'7 Days', days:7, product:'Gym Membership', price:1800, orig:2000, off:'10% off'},
  {id:'g2', name:'GYM Package2', label:'8 Days', days:8, product:'Gym Membership', price:2849.7, orig:3000, off:'5.01% off'},
  {id:'g3', name:'GYM Package3', label:'10 Days', days:10, product:'Gym Membership', price:3400, orig:4000, off:'15% off'},
  {id:'p1', name:'PT session 1', label:'5 Days', days:5, product:'Personal Training', price:1900, orig:2000, off:'5% off'},
  {id:'p2', name:'PT session 2', label:'10 Days', days:10, product:'Personal Training', price:2700, orig:3000, off:'10% off'},
  {id:'p3', name:'PT session 3', label:'15 Days', days:15, product:'Personal Training', price:4250, orig:5000, off:'15% off'},
  {id:'n1', name:'NEW GYM WORKOUT 1231', label:'12 Days', days:12, product:'Gym Membership', price:0},
  {id:'n2', name:'05-10-2026', label:'45 Days', days:45, product:'Gym Membership', price:0},
  {id:'a1', name:'Annual Gym', label:'12 Months', days:365, product:'Gym Membership', price:18000},
];
const digits10 = p => p.replace(/\D/g,'').slice(-10);
function mkMember(o){
  const ts = +`${TODAY.getFullYear()}${pad(TODAY.getMonth()+1)}${pad(TODAY.getDate())}`;
  return {id:'n'+Date.now()+Math.floor(Math.random()*1000), name:nameCase(o.name), email:o.email||'', phone:o.phone, created:fmtDate(TODAY), ts, status:'Active', waiver:'Pending', tags:[], source:o.source||'', age:null, memberships:[], activity:[]};
}
function leadMenuOpen(id){ return state.popup==='lmenu:'+id; }
function stageCell(l, locked, up){
  const chip = `<i class="dot"></i>${l.stage}`;
  if (locked) return `<span class="chip s ${STAGE_CHIP[l.stage]}" title="This lead is closed. Further changes are not allowed.">${chip}</span>`;
  const open = state.popup==='stage:'+l.id;
  const menu = open ? `<div class="menu" style="left:0;${up?'bottom':'top'}:32px" data-stop>${STAGES.map(st=>`<button class="mi ${st===l.stage?'sel2':''}" data-act="setstage:${l.id}|${st}"><span class="chip xs ${STAGE_CHIP[st]}"><i class="dot"></i>${st}</span>${st===l.stage?`<span style="margin-left:auto">${ic('check','sm')}</span>`:st==='Converted'?'<small class="muted" style="margin-left:auto">Opens convert</small>':''}</button>`).join('')}</div>` : '';
  return `<span class="stg"><button class="chip s ${STAGE_CHIP[l.stage]} stgbtn" data-act="stagemenu:${l.id}" aria-haspopup="menu" aria-expanded="${open}" aria-label="Change stage, now ${l.stage}">${chip}<span class="stgc">${ic('chev-d','sm')}</span></button>${menu}</span>`;
}
function leadRow(l, i, all){
  const tone = l.score>=8 ? 'g' : l.score>=4 ? 'o' : 'r';
  const pp = n => n==='Unassigned' ? '<span class="chip s outlined">Unassigned</span>' : `<span class="pp"><i>${esc(n[0])}</i>${esc(n)}</span>`;
  const locked = l.stage==='Converted' || l.stage==='Lost';
  const why = locked ? ' disabled title="This lead is closed. Further changes are not allowed."' : '';
  return `<tr><td><div class="lname"><b>${esc(l.name)}</b><small>${l.email?esc(l.email):'—'}</small></div></td>
    <td>${esc(phoneFmt(l.phone))}</td>
    <td>${l.source?`<span class="chip s default">${esc(l.source)}</span>`:'—'}</td>
    <td>${stageCell(l, locked, all && all.length>3 && all.length-i<=3)}</td>
    <td>${pp(l.assignee)}</td><td>${pp(l.owner)}</td><td>${l.follow||''}</td>
    <td><div class="score"><span class="sb"><i class="${tone}" style="width:${l.score*10}%"></i></span><b class="${tone}">${l.score}</b></div></td>
    <td><div style="display:flex;gap:4px;align-items:center;position:relative">
      <button class="iconbtn" style="border:0" data-act="toast:Opens the call dialog in the live app" aria-label="Call ${esc(l.name)}">${ic('phone','sm')}</button>
      <button class="iconbtn" style="border:0" data-act="toast:Opens Schedule follow-up in the live app" aria-label="Schedule a follow-up for ${esc(l.name)}">${ic('cal-plus','sm')}</button>
      <button class="iconbtn" style="border:0" data-act="lmenu:${l.id}" aria-label="Row actions for ${esc(l.name)}">${ic('more','sm')}</button>
      ${leadMenuOpen(l.id)?`<div class="menu" style="right:0;top:40px" data-stop>
        <button class="mi" ${locked?'disabled':''} data-act="toast:Opens the lead editor in the live app">${ic('pencil')}Edit</button>
        <button class="mi" ${locked?'disabled':''} data-act="leadconvert:${l.id}">${ic('refresh')}Convert to Member</button>
        <button class="mi" ${locked?'disabled':''} data-act="leadlost:${l.id}">${ic('alert-c')}Mark as Lost</button>
        <button class="mi danger" ${locked?'disabled':''} data-act="toast:Deleting leads is not part of this prototype">${ic('x')}Delete</button></div>`:''}
      </div></td></tr>`;
}
function viewLeads(){
  const counts = {All:leads.length}; STAGES.forEach(s=>counts[s]=leads.filter(l=>l.stage===s).length);
  const conv = leads.length ? (counts.Converted/leads.length*100).toFixed(1) : '0.0';
  const avg = leads.length ? (leads.reduce((a,l)=>a+l.score,0)/leads.length).toFixed(1) : '0.0';
  const q = lv.q.trim().toLowerCase(), d = q.replace(/\D/g,'');
  const rows = leads.filter(l => (lv.stage==='All'||l.stage===lv.stage) && (!q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || (d && l.phone.replace(/\D/g,'').includes(d))));
  const tile = (cls, icon, l, v) => `<div class="stile"><div class="h"><span class="ib ${cls}">${ic(icon,'sm')}</span>${l}<span class="info">${ic('info','sm')}</span></div><div class="n">${v}</div></div>`;
  return `
  <div class="ph"><div class="tt"><h1 class="t-h2">Leads</h1><p>Manage and track your sales pipeline leads</p></div>
    <div class="acts">
      <div class="tools" role="group" aria-label="Lead data">
        <button class="iconbtn l grey" data-act="toast:Opens the lead import in the live app" aria-label="Import" title="Import leads">${ic('file-in')}</button>
        <button class="iconbtn l grey" data-act="toast:Starts an export in the live app" aria-label="Export" title="Export leads">${ic('download')}</button>
      </div>
      <span class="vsep acts-sep"></span>
      ${btn('filled primary l sqr','toast:Create Lead is not part of this prototype yet','Create Lead','plus')}
    </div></div>
  <div class="tiles four">${tile('b','user-plus','Total Leads',leads.length)}${tile('g','check-c','Qualified Leads',counts.Qualified)}${tile('i','trend','Conversion Rate',conv+'%')}${tile('o','star','Avg. Lead Score',avg)}</div>
  <div class="bar"><div class="sbox">${ic('search','sm')}<input id="lq" placeholder="Search leads by name, email or phone" value="${esc(lv.q)}" aria-label="Search leads"></div></div>
  <div class="tbl"><div class="stabs" role="tablist">${['All',...STAGES].map(s=>`<button class="stab ${lv.stage===s?'on':''}" role="tab" data-lstage="${s}">${s}<span class="chip xs neutral">${counts[s]}</span></button>`).join('')}</div>
    <div class="tw"><table class="lt"><thead><tr><th>Name</th><th>Phone</th><th>Source</th><th>Stage</th><th>Assignee</th><th>Owner</th><th>Follow-up</th><th>Lead score</th><th>Actions</th></tr></thead>
    <tbody>${rows.length?rows.map(leadRow).join(''):`<tr><td colspan="9" style="height:auto">${empty('No leads found')}</td></tr>`}</tbody></table></div></div>`;
}

/* ---------- convert to member ---------- */
const cv = { id:null, pkg:null, start:TODAY, applied:0, payMode:'Offline', errs:{}, step:'form', memberId:null, summary:'' };
function cvBuy(){
  const e = cv.errs;
  const cards = LEAD_PKGS.map(p => `<button class="pkg ${cv.pkg===p.id?'on':''}" data-cvpkg="${p.id}"><span class="ck">${ic('check')}</span>
    <div class="tags"><span class="chip xs warning">${p.label}</span><span class="chip xs info">${p.product}</span></div><b>${esc(p.name)}</b><small>${p.days} days package</small>
    <span class="pr">${rupee(p.price)}${p.orig?` <s>${rupee(p.orig)}</s> <span class="chip xs success">${p.off}</span>`:''}</span></button>`).join('');
  return `<div class="pkgcards" id="cvpkgs">${cards}</div>${e.pkg?`<span class="err-text">${e.pkg}</span>`:''}
    <div class="sect">Membership Details<small>Review the details below. You can adjust the start date if needed.</small></div>
    <div class="g2"><div class="field"><label for="cv-start">Start Date <i>*</i></label><input class="input" type="date" id="cv-start" value="${cv.pkg?isoDate(cv.start):''}"></div>
      <div class="field"><label for="cv-end">End Date <i>*</i></label><input class="input" type="date" id="cv-end" disabled></div></div>
    <div class="field"><label for="cv-base">Base Amount</label><input class="input" id="cv-base" disabled placeholder="Enter amount (₹)"></div>
    <div class="field"><label for="cv-disc">Discount</label><div style="display:flex;gap:8px"><div class="dinp"><input class="input" id="cv-disc" type="number" min="0" placeholder="0"><span class="dunit">${dd("cvunit",[{v:"%",label:"%"},{v:"₹",label:"₹"}],{value:"%"})}</span></div>${btn("filled primary l","cvapply","Apply")}</div></div>
    <div class="note-i" id="cv-final">${ic('info','sm')}<span>Choose a package to see the amount to pay.</span></div>
    <div class="sect">Payment Details<small>Add payment information to complete the conversion.</small></div>
    <div class="fstack" id="cvpaybox">${payBody('cv')}</div>`;
}
function cvSuccess(){
  const to = members.find(x=>x.id===cv.memberId);
  return `<div class="empty" style="padding:24px 0 8px"><span class="okbig">${ic('check','xl')}</span><b style="font-size:20px;line-height:30px;margin-top:8px">Lead converted</b><span>${esc(to.name)} is now an Active member. ${esc(cv.summary)}</span></div>
    <div class="card tight"><div class="kv"><div class="r"><span>Recorded on</span><b>29 Oct 2026</b></div><div class="r"><span>Lead stage</span><b>Converted</b></div></div></div>`;
}
function drawerConvert(){
  const l = leads.find(x=>x.id===cv.id);
  if (cv.step==='done') {
    openLayer(drawerShell('Convert to Member?', personSub(l.id, l.name, l.phone), cvSuccess(), btn('outline inherit m','cvview','View member')+btn('filled primary m','closelayer','Done'), 'side')); return;
  }
  const clash = cv.errs.phone ? `<div class="alert error">${ic('info','sm')}<div>${cv.errs.phone}</div></div>` : '';
  const xfOn = xf.src==='transfer';
  openLayer(drawerShell('Convert to Member?', personSub(l.id, l.name, l.phone), `<div class="fstack">${clash}${xfHead(xfOn)}${xfOn?xfPanel():cvBuy()}</div>`, cancel+btn('filled primary m','cvsubmit','Convert to Member'), 'side'));
  if (!xfOn) cvSync();
}
function cvSync(){
  $$('#cvpkgs .pkg').forEach(b => b.classList.toggle('on', b.dataset.cvpkg===cv.pkg));
  const p = LEAD_PKGS.find(x=>x.id===cv.pkg); if (!p) return;
  $('#cv-end').value = isoDate(addDays(cv.start, p.days)); $('#cv-start').value = isoDate(cv.start);
  $('#cv-base').value = `₹ ${p.price}`;
  const final = Math.round(p.price*(1-cv.applied/100));
  payRefresh('cv'); $('#cv-final').innerHTML = `${ic('info','sm')}<span>Amount to pay: ${rupee(final)}${cv.applied?`, after ${cv.applied}% discount`:''}</span>`;
}
function cvRead(){
  const s = $('#cv-start'); if (s && s.value) { const d = new Date(s.value); if (!isNaN(d)) cv.start = d; }
  const dc = $('#cv-disc'); if (dc) { const raw = +dc.value || 0, pk = LEAD_PKGS.find(x=>x.id===cv.pkg), pct = $('#cvunit') && $('#cvunit').value==='₹' && pk && pk.price ? raw/pk.price*100 : raw; cv.applied = Math.round(Math.min(100, Math.max(0, pct))*100)/100; }
  xfRead();
}
function openConvert(id){
  Object.assign(cv, { id, pkg:null, start:TODAY, applied:0, payMode:'Offline', errs:{}, step:'form', memberId:null, summary:'' });
  xfReset(); xf.ctx = 'convert';
  drawerConvert();
}
function cvSubmit(){
  cvRead(); cv.errs = {};
  const l = leads.find(x=>x.id===cv.id), transfer = xf.src==='transfer';
  const clash = members.find(m => digits10(m.phone)===digits10(l.phone));
  if (clash) cv.errs.phone = `This number already belongs to ${clash.name}. A lead with an existing member's number cannot be converted.`;
  let pkg = null, xfOk = true;
  if (transfer) xfOk = xfCheck();
  else { pkg = LEAD_PKGS.find(x=>x.id===cv.pkg); if (!pkg) cv.errs.pkg = 'Choose a package'; }
  if (Object.keys(cv.errs).length || !xfOk) { drawerConvert(); const e = $('.drawer .err-text, .drawer .alert.error'); if (e) e.scrollIntoView({block:'center'}); return; }
  const to = mkMember({name:l.name, email:l.email, phone:l.phone, source:l.source||'Lead'});
  members.unshift(to); if (PHOTOS[l.id]) PHOTOS[to.id] = PHOTOS[l.id];
  if (!transfer) {
    const final = Math.round(pkg.price*(1-cv.applied/100)), end = addDays(cv.start, pkg.days), pd = payRead('cv').date;
    to.memberships.unshift({id:'ms'+Date.now(), name:pkg.name, status:'Active', amount:final, dur:pkg.label, paid:final>0?final:null, when:fmtLong(pd), start:fmtLong(cv.start), end:fmtLong(end), daysLeft:Math.max(0,Math.round((end-TODAY)/86400000)), payMode:cv.payMode, payMethod:payRead('cv').method});
    to.activity.unshift({t:'Lead converted to member', time:'Just now', d:`${l.name} was converted from a lead. ${pkg.name} membership added, ${rupee(final)} paid (${cv.payMode}).`, by:'Rohitashav Garg', cat:'Payments', k:'user-pen', tone:''});
    cv.summary = `The ${pkg.name} membership was added.`;
  } else {
    to.activity.unshift({t:'Lead converted to member', time:'Just now', d:`${l.name} was converted from a lead.`, by:'Rohitashav Garg', cat:'Profile Updates', k:'user-pen', tone:''});
    const {src, ms} = xfApply(to);
    cv.summary = `The ${ms.name} membership moved over from ${src.name}.`;
  }
  l.stage = 'Converted'; l.follow = ''; l.memberId = to.id;
  cv.memberId = to.id; cv.step = 'done';
  state.popup = null; render(); drawerConvert();
  if (transfer) toast('Membership assigned successfully.');
}

/* ---------- router ---------- */
function parse(){
  const h = location.hash.replace(/^#/,'') || '/members';
  const [path, qs] = h.split('?'); const p = path.split('/').filter(Boolean);
  const q = Object.fromEntries(new URLSearchParams(qs||''));
  return {p, q};
}
function render(){
  const {p,q} = parse();
  let main = '', crumbs = [{t:'Programs',href:'#/programs'}], nav = p[0]||'members';
  if (p[0]==='members' && p[1] && p[2]==='notes'){
    const m = members.find(x=>x.id===p[1]) || members[0];
    main = viewNotes(m); crumbs = [{t:'Programs',href:'#/programs'},{t:'Members',href:'#/members'},{t:nameCase(m.name),href:'#/members/'+m.id},{t:'Notes'}];
  } else if (p[0]==='members' && p[1]){
    const m = members.find(x=>x.id===p[1]) || members[0];
    const tab = TABS.some(t=>t[0]===q.tab)?q.tab:'overview';
    main = viewDetail(m,tab); crumbs = [{t:'Programs',href:'#/programs'},{t:'Members',href:'#/members'},{t:nameCase(m.name)}];
  } else if (!p[0] || p[0]==='members'){
    main = viewMembers(); crumbs.push({t:'Members'});
  } else if (p[0]==='leads'){
    main = viewLeads(); crumbs.push({t:'Leads'});
  } else {
    const names = Object.fromEntries(NAV.flatMap(g=>g.items).map(i=>[i.k,i.l]));
    main = `<div class="ph"><div class="tt"><h1 class="t-h2">${esc(names[p[0]]||'Programs')}</h1></div></div><div class="stub"><b>Shell page</b>Not part of this prototype yet.</div>`;
    crumbs.push({t:names[p[0]]||'Programs'});
  }
  const sc = window.scrollY;
  $('#app').classList.toggle('collapsed', state.collapsed); $('#app').classList.remove('navopen');
  renderSide(nav); renderTop(crumbs); $('#main').innerHTML = main;
  if ($('#dual')) paintDual();
  if ($('#taginput')) $('#taginput').focus();
  window.scrollTo(0, sc);
}
function go(h){ if (location.hash===h) render(); else location.hash=h; }
window.addEventListener('hashchange', ()=>{ state.popup=null; detail.tagOpen=false; window.scrollTo(0,0); render(); });
const curId = () => parse().p[1];
const curMember = () => members.find(x=>x.id===curId()) || members[0];

/* ---------- events ---------- */
document.addEventListener('click', e=>{
  const t = e.target;
  const inStop = t.closest('[data-stop]');
  if (!t.closest('.dd')) closeDds();
  const ddt = t.closest('[data-ddt]');
  if (ddt) { const d = ddt.closest('.dd'), open = !d.classList.contains('open'); closeDds(); d.classList.toggle('open', open); ddt.setAttribute('aria-expanded', open); return; }
  const ddo = t.closest('[data-ddo]'); if (ddo) { ddPick(ddo); return; }
  if (t.matches('[data-scrim]')) { closeLayer(); return; }
  const a = t.closest('[data-act],[data-go],[data-nav],[data-tab],[data-tile],[data-sort],[data-page],[data-status],[data-setstatus],[data-menu],[data-ftag],[data-memf],[data-actf],[data-fuf],[data-scroll],[data-col],[data-colall],[data-pkgid],[data-paymode],[data-pick],[data-pickprov],[data-lstage],[data-cvpkg],[data-xfsrc],[data-xfms],#mpart');
  if (!a){ if (!inStop && state.popup){ state.popup=null; render(); } return; }
  const d = a.dataset;
  if (d.go){ state.popup=null; closeLayer(); go(d.go); return; }
  if (d.nav){ state.popup=null; $('#app').classList.remove('navopen'); go(d.nav==='members'?'#/members':'#/'+d.nav); return; }
  if (d.tab){ go(`#/members/${curId()}?tab=${d.tab}`); return; }
  if (d.tile){ state.tile=d.tile; state.page=1; render(); return; }
  if (d.sort!==undefined){ state.sortDir = state.sortDir==='desc'?'asc':'desc'; render(); return; }
  if (d.page){ state.page=+d.page; render(); return; }
  if (d.status){ state.popup = state.popup==='status:'+d.status?null:'status:'+d.status; render(); return; }
  if (d.setstatus){ const [id,s]=d.setstatus.split('|'); const m=members.find(x=>x.id===id);
    if(m && m.status!==s){ m.status=s; m.activity.unshift({t:'Member status updated',time:'Just now',d:`Member status was changed to ${s}.`,by:'Rohitashav Garg',cat:'Profile Updates',k:'msg-sq',tone:''}); toast(`${m.name} is now ${s}`);} state.popup=null; render(); return; }
  if (d.menu){ state.popup = state.popup==='menu:'+d.menu?null:'menu:'+d.menu; render(); return; }
  if (d.ftag){ const f=state.filters.tags, i=f.indexOf(d.ftag); i>-1?f.splice(i,1):f.push(d.ftag); state.page=1; render(); return; }
  if (d.memf){ detail.memFilter=d.memf; render(); return; }
  if (d.actf){ detail.actFilter=d.actf; render(); return; }
  if (d.fuf){ detail.fuFilter=d.fuf; render(); return; }
  if (d.scroll){ const tb=$('#tabs'); if(tb) tb.scrollBy({left:+d.scroll*240,behavior:'smooth'}); return; }
  if (d.colall!==undefined){ const all=TOGGLE_COLS.every(c=>state.cols.has(c.k)); TOGGLE_COLS.forEach(c=>all?state.cols.delete(c.k):state.cols.add(c.k)); render(); modalColumns(); return; }
  if (d.col){ state.cols.has(d.col)?state.cols.delete(d.col):state.cols.add(d.col); render(); modalColumns(); return; }
  if (d.pkgid){ mem.pkg=d.pkgid; syncMem(); return; }
  if (d.paymode){ const [p, mo] = d.paymode.split('|'); if (p==='m') mem.payMode=mo; else if (p==='cv') cv.payMode=mo; else xf.payMode=mo; payRender(p); return; }
  if (d.pick!==undefined){ $$('[data-pick]',a.parentElement).forEach(b=>b.classList.remove('on')); a.classList.add('on'); $$('.modal .err-text').forEach(e => e.remove());
    if (a.dataset.reason) $('#nr-notewrap').style.display = a.dataset.reason==='Other' ? '' : 'none'; return; }
  if (a.dataset.pickprov!==undefined){ $('.prow').forEach(b=>b.classList.remove('on')); a.classList.add('on'); const ab=$('#assignbtn'); if(ab){ ab.disabled=false; ab.dataset.act='assigndone'; } return; }
  if (d.lstage){ lv.stage=d.lstage; state.popup=null; render(); return; }
  if (d.xfsrc){ if (xf.ctx==='convert') cvRead(); else xfRead(); xf.src=d.xfsrc; xf.errs={}; cv.errs={}; xfRedraw(); return; }
  if (d.cvpkg){ cv.pkg=d.cvpkg; delete cv.errs.pkg; cvSync(); return; }
  if (d.xfms){ xfRead(); xf.msid=d.xfms; delete xf.errs.ms; xfRedraw(); return; }
  if (a.id==='mpart'){ mem.partial=!mem.partial; a.classList.toggle('on',mem.partial); a.setAttribute('aria-checked',mem.partial); $('#mpaidwrap').style.display = mem.partial ? '' : 'none'; return; }
  const act = d.act||''; const name = act.split(':')[0], arg = act.slice(act.indexOf(':')+1);
  switch(name){
    case 'collapse': state.collapsed=!state.collapsed; render(); break;
    case 'navtoggle': $('#app').classList.toggle('navopen'); break;
    case 'profile': state.popup = state.popup==='profile'?null:'profile'; render(); break;
    case 'filters': state.popup = state.popup==='filters'?null:'filters'; render(); break;
    case 'columns': state.popup=null; render(); modalColumns(); break;
    case 'pagemenu': state.popup = state.popup==='page'?null:'page'; render(); break;
    case 'memmenu': state.popup = state.popup==='memmenu:'+arg?null:'memmenu:'+arg; render(); break;
    case 'memmenu2': toast('Package actions are not part of this prototype'); break;
    case 'memmenu3': state.popup = state.popup==='hdrmenu'?null:'hdrmenu'; render(); break;
    case 'closepop': state.popup=null; render(); break;
    case 'clearfilters': state.filters={tags:[],date:'',ageMin:18,ageMax:100}; state.page=1; render(); break;
    case 'add': drawerAdd(); break;
    case 'import': modalImport(); break;
    case 'importhistory': state.popup=null; render(); toast('Opens Import History in the live app'); break;
    case 'closelayer': closeLayer(); break;
    case 'allmembers': toast('Opens the list of all YourPal members across programs'); break;
    case 'assign': state.popup=null; render(); modalAssign(d.id||curId()); break;
    case 'notes': state.popup=null; go(`#/members/${d.id}/notes`); break;
    case 'transfer': state.popup=null; render(); modalTransfer(d.id); break;
    case 'dotransfer': { const v=$('#tgt').value; if(!v){ toast('Choose a program first'); break; } closeLayer(); toast(`Transfer to ${v} is a placeholder in this prototype`); break; }
    case 'addtag': detail.tagOpen=true; render(); break;
    case 'biometric': state.popup=null; render(); modalBiometric(); break;
    case 'editprofile': state.popup=null; render(); drawerEdit(curMember()); break;
    case 'updateprofile': closeLayer(); toast('Profile saved. This is a prototype, nothing is stored'); break;
    case 'addmembership': drawerMembership('add', curMember()); break;
    case 'renew': drawerMembership('renew', curMember()); break;
    case 'invoice': toast('Opens the invoice in the live app'); break;
    case 'editstart': state.popup=null; render(); modalSimpleDate(); break;
    case 'lmenu': state.popup = state.popup==='lmenu:'+arg?null:'lmenu:'+arg; render(); break;
    case 'leadconvert': state.popup=null; render(); openConvert(arg); break;
    case 'leadlost': { const l=leads.find(x=>x.id===arg); l.stage='Lost'; l.follow=''; state.popup=null; render(); toast(l.name+' was marked as Lost'); break; }
    case 'cvapply': cvRead(); cvSync(); toast(cv.applied?cv.applied+'% discount applied':'No discount'); break;
    case 'cvsubmit': cvSubmit(); break;
    case 'cvview': closeLayer(); go('#/members/'+cv.memberId+'?tab=membership'); break;
    case 'markready': state.popup=null; render(); modalReady(arg, true); break;
    case 'unready': state.popup=null; render(); modalReady(arg, false); break;
    case 'setready': setReady(arg); break;
    case 'stagemenu': state.popup = state.popup==='stage:'+arg ? null : 'stage:'+arg; render(); break;
    case 'setstage': { const [id, st] = arg.split('|'), l = leads.find(x=>x.id===id); state.popup = null;
      if (st==='Converted') { render(); openConvert(id); break; }
      if (st!==l.stage) { l.stage = st; if (st==='Lost') l.follow = ''; toast(`${l.name} moved to ${st}`); }
      render(); break; }
    case 'norenew': state.popup=null; render(); modalNoRenew(arg); break;
    case 'donorenew': doNoRenew(arg); break;
    case 'reopenrenew': state.popup=null; render(); modalReopen(arg); break;
    case 'doreopen': doReopen(arg); break;
    case 'freeze': state.popup=null; render(); modalFreeze(arg); break;
    case 'freezeconfirm': freezeConfirm(arg); break;
    case 'togglefrz': (detail.frzOpen = detail.frzOpen || {})[arg] = !detail.frzOpen[arg]; render(); break;
    case 'xfsubmit': xfSubmitAdd(); break;
    case 'togglepay': detail.payOpen[arg]=!detail.payOpen[arg]; render(); break;
    case 'schedulefu': modalSchedule(); break;
    case 'mapply': { const raw=+($('#mdisc').value)||0, unit=$('#munit').value, p=PACKAGES.find(x=>x.id===mem.pkg); const pct=unit==='₹' && p ? raw/p.amount*100 : raw; mem.applied=Math.round(Math.min(100,Math.max(0,pct))*100)/100; syncMem(); toast(raw?`${raw}${unit} discount applied`:'No discount'); break; }
    case 'savemem': saveMem(); break;
    case 'submitadd': submitAdd(); break;
    case 'assigndone': closeLayer(); toast('Provider assigned. This is a prototype, nothing is stored'); break;
    case 'toast': toast(arg); break;
    case 'copy': if(navigator.clipboard) navigator.clipboard.writeText(arg).catch(()=>{}); toast('Number copied'); break;
  }
});
document.addEventListener('input', e=>{
  const t=e.target;
  if (t.id==='xf-fee' || t.id==='mpaid') t.value = t.value.replace(/[^\d.]/g,'').replace(/(\..*)\./g,'$1');
  if (t.id==='q'){ state.q=t.value; state.page=1; const pos=t.selectionStart; render(); const n=$('#q'); n.focus(); n.setSelectionRange(pos,pos); }
  else if (t.id==='fdate'){ state.filters.date=t.value; state.page=1; render(); }
  else if (t.id==='amin'||t.id==='amax'){ let lo=+$('#amin').value, hi=+$('#amax').value; if(lo>hi){ if(t.id==='amin') lo=hi; else hi=lo; } $('#amin').value=lo; $('#amax').value=hi; state.filters.ageMin=lo; state.filters.ageMax=hi; state.page=1; paintDual(); }
  else if (t.id==='lq'){ lv.q=t.value; const pos=t.selectionStart; render(); const n=$('#lq'); n.focus(); n.setSelectionRange(pos,pos); }
  else if (t.id==='cv-start'){ const d=new Date(t.value); if(!isNaN(d)){ cv.start=d; cvSync(); } }
  else if (t.id==='xf-fee'){ xfSyncFee(); }
  else if (t.id==='fz-start' || t.id==='fz-end'){ fzSync(); }
  else if (t.id==='xf-start'){ const d=new Date(t.value); if(!isNaN(d)){ xf.start=d; const f=findMs(xf.msid); if(f) $('#xf-end').value=isoDate(addDays(d, f.ms.daysLeft)); } }
  else if (t.id==='mstart'){ const d=new Date(t.value); if(!isNaN(d)){ mem.start=d; syncMem(); } }
});
document.addEventListener('change', e=>{
  const t=e.target;
  if (t.id==='rpp'){ state.rows=+t.value; state.page=1; render(); }
  else if (t.id==='provsel'){ const p = PROVIDERS.find(x=>x.id===t.value), m = curMember(); if (p && m) { m.provider = p.n; m.activity.unshift({t:'Provider assigned', time:'Just now', d:`${p.n} (${p.r}) was assigned as provider.`, by:'Rohitashav Garg', cat:'Profile Updates', k:'user-check', tone:''}); render(); toast(`${p.n} assigned as provider`); } }
  else if (t.id==='xf-mem'){ xfRead(); xf.mid=t.value; xf.msid=null; xf.errs={}; xfRedraw(); }
  else if (t.id==='amin'||t.id==='amax'){ render(); }
});
document.addEventListener('keydown', e=>{
  if (e.key==='Escape' && ($('.dd.open') || $('.dpk.open'))){ closeDds(); closeDp(); return; }
  if (e.key==='Escape'){ if (layer().innerHTML) closeLayer(); else if (state.popup||detail.tagOpen){ state.popup=null; detail.tagOpen=false; render(); } }
  if (e.key==='Enter' && e.target.id==='ftag'){ const v=e.target.value.trim(); if(v && !state.filters.tags.includes(v)){ state.filters.tags.push(v); state.page=1; render(); } }
  if (e.key==='Enter' && e.target.id==='taginput'){ const v=e.target.value.trim(); const m=curMember(); if(v){ m.tags.push(v); toast(`Tag "${v}" added`);} detail.tagOpen=false; render(); }
});

function submitAdd(){
  const g = id => ($('#a-'+id)||{}).value||'';
  const v = {}; ['first','last','phone','email','gender','age','dob','a1','a2','pin','country','state','city','interest','tags','source','ec','ecp'].forEach(k=>v[k]=g(k).trim());
  const errs = {};
  ['first','last','phone','gender','age','dob','country','state','city'].forEach(k=>{ if(!v[k]) errs[k]='This field is required'; });
  if (v.phone && !/^\d[\d\s-]{7,}$/.test(v.phone)) errs.phone='Enter a valid phone number';
  if (v.email && !/^\S+@\S+\.\S+$/.test(v.email)) errs.email='Enter a valid email';
  if (Object.keys(errs).length){ drawerAdd(errs, v); return; }
  const ts=+`${TODAY.getFullYear()}${pad(TODAY.getMonth()+1)}${pad(TODAY.getDate())}`;
  members.unshift({id:'n'+Date.now(), name:nameCase(`${v.first} ${v.last}`), email:v.email, phone:'+91'+v.phone.replace(/\D/g,''), created:fmtDate(TODAY), ts, status:'Active', waiver:'Pending', tags:v.tags?[v.tags]:[], source:v.source, age:+v.age||null, memberships:[], activity:[]});
  closeLayer(); state.tile='all'; state.page=1; render(); toast(`${v.first} ${v.last} was added`);
}

render();
/* ---------- date picker ----------
   Every input[type=date] is upgraded after render: the native input stays in the page, hidden, as the value holder (YYYY-MM-DD),
   so existing code that reads or sets .value keeps working. The visible control shows DD/MM/YYYY and opens one shared calendar.
   The calendar sits on the page (position: fixed) so a drawer or modal never clips it. */
const DP_PROTO = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
const DP_DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const dpDate = v => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v||''); return m ? new Date(+m[1], +m[2]-1, +m[3]) : null; };
const dpFmt = v => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v||''); return m ? `${m[3]}/${m[2]}/${m[1]}` : ''; };
const dpPop = document.createElement('div');
dpPop.className = 'dpp'; dpPop.setAttribute('role', 'dialog'); dpPop.setAttribute('aria-label', 'Choose a date');
document.body.appendChild(dpPop);
const closeDp = () => { dpPop.classList.remove('open'); $$('.dpk.open').forEach(w => w.classList.remove('open')); };
function dpPaint(inp){
  const w = inp.closest('.dpk'); if (!w) return;
  const t = w.querySelector('.dpt'), v = DP_PROTO.get.call(inp), d = dpDate(v), ro = inp.disabled;
  /* a read-only date (such as an end date worked out from the package) reads as a plain value, not as an empty form field */
  t.querySelector('span').textContent = d ? (ro ? `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` : dpFmt(v)) : (ro ? 'Set by the package' : 'DD/MM/YYYY');
  t.classList.toggle('empty', !d); t.classList.toggle('ro', ro); t.disabled = ro;
}
function dpEnhance(inp){
  inp.dataset.dp = '1';
  Object.defineProperty(inp, 'value', { get(){ return DP_PROTO.get.call(inp); }, set(v){ DP_PROTO.set.call(inp, v); dpPaint(inp); }, configurable:true });
  const w = document.createElement('div'); w.className = 'dpk';
  if (inp.style.width) { w.style.width = inp.style.width; inp.style.width = ''; }
  const label = inp.getAttribute('aria-label');
  inp.replaceWith(w);
  w.innerHTML = `<button type="button" class="dpt" aria-haspopup="dialog" ${label?`aria-label="${esc(label)}"`:''}><span></span>${ic('cal','sm')}</button>`;
  w.prepend(inp); dpPaint(inp);
}
function dpRender(w, view){
  const inp = w.querySelector('input'), sel = dpDate(inp.value), y = view.getFullYear(), m = view.getMonth();
  const first = new Date(y, m, 1), start = addDays(first, -first.getDay());
  let cells = '';
  for (let i = 0; i < 42; i++) {
    const d = addDays(start, i), iso = isoDate(d);
    cells += d.getMonth()!==m ? '<span></span>' : `<button type="button" class="dpd ${sel&&iso===isoDate(sel)?'sel':''} ${iso===isoDate(TODAY)?'today':''}" data-dpd="${iso}" aria-label="${d.getDate()} ${MONTHS_FULL[m]} ${y}">${d.getDate()}</button>`;
  }
  dpPop._w = w; w._view = new Date(y, m, 1);
  dpPop.innerHTML = `<div class="dph"><button type="button" class="dpn" data-dpn="-1" aria-label="Previous month">${ic('chev-l')}</button><b>${MONTHS_FULL[m]} ${y}</b><button type="button" class="dpn" data-dpn="1" aria-label="Next month">${ic('chev-r')}</button></div>
    <div class="dpg">${DP_DOW.map(x=>`<i>${x}</i>`).join('')}${cells}</div>
    <div class="dpf"><button type="button" class="btn text inherit s" data-dpc>Clear</button><button type="button" class="btn text primary s" data-dptoday>Today</button></div>`;
}
function dpOpen(w){
  const inp = w.querySelector('input'), r = w.querySelector('.dpt').getBoundingClientRect();
  dpRender(w, dpDate(inp.value) || TODAY);
  dpPop.classList.add('open'); w.classList.add('open');
  dpPlace(r);
}
function dpPlace(r){
  const ph = dpPop.offsetHeight, pw = dpPop.offsetWidth;
  let top = r.bottom + 8; if (top + ph > innerHeight - 8) top = Math.max(8, r.top - 8 - ph);
  dpPop.style.top = top + 'px'; dpPop.style.left = Math.min(Math.max(8, r.left), Math.max(8, innerWidth - pw - 8)) + 'px';
}
document.addEventListener('click', e => {
  const t = e.target, w = t.closest('.dpk') || (t.closest('.dpp') ? dpPop._w : null);
  if (!w) { closeDp(); return; }
  if (t.closest('.dpt')) { const open = !w.classList.contains('open'); closeDp(); if (open) dpOpen(w); return; }
  const nav = t.closest('[data-dpn]');
  if (nav) { const v = w._view; dpRender(w, new Date(v.getFullYear(), v.getMonth() + +nav.dataset.dpn, 1)); return; }
  const day = t.closest('[data-dpd]'), clr = t.closest('[data-dpc]'), now = t.closest('[data-dptoday]');
  if (day || clr || now) {
    const inp = w.querySelector('input');
    DP_PROTO.set.call(inp, clr ? '' : day ? day.dataset.dpd : isoDate(TODAY)); dpPaint(inp); closeDp();
    inp.dispatchEvent(new Event('input', {bubbles:true})); inp.dispatchEvent(new Event('change', {bubbles:true}));
  }
});
document.addEventListener('scroll', e => {
  if (!dpPop.classList.contains('open') || dpPop.contains(e.target)) return;
  const w = dpPop._w, r = w && w.isConnected ? w.querySelector('.dpt').getBoundingClientRect() : null;
  if (!r || r.bottom < 0 || r.top > innerHeight) { closeDp(); return; }
  dpPlace(r);
}, true);
window.addEventListener('resize', closeDp);
/* ---------- time picker ----------
   Same idea as the date picker: the native input stays in the page, hidden, holding HH:MM, and one shared popup shows hours and minutes. */
const tpPop = document.createElement('div');
tpPop.className = 'tpp'; tpPop.setAttribute('role', 'dialog'); tpPop.setAttribute('aria-label', 'Choose a time');
document.body.appendChild(tpPop);
const closeTp = () => { tpPop.classList.remove('open'); $$('.tpk.open').forEach(w => w.classList.remove('open')); };
const tpParts = v => { const p = String(v || '').split(':'); if (p.length < 2 || p[0] === '' || isNaN(+p[0]) || isNaN(+p[1])) return null; return [+p[0], +p[1]]; };
function tpPaint(inp){
  const w = inp.closest('.tpk'); if (!w) return;
  const t = w.querySelector('.tpt'), v = DP_PROTO.get.call(inp), ok = !!tpParts(v);
  t.querySelector('span').textContent = ok ? v.slice(0, 5) : 'HH:MM'; t.classList.toggle('empty', !ok); t.disabled = inp.disabled;
}
function tpEnhance(inp){
  inp.dataset.tp = '1';
  Object.defineProperty(inp, 'value', { get(){ return DP_PROTO.get.call(inp); }, set(v){ DP_PROTO.set.call(inp, v); tpPaint(inp); }, configurable:true });
  const w = document.createElement('div'); w.className = 'tpk';
  if (inp.style.width) { w.style.width = inp.style.width; inp.style.width = ''; }
  const label = inp.getAttribute('aria-label');
  inp.replaceWith(w);
  w.innerHTML = `<button type="button" class="tpt" aria-haspopup="dialog" ${label?`aria-label="${esc(label)}"`:''}><span></span>${ic('clock','sm')}</button>`;
  w.prepend(inp); tpPaint(inp);
}
function tpRender(w){
  const sel = tpParts(w.querySelector('input').value) || [9, 0];
  const mins = []; for (let m = 0; m < 60; m += 5) mins.push(m); if (!mins.includes(sel[1])) { mins.push(sel[1]); mins.sort((a, b) => a - b); }
  const col = (cls, label, items, cur, attr) => `<div class="tpc"><div class="tph">${label}</div><div class="tpl ${cls}">${items.map(n => `<button type="button" class="tpo ${n===cur?'sel':''}" ${attr}="${n}">${pad(n)}</button>`).join('')}</div></div>`;
  tpPop._w = w;
  tpPop.innerHTML = col('h', 'Hour', Array.from({length:24}, (_, i) => i), sel[0], 'data-th') + col('m', 'Min', mins, sel[1], 'data-tm');
  $$('.tpl', tpPop).forEach(l => { const b = l.querySelector('.sel'); if (b) l.scrollTop = b.offsetTop - l.clientHeight / 2 + 18; });
}
function tpPlace(r){
  const ph = tpPop.offsetHeight, pw = tpPop.offsetWidth;
  let top = r.bottom + 8; if (top + ph > innerHeight - 8) top = Math.max(8, r.top - 8 - ph);
  tpPop.style.top = top + 'px'; tpPop.style.left = Math.min(Math.max(8, r.left), Math.max(8, innerWidth - pw - 8)) + 'px';
}
document.addEventListener('click', e => {
  const t = e.target, w = t.closest('.tpk') || (t.closest('.tpp') ? tpPop._w : null);
  if (!w) { closeTp(); return; }
  if (t.closest('.tpt')) {
    const open = !w.classList.contains('open'); closeTp();
    if (open) { tpRender(w); tpPop.classList.add('open'); w.classList.add('open'); tpRender(w); tpPlace(w.querySelector('.tpt').getBoundingClientRect()); }
    return;
  }
  const h = t.closest('[data-th]'), m = t.closest('[data-tm]');
  if (h || m) {
    const inp = w.querySelector('input'), cur = tpParts(inp.value) || [9, 0];
    const hh = h ? +h.dataset.th : cur[0], mm = m ? +m.dataset.tm : cur[1];
    DP_PROTO.set.call(inp, pad(hh) + ':' + pad(mm)); tpPaint(inp);
    if (m) closeTp(); else tpRender(w);
    inp.dispatchEvent(new Event('input', {bubbles:true})); inp.dispatchEvent(new Event('change', {bubbles:true}));
  }
});
document.addEventListener('scroll', e => {
  if (!tpPop.classList.contains('open') || tpPop.contains(e.target)) return;
  const w = tpPop._w, r = w && w.isConnected ? w.querySelector('.tpt').getBoundingClientRect() : null;
  if (!r || r.bottom < 0 || r.top > innerHeight) { closeTp(); return; }
  tpPlace(r);
}, true);
window.addEventListener('resize', closeTp);
new MutationObserver(() => { $$('input[type=date]:not([data-dp])').forEach(dpEnhance); $$('input[type=time]:not([data-tp])').forEach(tpEnhance); }).observe(document.body, {childList:true, subtree:true});
$$('input[type=date]:not([data-dp])').forEach(dpEnhance);
$$('input[type=time]:not([data-tp])').forEach(tpEnhance);
})();
