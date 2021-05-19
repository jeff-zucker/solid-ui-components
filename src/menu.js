  async function menu( widget,containingEl ){
    console.log(widget);  
//    let json = await this.ttl2json(subject)
    /*
      <nav class="turtletools DropdownMenu">
        <ul>
        </ul>
      </nav>
      <div class="turtletools Display"></div>
    */
    if(!containingEl.style.height) {
      containingEl.style.height = "100vh"
      containingEl.style.overflow = "hidden !important"
      document.body.style.margin = 0
      document.body.style.padding = 0
    }
    let nav  = document.createElement('NAV')
/*
    nav.style.backgroundColor = "#734523"; 
    let logo =  document.createElement('IMG')
    logo.src = "https://solidproject.org/assets/img/solid-emblem.svg"
    logo.style.height="64px";
    logo.style.width="64px";
    logo.style.padding="0";
    logo.style.padding="1em";
//    logo.style.paddingLeft="1em";
    logo.style.margin="0";
    logo.style.display="inline-block";
    nav.appendChild(logo);

    let siteTitle =  document.createElement('SPAN')
    
    nav.appendChild(siteTitle);
*/
    let topUL   = document.createElement('UL')
//    topUL.style.float="left";
    topUL.style.display = "inline-block";
//    topUL.style.color = "white";
//    topUL.style.padding = "1em";
    topUL.style.margin = "0";
    topUL.style.fontWeight = "bold";
    nav.style.textAlign="right";     

    let display = document.createElement('DIV')
    nav.appendChild(topUL)
    containingEl.appendChild(nav)
    containingEl.appendChild(display)
    nav.classList.add('turtletools')
    nav.classList.add('DropdownMenu')
    display.classList.add('turtletools')
    display.classList.add('Display')
    display.style.height="88%"
    display.style.width="100%"
    display.style.margin="0"
    display.style.padding="0"
//    this.menuDisplay = display
// console.log(99,widget.subject.uri ,widget,widget.subject,display)
// url, options, subject, containingElement ){
//    await renderLink( widget.items[0] )
    let home = widget.items[0];
 await renderLink(widget, home,display)
//await renderLink(99,home.subject.uri ,widget,widget.subject,display)
    for(var i of widget.items){
      topUL.appendChild( renderMenuItem(i,widget,display) )
    }
/*
console.log(json)
    this.displayLink( json.menuItems[json.menuStart[0]] )
    for(var i of json.menuItems){
      topUL.appendChild( this.renderMenuItem(i) )
    }
*/
  }

  function renderMenuItem(i,o,containingElement){
let label = kb.any(i,o.labelTerm) || UI.utils.label(i);
    const li = document.createElement('LI')
    const sp =  document.createElement('SPAN')
//    sp.innerHTML = i.title
    sp.innerHTML = label
    li.appendChild(sp)
    li.style.textDecoration="none";
    li.style.display="inline-block";
    li.style.marginLeft="0";
    li.style.marginRight="2em";
    li.style.cursor="pointer"
//    li.style.color = "#734523"; 
//      li.classList.add('item')
//      const self = this
      li.addEventListener('click',e=>{
        renderLink(o, i,containingElement)
      })
      return li;
    if(i.type.match('Link')){
      /*
       *  <li class="item"><span>${i.title}</span></li>
       */
      li.classList.add('item')
      const self = this
      li.addEventListener('click',e=>{
        self.displayLink(i)
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
      for(var m in i.menuItems){
        ul2.appendChild( this.renderMenuItem(i.menuItems[m]) )
      }
    }
    return li
  }
