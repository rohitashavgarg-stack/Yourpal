const MS_CHIP = {Expired:'chip s error', Active:'chip s success', Frozen:'chip s info', Suspended:'chip s warning', Transferred:'chip s neutral'};
const msBalance = ms => ms.balance!=null ? ms.balance : Math.max(0, ms.amount - (ms.paid||0));
const msPays = ms => ms.pays || (ms.paid ? [{label:'Initial Payment', amount:ms.paid, when:ms.when, mode:'online'}] : []);
function membershipCard(ms){
  const open = state.popup==='memmenu:'+ms.id, paying = !!detail.payOpen[ms.id];
  const locked = ms.status==='Transferred';
  const pays = msPays(ms), total = pays.reduce((a,p)=>a+p.amount,0), bal = msBalance(ms);
  const note = ms.to ? `Transferred to <a data-go="#/members/${ms.toId}?tab=membership">${esc(ms.to)}</a> on ${ms.on}`
             : ms.from ? `Transferred from <a data-go="#/members/${ms.fromId}?tab=membership">${esc(ms.from)}</a>, ${ms.daysLeft} days left` : '';
  const readyItem = ms.status==='Active' && !ms.ready ? `<button class="mi" data-act="markready:${ms.id}">${ic('swap')}Mark ready for transfer</button>`
                  : ms.ready ? `<button class="mi" data-act="unready:${ms.id}">${ic('x')}Remove from transfer list</button>` : '';
  const menu = open && !locked ? `<div class="menu" style="right:0;top:40px" data-stop><button class="mi" data-act="toast:Opens the invoice preview in the live app">${ic('eye')}Preview Invoice</button><button class="mi" data-act="toast:Downloads the invoice PDF in the live app">${ic('download')}Download Invoice</button><hr class="mdiv"><button class="mi" data-act="editstart">${ic('cal')}Edit Start Date</button>${readyItem?`<hr class="mdiv">${readyItem}`:''}</div>` : '';
  return `<div class="mcard ${locked?'locked':''}"><div class="mrow"><span class="mtile">${ic('star','lg')}</span>
      <div class="mid"><div class="mt"><b>${ms.name}</b><span class="${MS_CHIP[ms.status]}"><i class="dot"></i>${ms.status}</span>${ms.ready?`<span class="chip s info">${ic('swap','sm')}Ready for transfer</span>`:''}${bal>0&&ms.status==='Active'?`<span class="chip s warning">Balance due ${rupee(bal)}</span>`:''}</div><div class="ma"><b>${rupee(ms.amount)}</b><span class="chip xs neutral">${ms.dur}</span></div>${note?`<div class="mnote">${note}</div>`:''}</div>
      <div class="mact">${ms.status==='Expired'?btn('outline inherit m','renew','Renew Membership','refresh'):''}${btn('outline inherit m','invoice','Invoice','receipt-text',locked?'disabled':'')}<button class="iconbtn sq" data-act="memmenu:${ms.id}" aria-label="More membership actions" ${locked?'disabled':''}>${ic('more','sm')}</button>${menu}</div></div>
    <button class="phist" data-act="togglepay:${ms.id}" aria-expanded="${paying}"><span>${ic(paying?'chev-d':'chev-r')}Payment history (${pays.length})</span><b>${pays.length?'Paid '+rupee(total):'No payments'}</b></button>
    ${paying?`<div class="pbody">${pays.length?pays.map(payRow).join(''):`<div class="muted t-b3">${ms.from?'Payment history stays with '+esc(ms.from)+'.':'No payments recorded.'}</div>`}</div>`:''}</div>`;
}
function tabMembership(m){
  const list = m.memberships.filter(x=>detail.memFilter==='All'||x.status===detail.memFilter);
  return `<div class="chips">${filterChips(['All','Active','Frozen','Suspended','Expired','Transferred'],detail.memFilter,'data-memf')}<span class="sp"></span>${btn('filled primary l rect','addmembership','Add Membership','plus')}</div>
  ${list.length?`<div class="stack">${list.map(membershipCard).join('')}</div>`:`<div class="card">${empty('No memberships','There are no memberships for this filter.')}</div>`}`;
}
