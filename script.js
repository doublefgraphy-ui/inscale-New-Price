(()=>{
  'use strict';
  const CSV_URL='price.csv';
  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];
  const state={products:[],mode:'all',floor:'',gallery:[],galleryIndex:0,current:null};

  function parseCSV(text){
    const rows=[];let row=[],field='',quoted=false;
    for(let i=0;i<text.length;i++){
      const c=text[i],n=text[i+1];
      if(c==='"'&&quoted&&n==='"'){field+='"';i++;continue}
      if(c==='"'){quoted=!quoted;continue}
      if(c===','&&!quoted){row.push(field);field='';continue}
      if((c==='\n'||c==='\r')&&!quoted){if(field!==''||row.length){row.push(field);rows.push(row)}row=[];field='';if(c==='\r'&&n==='\n')i++;continue}
      field+=c;
    }
    if(field!==''||row.length){row.push(field);rows.push(row)}
    if(!rows.length)return[];
    const headers=rows.shift().map(h=>h.trim().replace(/^\uFEFF/,''));
    return rows.filter(r=>r.some(v=>String(v||'').trim())).map(r=>Object.fromEntries(headers.map((h,i)=>[h,String(r[i]||'').trim()])));
  }
  const esc=v=>String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  const digits=v=>String(v||'').replace(/[^0-9]/g,'');
  function money(v){const raw=String(v||'').trim();if(!raw)return '가격 문의';if(raw.includes('\n'))return esc(raw.split('\n').map(x=>{const d=digits(x);return d?`₩${Number(d).toLocaleString('ko-KR')}`:x}).join('\n'));const d=digits(raw);return d?`₩${Number(d).toLocaleString('ko-KR')}`:esc(raw.replace(/\\/g,'₩'))}
  function hasSale(p){return String(p.dp_price||'').trim()!==''||/DP\s*SALE|DPSALE|DISPLAY SALE/i.test([p.sale_status,p.display,p.note].join(' '))}
  function images(p){return [...new Set([p.image,...String(p.more_image||'').split('|'),...String(p.showroom_images||'').split('|')].map(x=>x.trim()).filter(Boolean))]}
  function searchText(p){return [p.floor,p.brand,p.name,p.designer,p.size,p.material,p.color,p.origin,p.product_code,p.description].join(' ').toLowerCase()}
  function hydrate(p){return {...p,dpSale:hasSale(p),search:searchText(p)}}

  function counts(){
    const ps=state.products;$('#statProducts').textContent=ps.length.toLocaleString('ko-KR');$('#statBrands').textContent=new Set(ps.map(p=>p.brand).filter(Boolean)).size.toLocaleString('ko-KR');$('#countAll').textContent=ps.length;
    ['B1','1F','2F','3F','4F'].forEach(f=>$('#count'+f).textContent=ps.filter(p=>p.floor===f).length);$('#countSale').textContent=ps.filter(p=>p.dpSale).length;
  }
  function filtered(){const q=$('#searchInput').value.trim().toLowerCase();return state.products.filter(p=>(!q||p.search.includes(q))&&(state.mode!=='floor'||p.floor===state.floor)&&(state.mode!=='sale'||p.dpSale))}
  function brandSort(a,b){return a.localeCompare(b,'en',{sensitivity:'base'})}
  function subtitleForBrand(brand){const map={CASSINA:'Contemporary Italian Design',VITRA:'Design Classics & Contemporary Furniture',ARTEK:'Finnish Modern Design',KNOLL:'Modern Furniture & Design Icons','POLTRONA FRAU':'Italian Leather & Craftsmanship',FLOS:'Architectural & Decorative Lighting',ARTEMIDE:'Italian Lighting Design',MUUTO:'New Perspectives on Scandinavian Design'};return map[String(brand||'').toUpperCase()]||'INSCALE SHOWROOM COLLECTION'}
  function specRow(label,value){return value?`<div class="quick-spec-row"><span>${label}</span><strong>${esc(value)}</strong></div>`:''}

  function card(p,index){
    const priceClass=String(p.price||'').includes('\n')?' many':'';
    const imgs=images(p);
    const actions=[];
    if(imgs.length>1)actions.push(`<button class="card-action" type="button" data-gallery="${index}">MORE IMAGE · ${imgs.length}</button>`);
    if(p.url)actions.push(`<a class="card-action primary" href="${esc(p.url)}" target="_blank" rel="noopener">INFO LINK →</a>`);
    return `<article class="product-card">
      <div class="product-image">${p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" onerror="this.style.display='none'">`:''}<span class="floor-label">${esc(p.floor||'-')}</span><span class="brand-label">${esc(p.brand||'INSCALE')}</span>${p.dpSale?'<span class="sale-dot" title="DP SALE"></span>':''}</div>
      <div class="product-body">
        <h4 class="product-name">${esc(p.name||'-')}</h4>
        <p class="product-designer">${esc(p.designer||p.category||'')}</p>
        <div class="product-price${priceClass}">${money(p.price)}</div>
        ${p.dp_price?`<div class="product-sale">DP SALE · ${money(p.dp_price)}${p.discount_rate?` <small>${esc(p.discount_rate)}% OFF</small>`:''}</div>`:''}
        <div class="quick-spec">
          ${specRow('Size',p.size)}
          ${specRow('Material',p.material)}
          ${specRow('Color',p.color)}
          ${specRow('Origin',p.origin)}
        </div>

      </div>
      ${actions.length?`<div class="card-actions ${actions.length===1?'single':''}">${actions.join('')}</div>`:''}
    </article>`;
  }

  function render(){
    const items=filtered();const by=new Map();items.forEach(p=>{const k=p.brand||'OTHER';if(!by.has(k))by.set(k,[]);by.get(k).push(p)});
    const title=state.mode==='floor'?`${state.floor} Display`:state.mode==='sale'?'DP Sale':'All Products';
    $('#catalogTitle').textContent=title;$('#catalogEyebrow').textContent=state.mode==='floor'?`${state.floor} SHOWROOM`:state.mode==='sale'?'SPECIAL DISPLAY':'ALL DISPLAY';$('#resultCount').textContent=`${items.length.toLocaleString('ko-KR')} PRODUCTS · ${by.size.toLocaleString('ko-KR')} BRANDS`;
    $('#emptyState').hidden=items.length!==0;
    $('#brandSections').innerHTML=[...by.entries()].sort((a,b)=>brandSort(a[0],b[0])).map(([brand,list])=>`<section class="brand-section"><div class="brand-banner"><div class="brand-banner-main"><span class="brand-mark"></span><div><h3>${esc(brand)}</h3><p>${esc(subtitleForBrand(brand))}</p></div></div><span class="brand-count">${list.length}개</span></div><div class="product-grid">${list.map(p=>card(p,state.products.indexOf(p))).join('')}</div></section>`).join('');
  }

  function openGallery(index){const p=state.products[index];if(!p)return;state.current=p;state.gallery=images(p);if(state.gallery.length<2)return;state.galleryIndex=0;$('#galleryBrand').textContent=p.brand||'INSCALE';$('#galleryName').textContent=p.name||'';updateGallery();$('#galleryModal').hidden=false;document.body.style.overflow='hidden'}
  function updateGallery(){const p=state.current,u=state.gallery[state.galleryIndex]||'';$('#galleryImage').src=u;$('#galleryImage').alt=p?.name||'';$('#galleryCount').textContent=`${state.galleryIndex+1} / ${state.gallery.length}`;$('#galleryPrev').hidden=state.gallery.length<=1;$('#galleryNext').hidden=state.gallery.length<=1}
  function closeGallery(){$('#galleryModal').hidden=true;document.body.style.overflow='';state.current=null;state.gallery=[]}
  function shift(n){if(!state.gallery.length)return;state.galleryIndex=(state.galleryIndex+n+state.gallery.length)%state.gallery.length;updateGallery()}
  function reset(){state.mode='all';state.floor='';$('#searchInput').value='';$$('.tab').forEach((b,i)=>b.classList.toggle('is-active',i===0));render();window.scrollTo({top:0,behavior:'smooth'})}

  $('#floorTabs').addEventListener('click',e=>{const b=e.target.closest('.tab');if(!b)return;state.mode=b.dataset.mode;state.floor=b.dataset.floor||'';$$('.tab').forEach(x=>x.classList.toggle('is-active',x===b));render();document.querySelector('.catalog-wrap').scrollIntoView({behavior:'smooth',block:'start'})});
  $('#searchInput').addEventListener('input',render);$('#resetBtn').addEventListener('click',reset);$('#homeBtn').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  $('#brandSections').addEventListener('click',e=>{const b=e.target.closest('[data-gallery]');if(b)openGallery(Number(b.dataset.gallery))});
  $('#galleryModal').addEventListener('click',e=>{if(e.target.closest('[data-close-gallery]'))closeGallery()});$('#galleryPrev').addEventListener('click',()=>shift(-1));$('#galleryNext').addEventListener('click',()=>shift(1));document.addEventListener('keydown',e=>{if($('#galleryModal').hidden)return;if(e.key==='Escape')closeGallery();if(e.key==='ArrowLeft')shift(-1);if(e.key==='ArrowRight')shift(1)});

  fetch(CSV_URL,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('price.csv load failed');return r.text()}).then(t=>{state.products=parseCSV(t).map(hydrate);counts();render()}).catch(err=>{$('#resultCount').textContent='데이터 로딩 실패';$('#brandSections').innerHTML=`<div class="empty">price.csv 파일을 확인해주세요.<br>${esc(err.message)}</div>`});
})();
