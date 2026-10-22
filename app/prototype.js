import {screens as classic} from './screens.js';
import {screens as alternate} from './screens-v2.js';
import {slides as orbitSlides} from './variant-two.js';
import {icon} from './icons.js';

// Screenshot order: the first alternate illustration, then classic benefits and match.
const screens = [alternate[0], classic[1], classic[2]];
const one = document.querySelector('#keysOnboardingPrototype');
const two = document.querySelector('#variantTwo');
const modal = document.querySelector('dialog');
const params = new URLSearchParams(location.search);
let variant = params.get('variant') === '2' || /variant-2\.html$/.test(location.pathname) ? 2 : 1;
let step = Math.min(2, Math.max(0, (Number(params.get('step')) || 1) - 1));
const steps = [0, 0];
one.querySelector('.kon-stage').innerHTML = screens.map((s,i) => `<section class="kon-slide" data-theme="${s.theme}" aria-labelledby="title-${i}"><div class="kon-visual" aria-hidden="true">${s.visual}</div><div class="kon-copy"><span class="kon-eyebrow">${s.eyebrow}</span><h1 id="title-${i}" tabindex="-1">${s.title}</h1><p>${s.body}</p></div></section>`).join('');
one.querySelector('.kon-back').innerHTML = icon('back');
two.querySelector('.orbit-slides').innerHTML = orbitSlides.map((html,i)=>`<section class="orbit-slide" aria-label="Шаг ${i+1}">${html}</section>`).join('');
two.querySelector('.step-bars').innerHTML = [0,1,2].map(i=>`<button type="button" data-step="${i}" aria-label="Шаг ${i+1}"></button>`).join('');
// Retain the original artwork proportions on compact phone heights.
const artResize = new ResizeObserver(entries => entries.forEach(({target,contentRect:r}) => {
  target.style.setProperty('--orbit-art-scale', Math.min(r.width / 343, r.height / Number(target.dataset.artHeight)));
}));
two.querySelectorAll('.orbit-slide').forEach(slide => {
  const art = [...slide.querySelectorAll('div')].find(el => ['356px','380px'].includes(el.style.height) && el.style.overflow === 'hidden');
  if (art) {
    art.dataset.artHeight = parseFloat(art.style.height); art.classList.add('orbit-visual');
    const inner = document.createElement('div'); inner.className = 'orbit-art'; inner.style.height = art.style.height; inner.style.setProperty('--original-height',art.style.height);
    inner.append(...art.childNodes); art.append(inner); artResize.observe(art);
  }
  const title = [...slide.querySelectorAll('span')].find(el => el.style.fontSize === '24px' && el.style.fontFamily.includes('Unbounded'));
  if(title){const heading=document.createElement('h1');heading.style.cssText=title.style.cssText;heading.style.margin='0';heading.tabIndex=-1;heading.append(...title.childNodes);title.replaceWith(heading);}
});
const resize = new ResizeObserver(entries=>entries.forEach(({target,contentRect:r})=>target.style.setProperty('--kon-art-scale',Math.min(r.width/320,r.height/360))));
one.querySelectorAll('.kon-visual').forEach(el=>resize.observe(el));
function show(focus = false) {
  steps[variant-1]=step;
  one.hidden=variant!==1; two.hidden=variant!==2;
  document.body.dataset.variant=variant;
  document.querySelectorAll('.variant-switch button').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.variant)===variant)));
  one.style.setProperty('--kon-step',step);
  one.querySelectorAll('.kon-slide').forEach((el,i)=>{el.style.setProperty('--kon-offset',i-step);el.inert=i!==step;el.setAttribute('aria-hidden',String(i!==step));el.classList.toggle('is-current',i===step);});
  two.querySelectorAll('.orbit-slide').forEach((el,i)=>{el.hidden=i!==step;el.inert=i!==step;});
  document.querySelectorAll('[data-back]').forEach(el=>{el.disabled=step===0;if(el.classList.contains('kon-back'))el.hidden=step===0;});
  document.querySelectorAll('[data-skip]').forEach(el=>el.hidden=step===2);
  document.querySelectorAll('[data-booking]').forEach(el=>el.hidden=step!==2);
  one.querySelector('[data-onboard-label]').textContent=step===2?'Найти мой отель':'Дальше';
  one.querySelector('[data-onboard-progress]').textContent=`${step+1} из 3`;
  two.querySelector('[data-next]').textContent=step===2?'Начать':'Дальше';
  two.querySelector('.orbit-footer').classList.toggle('last',step===2);
  two.querySelectorAll('[data-step]').forEach((b,i)=>{b.classList.toggle('complete',i<=step);b.setAttribute('aria-current',i===step?'step':'false');});
  document.querySelector('[data-step-status]').textContent=`Шаг ${step+1} из 3`;
  const url=new URL(location.href);url.searchParams.set('variant',variant);url.searchParams.set('step',step+1);try { history.replaceState(null,'',url); } catch { /* Some local-file browsers restrict URL updates; navigation still works. */ }
  if(focus)(variant===1?one.querySelector('.is-current h1'):two.querySelector('.orbit-slide:not([hidden]) h1'))?.focus({preventScroll:true});
}
function go(index){step=Math.max(0,Math.min(2,index));show(true);}
function finish(booking=false){
  modal.querySelector('h2').textContent=booking?'Переходим к вашей брони':'Переходим к поиску отеля';
  modal.querySelector('[data-completion-text]').textContent=booking?'Следующий экран приложения — добавление существующей брони. Здесь заканчивается прототип онбординга.':'Три шага пройдены. Следующий экран приложения — поиск отеля. Здесь заканчивается прототип онбординга.';
  modal.showModal();
}
document.querySelectorAll('[data-next]').forEach(b=>b.addEventListener('click',()=>step<2?go(step+1):finish()));
document.querySelectorAll('[data-skip]').forEach(b=>b.addEventListener('click',()=>go(2)));
document.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',()=>go(step-1)));
document.querySelectorAll('[data-booking]').forEach(b=>b.addEventListener('click',()=>finish(true)));
document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>go(Number(b.dataset.step))));
document.querySelectorAll('.variant-switch [data-variant]').forEach(b=>b.addEventListener('click',()=>{variant=Number(b.dataset.variant);step=steps[variant-1];show();}));
document.querySelector('[data-restart]').addEventListener('click',()=>go(0));
modal.addEventListener('close',()=>{if(modal.returnValue==='restart')go(0);});
let pointer=null, swiped=false;
document.querySelectorAll('[data-phone-screen]').forEach(phone=>{
  phone.addEventListener('pointerdown',e=>{if(e.isPrimary&&e.button===0){pointer={x:e.clientX,y:e.clientY};swiped=false;}});
  phone.addEventListener('pointerup',e=>{if(!pointer)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer=null;if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.3){swiped=true;go(step+(dx<0?1:-1));}});
  phone.addEventListener('pointercancel',()=>pointer=null);
  phone.addEventListener('click',e=>{if(swiped){e.preventDefault();e.stopImmediatePropagation();swiped=false;}},true);
});
document.addEventListener('keydown',e=>{if(modal.open||e.target.closest('.variant-switch'))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(step+(e.key==='ArrowRight'?1:-1));}});
show();
