export async function buttonListMenu(options){
  if(options.displayArea && options.startingContent){
    await solidUI.util.show('',options.startingContent,'',options.displayArea);
  }
  let displayIn = options.displayArea;
  displayIn=typeof displayIn==="string" ?document.querySelector(displayIn) :displayIn;
  let div = document.createElement('DIV');
//  div.id =  options.contentSource.replace(/.*\#/,'');
  let html = "";
  let parts = options.dataSource;
  if(typeof parts.length==="undefined")parts=[parts];
  for(let p of parts){
      let attrs = "";
      let b = document.createElement('BUTTON');
      b.dataset.link = p.link || p.dataSource;
      b.dataset.label = p.label;
      b.dataset.linktype = p.linktype || p.pluginType;
      b.innerHTML = p.label;
      b.value = p.dataSource;
      b = solidUI.styleButton(b,options);
      b.style['font-size'] = "100%";
      b.addEventListener('click',async(e)=>{
        return solidUI.handleLinkClick(e,options);
/*
        e.preventDefault();
        let link = b.dataset.link;
        let linkType = b.dataset.linktype || "";
        if(solidUI.hideTabulator) solidUI.hideTabulator();
        if(linkType==='Replace'){
          window.location.href=link;                   
        }
        else if(linkType==='External'){
          return u.showIframeSrc(link,options.displayArea);
        }
        else if(linkType==='SolidOS'){
         return u.show('SolidOSLink',link,null,null,null,options)
        }
        else if(linkType==='Component') {
          let newDiv = document.createElement('DIV');
          newDiv.dataset["suic"]=link;
          displayIn.innerHTML = "";
          displayIn.appendChild(newDiv);
          displayIn = await solidUI.initInternal(displayIn) ;
        }
*/
      });
      div.appendChild(b)
    }
    div.style['text-align']="center";
    return div;
}
