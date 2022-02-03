class SelectorPanel {

  render(j){
    const wrapper = document.createElement('SPAN');
    wrapper.classList.add('solid-ui-component');
//    wrapper.style=`width:100%;height:${j.height};display:table-row`;
  wrapper.style="display:flex;flex-direction:row;width:100%;height:${j.height}"
    const leftColumn = document.createElement('DIV');
    leftColumn.style="display:table-cell;margin-top:0; width:30vw; padding-left:0.5em;";
    leftColumn.style="display:flex;flex-direction:column;margin-top:0; width:30vw; max-height:100vh;";
    const rightColumn = document.createElement('DIV');
//    rightColumn.style=`display:table-cell;height:{j.height} !important;width:69vw; border:1px solid red;`;
    rightColumn.style=`flex-grow:1;height:{j.height};max-height:100vh;`;

    let collectionSelector = document.createElement('DIV');
    collectionSelector.style = `width:${j.width};border:1px solid grey;`;
    collectionSelector.style.background=j.unselBackground;
    collectionSelector.style.color=j.unselColor;
    j.parts ||= j.dataSource.parts;
    const firstOption = j.label || (j.parts[0]).label;
    collectionSelector.innerHTML = `
       <div style="border-bottom:1px solid grey; padding:1em;cursor:pointer;">
        <span style="display:table-cell;width:99%">${firstOption}</span><span style="display:table-cell;font-size:large;width:100%;text-align:right;">⌄</span>
       </div>
    `;
    let collectionsList = document.createElement('DIV');
    collectionsList.style = `width:${j.width};border:1px solid grey;border-top:none;display:none`;
    collectionSelector.querySelector('div').onclick=()=>{
      collectionsList.style.display="block";     
    }
    for(let p of j.parts){
      collectionsList.innerHTML += `
         <a href="${p.link}" style="text-decoration:none;display:block;border-bottom:1px solid grey; padding:1em;" data-link='${p.link}'>
          ${p.label}
         </a>
      `;
    }
    for(let anchor of collectionsList.querySelectorAll('A')){
      anchor.onclick = (e)=>{
         e.preventDefault();
         let el = e.target;
         let link = el.href;
         el.parentElement.style.display="none";
         collectionSelector.querySelector('DIV SPAN').innerHTML = el.innerHTML;
         itemsList.style.display="block";      
         displayLink(null,link,itemsList);
         return false;
      }
    }
    let itemsList = document.createElement('DIV');
    itemsList.style = `flex-grow:1:100%;border:1px solid grey;border-top:none;overflow-y:scroll;`;
    leftColumn.appendChild(collectionSelector);
    leftColumn.appendChild(collectionsList);
    leftColumn.appendChild(itemsList);
    wrapper.appendChild(leftColumn);
    wrapper.appendChild(rightColumn);
    return wrapper;
  }

}

/*
wrapper
  leftColumn
    collectionSelector
    collectionsList
    itemsList
  rightColumn
    displayArea
*/

  
