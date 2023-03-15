export class Menu {

  async render( solidUI, json,element ){
    if(typeof json==='string'){
      json = await solidUI.processComponent(element,json);
    }
    if(json.displayArea && json.landingPage){
      await solidUI.processComponentSubject(json.landingPage);
    }
    let nav = solidUI.createElement('NAV','solid-uic-dropdown-menu')
    let topUL   = document.createElement('UL')
    let mainDisplay = document.createElement('DIV')
    this.pluginMenuArea = document.createElement('DIV');
    this.pluginMenuArea.id = "pluginMenuArea";
    this.pluginMenuArea.style.paddingTop = "3rem";
    const wrapper = solidUI.createElement('DIV');
    wrapper.style.width="100%";
    wrapper.style["overflow-x"]="hidden";
    topUL = _styleUL(topUL,json);
    wrapper.appendChild(nav);
    wrapper.appendChild(mainDisplay);
    wrapper.appendChild(this.pluginMenuArea);
    nav = _styleNav(nav,json);
    mainDisplay = _styleMain(mainDisplay,json);
    mainDisplay.innerHTML="";
    mainDisplay.classList.add('main');
    nav.appendChild(topUL)
    for(var i of json.parts){
      topUL.appendChild( await this.renderMenuItem(i,json,mainDisplay) )
    }
    return(wrapper);
  }

  async renderMenuItem(i,json,mainDisplay){
    if(i.menu && i.menu.type && i.menu.type === "SparqlQuery"){
      let menu = await solidUI.processComponent(null,null,i.menu);
      if(typeof menu==="object") i.parts = menu
    }
    if(!i.parts && i.dataSource ){
       if(!i.pluginType || i.pluginType!="resourceSelector"){
         let x = await solidUI.getComponentHash(i.dataSource);
         i.parts = x && x.parts ?x.parts :null;
       }
    }
    let li = document.createElement('LI')
    const sp =  document.createElement('SPAN')
    sp.innerHTML = i.label;
    li.appendChild(sp)
    li.onmouseover = ()=>{
      li.style.color = solidUI.menuColor;
      li.style.background = solidUI.menuHighlight;
    } 
    li.onmouseout = ()=>{
      li.style.color = solidUI.menuColor;
      li.style.background = solidUI.menuBackground;
    } 
    if(i.popout || !i.parts){
      /*
       *  <li class="item"><span>${i.label}</span></li>
       */
      li.classList.add('item')
//
      li.name = i.href || i.dataSource && i.dataSource.dataSource ?i.dataSource.dataSource :i.dataSource;
      li.pluginType = i.pluginType;
      
      li.dataset.link = li.name;
      li.dataset.linktype = i.pluginType;
      li.dataset.label = i.label;

      const self = this
      li.onclick = async (e)=>{
        let pluginURI = li.dataset.link;
        let pluginType = li.dataset.linktype || li.dataset.link || "";
        let pluginLabel = li.dataset.label;
        let pArea = this.pluginMenuArea;
        if(pluginType==="SolidOS"){
          pArea = document.getElementById('outline')
        }
        let newId = pluginLabel.replace(/\s/g,"_");
        let newArea = pArea.querySelector('#'+newId);
        let processedPlugin = await solidUI.processComponentSubject(pluginURI);
        // = Plugin JSON
        processedPlugin ||= i;
        if(processedPlugin.landingPage){
          await solidUI.processComponentSubject(processedPlugin.landingPage);
        }
        processedPlugin.contentArea = '#' + newId;
        for(let plugin of pArea.childNodes){
          plugin.style.display="none";
        }
        if(!newArea && pluginType != "SolidOS"){
           newArea = document.createElement('DIV');
           newArea.id = newId;
           pArea.appendChild(newArea);
           newArea.innerHTML=`<h3 style="margin:0;margin-bottom:0.5rem;">${e.target.innerHTML}</h3>`;
           if(processedPlugin.type){
             processedPlugin = await solidUI.processComponentJson(processedPlugin);
             newArea.appendChild(processedPlugin);
           }
           else if(!processedPlugin.dataSource || !pluginType==="SolidOS") {
              newArea.appendChild(processedPlugin)
           }
           if(pluginType==="resourceSelector"){
             newArea.appendChild(processedPlugin)
           }
        }
        if(newArea) {
          newArea.style.display="block";
          newArea.focus();
        }
      }
      li = _styleLI(li,json);
    }
    else {
      /*
        <li class="caret">
          <span class="caret" style="cursor:pointer;">${i.title}</span>
          <ul class="nested">
          </ul>
        </li>
      */
      li.classList.add('caret')
      let ul2 = document.createElement('UL')
      ul2.style.background="white";
      ul2.style.width="100%";
      li.appendChild(ul2)
      ul2.classList.add('nested')     
      if(typeof i.parts.length==="undefined") i.parts = [i.parts];
      for(var m in i.parts){
        let newItem = i.parts[m]
        if(typeof newItem==='object') newItem.target=json.target;
        ul2.appendChild( await this.renderMenuItem(newItem,json,mainDisplay) )
      }
    }
    return li
  }
}

// MENU CONTAINER
function _styleNav(nav,json){
//    nav.style.width="100%";
    nav.style.padding="0 !impotant";
    nav.style.background=json.color || solidUI.menuBackground;
    nav.style.color=json.background || solidUI.menuColor;
    nav.style.display="inline-block";
    nav.style.textAlign=json.position;
    return nav;
}

// INITIAL STATE OF MENU
//
function _styleUL(ul,json){
//    ul.style.width="100%";
      ul.style.color = solidUI.menuColor;
      ul.style.background = solidUI.menuBackground;

    ul.style.padding="0 !impotant";
    ul.style.margin="0 !impotant";
    ul.style.textAlign=json.position;
    ul.style['padding-inline-start']="0 !important";
    return ul;
}
// TOP MENU ITEM DISPLAY
function  _styleLI(li,json){
    li.style.cursor="pointer"
    li.style.display="inline-block";
    li.style.padding="0.5rem";
    li.style.margin="0.25rem";
    li.style.color = json.color || solidUI.menuColor;
    li.style.background = json.background || solidUI.menuBackground;
    return li;
 }
// MENU DISPLAY
function  _styleMain(mainDisplay,json){
    mainDisplay.style.width="100%";
/*
    mainDisplay.style.backgroundColor = 'red' || json.background || solidUI.menuBackground;
    mainDisplay.style.color = 'blue' || json.color || solidUI.menuColor;
*/
    return mainDisplay;
 }

