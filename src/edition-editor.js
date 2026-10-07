export function editionPanel() {
  const selection = (id, label) => `<div class="field"><label for="${id}">${label}</label><select id="${id}"><option value="">انتخاب نشده</option></select></div>`;
  return `<details class="edition-settings glass"><summary><span><b>صفحه اول را بچین</b><small>خبر اصلی، انتخاب سردبیر و پرونده ویژه</small></span><span class="edition-toggle" aria-hidden="true">+</span></summary><form id="editionForm"><div class="edition-config-grid"><fieldset><legend>خبر اصلی</legend>${selection('editionMain','خبر در کانون صفحه اول')}<p class="helper">انتخاب خودکار، خبر فوری یا تازه‌ترین خبر را نمایش می‌دهد.</p></fieldset><fieldset><legend>انتخاب سردبیر</legend>${[1,2,3].map(index => selection('editionPick'+index,'انتخاب '+index)).join('')}</fieldset><fieldset><legend>پرونده ویژه</legend><div class="field"><label for="editionDossierTitle">عنوان پرونده</label><input id="editionDossierTitle" maxlength="140" placeholder="عنوان مشترک خبرهای این پرونده"></div><div class="field"><label for="editionDossierDescription">معرفی کوتاه پرونده</label><textarea id="editionDossierDescription" maxlength="300" rows="2" placeholder="این خبرها چه موضوع مشترکی دارند؟"></textarea></div>${[1,2,3,4].map(index => selection('editionDossier'+index,'روایت '+index)).join('')}</fieldset></div><div class="edition-config-actions"><button class="btn btn-primary" id="saveEdition" type="submit">ذخیره چیدمان صفحه اول</button><a class="btn btn-soft" href="/">مشاهده صفحه اول</a><p id="editionMessage" role="status" aria-live="polite"></p></div></form></details>`;
}

export const editionEditorStyles = `
.edition-settings{border-radius:23px;margin:22px 0;overflow:hidden}.edition-settings>summary{cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:22px 27px;list-style:none}.edition-settings>summary::-webkit-details-marker{display:none}.edition-settings>summary b{display:block;font-size:19px;font-weight:800;color:#254852}.edition-settings>summary small{display:block;font-size:11px;color:#758b92;margin-top:3px}.edition-toggle{display:grid;place-items:center;border:1px solid #d8e5e4;border-radius:50%;width:35px;height:35px;font-size:23px;color:#688e85;flex-shrink:0;transition:transform .2s}.edition-settings[open] .edition-toggle{transform:rotate(45deg)}.edition-settings[open]>summary{border-bottom:1px solid #e1eaea}.edition-settings>form{padding:23px 27px 27px}.edition-config-grid{display:grid;grid-template-columns:.75fr 1fr 1.25fr;gap:27px}.edition-config-grid fieldset{border:0;border-inline-start:1px solid #dce7e6;margin:0;padding:0 20px 0 0;min-inline-size:0;min-width:0}.edition-config-grid fieldset:first-child{border:0;padding:0}.edition-config-grid legend{font-weight:750;font-size:14px;color:#345b62;margin-bottom:8px}.edition-config-grid input,.edition-config-grid select,.edition-config-grid textarea{width:100%;min-width:0}.edition-config-grid textarea{min-height:85px!important;resize:vertical}.edition-config-grid .field{margin:12px 0}.edition-config-grid .field label{font-size:10px}.edition-config-grid .field select{font-size:11px}.edition-config-actions{border-top:1px solid #dce7e6;padding-top:20px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:24px}.edition-config-actions p{font-size:11px;color:#417c67;margin:0;max-width:100%;overflow-wrap:anywhere}.edition-config-actions p.is-error{color:#bd4157}.edition-settings>summary:focus-visible{outline:3px solid #159e9c;outline-offset:-5px}
@media(max-width:820px){.edition-config-grid{grid-template-columns:1fr 1fr}.edition-config-grid fieldset:last-child{grid-column:1/-1;border:0;border-top:1px solid #dce7e6;padding:20px 0 0;margin-top:4px}}@media(max-width:600px){.edition-settings{border-radius:18px;margin-block:17px}.edition-settings>summary{padding:20px}.edition-settings>summary b{font-size:17px}.edition-settings>summary small{font-size:9px}.edition-settings>form{padding:20px}.edition-config-grid{grid-template-columns:1fr;gap:20px}.edition-config-grid fieldset{border:0;border-top:1px solid #dce7e6;padding:20px 0 0}.edition-config-grid fieldset:last-child{grid-column:auto}.edition-config-grid .field select,.edition-config-grid .field input,.edition-config-grid .field textarea{font-size:13px}.edition-config-actions{gap:8px}.edition-config-actions .btn{font-size:10px}.edition-config-actions p{flex-basis:100%;font-size:10px}}
`;

export const editionEditorScript = `
function renderEdition(edition={}) {
  const published=allRows.filter(article=>['published','breaking'].includes(article.status)&&article.published_at);
  const fields=['editionMain',...Array.from({length:3},(_,i)=>'editionPick'+(i+1)),...Array.from({length:4},(_,i)=>'editionDossier'+(i+1))];
  for(const id of fields){
    const select=$('#'+id);
    select.innerHTML='<option value="">'+(id==='editionMain'?'انتخاب خودکار':'انتخاب نشده')+'</option>'+published.map(article=>'<option value="'+esc(article.slug)+'">'+esc(article.title)+'</option>').join('');
  }
  $('#editionMain').value=edition.main_slug||'';
  for(let i=1;i<=3;i++)$('#editionPick'+i).value=edition.editor_picks?.[i-1]||'';
  for(let i=1;i<=4;i++)$('#editionDossier'+i).value=edition.dossier_slugs?.[i-1]||'';
  $('#editionDossierTitle').value=edition.dossier_title||'';
  $('#editionDossierDescription').value=edition.dossier_description||'';
}
$('#editionForm').addEventListener('submit',async event=>{
  event.preventDefault();
  const button=$('#saveEdition'),message=$('#editionMessage');
  const input={main_slug:$('#editionMain').value,editor_picks:Array.from({length:3},(_,i)=>$('#editionPick'+(i+1)).value).filter(Boolean),dossier_title:$('#editionDossierTitle').value,dossier_description:$('#editionDossierDescription').value,dossier_slugs:Array.from({length:4},(_,i)=>$('#editionDossier'+(i+1)).value).filter(Boolean)};
  message.textContent='';message.classList.remove('is-error');button.disabled=true;button.textContent='در حال ذخیره…';
  try{const response=await api('/api/admin/homepage',{method:'PUT',body:JSON.stringify(input)});renderEdition(response.edition);message.textContent='چیدمان صفحه اول ذخیره شد.';}
  catch(error){message.textContent=error.message;message.classList.add('is-error');}
  finally{button.disabled=false;button.textContent='ذخیره چیدمان صفحه اول';}
});
`;
