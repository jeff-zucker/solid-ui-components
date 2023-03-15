/*
  color       // a ui:Color for text of the selector
  background  // a ui:Color for the background of the selector
  highlight   // a ui:Color for the selector options background
  size        // the number of options to show
  parts       // an array of options
  dataSource  // a component address that yields an array of options
  onchange    // action to take on selection
*/
export function optionSelector(j) {
    const hasSuic = typeof solidUI !="undefined";
    j.color ||= hasSuic ?solidUI.menuColor :"#000000";
    j.background ||= hasSuic ?solidUI.menuBackground : "#c0c0c0";
    j.highlight ||= hasSuic ?solidUI.menuHighlight : "#909090";
    j.size ||=  hasSuic ?solidUI.selectorSize :0;
    const borderColor = j.color;
    const wrapper = document.createElement('DIV');
    let collectionSelector = document.createElement('DIV');
    collectionSelector.style = `border:1px solid ${borderColor};border-bottom:none`;
    collectionSelector.style.background=j.background;
    collectionSelector.style.color= j.color;
    j.parts ||= j.dataSource.parts;
    const firstOption = j.label || j.parts[0] ?(j.parts[0]).label || j.parts[0]:"";
    collectionSelector.innerHTML = `<div style="border-bottom:1px solid ${borderColor}; padding:0.5em;cursor:pointer;"><span style="display:table-cell;width:100%">${firstOption}</span><span style="display:table-cell;width:100%;text-align:right;">⌄</span></div>`;
    let collectionsList = document.createElement('DIV');
    collectionSelector.querySelector('div').onclick=()=>{
      collectionsList.style.display||="block";     
      if(collectionsList.style.display==="block") collectionsList.style.display="none";     
      else collectionsList.style.display="block";     
    }
    for(let p of j.parts){
      p.link ||= p.value;
      p.type ||= p.contentType;
      collectionsList.innerHTML += `<a href="${p.link}" style="text-decoration:none;display:block;border-bottom:1px solid ${borderColor}; padding:0.5em; background-color:${j.highlight};color:${j.color}" data-label="${p.label}" data-link="${p.link}" data-type="${p.type}">${p.label}</a>`;
    }
    let anchorList = collectionsList.querySelectorAll('A');
    for(let anchor of anchorList){
      anchor.onclick = (e)=>{
         e.preventDefault();
         let el = e.target;
         for(let a of anchorList){
           if(a==el) a.style.background=j.background;
           else  a.style.background=j.highlight;
         }
         if(!j.size) {
            el.parentElement.style.display="none";
            collectionSelector.querySelector('DIV SPAN').innerHTML=el.innerHTML;
         }
         console.log(99,el.href,el.dataset.type,el.dataset.link)
         return j.onchange(el.innerHTML,el.href,el.dataset.type);
      }
    }
    if(j.size){
       if(j.size>j.parts.length) j.size=j.parts.length;              
       j.size = (j.size*2)+1+"rem";
       collectionsList.style = `border:1px solid ${borderColor};border-top:none;height:${j.size}`;
       collectionsList.style.overflow="auto";
       collectionsList.style["max-height"]=j.size;
//       collectionsList.style["border-radius"]="0.4rem";
    }
    else {
      collectionsList.style=`border:1px solid ${borderColor};border-top:none;display:none`;
//      collectionSelector.style["border-radius"]="0.4rem";
      collectionSelector.style["margin-bottom"]="0.4rem";
      wrapper.appendChild(collectionSelector);
    }
    collectionsList.style["margin-bottom"]="0.4rem";
    wrapper.appendChild(collectionsList);
    return wrapper;
  }


