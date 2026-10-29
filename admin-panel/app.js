/* YourPal admin panel prototype: Members flow.
   Mock data only. Routes: #/members and #/members/<id>?tab=<tab>. Other sidebar pages are shells. */
(function(){
'use strict';

/* ---------- helpers ---------- */
const $ = (s, r=document) => r.querySelector(s);
const esc = s => String(s==null?'':s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ic = (n, c='') => `<svg class="ic ${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const initials = n => n.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
const AV = ['#3F51B5','#1F7A5A','#8E3FA8','#B24D00','#1373CC','#992B28','#4552A9'];
const avColor = id => AV[[...String(id)].reduce((a,c)=>a+c.charCodeAt(0),0) % AV.length];
const fmtDate = d => { const p = n => String(n).padStart(2,'0'); return `${p(d.getDate())}/${p(d.getMonth()+1)}/${d.getFullYear()}`; };
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>t.classList.remove('show'),2200); }

/* ---------- data (copied from the Doli_GYM dev program) ---------- */
const PROGRAM = { name:'Doli_GYM', type:'Fitness Center' };
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
const DOLI_ACTIVITY = [
  {t:'Member status updated', time:'27 Oct · 5:35 PM', d:'Member status was changed to Active.', by:'Doli Jha', cat:'Profile Updates'},
  {t:'Membership renewal was marked as Not Interested.', time:'22 Oct · 5:07 PM', d:'Membership renewal was marked as Not Interested.', by:'Doli Jha', cat:'Follow-ups'},
  {t:'Member status updated', time:'21 Oct · 5:46 AM', d:'Member status was changed to Inactive.', by:'System', cat:'Profile Updates'},
  {t:'Follow-Up Scheduled', time:'19 Oct · 3:14 PM', d:'Call follow-up was scheduled for 19/10/2026, 15:30 and assigned to doli.jha.', by:'Doli Jha', cat:'Follow-ups'},
  {t:'Member status updated', time:'30 Sept · 9:50 AM', d:'Member status was changed to Active.', by:'Doli Jha', cat:'Profile Updates'},
  {t:'Member status updated', time:'28 Sept · 2:50 PM', d:'Member status was changed to Active.', by:'Rohitashav Garg', cat:'Profile Updates'},
  {t:'Member status updated', time:'28 Sept · 2:50 PM', d:'Member status was changed to Inactive.', by:'Rohitashav Garg', cat:'Profile Updates'},
];
const DOLI_FOLLOWUPS = [
  {type:'Call', tag:'Renewal', state:'Missed', when:'Oct 19, 2026 · 3:30 PM', by:'doli.jha', note:''},
  {type:'Call', tag:'Completed', state:'Completed', when:'Sep 18, 2026 · 5:00 PM', by:'doli.jha', note:'test'},
];
const ALL_COLS = [
  {k:'name', l:'Members Name', fixed:true},{k:'phone', l:'Phone Number'},{k:'provider', l:'Provider'},
  {k:'tags', l:'Tags'},{k:'waiver', l:'Waiver Status'},{k:'created', l:'Created At'},{k:'status', l:'Status'},{k:'actions', l:'Actions', fixed:true},
];
const STATUSES = ['Active','Inactive'];

const state = {
  q:'', tile:'all', cols:new Set(ALL_COLS.map(c=>c.k)), sortDir:'desc', rows:20, page:1,
  filters:{tags:[], date:'', ageMin:18, ageMax:100},
  popup:null,        // 'filters' | 'columns' | 'page' | 'menu:<id>' | 'status:<id>' | 'profile'
  collapsed:false,
};

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
  {g:'Reporting', items:[{k:'pt', l:'PT Reporting', i:'clipboard'},{k:'exports', l:'Exports', i:'download'}]},
  {g:'Settings', items:[{k:'staff', l:'Staff', i:'staff'},{k:'settings', l:'Program Settings', i:'settings', dot:true}]},
];
const STUB_TEXT = {
  dashboard:'The sales dashboard. Not part of this prototype yet.', leads:'Leads. Not part of this prototype yet.',
  attendance:'Attendance. Not part of this prototype yet.', payments:'Payments. Not part of this prototype yet.',
  packages:'Membership Packages. Not part of this prototype yet.', assignments:'Assignments. Not part of this prototype yet.',
  waiver:'Waiver Forms. Not part of this prototype yet.', pt:'PT Reporting. Not part of this prototype yet.',
  exports:'Exports. Not part of this prototype yet.', staff:'Staff. Not part of this prototype yet.', settings:'Program Settings. Not part of this prototype yet.',
};

function renderSide(active){
  $('#side').innerHTML = `
    <div class="brand"><div class="logo"><i>YP</i><b>YourPal</b></div>
      <button class="iconbtn" data-act="collapse" aria-label="Collapse sidebar">${ic('sidebar','sm')}</button></div>
    <div class="prog"><button class="back" data-go="#/programs" aria-label="Go back to programs list">${ic('back','sm')}</button>
      <div class="nm"><b>${esc(PROGRAM.name)}</b><span>${esc(PROGRAM.type)}</span></div>
      <button class="iconbtn" aria-label="Switch active program">${ic('updown','sm')}</button></div>
    ${NAV.map(g=>`<div class="grp">${g.g}${ic('chev-u','sm')}</div>${g.items.map(n=>`
      <button class="nav ${n.k===active?'on':''}" data-nav="${n.k}">${ic(n.i)}${n.dot?'<i class="dot"></i>':''}<span class="l">${n.l}</span></button>`).join('')}`).join('')}
    <div class="side-foot"><button class="nav" data-nav="account">${ic('sliders')}<span class="l">Account & Settings</span></button></div>`;
}

function renderTop(crumbs){
  $('#top').innerHTML = `
    <div class="crumb">${ic('sidebar','sm')}${crumbs.map((c,i)=>i<crumbs.length-1?`<a data-go="${c.href}">${esc(c.t)}</a><span>${ic('chev-r','sm')}</span>`:`<b>${esc(c.t)}</b>`).join('')}</div>
    <div class="gsearch">${ic('search','sm')}<input placeholder="Search programs by name, leads or members by name or number" aria-label="Search"></div>
    <div class="sp"></div>
    <button class="iconbtn rocket" aria-label="Setup wizard: 5 to set up">${ic('rocket','sm')}<i></i></button>
    <div class="me" data-act="profile" style="cursor:pointer"><span class="av">R</span>Rohitashav Garg${ic('chev-d','sm')}
      ${state.popup==='profile'?`<div class="menu" style="right:0;top:44px;min-width:200px;position:absolute" data-stop>
        <button>${ic('sliders')}Account & Settings</button><button>${ic('help')}Feedback</button>
        <div class="grp" style="padding:8px 12px 2px">Theme</div>
        <button>${ic('sun')}Light<span style="margin-left:auto;color:var(--primary-60)">${ic('check','sm')}</span></button>
        <button>${ic('moon')}Dark</button><button>${ic('monitor')}System</button>
        <button style="color:var(--error-70)">${ic('logout')}Logout</button></div>`:''}</div>`;
}

/* ---------- members list ---------- */
function visibleMembers(){
  const q = state.q.trim().toLowerCase();
  let rows = members.filter(m => {
    if (state.tile==='active' && m.status!=='Active') return false;
    if (state.tile==='inactive' && m.status!=='Inactive') return false;
    if (q && !(m.name+' '+m.email+' '+m.phone).toLowerCase().includes(q)) return false;
    if (state.filters.tags.length && !state.filters.tags.every(t=>m.tags.includes(t))) return false;
    if (state.filters.date){ const [y,mo,d]=state.filters.date.split('-'); if (m.ts !== +(y+mo+d)) return false; }
    if (m.age!=null && (m.age<state.filters.ageMin || m.age>state.filters.ageMax)) return false;
    return true;
  });
  rows.sort((a,b)=> state.sortDir==='desc' ? b.ts-a.ts : a.ts-b.ts);
  return rows;
}
function stChip(m, withMenu){
  const cls = m.status.toLowerCase();
  return `<span class="stsel"><button class="stbtn ${cls}" data-status="${m.id}" aria-label="Change status, now ${m.status}">${m.status}${ic('chev-d')}</button>
    ${withMenu && state.popup==='status:'+m.id?`<div class="menu" style="top:32px;left:0;min-width:120px" data-stop>${STATUSES.map(s=>`<button data-setstatus="${m.id}|${s}">${s}${s===m.status?`<span style="margin-left:auto">${ic('check','sm')}</span>`:''}</button>`).join('')}</div>`:''}</span>`;
}
function cell(m,k){
  switch(k){
    case 'name': return `<td><div class="mc"><span class="ava" style="background:${avColor(m.id)}">${esc(initials(m.name))}</span><div class="nm"><a data-go="#/members/${m.id}">${esc(m.name)}</a><small>${m.email?esc(m.email):'—'}</small></div></div></td>`;
    case 'phone': return `<td>${esc(m.phone)}</td>`;
    case 'provider': return `<td><button class="chip s outlined" data-act="assign" style="cursor:pointer">Assign Provider ${ic('plus')}</button></td>`;
    case 'tags': return `<td>${m.tags.length?m.tags.map(t=>`<span class="chip s primary">${esc(t)}</span>`).join(' '):'<span class="chip s outlined">No Tags</span>'}</td>`;
    case 'waiver': return `<td><span class="chip s warning">${m.waiver}</span></td>`;
    case 'created': return `<td>${m.created}</td>`;
    case 'status': return `<td>${stChip(m,true)}</td>`;
    case 'actions': return `<td><div style="display:flex;gap:6px;align-items:center;position:relative">
      <button class="iconbtn" data-go="#/members/${m.id}" aria-label="View details for ${esc(m.name)}" style="border:0">${ic('eye')}</button>
      <button class="iconbtn" data-menu="${m.id}" aria-label="More actions" style="border:0">${ic('more')}</button>
      ${state.popup==='menu:'+m.id?`<div class="menu" style="right:0;top:34px" data-stop><button data-act="notes" data-id="${m.id}">${ic('note')}Notes</button><button data-act="transfer" data-id="${m.id}">${ic('swap')}Transfer Program</button></div>`:''}</div></td>`;
  }
}
function viewMembers(){
  const rows = visibleMembers();
  const total = members.length, act = members.filter(m=>m.status==='Active').length, ina = total-act;
  const per = state.rows, pages = Math.max(1, Math.ceil(rows.length/per)); if (state.page>pages) state.page=pages;
  const slice = rows.slice((state.page-1)*per, state.page*per);
  const cols = ALL_COLS.filter(c=>state.cols.has(c.k));
  const nFilters = state.filters.tags.length + (state.filters.date?1:0) + ((state.filters.ageMin!==18||state.filters.ageMax!==100)?1:0);
  return `
  <div class="ph"><div class="tt"><h1 class="t-h1">Members</h1><p>Manage and track your Members</p></div>
    <div class="acts">
      <button class="btn outline inherit m" data-act="allmembers">Click here for all Yourpal Members</button>
      <button class="btn filled primary m" data-act="add">${ic('plus')}Add Members</button>
      <button class="btn tonal primary m" data-act="import">${ic('upload')}Import</button>
      <button class="iconbtn" data-act="pagemenu" aria-label="More">${ic('more')}</button>
      ${state.popup==='page'?`<div class="menu" style="right:0;top:40px" data-stop><button data-act="export">${ic('download')}Export members</button></div>`:''}
    </div></div>
  <div class="tiles">
    <button class="tile ${state.tile==='all'?'on':''}" data-tile="all"><div class="h"><span class="ib b">${ic('users','sm')}</span>Total Members<span class="info">${ic('info','sm')}</span></div><div class="n">${total}</div></button>
    <button class="tile ${state.tile==='active'?'on':''}" data-tile="active"><div class="h"><span class="ib g">${ic('check-c','sm')}</span>Active Members<span class="info">${ic('info','sm')}</span></div><div class="n">${act}</div></button>
    <button class="tile ${state.tile==='inactive'?'on':''}" data-tile="inactive"><div class="h"><span class="ib n">${ic('clock','sm')}</span>Inactive Members<span class="info">${ic('info','sm')}</span></div><div class="n">${ina}</div></button>
  </div>
  <div class="bar">
    <div class="sbox">${ic('search','sm')}<input id="q" placeholder="Search Members by name, email or phone number" value="${esc(state.q)}" aria-label="Search members">${ic('help','sm')}</div>
    <div class="sp"></div>
    <button class="btn outline inherit m" data-act="filters">${ic('filter')}Filters${nFilters?` <span class="chip xs primary">${nFilters}</span>`:''}</button>
    <button class="btn outline inherit m" data-act="columns">${ic('columns')}Columns</button>
    ${state.popup==='filters'?filtersPop():''}${state.popup==='columns'?columnsPop():''}
  </div>
  <div class="tbl"><div class="tw"><table><thead><tr>${cols.map(c=>c.k==='created'
      ? `<th class="sort" data-sort>${c.l}<span class="sa">${ic(state.sortDir==='desc'?'chev-d':'chev-u','sm')}</span></th>`
      : `<th>${c.l}</th>`).join('')}</tr></thead>
    <tbody>${slice.length?slice.map(m=>`<tr>${cols.map(c=>cell(m,c.k)).join('')}</tr>`).join(''):`<tr><td colspan="${cols.length}"><div class="empty"><div class="eic">${ic('empty')}</div><b>No Data Found</b>There's nothing to show here yet. Try adjusting your filters or check back later.</div></td></tr>`}</tbody></table></div>
    <div class="pager"><span>Showing ${rows.length?(state.page-1)*per+1:0}–${Math.min(state.page*per,rows.length)} of ${rows.length}</span><div class="sp"></div>
      <div class="pg">${Array.from({length:pages},(_,i)=>`<button class="${i+1===state.page?'on':''}" data-page="${i+1}">${i+1}</button>`).join('')}</div>
      <span>Rows per page</span><select id="rpp">${[10,20,50].map(n=>`<option ${n===per?'selected':''}>${n}</option>`).join('')}</select></div></div>`;
}
function filtersPop(){
  const f=state.filters;
  return `<div class="pop" data-stop><h4>Filters<button class="iconbtn" data-act="closepop" style="border:0" aria-label="Close">${ic('x','sm')}</button></h4>
    <div class="field"><label>Tags</label><input class="input" id="ftag" placeholder="Type tag and press Enter"></div>
    <div class="chips" style="margin:8px 0 0">${['VIP','At-risk'].map(t=>`<span class="chip s ${f.tags.includes(t)?'selectable on':'selectable'}" data-ftag="${t}">${t}</span>`).join('')}</div>
    <div class="sec"><div class="field"><label>Created Date</label><input class="input" type="date" id="fdate" value="${esc(f.date)}"></div></div>
    <div class="sec"><div class="field"><label>Age Range</label></div>
      <div class="range"><div class="rv"><span>${f.ageMin}</span><span>${f.ageMax}</span></div>
        <input type="range" id="amin" min="18" max="100" value="${f.ageMin}" aria-label="Minimum age"><input type="range" id="amax" min="18" max="100" value="${f.ageMax}" aria-label="Maximum age"></div></div>
    <div class="foot"><button class="btn text inherit m" data-act="clearfilters">Clear All</button><button class="btn filled primary m" data-act="closepop">Apply</button></div></div>`;
}
function columnsPop(){
  return `<div class="pop" style="width:240px" data-stop><h4>Columns<button class="iconbtn" data-act="closepop" style="border:0" aria-label="Close">${ic('x','sm')}</button></h4>
    ${ALL_COLS.map(c=>`<label class="chk"><input type="checkbox" data-col="${c.k}" ${state.cols.has(c.k)?'checked':''} ${c.fixed?'disabled':''}>${c.l}</label>`).join('')}</div>`;
}

/* ---------- member detail ---------- */
const TABS = [['overview','Overview'],['profile','Profile'],['membership','Memberships'],['payment','Payments'],['providerhistory','Provider History'],['activity','Activity Timeline'],['followups','Follow-ups'],['attendance','Attendance'],['calllogs','Call Logs'],['waiver','Waiver']];
const detail = { tab:'overview', actFilter:'All', fuFilter:'All', memFilter:'All' };

function emptyBlock(t='No Data Found', d="There's nothing to show here yet. Try adjusting your filters or check back later."){
  return `<div class="card"><div class="empty"><div class="eic">${ic('empty')}</div><b>${t}</b>${d}</div></div>`;
}
function tabOverview(m){
  const r = m.rich;
  const fus = r ? DOLI_FOLLOWUPS : [];
  const upcoming = fus.find(f=>f.state==='Missed');
  const act = r ? DOLI_ACTIVITY.slice(0,4) : [];
  return `
  <div class="kpis">
    <div class="card kpi"><div class="l">${ic('wallet','sm')}Total Revenue</div><div class="v">${r?'₹800':'₹0'}<small>${r?'Across 1 billed plan':'No billed plan'}</small></div></div>
    <div class="card kpi"><div class="l">${ic('flag','sm')}Follow-ups</div><div class="v" style="color:${r?'var(--warning-90)':'inherit'}">${fus.length?1:0}<small>${r?'1 missed':''}</small></div></div>
    <div class="card kpi"><div class="l">${ic('card','sm')}Outstanding Balance</div><div class="v">No dues<small>${r?'Across 1 billed plan':''}</small></div></div>
    <div class="card kpi"><div class="l">${ic('cal','sm')}Days Left</div><div class="v">0<small>${r?'of 30 days remaining on the active plan':'No active plan'}</small></div></div>
  </div>
  <div class="grid2">
    <div class="stack">
      <div class="card"><div class="ch"><div><h3>Upcoming Follow Ups</h3><p>Next scheduled follow-ups</p></div><div class="r"><button class="btn outline inherit m" data-tab="followups">View follow-ups</button></div></div>
        ${upcoming?`<div class="fu"><div class="t"><span class="ib3">${ic('phone','sm')}</span><b class="t-m3">Call</b><span class="chip xs outlined" style="margin-left:auto">Call</span><span class="chip xs info">${ic('clock')}Due</span></div>
          <div class="meta">${ic('cal','sm')}${upcoming.when}<span class="by"><span class="sa2">${initials(upcoming.by)}</span>${upcoming.by}</span></div></div>
          <div class="alert error">${ic('info')}<div><b>1 missed follow-ups.</b> A missed item never re-schedules itself — reopen it or close it out.</div></div>`
          :'<div class="muted t-m3">No follow-ups scheduled.</div>'}</div>
      <div class="card"><div class="ch"><div><h3>Recent activity</h3><p>Latest ${act.length||0} activites for the member</p></div><div class="r"><button class="btn outline inherit m" data-tab="activity">View timeline</button></div></div>
        ${act.length?`<div class="feed">${act.map(feedItem).join('')}</div>`:'<div class="muted t-m3">No activity yet.</div>'}</div>
    </div>
    <div class="stack">
      <div class="card"><div class="ch"><h3>Personal Details</h3></div><div class="kv">
        <div class="r"><span>Phone</span><b>${esc(m.phone.startsWith('+91')?'+91 '+m.phone.slice(3):m.phone)}</b></div>
        <div class="r"><span>Email</span><b>${m.email?esc(m.email):'N/A'}</b></div>
        <div class="r"><span>Assigned Provider</span><b>Unassigned</b></div>
        <div class="r"><span>Experience Manager</span><b>${esc(m.manager||'N/A')}</b></div>
        <div class="r"><span>Lead Source</span><b>${esc(m.source||'N/A')}</b></div>
        <div class="r"><span>Lead ID</span><b>${esc(m.leadId||'N/A')} ${m.leadId?'<a>View</a>':''}</b></div></div></div>
      <div class="card"><div class="ch"><h3>Emergency Contact</h3></div><div class="kv"><div class="r"><span>Name</span><b>N/A</b></div><div class="r"><span>Phone</span><b>N/A</b></div></div></div>
    </div>
  </div>`;
}
function feedItem(a){
  return `<div class="fi"><span class="dot"></span><div style="flex:1"><div style="display:flex;gap:8px;align-items:baseline"><span class="tt">${esc(a.t)}</span><span class="tm" style="margin-left:auto">${a.time}</span></div>
    <div class="ds">${esc(a.d)}</div><div class="by"><span class="sa2">${initials(a.by)}</span>${esc(a.by)}</div></div></div>`;
}
function tabProfile(m){
  const ph = m.phone.startsWith('+91')?'+91 '+m.phone.slice(3):m.phone;
  const f = (l,v)=>`<div><div class="lbl">${l}</div><div class="val">${v||'N/A'}</div></div>`;
  return `<div class="stack">
    <div class="card"><div class="ch"><h3>Basic Details</h3><div class="r"><button class="btn outline inherit m">Edit</button></div></div><div class="fgrid">${f('Full Name',esc(m.name))}${f('Date of Birth','')}${f('Gender','')}${f('Age',m.age?m.age+' yrs':'NA yrs')}</div></div>
    <div class="card"><div class="ch"><h3>Contact Details</h3></div><div class="fgrid">${f('Phone',esc(ph))}${f('Email',esc(m.email))}${f('Address','')}</div></div>
    <div class="card"><div class="ch"><h3>Record</h3></div><div class="kv">
      <div class="r"><span>Lead Source</span><b>${esc(m.source||'N/A')}</b></div>
      <div class="r"><span>Lead ID</span><b>${esc(m.leadId||'N/A')} ${m.leadId?'<a>View</a>':''}</b></div>
      <div class="r"><span>Assigned Provider</span><b>Unassigned <a>Change</a></b></div>
      <div class="r"><span>Experience Manager</span><b>${esc(m.manager||'N/A')} <a>Change</a></b></div></div></div>
    <div class="card"><div class="ch"><h3>Emergency contact</h3></div><div class="kv"><div class="r"><span>Name</span><b>N/A</b></div><div class="r"><span>Phone</span><b>N/A</b></div></div></div></div>`;
}
function tabMembership(m){
  const ch = ['All','Active','Frozen','Suspended','Expired'];
  const show = m.rich && (detail.memFilter==='All'||detail.memFilter==='Expired');
  return `<div class="chips">${ch.map(c=>`<button class="chip m selectable ${detail.memFilter===c?'on':''}" data-memf="${c}">${c}</button>`).join('')}<span style="margin-left:auto"></span><button class="btn filled primary m" data-act="addmembership">${ic('plus')}Add Membership</button></div>
  ${show?`<div class="card mem"><div class="top2"><span class="pill">${ic('card')}</span><div><div class="t-h4">monthly</div><div class="muted t-m3">1 Month</div></div><span class="chip s error" style="margin-left:8px">Expired</span><span class="amt">₹800</span></div>
    <div style="display:flex;gap:var(--s-2)"><button class="btn filled primary m">Renew Membership</button><button class="btn outline inherit m">${ic('download')}Invoice</button></div>
    <div class="t-m3" style="border-top:1px solid var(--neutral-10);padding-top:var(--s-3)"><b>Payment history (1)</b><div class="pay" style="margin-top:8px"><span class="ib3">${ic('check','sm')}</span><div><div class="t-m3">Paid</div></div><span class="amt">₹800</span></div></div></div>`
    : emptyBlock('No memberships','There are no memberships for this filter.')}`;
}
function tabPayment(m){
  if(!m.rich) return emptyBlock('No payments','This member has no billed plan yet.');
  return `<div class="field" style="max-width:320px;margin-bottom:var(--s-3)"><label>Select Package</label><select class="input"><option>monthly · 21 Sep 2026</option></select></div>
  <div class="card"><div class="alert error" style="margin:0 0 var(--s-3)">${ic('info')}<div style="flex:1"><b>Membership expired · monthly</b><br>This membership has expired on 20 Oct 2026.</div><span class="chip s error">Expired</span></div>
    <button class="btn filled primary m" style="margin-bottom:var(--s-4)">Renew Membership</button>
    <div class="kpis" style="grid-template-columns:repeat(2,1fr);margin:0 0 var(--s-3)"><div><div class="lbl">Plan Total</div><div class="t-h2">₹800</div><div class="muted t-m3">monthly</div></div><div><div class="lbl">Paid</div><div class="t-h2" style="color:var(--success-80)">₹800</div><div class="muted t-m3">100% collected</div></div></div>
    <div class="rowsb" style="display:flex;justify-content:space-between;margin-bottom:6px"><span class="t-m3">Payment progress</span><b class="t-m3">100% Paid</b></div><div class="bar2"><i style="width:100%"></i></div>
    <div class="pay" style="margin-top:var(--s-4)"><span class="ib3">${ic('check','sm')}</span><div><div class="t-m3"><b>Initial Payment</b> <span class="chip xs success">Paid</span></div><div class="muted t-m3">Paid Sep 21, 2026 · phonepe · Mode: online</div></div><span class="amt">₹800</span></div></div>`;
}
function tabActivity(m){
  const f = ['All','Payments','Tags','Follow-ups','Profile Updates','Freeze'];
  const items = m.rich ? DOLI_ACTIVITY.filter(a=>detail.actFilter==='All'||a.cat===detail.actFilter) : [];
  return `<div class="chips">${f.map(c=>`<button class="chip m selectable ${detail.actFilter===c?'on':''}" data-actf="${c}">${c}</button>`).join('')}</div>
  <div class="card">${items.length?`<div class="feed">${items.map(feedItem).join('')}</div>`:`<div class="empty"><div class="eic">${ic('empty')}</div><b>No Data Found</b>There's nothing to show here yet. Try adjusting your filters or check back later.</div>`}</div>`;
}
function tabFollowups(m){
  const f = ['All','Call','Email','Whatsapp','Meeting','Other'];
  const items = (m.rich?DOLI_FOLLOWUPS:[]).filter(x=>detail.fuFilter==='All'||x.type===detail.fuFilter);
  return `<div class="chips">${f.map(c=>`<button class="chip m selectable ${detail.fuFilter===c?'on':''}" data-fuf="${c}">${c}</button>`).join('')}<span style="margin-left:auto"></span><button class="btn filled primary m" data-act="schedulefu">${ic('plus')}Schedule Follow-Up</button></div>
  ${items.length?`<div class="stack">${items.map(x=>`<div class="card fu"><div class="t"><span class="ib3">${ic('phone','sm')}</span><b class="t-m3">${x.type}</b>
    <span class="chip xs ${x.tag==='Renewal'?'primary':'neutral'}">${x.tag}</span><span class="chip xs ${x.state==='Missed'?'error':'success'}" style="margin-left:auto">${x.state}</span></div>
    ${x.note?`<div class="t-m3" style="margin-bottom:6px">${esc(x.note)}</div>`:''}<div class="meta">${ic('cal','sm')}${x.when}<span class="by"><span class="sa2">${initials(x.by)}</span>${x.by}</span></div></div>`).join('')}</div>`:emptyBlock()}`;
}
function tabAttendance(){
  const k = (l,v,s)=>`<div class="card kpi"><div class="l">${l}</div><div class="v">${v}</div><div class="muted t-m3">${s}</div></div>`;
  return `<div class="kpis">${k('Last Visit','—','—')}${k('Current Activity Status','<span class="chip s warning" style="font-size:14px">Missing</span>','not visited for more than 30 days, or never visited')}${k('Total Visits','0','All time')}${k('Visits This Month','0','Oct 2026')}</div>
  <div class="chips">${['All','Checked out','Checked In','Auto checkout'].map((c,i)=>`<span class="chip m selectable ${i?'':'on'}">${c}</span>`).join('')}<span style="margin-left:auto"></span>${['7 days','30 days','All time'].map((c,i)=>`<span class="chip m selectable ${i===2?'on':''}">${c}</span>`).join('')}</div>${emptyBlock()}`;
}
function tabWaiver(m){
  return `<div class="card"><div class="ch"><div><h3>Waiver</h3></div><div class="r"><span class="chip s warning">Waiting for the user</span></div></div>
    <div class="t-m3 muted" style="margin-bottom:var(--s-3)"><b style="color:var(--text-primary)">Upload Offline</b><br>Already have a signed copy? Upload it to mark this waiver complete.</div>
    <div class="drop">${ic('upload')}<b>Drag & drop signed document</b><span class="t-b3">PDF, JPG or PNG · max 10MB</span><div style="margin-top:var(--s-3)"><button class="btn outline primary m">Choose File</button></div></div></div>`;
}
function viewDetail(m, tab){
  detail.tab = tab;
  const body = {overview:tabOverview, profile:tabProfile, membership:tabMembership, payment:tabPayment, providerhistory:()=>emptyBlock(), activity:tabActivity, followups:tabFollowups, attendance:tabAttendance, calllogs:()=>emptyBlock(), waiver:tabWaiver}[tab](m);
  const rich = !!m.rich;
  return `<div class="mh"><div class="pic" style="background:${avColor(m.id)}">${esc(initials(m.name))}</div>
    <div class="in"><h1>${esc(m.name)} ${stChip(m,true)}</h1>
      <div class="row"><button class="btn outline inherit s" data-act="addtag">${ic('plus')}Add Tag</button>${m.tags.map(t=>`<span class="chip s primary">${esc(t)}</span>`).join('')}</div>
      <div class="age">${m.age?m.age:'NA'} yrs &nbsp;|</div>
      <div class="row"><span class="prov"><span class="q">?</span>Unassigned <a data-act="assign">Assign Provider</a></span></div></div>
    <div class="ac"><button class="iconbtn" aria-label="Call">${ic('phone')}</button><button class="iconbtn" aria-label="Email" ${m.email?'':'disabled'}>${ic('mail')}</button><button class="iconbtn" aria-label="WhatsApp">${ic('msg')}</button><button class="iconbtn" aria-label="More options">${ic('more')}</button></div></div>
  <div class="tabs" role="tablist">${TABS.map(([k,l])=>`<button class="tab ${k===tab?'on':''}" role="tab" data-tab="${k}">${l}</button>`).join('')}</div>
  ${body}`;
}

/* ---------- overlays ---------- */
function openLayer(html){ $('#layer').innerHTML = html; }
function closeLayer(){ $('#layer').innerHTML=''; }
function drawerAdd(errs={}, v={}){
  const f=(id,l,req,ph,type='text',ex='')=>`<div class="field"><label>${l}${req?' <i>*</i>':''}</label><input class="input ${errs[id]?'err':''}" id="a-${id}" type="${type}" placeholder="${ph}" value="${esc(v[id]||'')}" ${ex}>${errs[id]?`<span class="err-text">${errs[id]}</span>`:''}</div>`;
  const sel=(id,l,req,opts)=>`<div class="field"><label>${l}${req?' <i>*</i>':''}</label><select class="input ${errs[id]?'err':''}" id="a-${id}"><option value="">Select ${l.toLowerCase()}</option>${opts.map(o=>`<option ${v[id]===o?'selected':''}>${o}</option>`).join('')}</select>${errs[id]?`<span class="err-text">${errs[id]}</span>`:''}</div>`;
  openLayer(`<div class="scrim right" data-scrim><div class="drawer" role="dialog" aria-label="Add New Members" data-stop>
    <div class="dh"><span class="ib2">${ic('users','sm')}</span><h3>Add New Members</h3><button class="iconbtn" data-act="closelayer" style="border:0" aria-label="Close">${ic('x','sm')}</button></div>
    <div class="db">
      <div class="sect">Basic Information</div>
      <div class="field"><label>Profile Image</label><div class="avup"><span class="big">${ic('user','lg')}</span><div><button class="btn outline primary s">Upload Image</button><div class="t-b3 muted" style="margin-top:4px">Max 5 MB. Image files only (Optional).</div></div></div></div>
      <div class="g2" style="margin-top:var(--s-3)">${f('first','First Name',1,'Enter first name')}${f('last','Last Name',1,'Enter last name')}
        ${f('phone','Phone Number',1,'Enter phone number','tel')}${f('email','Email',0,'eg: patient@example.com','email')}
        ${sel('gender','Gender',1,['Male','Female','Other'])}${f('age','Age',1,'Age','number')}${f('dob','DOB',1,'DD/MM/YYYY')}</div>
      <div class="sect">Address Details</div>
      <div class="g2">${f('a1','Address Line 1',0,'Enter address line 1')}${f('a2','Address Line 2 (Optional)',0,'Enter address line 2')}${f('pin','Pin Code',0,'Enter Pin Code')}
        ${sel('country','Country',1,['India','United Arab Emirates','United States'])}${sel('state','State',1,['Rajasthan','Delhi','Maharashtra'])}${f('city','City',1,'Enter City')}</div>
      <div class="sect">Engagement</div>
      <div class="g2">${sel('interest','Interest',0,['Weight loss','Strength','Fitness'])}${f('tags','Tags',0,'Type tag and press Enter')}${f('source','Source',0,'eg: Referral, Walk-in, Website')}</div>
      <div class="sect">Health and Emergency</div>
      <div class="g2">${f('ec','Emergency Contact',0,'Enter Name')}${f('ecp','Emergency Contact Number',0,'Enter phone number','tel')}</div>
    </div>
    <div class="df"><button class="btn outline inherit m" data-act="closelayer">Cancel</button><button class="btn filled primary m" data-act="submitadd">Submit</button></div></div></div>`);
}
function modalImport(){
  openLayer(`<div class="scrim" data-scrim><div class="modal" role="dialog" aria-label="Member Data Import" data-stop>
    <div style="display:flex;align-items:flex-start;gap:12px"><div style="flex:1"><h3>Member Data Import</h3><div class="sub">Upload Excel file with Members, Payments, and Membership Package tabs up to 10MB</div></div><button class="iconbtn" data-act="closelayer" style="border:0" aria-label="Close">${ic('x','sm')}</button></div>
    <div class="drop" style="margin:var(--s-4) 0 var(--s-3)">${ic('upload')}<b>Drag & drop your file here</b>or <a>browse</a> to choose a file</div>
    <div class="sub" style="text-align:center;margin-bottom:var(--s-4)">Not sure about the format? <a style="color:var(--primary-60);font-weight:600;cursor:pointer">${ic('download','sm')} Download sample file</a></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--s-3)"><button class="btn outline inherit l" data-act="closelayer">Cancel</button><button class="btn filled primary l" disabled>Import</button></div></div></div>`);
}
function modalSimple(title, sub, body, action){
  openLayer(`<div class="scrim" data-scrim><div class="modal" role="dialog" aria-label="${esc(title)}" data-stop>
    <div style="display:flex;gap:12px;align-items:flex-start"><div style="flex:1"><h3>${esc(title)}</h3><div class="sub">${esc(sub)}</div></div><button class="iconbtn" data-act="closelayer" style="border:0" aria-label="Close">${ic('x','sm')}</button></div>
    <div style="margin:var(--s-4) 0">${body}</div>
    <div style="display:flex;justify-content:flex-end;gap:var(--s-2)"><button class="btn outline inherit m" data-act="closelayer">Cancel</button>${action||''}</div></div></div>`);
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
  if (p[0]==='members' && p[1]){
    const m = members.find(x=>x.id===p[1]) || members[0];
    const tab = TABS.some(t=>t[0]===q.tab)?q.tab:'overview';
    main = viewDetail(m,tab); crumbs.push({t:'Members',href:'#/members'},{t:m.name});
  } else if (!p[0] || p[0]==='members'){
    main = viewMembers(); crumbs.push({t:'Members'});
  } else {
    const names = Object.fromEntries(NAV.flatMap(g=>g.items).map(i=>[i.k,i.l]));
    main = `<div class="ph"><div class="tt"><h1 class="t-h1">${esc(names[p[0]]||'Programs')}</h1></div></div><div class="stub"><b>Shell page</b>${esc(STUB_TEXT[p[0]]||'Not part of this prototype yet.')}</div>`;
    crumbs.push({t:names[p[0]]||'Programs'});
  }
  const sc = window.scrollY;
  $('#app').classList.toggle('collapsed', state.collapsed);
  renderSide(nav); renderTop(crumbs); $('#main').innerHTML = main;
  window.scrollTo(0, sc);
}
function go(h){ if (location.hash===h) render(); else location.hash=h; }
window.addEventListener('hashchange', ()=>{ state.popup=null; window.scrollTo(0,0); render(); });

/* ---------- events ---------- */
document.addEventListener('click', e=>{
  const t = e.target;
  const inStop = t.closest('[data-stop]');
  // overlays
  if (t.matches('[data-scrim]')) { closeLayer(); return; }
  const a = t.closest('[data-act],[data-go],[data-nav],[data-tab],[data-tile],[data-sort],[data-page],[data-status],[data-setstatus],[data-menu],[data-ftag],[data-memf],[data-actf],[data-fuf]');
  if (!a){ if (!inStop && state.popup){ state.popup=null; render(); } return; }
  const d = a.dataset;
  if (d.go){ state.popup=null; go(d.go); return; }
  if (d.nav){ state.popup=null; if (d.nav==='members') go('#/members'); else go('#/'+d.nav); return; }
  if (d.tab){ const {p}=parse(); go(`#/members/${p[1]}?tab=${d.tab}`); return; }
  if (d.tile){ state.tile=d.tile; state.page=1; render(); return; }
  if (d.sort!==undefined){ state.sortDir = state.sortDir==='desc'?'asc':'desc'; render(); return; }
  if (d.page){ state.page=+d.page; render(); return; }
  if (d.status){ state.popup = state.popup==='status:'+d.status?null:'status:'+d.status; render(); return; }
  if (d.setstatus){ const [id,s]=d.setstatus.split('|'); const m=members.find(x=>x.id===id); if(m && m.status!==s){ m.status=s; if(m.rich) DOLI_ACTIVITY.unshift({t:'Member status updated',time:'Just now',d:`Member status was changed to ${s}.`,by:'Rohitashav Garg',cat:'Profile Updates'}); toast(`${m.name} is now ${s}`);} state.popup=null; render(); return; }
  if (d.menu){ state.popup = state.popup==='menu:'+d.menu?null:'menu:'+d.menu; render(); return; }
  if (d.ftag){ const f=state.filters.tags, i=f.indexOf(d.ftag); i>-1?f.splice(i,1):f.push(d.ftag); state.page=1; render(); return; }
  if (d.memf){ detail.memFilter=d.memf; render(); return; }
  if (d.actf){ detail.actFilter=d.actf; render(); return; }
  if (d.fuf){ detail.fuFilter=d.fuf; render(); return; }
  switch(d.act){
    case 'collapse': state.collapsed=!state.collapsed; render(); break;
    case 'profile': state.popup = state.popup==='profile'?null:'profile'; render(); break;
    case 'filters': state.popup = state.popup==='filters'?null:'filters'; render(); break;
    case 'columns': state.popup = state.popup==='columns'?null:'columns'; render(); break;
    case 'pagemenu': state.popup = state.popup==='page'?null:'page'; render(); break;
    case 'closepop': state.popup=null; render(); break;
    case 'clearfilters': state.filters={tags:[],date:'',ageMin:18,ageMax:100}; state.page=1; render(); break;
    case 'add': drawerAdd(); break;
    case 'import': modalImport(); break;
    case 'closelayer': closeLayer(); break;
    case 'allmembers': toast('Opens the list of all YourPal members across programs'); break;
    case 'export': state.popup=null; render(); toast('Export started. This is a prototype, no file is created'); break;
    case 'assign': modalSimple('Assign Provider','Choose a provider for this member.',`<div class="field"><label>Provider</label><select class="input"><option>Select provider</option></select></div>`,`<button class="btn filled primary m" data-act="closelayer">Assign</button>`); break;
    case 'notes': { state.popup=null; render(); const m=members.find(x=>x.id===a.dataset.id); modalSimple('Notes',m?m.name:'','<div class="field"><label>Add a note</label><textarea class="input" style="height:96px;padding:8px 12px" placeholder="Write a note"></textarea></div>',`<button class="btn filled primary m" data-act="closelayer">Save note</button>`); break; }
    case 'transfer': { state.popup=null; render(); const m=members.find(x=>x.id===a.dataset.id); modalSimple('Transfer Program',m?m.name:'','<div class="field"><label>Program</label><select class="input"><option>Select program</option><option>Elevate Fitness Club</option><option>IAmFit</option></select></div>',`<button class="btn filled primary m" data-act="closelayer">Transfer</button>`); break; }
    case 'addtag': modalSimple('Add Tag','Tags help you filter members.','<div class="field"><label>Tag</label><input class="input" placeholder="Type tag and press Enter"></div>',`<button class="btn filled primary m" data-act="closelayer">Add</button>`); break;
    case 'addmembership': modalSimple('Add Membership','Choose a package for this member.','<div class="field"><label>Package</label><select class="input"><option>3 months, ₹2,000</option><option>monthly, ₹800</option></select></div>',`<button class="btn filled primary m" data-act="closelayer">Add</button>`); break;
    case 'schedulefu': modalSimple('Schedule Follow-Up','Pick a type, date and time.','<div class="g2"><div class="field"><label>Type</label><select class="input"><option>Call</option><option>Email</option><option>Whatsapp</option><option>Meeting</option></select></div><div class="field"><label>Date</label><input class="input" type="date"></div></div>',`<button class="btn filled primary m" data-act="closelayer">Schedule</button>`); break;
    case 'submitadd': submitAdd(); break;
  }
});
document.addEventListener('input', e=>{
  const t=e.target;
  if (t.id==='q'){ state.q=t.value; state.page=1; const pos=t.selectionStart; render(); const n=$('#q'); n.focus(); n.setSelectionRange(pos,pos); }
  else if (t.id==='fdate'){ state.filters.date=t.value; state.page=1; render(); }
  else if (t.id==='amin'||t.id==='amax'){ let lo=+$('#amin').value, hi=+$('#amax').value; if(lo>hi){ if(t.id==='amin') lo=hi; else hi=lo; } state.filters.ageMin=lo; state.filters.ageMax=hi; state.page=1; render(); const n=$('#'+t.id); n&&n.focus(); }
});
document.addEventListener('change', e=>{
  const t=e.target;
  if (t.dataset && t.dataset.col){ t.checked?state.cols.add(t.dataset.col):state.cols.delete(t.dataset.col); render(); }
  else if (t.id==='rpp'){ state.rows=+t.value; state.page=1; render(); }
});
document.addEventListener('keydown', e=>{
  if (e.key==='Escape'){ if ($('#layer').innerHTML) closeLayer(); else if (state.popup){ state.popup=null; render(); } }
  if (e.key==='Enter' && e.target.id==='ftag'){ const v=e.target.value.trim(); if(v && !state.filters.tags.includes(v)){ state.filters.tags.push(v); state.page=1; render(); } }
});

function submitAdd(){
  const g = id => ($('#a-'+id)||{}).value||'';
  const v = {}; ['first','last','phone','email','gender','age','dob','a1','a2','pin','country','state','city','interest','tags','source','ec','ecp'].forEach(k=>v[k]=g(k).trim());
  const errs = {};
  ['first','last','phone','gender','age','dob','country','state','city'].forEach(k=>{ if(!v[k]) errs[k]='This field is required'; });
  if (v.phone && !/^\+?\d[\d\s-]{7,}$/.test(v.phone)) errs.phone='Enter a valid phone number';
  if (v.email && !/^\S+@\S+\.\S+$/.test(v.email)) errs.email='Enter a valid email';
  if (Object.keys(errs).length){ drawerAdd(errs, v); return; }
  const now=new Date(); const ts=+`${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
  members.unshift({id:'n'+Date.now(), name:`${v.first} ${v.last}`, email:v.email, phone:(v.phone.startsWith('+')?v.phone:'+91'+v.phone.replace(/\D/g,'')), created:fmtDate(now), ts, status:'Active', waiver:'Pending', tags:v.tags?[v.tags]:[], source:v.source, age:+v.age||null});
  closeLayer(); state.tile='all'; state.page=1; render(); toast(`${v.first} ${v.last} was added`);
}

render();
})();
