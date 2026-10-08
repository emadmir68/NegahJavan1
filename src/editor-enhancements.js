export function editorAiPanel() {
  return `<section class="editor-ai" aria-labelledby="editorAiTitle"><div><h3 id="editorAiTitle">دستیار تحریریه</h3><p id="aiAvailability" class="helper">در حال بررسی دسترسی…</p></div><div class="actions"><button type="button" id="aiRewrite" class="btn btn-soft" disabled>اصلاح هوشمند متن</button><button type="button" id="aiImage" class="btn btn-soft" disabled>ساخت تصویر برای خبر بی‌عکس</button></div><p class="helper">پیشنهاد متن را پیش از اعمال بررسی کنید. تصویر ساخته‌شده با برچسب «تصویرسازی هوش مصنوعی» منتشر می‌شود.</p><p id="aiMessage" class="helper" role="status" aria-live="polite"></p><div id="aiProposal" hidden><h4>پیشنهاد برای بررسی</h4><label for="aiProposedTitle">تیتر پیشنهادی</label><input id="aiProposedTitle" readonly><label for="aiProposedExcerpt">خلاصه پیشنهادی</label><textarea id="aiProposedExcerpt" readonly></textarea><label for="aiProposedBody">متن پیشنهادی</label><textarea id="aiProposedBody" readonly></textarea><p id="aiProposedCategory" class="helper"></p><p class="helper">نام‌ها، نقل‌قول‌ها و جزئیات خبر را با متن اصلی تطبیق دهید.</p><div class="actions"><button type="button" id="aiApply" class="btn btn-primary">اعمال پیشنهاد در فرم</button><button type="button" id="aiDismiss" class="btn btn-soft">حفظ متن اصلی</button></div></div></section>`;
}

export const editorEnhancementStyles = `
.editor-ai{padding:20px;margin:20px 0;border:1px solid #bdd7d3;border-radius:16px;background:#f0f8f5}.editor-ai h3{margin:0;font-size:19px;color:#17423d}.editor-ai .helper{font-size:12px;line-height:1.9}.editor-ai .btn:disabled{opacity:.45;cursor:not-allowed}.editor-ai [hidden]{display:none!important}.editor-ai #aiProposal{margin-top:18px;padding-top:18px;border-top:1px solid #cadfd9}.editor-ai #aiProposedBody{min-height:230px}.editor-ai #aiProposedExcerpt{min-height:85px}.editor-ai label{display:block;margin:10px 0 6px;font-size:12px;color:#345a55}.editor-ai input,.editor-ai textarea{display:block;width:100%;border:1px solid #bfd6cd;border-radius:9px;padding:10px 12px;background:#fff;color:#173b40;font:inherit;font-size:13px;line-height:2;resize:vertical}.editor-ai .is-error{color:#b72d4b}.preview-media{position:relative;aspect-ratio:16/9!important;height:auto!important;padding:0!important;overflow:hidden;background:#e5eeeb}.preview-media>img,.preview-media>video{display:block;position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.preview-media>video{object-fit:contain;background:#17333a}.preview-media .preview-ai-label{position:absolute;bottom:9px;left:9px;border-radius:6px;padding:4px 8px;background:#183a37e6;color:white;font-size:11px}#saveNotice{padding:12px 16px;margin:14px 0;border:1px solid #bad7ca;border-radius:12px;background:#edf8f0;color:#245b42;font-size:13px;line-height:1.8}#saveNotice:empty{display:none}#saveNotice a{color:inherit;text-decoration:underline}
`;

export const editorEnhancementScript = String.raw`
let imageGenerated=false;
const editorAi={configured:false,busy:false,generation:0,proposal:null,snapshot:''};
function composeSnapshot(){return JSON.stringify([editing,...['title','body','excerpt','category','hero_image','image_alt','image_caption','video_url','video_caption','status','author_name','source_name','source_url','format','slug'].map(id=>$('#'+id).value),pendingMedia.image.version])}
function aiArticleInput(){return {title:$('#title').value,body:$('#body').value,excerpt:$('#excerpt').value,category:$('#category').value,request_id:crypto.randomUUID()}}
function aiMessage(text,error=false){$('#aiMessage').textContent=text;$('#aiMessage').classList.toggle('is-error',error)}
function refreshAiButtons(){
  const ready=editorAi.configured&&!editorAi.busy&&!$('#save').disabled&&!!$('#title').value.trim();
  $('#aiRewrite').disabled=!ready||!$('#body').value.trim();
  $('#aiImage').disabled=!ready||!mediaConnection.configured||!!$('#hero_image').value.trim()||!!pendingMedia.image.file||pendingMedia.image.processing||!!pendingMedia.image.xhr;
  $('#aiRewrite').textContent=editorAi.busy?'در حال پردازش…':'اصلاح هوشمند متن';
}
function renderEditorAi(config={}){editorAi.configured=!!config.configured;$('#aiAvailability').textContent=config.configured?'متن و تصویر فقط با درخواست شما ساخته می‌شوند؛ این ابزار سهمیهٔ روزانه دارد.':'دستیار هوش مصنوعی در این نسخه در دسترس نیست؛ مرتب‌سازی متن و کاور گرافیکی فعال‌اند.';refreshAiButtons()}
function dismissAiProposal(){editorAi.proposal=null;$('#aiProposal').hidden=true}
function resetAiDraft(){editorAi.generation++;editorAi.busy=false;dismissAiProposal();aiMessage('');refreshAiButtons()}
async function requestEditorialAi(kind){
  if(editorAi.busy)return;
  const button=$('#'+(kind==='image'?'aiImage':'aiRewrite'));if(button.disabled)return;
  const generation=++editorAi.generation,snapshot=composeSnapshot();
  dismissAiProposal();editorAi.busy=true;refreshAiButtons();
  aiMessage(kind==='image'?'در حال ساخت تصویر اختصاصی و ذخیره در فضای عکس‌های خبر…':'در حال آماده‌سازی پیشنهاد برای بررسی…');
  try{
    const data=await api('/api/admin/ai-'+(kind==='image'?'image':'rewrite'),{method:'POST',body:JSON.stringify(aiArticleInput())});
    if(generation!==editorAi.generation)return;
    if(snapshot!==composeSnapshot()){aiMessage('خبر در این فاصله تغییر کرده است؛ نتیجه روی متن یا عکس فعلی اعمال نشد.');return}
    if(kind==='image'){
      if(data.media?.kind!=='image'||!clientMediaUrl(data.media?.url))throw new Error('تصویر ساخته‌شده معتبر نیست.');
      $('#hero_image').value=data.media.url;$('#image_alt').value=data.alt||'';$('#image_caption').value=data.caption||'';imageGenerated=true;
      releasePendingMedia('image');refreshMediaPreview('image');updatePreview();
      aiMessage('تصویر آماده شد؛ با ذخیرهٔ خبر به آن متصل می‌شود.');
    }else{
      const p=data.prepared;if(!p||typeof p.body!=='string'||typeof p.title!=='string')throw new Error('پیشنهاد متن کامل نبود.');
      editorAi.proposal=p;editorAi.snapshot=snapshot;
      $('#aiProposedTitle').value=p.title;$('#aiProposedExcerpt').value=p.excerpt||'';$('#aiProposedBody').value=p.body;
      $('#aiProposedCategory').textContent='دسته پیشنهادی: '+(labels[p.category]||'عمومی');$('#aiProposal').hidden=false;
      aiMessage('پیشنهاد آماده است؛ متن اصلی تا انتخاب «اعمال پیشنهاد» حفظ می‌شود.');
    }
  }catch(error){if(generation===editorAi.generation)aiMessage(error.message,true)}
  finally{if(generation===editorAi.generation){editorAi.busy=false;refreshAiButtons()}}
}
$('#aiRewrite').onclick=()=>requestEditorialAi('rewrite');
$('#aiImage').onclick=()=>requestEditorialAi('image');
$('#aiDismiss').onclick=()=>{dismissAiProposal();aiMessage('متن اصلی حفظ شد.')};
$('#aiApply').onclick=()=>{
  if(!editorAi.proposal)return;
  if(composeSnapshot()!==editorAi.snapshot){dismissAiProposal();aiMessage('متن اصلی تغییر کرده است؛ برای همین متن پیشنهاد تازه بگیرید.',true);return}
  const p=editorAi.proposal;
  for(const id of ['title','body','excerpt','category'])if(typeof p[id]==='string')$('#'+id).value=p[id];
  dismissAiProposal();updateInsights();updatePreview();refreshAiButtons();aiMessage('پیشنهاد در فرم اعمال شد؛ برای ثبت، خبر را ذخیره کنید.');
};
$('#articleForm').addEventListener('input',()=>{refreshAiButtons();if(editorAi.proposal&&composeSnapshot()!==editorAi.snapshot){dismissAiProposal();aiMessage('با تغییر خبر، پیشنهاد قبلی کنار گذاشته شد.')}});
$('#articleForm').addEventListener('change',refreshAiButtons);
`;
