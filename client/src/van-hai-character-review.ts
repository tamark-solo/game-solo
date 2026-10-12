import './van-hai-character-review.css';
import {mountCharacterMapReview} from './features/character-map-review';
import {characterCostumeGallery} from './ui/character-costume-gallery';
import {characterQiConceptGallery} from './ui/character-qi-concept-gallery';
import {CHARACTER_QI_CONCEPTS} from './core/character-qi-concepts';
import {CHARACTER_MAP_VARIANTS,CHARACTER_MAP_REVIEW_IDS as IDS} from './core/character-map-review-state';
// Costume art comparison only: no player identity, gameplay or persistence mutations.
const root=document.querySelector('.player-review')!;
document.getElementById('costume-gallery')!.innerHTML=characterCostumeGallery();
document.getElementById('costume-gallery')!.insertAdjacentHTML('beforebegin',characterQiConceptGallery());
const mapSection=mountCharacterMapReview(document.querySelector('main')!);
document.querySelector('.identity-reference')!.before(mapSection);
const select=document.getElementById(IDS.variant) as HTMLSelectElement;
function markSelected(){root.querySelectorAll<HTMLElement>('[data-costume-card]').forEach(card=>{const selected=card.dataset.costumeCard===select.value;card.dataset.selected=String(selected);card.querySelector('button')!.setAttribute('aria-pressed',String(selected));});}
select.addEventListener('change',markSelected);
const proposalSelect=document.getElementById(IDS.proposal) as HTMLSelectElement;
function markConcept(){root.querySelectorAll<HTMLElement>('[data-qi-concept-card]').forEach(card=>{const selected=card.dataset.qiConceptCard===proposalSelect.value;card.dataset.selected=String(selected);card.querySelector('button')!.setAttribute('aria-pressed',String(selected));});}
select.addEventListener('change',markConcept);mapSection.addEventListener('character-map-art-change',()=>{markSelected();markConcept();});
root.addEventListener('click',event=>{const button=(event.target as HTMLElement).closest<HTMLButtonElement>('[data-qi-concept]');if(!button)return;const value=button.dataset.qiConcept!;if(!Object.prototype.hasOwnProperty.call(CHARACTER_QI_CONCEPTS,value))return;proposalSelect.value=value;proposalSelect.dispatchEvent(new Event('change',{bubbles:true}));mapSection.querySelector<HTMLButtonElement>('[data-camera-zoom="1"]')!.click();mapSection.scrollIntoView({block:'start'});});
const galleryQi=document.getElementById('costume-gallery-qi') as HTMLInputElement,mapQi=document.getElementById(IDS.qi) as HTMLInputElement;
galleryQi.addEventListener('change',()=>{mapQi.checked=galleryQi.checked;mapQi.dispatchEvent(new Event('change',{bubbles:true}));});
mapQi.addEventListener('change',()=>{galleryQi.checked=mapQi.checked;});
const galleryMotion=document.getElementById('costume-gallery-motion') as HTMLInputElement,mapMotion=document.getElementById(IDS.motion) as HTMLInputElement;
galleryMotion.addEventListener('change',()=>{mapMotion.checked=galleryMotion.checked;mapMotion.dispatchEvent(new Event('change',{bubbles:true}));});
mapMotion.addEventListener('change',()=>{galleryMotion.checked=mapMotion.checked;});
root.addEventListener('click',event=>{
 const button=(event.target as HTMLElement).closest<HTMLButtonElement>('[data-costume-variant]');
 if(!button)return;const value=button.dataset.costumeVariant!;
 if(!Object.prototype.hasOwnProperty.call(CHARACTER_MAP_VARIANTS,value))return;
 select.value=value;select.dispatchEvent(new Event('change',{bubbles:true}));mapSection.scrollIntoView({block:'start'});
});
if(new URLSearchParams(location.search).get('view')==='map')mapSection.scrollIntoView({block:'start'});
