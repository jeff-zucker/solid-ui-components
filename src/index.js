import * as user from  './user.js';
// DataSources
//import {Feed} from './model/rss.js';
import {Feed} from './model/feed.js';
import {Sparql} from './model/sparql.js';
// Templates
import {Accordion} from './view/accordion.js';
import {App} from './view/app.js';
import {Form} from './view/form.js';
import {Menu} from './view/menu.js';
import {menuOfMenus} from './view/menuMenu.js';
import {Modal} from './view/modal.js';
import {SelectorPanel} from './view/selectorPanel.js';
import {Table} from './view/table.js';
import {Tabs} from './view/tabs.js';
import {BookmarkTree} from './view/bookmarkTree.js';
import {containerSelector} from './view/selector.js';
import {draggable} from './view/draggable.js';
import {buttonListMenu} from './view/buttonListMenu.js';
import {componentButton} from './view/componentButton.js';
import {CU} from './utils.js';
const u = new CU();

const sparql = new Sparql();
const proxy = "https://solidcommunity.net/proxy?uri=";

class SolidUIcomponent {

$rdf = UI.rdf;
skos = $rdf.Namespace('http://www.w3.org/2004/02/skos/core#');
ui = $rdf.Namespace('http://www.w3.org/ns/ui#');
rdf=$rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

  constructor(){
if(typeof panes !="undefined") window.outliner = panes.getOutliner(document);
  }


  // BREAKING : components marked as data-suic, not data-solid_ui_component
  suic = "[data-suic]";

  async init(){

    // fetcher = this.makeLSfetcher(UI); // see drafts/in-browser-fetcher.js
    let all = document.querySelectorAll(this.suic)
//    all= all.length>0 ?all : document.querySelectorAll('[data-solid_ui_component]')
    for(let element of all) {
      const content = await this.processComponent(element);
      if(content) element.appendChild( content );
    }
  }

  async initInternal(containingElement){
    let all = containingElement.querySelectorAll(this.suic)
    for(let element of all) {
      const content = await this.processComponent(element);
      element.appendChild( content );
    }
    return containingElement;
  }

  async activateComponent(selector,targetElement){
    targetElement ||= document;
    let elm = typeof selector==="string" ?document.querySelector(selector) :selector;
    let c = await this.getComponentHash(elm.getAttribute('data-suic'));
    if(c && c.plugin) elm.setAttribute('data-suicPlugin',c.plugin);
    if(elm.innerHTML.replace(/\s*/g,'').length === 0) {
      const content = await this.processComponent(elm);
      elm = content;
      if(elm){
        elm.style ||= {};
        elm.style.display="block";
      }
    }
    return elm;
  }

  pluginType(plugin){
    if(!plugin || plugin.match(/(PodBrowser,SolidOS,FeedList,ConceptTree)/)) return "builtIn";
    return "";
  }

  async showPage(event,json,obj){
console.log('SHOW PAGE')
     if(event && event.preventDefault) event.preventDefault();
     event ||= {target:{tagName:""}};
     event.target.dataset ||= {};
     json ||= {};
     obj ||= json;
     let type;
     let url = event.href || event.value || json.link || json['data'];
     url ||= event.target.value;
     let plugin = event.target.dataset.suicplugin;
     if(!plugin && event.target.parentElement){
        event.target.parentElement.dataset ||= {};
        plugin = event.target.parentElement.dataset.suicplugin;
     }
     if(plugin && this.pluginType(plugin) != "built-in"){
       let pFile = window.origin + `/cm/plugins/${plugin}.ttl`;
       await UI.store.fetcher.load(pFile);
       let node = UI.rdf.sym(pFile+"#this");
       let x= UI.store.match(node,this.rdf('type'),this.ui('LinkHandler'));
       if(x && x.length===1){
         let converter = UI.store.any(node,this.ui('linkConvert'),null,node.doc())
       url = converter.value.interpolate({href:url});
         type="text/html";
       }
     }
     type ||= event.target.dataset.contenttype || u.findType(url);
     if(solidUI.showFunction) return await solidUI.showFunction(type,url,json.displayArea,true,obj);
     let content
     if(obj.displayTarget && obj.displayTarget.match(/#Draggable/)){
       let outerContent = (await u.show(type,url,"","",true,obj)).outerHTML;
       alert(outerContent)
       await draggable({
          label : obj.label,
          content : outerContent,
       });
       return;
     }
     else {
       content =  await u.show(type,url,"",json.displayArea,true,obj)
     }
     return content;
  }

  async processComponent(element,subject,json){
    if(!json){    
      if(!subject && element && element.dataset){
        let urlToLoad  = element.dataset.suic;
        if(urlToLoad.startsWith('/')) urlToLoad = window.origin + urlToLoad;
        subject = await this.loadUnlessLoaded(urlToLoad);
      }
      if(!subject) return null;
      json = await this.getComponentHash(subject)
      element ||= {}
      element.dataset ||= {};
      element.parentNode  ||= {};
      element.parentNode.dataset  ||= {};
      json.displayArea = element.dataset.display || element.parentNode.dataset.display;
      if(element.id) json.contentArea = '#' + element.id ;
      json.contentSource = subject.value ?subject.value :subject ;
    }
    json ||= subject;
    if(!json.plugin && element && element.getAttribute) json.plugin = element.getAttribute('data-suicPlugin') || {};
    if(json.type==="Component"){
       if(json.plugin.match(/#PodBrowser/))
         return await containerSelector(json);
       if(json.plugin.match(/#SolidOSLink/))
         return u.show('SolidOSLink',json.href,null,null,null,json)
       let newJson = await this.getComponentHash(json.dataSource,json);
       newJson.contentSource = json.dataSource;
       newJson.contentArea = json.contentArea;
       newJson.displayArea = json.displayArea;
       json = newJson;
    }

    if(!json) {console.log("No ComponentHASH ",subject); return;}
    // default color,orientation,position
    json = this.getDefaults(json);

//    if(json.type.match(/Link/)){
//      return displayLink(json)
//    }

    // DATASOURCE
    let dataSource = (typeof json.dataSource==="string") ?await this.getComponentHash(json.dataSource) : json.dataSource ;
    if(dataSource && typeof dataSource.dataSource==="string"){
      dataSource = await this.getComponentHash(dataSource.dataSource);
    }
    if(dataSource && dataSource.type==='Script') {
      let as=await Function('"use strict";return('+dataSource.content+')')();
      let el = document.querySelector(json.contentArea);
      for(let anchor of as){
        anchor.target = json.displayArea;
        anchor.addEventListener('click',async (e)=>{
          e.preventDefault();
          anchor.setAttribute('data-contenttype','text/html');
          await u.show('text/html',anchor.href,null,json.displayArea);
        });
        el.classList.add('suic-anchor-list');
        el.appendChild(anchor);      
      }
    }
    if(dataSource && dataSource.type==='SparqlQuery') {
      let endpoint = dataSource.endpoint;
      let query = dataSource.query.replace(/\$\{[^\}]*\}/g,'');
      json.parts = await this.sparqlQuery(endpoint,query,json);
      if(json.type==='SparqlQuery') return json.parts;
    }
    if(json.type==='SparqlQuery') {
      json.parts = await this.sparqlQuery(json.endpoint,json.query,json);
      if(json.type==='SparqlQuery') return json.parts;
    }
    if(json.type==='SolidOSLink') {
       return u.show('SolidOSLink',json.href,null,null,null,json)
    }
    if(json.type==='AnchorList') {
      for(let l of json.content.split(/\n/) ){

      }
    }
    if(json.parts && json.groupOn){
      json.parts = sparql.flatten(json.parts,json.groupOn)
      console.log(json.groupOn,json.parts)
    }

    if(json.type==='App'){
      return await (new App()).render(this,json);
    }
    else if(json.type && json.type.match(/Link/)){
      return await window.displayLink(element,json,element);
    }
    else if(json.type && json.type.match(/ButtonListMenu/)){
      return await buttonListMenu(json);
    }
    else if(json.type==='Menu'){
      return await (new Menu()).render(this,json,element);
    }
    else if(json.type==='MenuOfMenus'){
      return await menuOfMenus(json);
    }
    else if(json.type==='ComponentButton'){
      return await componentButton(json);
    }
    else if(json.type==='Draggable'){
      return await draggable(json);
    }
    else if(json.type==='ContainerSelector'){
      return await containerSelector(json);
    }
    else if(json.type==='FeedList'){
      return await (new Feed()).makeFeedSelector(json.contentSource,json.contentArea,json.displayArea);
    }
    else if(json.type==='BookmarkTree'){
      await (new BookmarkTree()).getTopic(json.contentSource,json.contentArea,json.displayArea,'start');
      let elm = document.querySelector(json.contentArea);
      elm.style = "padding:0;margin:0;list-style:none;"
      document.getElementById('ocbStart').click();
    }
    else if(json.type==='SelectorPanel'){
      let panel = new SelectorPanel();
      let d = this.setDefaults(json);
      return await panel.render(json);
    }
    else if(json.type==='ModalButton'){
      // return await (new Modal()).render(this,json)
         return await (new Modal()).render(json,this)
    }
    else if(json.type==='Accordion'){
      return await (new Accordion()).render(this,json)
    }
    else if(json.type==='FormComponent'){
      return await (new Form()).render(this,json)
    }
    else if(json.type==='Tabset'){
      return await (new Tabs).render(this,json)
    }
    if(json.type==="Table"){
      return await (new Table()).render(json);
    }
    let contentWrapper = document.createElement('DIV');
    let results,before,after,content,label;

// RECORD
    if(json.type==='Record') {
      label = this.getValue( dataSource, ui('label') );
      content = this.getValue( dataSource, ui('content') );
      results = {label,content} ;
    }

results = results || json.parts;  
this.log('Parts for Component',results);
// TEMPLATE
    let template = json.template;
    if(!template){
      return results;
    }
    if(template.groupOn) {
      results = sparql.flatten(results,template.groupOn)
    }   
    
      if(template=="AccordionMenu"){
        let compo = await this.runBuiltIn(template,results);
        if(compo) contentWrapper.appendChild(compo);
        return contentWrapper;
      }
      if(template=="Table"||json.type==="Table"){
        let compo = await (new Table()).render(json);
        if(compo) contentWrapper.appendChild(compo);
        return contentWrapper;
      }
      if(template=="ModalButton"){
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
        if(typeof template=="string") {
          template = await this.getComponentHash(template);
        }
        recurring = template.recurring;
        before = template.before;
        after = template.after;
//        recurring = recurring || template;
        let body = this.fillTemplate(recurring,results);
        contentWrapper.innerHTML = (before||"") + body + (after||"");

/*
      if( dataSourceType.match(/Menu/) ) {
        for(let menuItem of contentWrapper.children){
          menuItem.addEventListener('click',(event)=>this.menu(event));
        }
      }
*/
      return contentWrapper ;
    
  }
getObjects(store,s,p,g){
  let list = store.each(s,p,null,g);
  if(list.length===0) return list
  let type = list[0].termType;
  let isFirst = store.any(list[0],this.rdf('first'));
  if(type==="Collection") return list[0].elements;
  else {
    if(!isFirst) return list;
    else {
      return this.getRdfsList(store,list[0]);
    }
  }
}
getRdfsList(store,first,list){
  list ||= [];
  list.push( store.any(first,this.rdf('first')) );
  let rest = store.any(first,this.rdf('rest'));
  if(rest && rest.value===this.rdf('nil').value) {
    return list;
  }
  else {
   return this.getRdfsList(store,rest,list)
  }
}
  
async getComponentHash(subject,hash){
    if(!subject) return hash;
    subject = await this.loadUnlessLoaded(subject);
    if(!subject) return null;
    let predicatePhrases = UI.store.match(subject,null,null);
/*
    let thisdoc = UI.store.match(subject,null,null,subject.doc())
    let isComponent = UI.store.any(subject,this.rdf('type'),this.ui('Component'));
  //  console.log(66,subject.value,isComponent)
*/
    hash = hash || {}
    for(let p of predicatePhrases){
      let pred = p.predicate.value.replace(/http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#/,'').replace(/http:\/\/www.w3.org\/ns\/ui#/,'');
      let obj = p.object;
      let doc = subject.doc ?subject.doc() :subject;
      let items = this.getObjects(UI.store,subject,p.predicate,doc);
      hash[pred] ||= [];
/*
      for(let item of items){
//console.log(55,p.predicate.value,item)
//let x = await this.getComponentHash(item,hash);
        hash[pred].push(item.value);
      }
*/
      if(obj.termType==="BlankNode"){
        obj = await this.getComponentHash(obj);
        if(!hash[pred])  hash[pred] = obj;
        else if(typeof hash[pred] !='ARRAY') hash[pred] = [obj]
        else hash[pred].push(obj);
      }
      else if(obj.termType==="Collection"){
        obj = obj.elements;
        for(let uri of obj){
          let component = await this.getComponentHash(uri,{});
          if(!hash[pred])  hash[pred] = [component];
          else hash[pred].push(component);
        }
      }
      else {
        obj = obj.value.replace(/^http:\/\/www.w3.org\/ns\/ui#/,'');
        if(!hash[pred])  hash[pred] = obj;
        else if(typeof hash[pred] !='ARRAY') hash[pred] = [obj]
        else hash[pred].push(obj);
      }
      if(hash[pred].length==1) hash[pred]=hash[pred][0];
    }
    hash.id ||= subject.value;
    return hash ;
  }
  log(...args){
    if(typeof DEBUG!="undefined") console.log(args);
  }
  setStyle(element,styles){
    for(let s of Object.keys(styles)){
      element.style[s]=styles[s];
    }
  }


/*-----------
  SPARQL
----------*/
  async sparqlQuery(endpoint,queryString,json){
    if(typeof Comunica !="undefined")
      return await sparql.comunicaQuery(endpoint,queryString,json);
    else   
      return await sparql.rdflibQuery(endpoint,queryString,json);
//    return await sparql.rdflibQuery(solidUI,UI.store,endpoint,queryString,json);  
  }


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  DISPLAY METHODS
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

getDefaults(json){
  if(typeof json=="string") json = this.processComponent('',json)
  json.height ||= this.height;
  json.width ||= this.width;
  json.proxy ||= this.proxy || proxy;
  json.background ||= this.background || "#f6f6f6";
  json.color ||= this.color || "#000";
  json.selBackground ||= this.selBackground || "#559";
  json.selColor ||= this.selColor || "#fff";
  json.unselBackground ||= this.unselBackground || "transparent" // "#e0e0e0";
  json.unselColor ||= this.unselColor || "#000";
  json.orientation ||= this.orientation || "horizontal";
  json.position ||= this.position || "left";
  this.proxy = json.proxy
  return(json);
}
setDefaults(json){
  if(typeof json=="string") json = this.processComponent('',json)
  this.background = json.background;
  this.color = json.color;
  this.selBackground = json.selBackground;
  this.selColor = json.selColor;
  this.unselBackground = json.unselBackground;
  this.unselColor = json.unselColor;
  this.orientation = json.orientation;
  this.position = json.position
  this.proxy = json.proxy
  return(this.getDefaults(json));
}

  fillTemplate(templateStr,object){
    function fillOneTemplateRow(templateStr,object){
      for(let o of Object.keys(object) ){
        let newStuff=object[o]||" ";
        if(typeof newStuff==='object' && newStuff.length>1) newStuff = newStuff.join(", ");
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

  runBuiltIn(json,template,results){
    if(template.match(/Table/)) return this.results2table(json,results);
    if(template.match(/Modal/)) return this.results2modal(results);
    if(template.match(/Accordion/)) return tabset(results);
    if(template.match(/DescriptionList/)) return this.results2descriptionList(results);
  }

  /* UTILITIES
  */

  diff(diffMe, diffBy){ diffMe.split(diffBy).join('') }

  simulateClick(el){
    if (el.fireEvent) {
      el.fireEvent('on' + 'click');
    } else {
      var evObj = document.createEvent('Events');
      evObj.initEvent('click', true, false);
      el.dispatchEvent(evObj);
    }
  }

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
    let uiNamespace = 'http://www.w3.org/ns/ui#';
    let type = UI.store.each( subject, rdf('type') ).map( (object) =>{
      object = object.value;
      if(object.match(/ns\/ui#/)) return object.replace(/.*\#/,'');
    });
    return type[0] || "";
  }

  async clearInline(){
    for(let stm of UI.store.match()){
      if(stm.graph.value.startsWith('inline:')) UI.store.remove(stm);
    }
  }

  loadFromMemory(sentUri){
    let uri = sentUri //.replace(/^inline:/,'');
    if( UI.store.any(null,null,null,$rdf.sym(uri)) ) return $rdf.sym(uri);
    let [eName,fragment] = uri.split(/#/);
    let eDoc = document.getElementById(eName)
    let uiString = eDoc.innerText || eDoc.value;
    uiString = uiString.trim()
    if(uiString.startsWith('\<\!\[CDATA\[')) uiString=uiString.replace(/^\<\!\[CDATA\[/,'').replace(/\]\]$/,'').replace(/~~/g,'#');
    try {
      $rdf.parse(  uiString, UI.store, uri, "text/turtle" ); 
      return($rdf.sym(uri));
    }
    catch(e) { console.log(e) }
  }

  async  loadUnlessLoaded(uri){
    try {
      if(!uri) return;
      if(uri && uri.termType && uri.termType==="BlankNode") return uri;
      uri = typeof uri==="object" ?uri.uri :uri;
      if(uri.startsWith('inline')) return this.loadFromMemory(uri);
      if(!uri.startsWith('http')&&!uri.startsWith('ls')) uri = window.location.href.replace(/\/[^\/]*$/,'/') + uri;
    const mungedUri = uri.replace(/\#[^#]*$/,'');
      let graph = $rdf.sym(mungedUri);
      if( !UI.store.any(null,null,null,graph) ){
        console.log("loading "+graph.uri+" ...");
        let r = await UI.store.fetcher.load(graph.uri);
        if(UI.store.any(null,null,null,graph)) console.log(`<${graph.uri}> loaded!`);
        else console.log(`<${graph.uri}> could not be loaded!`);
//console.log(UI.store.match(null,null,null,graph));
      }
      else console.log(`<${graph.uri}> already loaded!`);
      return $rdf.sym(uri);
    }
    catch(e) { console.log(e); return $rdf.sym(uri) }
  }
   getValue(s,p,o,g) {
     let node = UI.store.any( s, p, o, g );
     return node ?node.value :"" 
   }
   valuesContain(s,p,o,g,wanted) {
    let nodes = UI.store.each( s, p, o, g );
    for(let n of nodes) {
      n = n ?n.value :"";
      if(n===wanted) return n;
    }
  }

} // END OF CLASS SolidUIcomponent

let solidUI = new SolidUIcomponent();
solidUI.util = u;
solidUI.draggable = draggable;
export default solidUI;
/*
document.addEventListener('DOMContentLoaded', function() {    
  let solidUI = new SolidUIcomponent();
  solidUI.util = u;
});
*/
