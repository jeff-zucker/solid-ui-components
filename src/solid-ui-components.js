const proxy = "https://solidcommunity.net/proxy?uri=";
const fetch = window.SolidFetch || window.fetch ;
const validComponentType = {
  Table : 1,
  Accordion : 1,
  Menu : 1,
  Tabset : 1,
  ModalButton : 1,
  DescriptionList : 1,
  Template : 1,
  DataSource : 1,
  SparqlQuery : 1,
  PageElement : 1,
  TemplateMenu : 1,
};
  const $rdf = UI.rdf;
  const kb = $rdf.graph();
  const fetcher = $rdf.fetcher(kb);
  const skos = $rdf.Namespace('http://www.w3.org/2004/02/skos/core#');
  const ui = $rdf.Namespace('https://www.w3.org/ns/ui#');
  const rdf=$rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

class SolidUIcomponent {

  async init(){
    const all = document.querySelectorAll('[data-solid_ui_component]')
    for(let element of all) {
      const content = await this.processComponent(element);
      if(content) element.appendChild( content );
    }
  }

  async initInternal(containingElement){
    const all = containingElement.querySelectorAll('[data-solid_ui_component]')
    for(let element of all) {
      const content = await this.processComponent(element);
      element.appendChild( content );
    }
    return containingElement;
  }

  async getComponentHash(subject,hash){
    subject = await this.loadUnlessLoaded(subject);
    if(!subject) return null;
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
          if(!hash[pred])  hash[pred] = [o];
          else hash[pred].push(o);
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
  setStyle(element,styles){
    for(let s of Object.keys(styles)){
      element.style[s]=styles[s];
    }
  }

  async renderApp(app){
    app.background ||= "white";
    app.color ||= "black";
    app.orientation ||= "horizontal";
    app.position ||= "left";
    app.logo = app.logo ?`<img src="${app.logo}" style="height:3rem; display:inline-block;padding-left:1rem;">` : "";
    let appString = app.orientation==='horizontal' 
?`
<div class="solid-uic-app" style="display:table; height: 3rem; padding-top:1rem;padding-bottom:0;width:100%;background:${app.background};color:$app.color">

  <div style="display:table-row; height:3rem;">
    ${app.logo}
    <span style="display:inline-block; vertical-align:top; align:left; font-size: 2rem; padding-top: 0.4rem; padding-left:1rem;">
      ${app.title}
    </span>
  </div>

  <div style="display:table-row; height:2rem; algin:right;">
    <div class="fill-me" style="width:96%;text-align:${app.position};color:${app.color}">
    </div>
  </div>

  <div style="display:table-row;background:white;color:black">
    <div class="main" style="padding:1rem;"></div>
  </div>

</div>
`
:`
<div class="solid-uic-app" style="display:table; height: 3rem; padding-bottom:0;width:100%;">
  <div style="display:table-row; height:3rem; width:100%">
    ${app.logo}
    <H2 style="display:inline-block; vertical-align:top; align:left;">
      ${app.title}
    </H2>
  </div>
  <div style="padding-top:0;margin-top:0;">  
    <div class="leftColumn" style="display:table-cell;width:20vw;">
      <nav class="fill-me" style="text-align:left;"></nav>
    </div>
    <div style="display:table-cell;background:white;color:black;padding-left:2em;padding-top:0">
      <div class="main" style="padding:1rem;padding-right:0;padding-top:0;"></div>
    </div>
  </div>
</div>
`;
  // if(app.stylesheet) appString=`<link href="${app.stylesheet}" rel="stylesheet">`+appString;
  const menu = await this.processComponent('',app.menu);
  let element = solidUI.createElement('SPAN','',appString);
  let toFill = element.querySelector(".fill-me");
  toFill.appendChild(menu);
  if(app.initialContent) {
    let main = element.querySelector(".main");
    main.appendChild(await solidUI.processComponent('',app.initialContent));
  }  
  return element;
    document.body.style.margin="0";
    document.body.style.padding="0";
    const topDiv = this.createElement('DIV','solid-uic-app');
    topDiv.style.display="table";
    topDiv.style.width="100vw";
    document.body.appendChild(topDiv);
    const firstRow = this.createElement('DIV');
    firstRow.style.display="table-row";
    firstRow.style.height="4rem";
    topDiv.appendChild(firstRow);
    const secondRow = this.createElement('DIV','main');
    secondRow.style.display="table-row";
    secondRow.style.width="100%";
    secondRow.style.height="100%";
    secondRow.style.backgrond="white";
    topDiv.appendChild(secondRow);
    const header = this.createElement('HEADER');
    this.setStyle(header,{
      display:"grid",
      "grid-template-columns":"4rem auto auto",
      "grid-gap":0,
      margin:0,
      padding:"0.5rem",
      "padding-top":"1rem",
      height:"4rem",
    });
    firstRow.appendChild(header);
    const logo = this.createElement('IMG');
    logo.src = app.logo;
    logo.style.height="3rem";
    const title = this.createElement('DIV');
    title.style.fontSize="2rem";
    title.style.marginTop="0.4rem";
    title.innerHTML = app.label;
    const menuWrapper = this.createElement('SPAN');
    header.appendChild(logo);
    header.appendChild(title);
    firstRow.appendChild(menuWrapper);
    
//      <div class="solid-uic-dropdown-menu">
    if(app.parts) await this.renderMenu(app.parts,header);
    else menuWrapper.appendChild(menu)
  }  

  async renderMenu(menuObject,element){
    let menu = new Menu();
    return await menu.render(menuObject,element);
  }

  async processComponent(element,subject,json){
    if(!json){    
      if(!subject && element && element.dataset) subject = await this.loadUnlessLoaded(element.dataset.solid_ui_component);
      if(!subject) return null;
      json = await this.getComponentHash(subject)
    }
    if(json.type==='App'){
      return await this.renderApp(json);
    }
    else if(json.type==='Link'){
      return await displayLink(element,json);
    }
    else if(json.type==='Menu'){
      return await this.renderMenu(json.parts);
    }
    else {
    }
    let contentWrapper = document.createElement('DIV');
    let results,before,after,content,label;

    // DATASOURCE
    let dataSource = typeof json.dataSource==="string" ?await this.getComponentHash(json.dataSource) : json.dataSource ;

// SPARQL-QUERY
    if(dataSource.type==='SparqlQuery') {
      let endpoint = dataSource.endpoint;
      let query = dataSource.query;
      results = await this.sparqlQuery(endpoint,query);
    }
// RECORD
    if(json.type==='Record') {
      label = this.getValue( dataSource, ui('label') );
      content = this.getValue( dataSource, ui('content') );
      results = {label,content} ;
    }

    
// TEMPLATE
    let template = json.template;
    if(!template){
      return results;
    }
    if(template.groupOn) {
      results = this.flatten(results,template.groupOn)
      console.log(66,results)
    }   
    
      if(template=="AccordionMenu"){
        let compo = await this.runBuiltIn(template,results);
        if(compo) contentWrapper.appendChild(compo);
        return contentWrapper;
      }
      if(template=="Table"){
        let compo = await this.runBuiltIn(template,results);
        if(compo) contentWrapper.appendChild(compo);
        return contentWrapper;
      }
      if(template=="Modal"){
        let compo = await this.makeMmodal(json.label,json.content);
        if(compo) contentWrapper.appendChild(compo);
        return contentWrapper;
      }
      let recurring;
// let template = json.template.value ?json.template.value :json.template ;

/*
      let isBuiltIn = template.match(/^https:\/\/www.w3.org\/ns\/ui#/) ;
      if( isBuiltIn ) {
        if(template.match(/ModalButton/)) {
          results = await this.makeModalButton(label,content);
        }
        else if( template.match(/DropdownMenu/ || dataSourceType==="App") ){
            let m = new Menu();
            let results = await m.render(subject,contentWrapper)
            // console.log(results)
        }
        else {
          results = await this.runBuiltIn(template,results);
        }
        if(results) contentWrapper.appendChild(results);
      }
*/
      if(1) {
        if(typeof template=="STRING") {
          recurring = template ;
        }
        else {
          recurring = template.recurring;
          before = template.before;
          after = template.after;
        }
        recurring ||= template;
        let body = this.fillTemplate(recurring,results);
        contentWrapper.innerHTML = (before||"") + body + (after||"");
      }
/*
      if( dataSourceType.match(/Menu/) ) {
        for(let menuItem of contentWrapper.children){
          menuItem.addEventListener('click',(event)=>this.menu(event));
        }
      }
*/
      return contentWrapper ;
    
  }

flatten(results,groupOn){
  const newResults = {};
  for(let row of results) {
    let key = row[groupOn];
    if(!newResults[key]) newResults[key]={};
    for(let k of Object.keys(row)){
      if(!newResults[key][k]) {
        newResults[key][k]=row[k];
        continue;
      }  
      if(newResults[key][k]===row[k]) continue;
      if(typeof newResults[key][k]!="object") newResults[key][k]=[newResults[key][k]]
      newResults[key][k].push(row[k])
    }
  }
  results = [];
  for(let n of Object.keys(newResults)){
    results.push(newResults[n])
  }
  return results;
} 
  
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  SPARQL
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

  async rdflibQuery(kb,endpoint,queryString){
    await this.loadUnlessLoaded(endpoint);
    return new Promise(async (resolve,reject)=>{
      try {
        const preparedQuery=await $rdf.SPARQLToQuery(queryString,false,kb);
        let wanted = preparedQuery.vars.map( stm=>stm.label );
        let table = [];
        kb.query(preparedQuery, (results)=>{
          let row = {};
          for(let r in results){
            let rmunged = r.replace(/^\?/,'');
            if( wanted.includes(rmunged) ){
              row[rmunged] = results[r].value;
            }
          }
          table.push(row);
          table = table.sort((a,b)=>a.label > b.label ?1 :-1);
          resolve(table)
        })
      }
      catch(e) { console.log(e); resolve() }
    })
  }

  async  comunicaQuery(endpoint,sparqlStr,oneRowOnly){
    let comunica = Comunica.newEngine() ;
    function munge(x){
       return x ? x.replace(/^"/,'').replace(/"[^"]*$/,'') :"";
    }
    let result = await comunica.query(sparqlStr,{sources:[endpoint]}) ;
    result = await result.bindings()
    let table = [];
    let hash = {};
    for(let e of result.entries()) {
      if( !e[1] ||  !e[1]._root || !e[1]._root.entries ) continue;
      e = e[1]._root.entries
      let row = {} ;
      for(let i in e){
        let key = munge( e[i][0].replace(/^\?/,''))
        let value = munge(e[i][1].id)
        if( row[key] && typeof row[key] != 'ARRAY' ) row[key]= [row[key]]
        if( typeof row[key] === "ARRAY" ) row[key].push(value)
        else row[key] = value;
      }
      if(oneRowOnly) {
        console.log(row);
      }
      else table.push(row);
    }
    return oneRowOnly ?hash :table;
  }

  async  sparqlQuery(endpoint,queryString){
    // COMMUNICA
    let results = await this.comunicaQuery(endpoint,queryString);
    // RDFLIB
    // let results = await this.rdflibQuery(kb,endpoint,querystring);  
    console.log(`got ${results.length} results`);
    return results;
  }

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  DISPLAY METHODS
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

  fillTemplate(templateStr,object){
    function fillOneTemplateRow(templateStr,object){
      for(let o of Object.keys(object) ){
        let newStuff=object[o]||" ";
        if(typeof newStuff==='object') newStuff = newStuff.join(" - ");
        let re = new RegExp( `\\$\\{${o}\\}`, 'gi' );
        templateStr  = templateStr.replace( re, newStuff );
      }
      return templateStr;
    }
    let string = "";
    for(let r of object){
       string += fillOneTemplateRow(templateStr,r)+"\n";
    }
    return string;
  }

  runBuiltIn(template,results){
    if(template.match(/Table/)) return this.results2table(results);
    if(template.match(/Modal/)) return this.results2modal(results);
    if(template.match(/Accordion/)) return tabset(results);
    if(template.match(/DescriptionList/)) return this.results2descriptionList(results);
  }

  results2table(results) {
    if(!results.length) return document.createElement('SPAN');
    let table = document.createElement('TABLE');
    let columnHeaders = Object.keys(results[0]);
    let headerRow = document.createElement('TR');
    for(let c of columnHeaders){
      let cell = document.createElement('TH');
      cell.innerHTML = c;
      cell.style.border="1px solid black";
      cell.style.padding="0.5em";
      cell.style.background="#ddd";
      headerRow.appendChild(cell);
    }
    table.appendChild(headerRow);
    for(let row of results){
      let rowElement = document.createElement('TR');
      for(let col of columnHeaders){
        let cell = document.createElement('TD');
        cell.innerHTML = row[col];
        cell.style.border="1px solid black";
        cell.style.padding="0.5em";
      rowElement.appendChild(cell);
      }
      table.appendChild(rowElement);
    }
    table.style.borderCollapse="collapse";
    return table;
  }
  async results2accordion (results) {
    let bgColor = "#ddd";
    const accordion = this.createElement('DIV','accordion-menu');
    accordion.classList.add('horizontal');
    if(!results || !results.length) return accordion;
    let cols  = Object.keys(results[0]);
    for(let row of results){
       let item = this.createElement( 'DIV' );
       let name = row[cols[0]];
       let rowhead = this.createElement( 'DIV','' );
       name = this.createElement('SPAN','',name) ;       
       name.style.display="table-cell";
       name.style.width="100%";
       rowhead.appendChild(name);
       let caret = this.createElement('SPAN','caret-down') ;       
       caret.style.display="table-cell";
       caret.textAlign="right";
       rowhead.appendChild(caret);
       rowhead.style.backgroundColor = bgColor;
       rowhead.style.padding="0.75em";
       rowhead.style.border="1px solid grey";
       rowhead.style.cursor = "pointer";
       let rowContent = "";
       for(let i=1; i<cols.length; i++){
         let key = cols[i];
         let value = row[key] || "";
         rowContent += `<p><b>${key}</b> : ${value}</p>`;
       }
       rowContent = this.createElement( 'DIV',null,rowContent );
       rowContent.style.padding="0.75em";
       rowContent.style.border="1px solid grey";
       rowContent.style.borderTop="none"; 
       rowContent.style.display = "none";
       rowhead.onclick = (e)=>{
         let showing = rowContent.style.display === "block" ;
         let items = accordion.children;
         for(let i of items) {
           i.children[1].style.display="none";
         }
         rowContent.style.display = showing ?"none" :"block";
       }
       item.appendChild(rowhead);
       item.appendChild(rowContent);
       item.style.marginBottom = "1em";
       accordion.appendChild(item);
    }
    return await this.initInternal(accordion);  
  }

  async results2accordionZ (results) {
    let bgColor = "#ddd";
    const accordion = this.createElement('DIV','accordion-menu');
    accordion.classList.add('horizontal');
    if(!results || !results.length) return accordion;
    let cols  = Object.keys(results[0]);
    for(let row of results){
       let item = this.createElement( 'DIV' );
       let name = row[cols[0]];
       let rowhead = this.createElement( 'DIV','' );
       name = this.createElement('SPAN','',name) ;       
       name.style.display="table-cell";
       name.style.width="100%";
       rowhead.appendChild(name);
       let caret = this.createElement('SPAN','caret-down') ;       
       caret.style.display="table-cell";
       caret.textAlign="right";
       rowhead.appendChild(caret);
       rowhead.style.backgroundColor = bgColor;
       rowhead.style.padding="0.75em";
       rowhead.style.border="1px solid grey";
       rowhead.style.cursor = "pointer";
       let rowContent = "";
       for(let i=1; i<cols.length; i++){
         let key = cols[i];
         let value = row[key] || "";
         rowContent += `<p><b>${key}</b> : ${value}</p>`;
       }
       rowContent = this.createElement( 'DIV',null,rowContent );
       rowContent.style.padding="0.75em";
       rowContent.style.border="1px solid grey";
       rowContent.style.borderTop="none"; 
       rowContent.style.display = "none";
       rowhead.onclick = (e)=>{
         let showing = rowContent.style.display === "block" ;
         let items = accordion.children;
         for(let i of items) {
           i.children[1].style.display="none";
         }
         rowContent.style.display = showing ?"none" :"block";
       }
       item.appendChild(rowhead);
       item.appendChild(rowContent);
       item.style.marginBottom = "1em";
       accordion.appendChild(item);
    }
    return await this.initInternal(accordion);  
  }


  /* ACCORDION
  */
  async results2accordionX(results){
//    const accordion = solidUI.createElement('DIV','accordion-menu');
    const accordion = solidUI.createElement('DIV','dropdown-menu');
//    accordion.classList.add('dropdown-menuhorizontal');
    const leftCol = solidUI.createElement('DIV','left-column');
    let mid="";
    let got  = {}
    let iframe = solidUI.createElement('IFRAME');
    console.log(results)
    let topics = results.map((row)=>{
      if(!got[row.topic]) {
        got[row.topic]=1;
        return row.topic;
      }
    }).filter(row=>typeof row != "undefined")
    for(let topic of topics) {
      let itemElement = solidUI.createElement('SPAN','',topic) ;
      itemElement.onclick= (e) => {
        let links = accordion.querySelectorAll('BUTTON');
        let sib = e.target.nextSibling;
        sib.style.display="block"
        let sublinks = sib.querySelectorAll('BUTTON');
        let showing = sublinks[0].style.display==='block';
        for(let link of links){
          link.style.display="none";
        }
        for(let link of sublinks){
          if(showing) link.style.display="none";
          else link.style.display="block";
        }
      }
      let contentElement = solidUI.createElement('DIV');
      contentElement.tabindex=0;
      contentElement.onblur = ()=>{alert(3)}
      let rows=results.filter((row)=>row['topic']===topic);
      for(let row of rows){
        let button=solidUI.createElement('BUTTON','',row.label);
        button.value = row.link ;
        button.onclick = (e) => {
          e.target.parentElement.style.display="none";
          showIframe(e.target.value,iframe);
        }
        button.style.display = "none";
        contentElement.appendChild(button);
      }
      leftCol.appendChild(itemElement)
      leftCol.appendChild(contentElement)
    }
    accordion.appendChild(leftCol);
    accordion.appendChild( iframe );
    return await this.initInternal(accordion);  
  }

  /* MODAL BUTTON
  */
  async makeModalButton (label,content) {
    const modal = document.createElement('SPAN');
    modal.innerHTML = `
  <button onclick="openModal(this)">${label}</button>
  <div style="display:none" class="modal">
    <div class="modal-content">
      <div class="close" onclick="closeModal(this)">&times;</div>
      ${content}
    </div>
  </div>
    `;
    return await this.initInternal(modal);  
  }


  /* UTILITIES
  */
  // CREATE HTML ELEMENT
  createElement(elementType,className,html,styles){
    let element = document.createElement(elementType);
    if(className) element.classList.add(className);
    if(html) element.innerHTML = html;
    if(styles){
      for(let s of styles.split(/;/)) {
        let pair = s.split(/:/)
        if(pair.length==2) 
          element.style[pair[0].trim()]=pair[1].trim();
      }
    }
    return element;
  }
  getComponentType(subject){
    if(!subject) return null;
    let uiNamespace = 'https://www.w3.org/ns/ui#';
    let type = kb.each( subject, rdf('type') ).map( (object) =>{
      object = object.value;
      if(object.match(/ns\/ui#/)) return object.replace(/.*\#/,'');
    });
    return type[0] || "";
  }

  async  loadFromMemory(uri){
    uri = uri.replace(/^internal:/,'');
    let [eName,fragment] = uri.split(/#/);
    let uiString = document.getElementById(eName).innerText;
    try {
      $rdf.parse(  uiString, kb, "data:inMemory", "text/turtle" ); 
      return("data:inMemory#"+uri);
    }
    catch(e) { console.log(e) }
  }

  async  loadUnlessLoaded(uri){
    try {
      if(!uri) return;
      if(uri.termType && uri.termType==="BlankNode") return uri;
      uri = typeof uri==="object" ?uri.uri :uri;
      if(!uri.startsWith('http')) uri = window.location.href.replace(/\/[^\/]*$/,'/') + uri;
      const mungedUri = uri.replace(/\#[^#]*$/,'');
      let graph = $rdf.sym(mungedUri);
      if( !kb.any(null,null,null,graph) ){
        console.log("loading "+graph.uri+" ...");
        await fetcher.load(graph);
        if(kb.any(null,null,null,graph)) console.log("Resource loaded!");
      }
      // else console.log("Resource already loaded!");
      return $rdf.sym(uri);
    }
    catch(e) { console.log(e); return null }
  }
   getValue(s,p,o,g) {
     let node = kb.any( s, p, o, g );
     return node ?node.value :"" 
   }
   valuesContain(s,p,o,g,wanted) {
    let nodes = kb.any( s, p, o, g );
    for(let n of nodes) {
      n = n ?n.value :"";
      if(n===wanted) return n;
    }
  }


} // END OF CLASS SolidUIcomponent


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  USER CALLABLE ACTIONS
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

  async function showIframe(uri,displayArea){
    if( uri.match(/localhost/) ) {
      displayArea.src = uri;
      return  ;
    }
    const r = await fetch(uri);
    const content = await r.text();
    const contentElement = solidUI.createElement('SPAN','',content);
    displayArea.contentWindow.document.body.innerHTML = "";
    displayArea.contentWindow.document.body.appendChild(contentElement);
  }


  function  openModal(element,action){
    element.parentElement.children[1].style.display = "block" ;
  }
  function  closeModal(element,action){
    element.parentElement.parentElement.style.display = "none" ;
  }
  function showByClass(event){
    let wanted = event.target.dataset.link;
    let main = event.target.closest('.solid-uic-app').querySelector('.main');
    let elements = main.querySelectorAll('[typeof]');
    for(let element of elements){
      if(wanted==="all") {
        element.style.display="block";
        continue;
      }
      if( (element.getAttribute('value')).indexOf(wanted)>-1 ) element.style.display="block";
      // if(element.classList.contains(wanted)) element.style.display="block";
      else element.style.display="none";
    }
    highlightMenuSelection(event)
  }
  function highlightMenuSelection (e) {
    let wanted = e.target.dataset.link;
    let siblings = e.target.parentElement.children;
    for(let sib of siblings){
      if(sib.dataset.link===wanted)  sib.classList.add('selected');
      else sib.classList.remove('selected');
    }
  }
  function toggleAccordion (e) {
    let wanted = e ?e.target.dataset.link :null;
    let siblings = e.target.closest('UL').children;

    // HIDE ALL ACCORDION DROPDOWNS
    let navs = e.target.closest('UL').querySelectorAll('NAV');
    for(let n of navs) {n.style.display="none"}

    // SHOW SELECTED ACCORDION DROPDOWNS
    for(let sib of siblings){
      let button = sib.querySelector('BUTTON');
      let links = sib.querySelectorAll('NAV DIV');
      for(l of links) { l.classList.remove('selected')}
      let box = sib.querySelector('NAV');
      if(button.dataset.link===wanted)  {
        box.style.display="block";
      }  
    } 
  }
  async function displayLink( e, item ){
    let containingEl;
    if(e) {
      const dropdown = e.target.closest('.solid-uic-app');
      containingEl = dropdown.querySelector('.main');
      containingEl.innerHTML="";
    } 
    //containingEl ||= document.body.querySelector('.main');
    //containingEl.innerHTML="";
    //alert(containingEl)
    let content = "";
    if(item.type!="Link") {
      let r = await solidUI.processComponent('','',item) ;
      containingEl.appendChild(r);
      return containingEl;
//      return( await solidUI.processComponent(containingEl,item.component) );
    }
    else if(item.template=='AccordionMenu'){
      console.log(item)
      let r = await solidUI.processComponent('','',item) ;
      containingEl.appendChild(r);
      return containingEl;
    }
    else if(item.type==="Link") {
      if(content){
        containingEl.innerHTML = content;
        return await solidUI.initInternal(containingEl);  
      }
      // return await this.renderApp(json);
      if(item.href){
/*
        const response = await fetch(item.href);
        content = await response.text();
        if(item.outputFormat==="text/plain") content = '<pre>'+content.replace(/</g,'&lt;')+'</pre>';
        containingEl ||= document.body;
        containingEl.innerHTML = content;
        return await solidUI.initInternal(containingEl);  
*/
        let iframe = solidUI.createElement('IFRAME','','');
        iframe.style.border="none";
        iframe.style.height="80vh";
        iframe.style.width="100%";
        iframe.src = item.href;
        if(containingEl) {
          containingEl.appendChild(iframe);
          return containingEl;
        }
        return iframe;
      }
    }
/*
Link content
Link href
Link href outputFormat "preformat"
Component
    let content
    if( link.uri ){
      if(containingEl.tagName==="IFRAME"){
        containingEl.src = link.uri
      }
      else {
        const i = document.createElement('IFRAME')
        i.src = link.uri
        i.style.height="100%"
        i.style.width="100%"
        i.style.border="none"
        containingEl.appendChild(i)
      }
    }
    else if( link.rdf ){
      await loadUnlessLoaded(link.rdf)
//      await this.tt.dispatch(containingEl,link.rdf)
    }
*/
  }


/*
   Components that are a ui:Menu will automatically have listeners attached
   which indicate the selected item.  You may put any javascript in the 
   onclick for each item either calling a method in your app, or one of 
   the built-in Solid-ui-componenet methods :
      * showByClass(className,wanted) : hides all elements with classList containing className except those that also contain wanted
      * showPage(uri,domAreaToDisplayIn,displayType)
*/
solidUI = new SolidUIcomponent();
