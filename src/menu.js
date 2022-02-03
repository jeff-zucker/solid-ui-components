class Menu {

  async render( json,element ){
    if(typeof json==='string'){
      json = await solidUI.processComponent(element,json);
    }
    let nav     = solidUI.createElement('NAV','solid-uic-dropdown-menu')
    let topUL   = document.createElement('UL')
    let mainDisplay = document.createElement('DIV')
    nav.style.width="100%";
    nav.style.background=json.unselBackground;
    nav.style.color=json.unselColor;
    nav.style.paddingLeft="1em";
    topUL.style.width="100%";
    mainDisplay.style.width="100%";
    mainDisplay.style.backgroundColor = json.background;
    mainDisplay.style.color = json.color;
    mainDisplay.innerHTML="";
    mainDisplay.classList.add('main');
    nav.appendChild(topUL)
    for(var i of json.parts){
      topUL.appendChild( this.renderMenuItem(i,json,mainDisplay) )
    }
    const wrapper = solidUI.createElement('SPAN');
    nav.style.display="inline-block";
    nav.style.textAlign=json.orientation;
    topUL.style.textAlign="left";
    wrapper.appendChild(nav);
    wrapper.appendChild(mainDisplay);
    return(wrapper);
  }

  renderMenuItem(i,json,mainDisplay){
    const li = document.createElement('LI')
    const sp =  document.createElement('SPAN')
    sp.innerHTML = i.label
    li.appendChild(sp)
    li.style.cursor="pointer"
    li.style.display="inline-block";
    li.style.backgroundColor = json.unselBackground;
    li.style.color = json.unselColor;
    li.onmouseover = ()=>{
      li.style.backgroundColor = json.selBackground;
      li.style.color = json.selColor;
    } 
    li.onmouseout = ()=>{
      li.style.backgroundColor = json.unselBackground;
      li.style.color = json.unselColor;
    } 
    if(!i.parts){
      /*
       *  <li class="item"><span>${i.label}</span></li>
       */
      li.classList.add('item')
      const self = this
      li.addEventListener('click',e=>{
        displayLink(e,i,mainDisplay)
      })
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
      li.appendChild(ul2)
      ul2.classList.add('nested')     
      for(var m in i.parts){
        ul2.appendChild( this.renderMenuItem(i.parts[m],json,mainDisplay) )
      }
    }
    return li
  }
}