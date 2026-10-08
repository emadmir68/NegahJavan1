// Shared by the browser and tests; never enlarges the original photograph.
export function imageTransformPlan(width, height, crop = false) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width<=0 || height<=0) throw new Error('ابعاد تصویر معتبر نیست.');
  let sw=width, sh=height;
  if (crop) {
    if (width/height>16/9) sw=height*16/9;
    else sh=width*9/16;
  }
  const scale=Math.min(1,1920/Math.max(sw,sh));
  return {sx:(width-sw)/2,sy:(height-sh)/2,sw,sh,width:Math.max(1,Math.round(sw*scale)),height:Math.max(1,Math.round(sh*scale)),changed:scale<1 || sw!==width || sh!==height};
}

export const imageToolsScript = imageTransformPlan.toString() + String.raw`
async function prepareNewsPhoto(file,crop=false){
  const mime=fileMime(file);
  if(!['image/jpeg','image/png'].includes(mime))return {file,note:'فرمت اصلی عکس حفظ شد.'};
  let image,objectUrl='';
  try{
    if(typeof createImageBitmap==='function')image=await createImageBitmap(file,{imageOrientation:'from-image'});
    else{objectUrl=URL.createObjectURL(file);image=new Image();image.src=objectUrl;await image.decode()}
    const width=image.width||image.naturalWidth,height=image.height||image.naturalHeight;
    if(width*height>40000000)throw new Error('برای آماده‌سازی، عکسی با ابعاد کوچک‌تر انتخاب کنید.');
    const plan=imageTransformPlan(width,height,crop);
    const canvas=document.createElement('canvas');canvas.width=plan.width;canvas.height=plan.height;
    const context=canvas.getContext('2d');if(!context)throw new Error('آماده‌سازی عکس در این مرورگر ممکن نیست.');
    context.drawImage(image,plan.sx,plan.sy,plan.sw,plan.sh,0,0,plan.width,plan.height);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,mime==='image/png'?'image/webp':'image/jpeg',0.86));
    if(!blob)throw new Error('آماده‌سازی عکس کامل نشد.');
    if(!plan.changed && blob.size>=file.size)return {file,note:'عکس با کیفیت اصلی آماده است.'};
    const extension=({'image/webp':'webp','image/jpeg':'jpg','image/png':'png'})[blob.type];
    if(!extension)throw new Error('فرمت خروجی عکس معتبر نیست.');
    const prepared=new File([blob],file.name.replace(/\.[^.]+$/,'')+'.'+extension,{type:blob.type,lastModified:file.lastModified});
    return {file:prepared,note:plan.width+' × '+plan.height+(crop?' · برش مرکزی ۱۶:۹':'')+' · آماده‌شده برای وب'};
  }finally{image?.close?.();if(objectUrl)URL.revokeObjectURL(objectUrl)}
}
`;
