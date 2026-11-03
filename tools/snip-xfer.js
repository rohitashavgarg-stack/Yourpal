/* ---------- transfer membership (epic RPM-1464) ----------
   1. An active membership is marked Ready for transfer from its card menu.
   2. The receiver side starts the transfer: the Add Membership and Convert to Member drawers have a small
      "Transfer membership" pill beside the package heading. Step 1 selects a ready membership, step 2 reviews it.
   3. The previous owner's card turns into a greyed-out, view-only Transferred card. Both members are notified.
   From the product feedback: a transfer fee, an editable start date and the payment method used when converting a lead. */
const TRANSFER_PERMISSION = true;   // Transfer Membership Package permission (on for Program Admin)
const notifs = [];
const xf = { ctx:'add', kind:'member', rid:null, rname:'', leadId:null, step:1, q:'', sel:null, start:'', end:'', reason:'', note:'', fee:'', pay:'later', amt:'', mode:'Offline', pdate:'', gst:'', bill:'', errs:{}, busy:false, done:false, res:null };

function modalMarkReady(msId){
  const m = curMember(), ms = m.memberships.find(x=>x.id===msId);
  openLayer(modalRaw('', 'Mark ready for transfer', `
    <div class="mh2"><h3 style="flex:1">Mark ready for transfer?</h3><button class="iconbtn rnd" data-act="closelayer" aria-label="Close">${ic('x')}</button></div>
    <div class="mb"><div class="t-b2">The ${esc(ms.name)} membership of ${esc(m.name)} will appear in the transfer search when another member is given a membership. You can remove it from the list at any time.</div></div>
    <div class="mf">${cancel}${btn('filled primary m','doready:'+msId,'Mark ready')}</div>`));
}
function setReady(msId, on){
  const m = curMember(), ms = m.memberships.find(x=>x.id===msId);
  ms.ready = on;
  m.activity.unshift({t:on?'Marked ready for transfer':'Removed from transfer list', time:'Just now', d:`${ms.name} membership was ${on?'marked ready for transfer':'removed from the transfer list'} by Rohitashav Garg.`, by:'Rohitashav Garg', cat:'Profile Updates', k:'swap', tone:'t'});
  closeLayer(); state.popup = null; render();
}

function xfOwners(){
  const q = xf.q.trim().toLowerCase(), d = q.replace(/\D/g,'');
  const rows = [];
  members.forEach(m => {
    if (xf.kind==='member' && m.id===xf.rid) return;
    const ready = m.memberships.filter(ms => ms.ready && ms.status==='Active');
    if (!ready.length) return;
    if (q && !m.name.toLowerCase().includes(q) && !(d && m.phone.replace(/\D/g,'').includes(d))) return;
    rows.push({m, ready});
  });
  return rows;
}
function xfList(){
  const rows = xfOwners();
  if (!rows.length) return `<div class="empty" style="padding:24px"><b>No memberships are marked ready for transfer.</b><span>Mark an active membership as ready from its ⋮ menu first.</span></div>`;
  return rows.map(({m, ready}) => `<div class="xown"><div class="xownh"><span class="av40" style="background:${avColor(m.id)}">${esc(initials(m.name)[0])}</span>
      <div style="flex:1;min-width:0"><b>${esc(m.name)}</b><small>${esc(phoneFmt(m.phone))}</small></div><span class="chip s info">${ready.length} ready for transfer</span></div>
    ${ready.map(ms => { const key = m.id+'|'+ms.id, bal = msBalance(ms);
      return `<button class="xms ${xf.sel===key?'on':''}" data-xfsel="${key}"><span class="xrad"></span><div style="flex:1;min-width:0"><b>${esc(ms.name)}, ${rupee(ms.amount)}</b><small>${ms.daysLeft} days left, ends ${ms.end}</small></div>${bal>0?`<span class="chip s warning">${rupee(bal)} due</span>`:'<span class="chip s success">No dues</span>'}</button>`; }).join('')}</div>`).join('');
}
function xfSel(){ if (!xf.sel) return null; const [mid, msid] = xf.sel.split('|'); const m = members.find(x=>x.id===mid); return m ? {m, ms:m.memberships.find(x=>x.id===msid)} : null; }
function xfPill(){
  return `<span class="pillsw" role="group" aria-label="Membership type"><button data-act="xfnew">New membership</button><button class="on" aria-current="true">Transfer membership</button></span>`;
}
function xfStep1(){
  return `<div class="sbox full">${ic('search','sm')}<input id="xfq" placeholder="Search the current owner by name or phone" value="${esc(xf.q)}" aria-label="Search the current owner"></div>
    <div class="xlist" id="xflist">${xfList()}</div>${xf.errs.sel?`<span class="err-text">${xf.errs.sel}</span>`:''}`;
}
function xfParty(label, hero, name, id, sub, tag, tone){
  return `<div class="xc"><div class="xlbl">${label}</div>
    <div class="xrow"><div class="xhero">${hero}</div><span class="xpill"><i style="background:${avColor(id)}">${esc(initials(name)[0])}</i><b>${esc(name)}</b></span></div>
    <div class="xfoot"><span class="xsub">${esc(sub)}</span><span class="chip s ${tone}">${tag}</span></div></div>`;
}
function xfDue(ms){ return (+xf.fee||0) + msBalance(ms); }
function xfReview(){
  const {m, ms} = xfSel(), e = xf.errs, bal = msBalance(ms), due = xfDue(ms);
  const fld = (id, l, req, type, val, ph='') => `<div class="field"><label for="${id}">${l}${req?' <i>*</i>':''}</label><input class="input ${e[id]?'err':''}" id="${id}" type="${type}" value="${esc(val)}" placeholder="${ph}">${e[id]?`<span class="err-text">${e[id]}</span>`:''}</div>`;
  const pay = due>0 ? `<div class="sect">Payment<small>The receiver owes ${rupee(due)}${xf.fee?`, the transfer fee of ${rupee(+xf.fee)} and the balance of ${rupee(bal)}`:''}. Pay now in full or in part, or pay later.</small></div>
    <div class="field"><div class="radio"><button class="${xf.pay==='later'?'on':''}" data-xfpay="later">Pay later</button><button class="${xf.pay==='now'?'on':''}" data-xfpay="now">Pay now</button></div></div>
    ${xf.pay==='now'?`${fld('xf-amt','Amount to pay now',1,'number',xf.amt||due,'Enter amount')}
      <div class="field"><label>Mode of Payment <i>*</i></label><div class="radio"><button class="${xf.mode==='Offline'?'on':''}" data-xfmode="Offline">Offline</button><button class="${xf.mode==='Online'?'on':''}" data-xfmode="Online">Online</button></div></div>
      <div class="g2">${fld('xf-pdate','Payment Date',1,'date',xf.pdate)}${fld('xf-gst','GST Number',0,'text',xf.gst,'Enter GST number')}</div>
      <div class="field"><label for="xf-bill">Billing Address</label><textarea class="input" id="xf-bill" placeholder="Enter billing address">${esc(xf.bill)}</textarea></div>`:''}` : '';
  return `<div class="xwrap"><div class="xcards">
      ${xfParty('From', ms.daysLeft+' days', m.name, m.id, ms.name+' plan, '+rupee(ms.amount), 'Current owner', 'outlined')}
      <span class="xarr">${ic('arrow-down')}</span>
      ${xfParty('To', ms.daysLeft+' days', xf.rname, xf.kind==='member'?xf.rid:xf.leadId, xf.kind==='member'?'Receives the membership':'Becomes a member', xf.kind==='member'?'Existing member':'Lead', xf.kind==='member'?'outlined':'success')}</div></div>
    <div class="card tight"><div class="kv">
      <div class="r"><span>Membership</span><b>${esc(ms.name)}</b></div>
      <div class="r"><span>Amount</span><b>${rupee(ms.amount)}</b></div>
      <div class="r"><span>Outstanding balance</span><b>${rupee(bal)}${bal>0?' payable by '+esc(xf.rname):''}</b></div>
      <div class="r"><span>Past payments</span><b>Stay with ${esc(m.name)}</b></div></div></div>
    <div class="g2">${fld('xf-start','Start date',1,'date',xf.start)}${fld('xf-end','End date',1,'date',xf.end)}</div>
    <div class="g2">${fld('xf-fee','Transfer fee (₹)',0,'number',xf.fee,'0')}<div></div></div>
    <div class="field"><label for="xf-reason">Reason (optional)</label><input class="input" id="xf-reason" value="${esc(xf.reason)}" placeholder="Why is this membership moving?"></div>
    <div class="field"><label for="xf-note">Note (optional)</label><textarea class="input" id="xf-note" placeholder="Add a note for the timeline">${esc(xf.note)}</textarea></div>${pay}`;
}
function xfSuccess(){
  const r = xf.res;
  return `<div class="empty" style="padding:24px 0 8px"><span class="okbig">${ic('check','xl')}</span><b style="font-size:20px;line-height:30px;margin-top:8px">Membership assigned successfully.</b>
    <span>${esc(r.toName)} now holds the ${esc(r.plan)} membership. ${esc(r.fromName)}'s card shows Transferred. Both members were notified.</span></div>
    <div class="card tight"><div class="kv"><div class="r"><span>Balance moved to ${esc(r.toName)}</span><b>${rupee(r.balance)}</b></div><div class="r"><span>Paid now</span><b>${rupee(r.paidNow)}</b></div><div class="r"><span>Recorded on</span><b>29 Oct 2026</b></div></div></div>`;
}
function drawerXfer(){
  const title = xf.ctx==='add' ? 'Add Membership' : 'Convert to Member?';
  let body, foot;
  if (xf.done) {
    body = xfSuccess();
    foot = btn('outline inherit m','xfview','View '+esc(xf.res.toName))+btn('filled primary m','closelayer','Done');
  } else {
    const head = `<div class="sect sectrow"><div>Choose your Package<small>Transfer a membership that is ready for transfer.</small></div>${xfPill()}</div>`;
    const steps = `<div class="steps"><span class="on"></span><span class="${xf.step===2?'on':''}"></span></div><div class="t-b3 muted" style="margin:8px 0 16px">Step ${xf.step} of 2, ${xf.step===1?'Select membership':'Review and confirm'}</div>`;
    body = head + steps + '<div class="fstack">' + (xf.step===1 ? xfStep1() : xfReview()) + '</div>';
    foot = xf.step===1 ? cancel + btn('filled primary m','xfreview','Review transfer','',xf.sel?'':'disabled')
                       : btn('outline inherit m','xfback','Back') + btn('filled primary m','xfconfirm','Confirm transfer');
  }
  openLayer(drawerShell(title, esc(xf.rname), body, foot, 'side'));
}
function xfOpen(ctx){
  const m = ctx==='add' ? curMember() : null, l = ctx==='convert' ? leads.find(x=>x.id===cv.id) : null;
  Object.assign(xf, { ctx, kind:ctx==='add'?'member':'lead', rid:m?m.id:null, rname:(m||l).name, leadId:l?l.id:null, step:1, q:'', sel:null, start:'', end:'', reason:'', note:'', fee:'', pay:'later', amt:'', mode:'Offline', pdate:isoDate(TODAY), gst:'', bill:'', errs:{}, busy:false, done:false, res:null });
  drawerXfer();
}
function xfRead(){
  const g = id => { const el = $('#'+id); return el ? el.value : null; };
  const v = { start:g('xf-start'), end:g('xf-end'), fee:g('xf-fee'), reason:g('xf-reason'), note:g('xf-note'), amt:g('xf-amt'), pdate:g('xf-pdate'), gst:g('xf-gst'), bill:g('xf-bill') };
  Object.keys(v).forEach(k => { if (v[k]!==null) xf[k] = v[k]; });
}
function xfReviewGo(){
  const pick = xfSel();
  if (!pick) { xf.errs.sel = 'Choose a membership to transfer'; drawerXfer(); return; }
  xf.errs = {};
  if (!xf.start) { xf.start = pick.ms.startIso || isoDate(TODAY); xf.end = pick.ms.endIso || isoDate(addDays(new Date(xf.start), pick.ms.daysLeft)); }
  xf.step = 2; drawerXfer();
}
function xfConfirm(){
  if (xf.busy) return;
  xfRead(); xf.errs = {};
  const pick = xfSel(); if (!pick) { xf.step = 1; drawerXfer(); return; }
  const {m:src, ms} = pick, bal = msBalance(ms), fee = Math.max(0, +xf.fee || 0), due = fee + bal;
  if (!xf.start) xf.errs['xf-start'] = 'This field is required';
  if (!xf.end) xf.errs['xf-end'] = 'This field is required';
  if (xf.start && xf.end && new Date(xf.end) < new Date(xf.start)) xf.errs['xf-end'] = "The end date can't be before the start date";
  let payNow = 0;
  if (due>0 && xf.pay==='now') {
    payNow = +xf.amt || 0;
    if (payNow<=0 || payNow>due) xf.errs['xf-amt'] = `Enter an amount between ₹1 and ${rupee(due)}`;
    if (!xf.pdate) xf.errs['xf-pdate'] = 'This field is required';
  }
  let clash = null;
  if (xf.kind==='lead') { const l = leads.find(x=>x.id===xf.leadId); clash = members.find(x => digits10(x.phone)===digits10(l.phone)); if (clash) xf.errs['xf-start'] = `This number already belongs to ${clash.name}. The lead cannot be converted.`; }
  if (Object.keys(xf.errs).length) { drawerXfer(); const e = $('.err-text'); if (e) e.scrollIntoView({block:'center'}); return; }
  xf.busy = true;   // one transfer only, even on a double click
  let to;
  if (xf.kind==='lead') { const l = leads.find(x=>x.id===xf.leadId); to = mkMember({name:l.name, email:l.email, phone:l.phone, source:l.source||'Lead'}); members.unshift(to); l.stage = 'Converted'; l.follow = ''; l.memberId = to.id; }
  else to = members.find(x=>x.id===xf.rid);
  const feePaid = Math.min(fee, payNow), balPaid = payNow - feePaid;
  const pays = payNow>0 ? [{label:feePaid>0?'Transfer payment':'Balance payment', amount:payNow, when:fmtLong(new Date(xf.pdate)), mode:xf.mode.toLowerCase()}] : [];
  const when = 'Oct 29, 2026', why = [xf.reason.trim() && 'Reason: '+xf.reason.trim(), xf.note.trim() && 'Note: '+xf.note.trim()].filter(Boolean).join('. ');
  ms.status = 'Transferred'; ms.ready = false; ms.to = to.name; ms.toId = to.id; ms.on = when; ms.balance = 0;
  to.memberships.unshift({id:'ms'+Date.now(), name:ms.name, status:'Active', amount:ms.amount, dur:ms.dur, paid:null, pays, balance:Math.max(0, bal - balPaid), fee:fee||null, when, end:fmtLong(new Date(xf.end)), daysLeft:ms.daysLeft, from:src.name, fromId:src.id, startIso:xf.start, endIso:xf.end});
  const log = (who, dir) => ({t:dir==='out'?'Membership transferred out':'Membership transferred in', time:'Just now', d:`Membership Transferred: ${ms.name}, from ${src.name} to ${to.name}, balance moved ${rupee(bal)}${fee?', transfer fee '+rupee(fee):''}${why?'. '+why:''}. Transferred by Rohitashav Garg, 29 Oct 2026.`, by:'Rohitashav Garg', cat:'Profile Updates', k:'swap', tone:'t'});
  src.activity.unshift(log(src, 'out')); to.activity.unshift(log(to, 'in'));
  notifs.unshift({text:`Your ${ms.name} has been transferred to ${to.name}.`, unread:true}, {text:`${ms.name} has been transferred to you by ${src.name}.`, unread:true});
  xf.res = {toId:to.id, toName:to.name, fromName:src.name, plan:ms.name, balance:bal, paidNow:payNow};
  xf.done = true; state.popup = null; render(); drawerXfer();
  xf.busy = false;
}

