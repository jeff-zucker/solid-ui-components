
async function tabset(results) {
  let container=solidUI.createElement('DIV','uic-accordion','',"display:flex; height:100%; width:100%; flex-direction:row;")
  let nav = solidUI.createElement('NAV','','',"margin:0;");
  let ul = solidUI.createElement('UL','','','list-style-type:none;display:flex;height:100%;margin:0;padding:0;flex-direction:column;width:26vw')

  const topics = {};
  for(let row of results) {
    if(!topics[row.topic]) {
      topics[row.topic]={submenu:[]};
    }
    topics[row.topic].submenu.push(row);
  }  
  let i=0;
  for(let topic of Object.keys(topics)){
    let li = solidUI.createElement('LI','','','margin-bottom:1rem;');
    let button = solidUI.createElement('BUTTON','',topic,'padding:1rem;border-radius:0;border:1px solid #6d8ecb; width:100%;font-weight:bold;cursor:pointer;background: #6d8ecb;');
    button.onclick = (event)=>{toggleAccordion(event)};
    button.setAttribute('data-link',topic.replace(/ /g,'_'));
    let box = solidUI.createElement('NAV','','','border:1px solid #6d8ecb;;border-top:none;padding:0.25rem');
    // to open first ACCORDION ON STARTUP if(i>0)
       box.style.display="none";
    i++;
    for(let item of topics[topic].submenu){
      let link = solidUI.createElement('DIV','',item.linkLabel,'padding:0.5rem;cursor:pointer');
      link.setAttribute('data-link',item.linkUrl);
      //link.style.display="none";
      link.onclick=(e)=>{
        let current = e.target;
        let link = current.dataset.link;
        showByClass(e,link)
      }
      box.appendChild(link); 
    }
    li.appendChild(button)
    li.appendChild(box);
    ul.appendChild(li)
  }
  nav.appendChild(ul)
  container.appendChild(nav);
  return container 
}