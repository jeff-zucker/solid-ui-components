class Menu {

  async render( json ){
    if(typeof json==='string'){
      json = await solidUI.processComponent('','',json);
    }
    let nav     = solidUI.createElement('NAV','solid-uic-dropdown-menu')
    let topUL   = document.createElement('UL')
    let display = document.createElement('DIV')
    nav.appendChild(topUL)
    for(var i of json){
      topUL.appendChild( this.renderMenuItem(i) )
    }
    const wrapper = solidUI.createElement('SPAN');
    nav.style.display="inline-block";
    nav.style.textAlign="right";
    topUL.style.textAlign="left";
    wrapper.appendChild(nav);
    return(wrapper);
  }

  renderMenuItem(i,template){
    const li = document.createElement('LI')
    const sp =  document.createElement('SPAN')
    sp.innerHTML = i.label
    li.appendChild(sp)
    li.style.cursor="pointer"
    li.style.display="inline-block";
    if(!i.parts){
      /*
       *  <li class="item"><span>${i.label}</span></li>
       */
      li.classList.add('item')
      const self = this
      li.addEventListener('click',e=>{
        displayLink(e,i)
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
        ul2.appendChild( this.renderMenuItem(i.parts[m]) )
      }
    }
    return li
  }
      /*
<div 
  <span class="solid-uic-dropdown-menu" style="height: 100vh;">
    <nav><ul>
      <li class="item" style="cursor: pointer;"><span>LABEL</span></li>
      <li class="caret" style="cursor: pointer;"><span>LABEL</span>
        <ul class="nested">
          <li class="item" style="cursor: pointer;"><span>LABEL</span></li>
        </ul>
      </li>
    </ul></nav>
    <div class="main" style="height:88%;width:100%;margin:0px;padding:0px;">
    </div>
  </span>
</div>


      <nav class="">
        <ul>
          <li class="item"><span>${i.label}</span></li>
          <li class="caret">
            <span class="caret" style="cursor:pointer;">${i.title}</span>
            <ul class="nested">
            </ul>
          </li>
        </ul>
      </nav>
      <div class="main"></div>
      */

  async rdf2json(subject,cfg){
    let label,link;
    return await this.getComponentHash(subject);

    subject = await solidUI.loadUnlessLoaded( subject ) 
    const dataSourceUri = kb.any( subject, ui('dataSource') )
    const dataSourceSubject = await solidUI.loadUnlessLoaded(dataSourceUri);
    return this.parseDataSource(dataSourceSubject,cfg);
  }

  async getComponentHash(subject,hash){
    subject = await solidUI.loadUnlessLoaded(subject);
    let predicatePhrases = kb.match(subject);
    hash ||= {}
    for(let p of predicatePhrases){
      let pred = p.predicate.value.replace(/http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#/,'').replace(/https:\/\/www.w3.org\/ns\/ui#/,'');
      let obj = p.object;
      if(obj.termType==="BlankNode"){
        obj = await this.getComponentHash(obj);
        if(!hash[pred])  hash[pred] = obj;
        else if(typeof hash[pred] !='ARRAY') hash[pred] = [obj]
        else hash[pred].push(obj);
      }
      else if(obj.termType==="Collection"){
        obj = obj.elements;
        for(let o of obj){
          o = await this.getComponentHash(o);
          if(!hash.parts)  hash.parts = [o];
          else hash.parts.push(o);
        }
      }
      else {
        obj = obj.value.replace(/https:\/\/www.w3.org\/ns\/ui#/,'');
        if(!hash[pred])  hash[pred] = obj;
        else if(typeof hash[pred] !='ARRAY') hash[pred] = [obj]
        else hash[pred].push(obj);
      }
    }
    return hash ;
  }

  async parseDataSource(dataSourceSubject,cfg){
    cfg ||= {};
    let dataSource = await this.getComponentHash(dataSourceSubject,cfg);
    return(dataSource.parts);
    if(dataSource.type != 'Collection'){
      return dataSource;
    }
    else {
      const parts = kb.any( dataSourceSubject,ui('parts')); 
    }
    if(!parts){
       let linkSubject = kb.any(dataSourceSubject,ui('dataSource'));
       let label = kb.any(dataSourceSubject,ui('label'));
       let link = hash;
       return {label:label.value||"",link:link.value||""};
    }
    if(parts.termType==="Collection"){
      let menuItems = parts.elements;
      for(let item of menuItems){
      let row = {};

        // LOAD EACH PART
        let itemSubject = await solidUI.loadUnlessLoaded(item);
        let label = kb.any(itemSubject,ui('label'));
        let link = kb.any(itemSubject,ui('dataSource'));

        // LOAD EACH PART'S LINK
        let linkSubject = await solidUI.loadUnlessLoaded(link);
        let linkType = solidUI.getComponentType(linkSubject)
        if( linkType === "DataCollection" ){
          row.submenu ||= [];
          row.submenu = await this.parseDataSource(linkSubject) ;
        }
        row.label = label ?label.value :"";
        row.link  = link  ?link.value  :"";
        cfg.push( row );
      }
    }
    return cfg;
  }

  async ZZZparseDataSource(dataSourceSubject,cfg){
    cfg ||= [];
    let dataSourceType = solidUI.getComponentType(dataSourceSubject);
    const parts = kb.any( dataSourceSubject,ui('parts')); 
    if(!parts){
       let linkSubject = kb.any(dataSourceSubject,ui('dataSource'));
       let label = kb.any(dataSourceSubject,ui('label'));
//       let link = kb.any(dataSourceSubject,ui('dataSource'));
let link = hash;
       return {label:label.value||"",link:link.value||""};
    }
    if(parts.termType==="Collection"){
      let menuItems = parts.elements;
      for(let item of menuItems){
      let row = {};

        // LOAD EACH PART
        let itemSubject = await solidUI.loadUnlessLoaded(item);
        let label = kb.any(itemSubject,ui('label'));
        let link = kb.any(itemSubject,ui('dataSource'));
let preds = kb.match(itemSubject);
let hash = {}
for(let p of preds){
  hash[p.predicate.value]=p.object.value;
}
console.log(hash);

        // LOAD EACH PART'S LINK
        let linkSubject = await solidUI.loadUnlessLoaded(link);
        let linkType = solidUI.getComponentType(linkSubject)
        if( linkType === "DataCollection" ){
          row.submenu ||= [];
          row.submenu = await this.parseDataSource(linkSubject) ;
        }
        row.label = label ?label.value :"";
        row.link  = link  ?link.value  :"";
        cfg.push( row );
      }
    }
    return cfg;
  }


} // end of Class Menu
