import * as user from  './user.js';
import {suicTemplate} from './default-templates.js';
// DataSources
//import {Feed} from './model/rss.js';
import {Feed} from './model/feed.js';
import {Sparql,runQuery} from './model/sparql.js';
// Templates
import {mediaList,mediaItem} from './view/mediaList.js';
import {Accordion} from './view/accordion.js';
import {App} from './view/app.js';
import {Form} from './view/form.js';
import {Menu} from './view/menu.js';
import {menuOfMenus} from './view/menuMenu.js';
import {Modal} from './view/modal.js';
import {optionSelector} from './view/optionSelector.js';
import {Table} from './view/table.js';
//import {Tabs} from './view/tabs.js';
import {tabSet} from './view/tabs.js';
import {BookmarkTree} from './view/bookmarkTree.js';
import {podSelector,resourceSelector} from './view/selector.js';
import {draggable} from './view/draggable.js';
import {buttonListMenu} from './view/buttonListMenu.js';
import {componentButton} from './view/componentButton.js';
import {searchButton} from './view/searchButton.js';
import {button} from './view/button.js';
import {CU} from './utils.js';
import {mungeLoginArea} from './login.js';
const u = new CU();
u.mungeLoginArea = mungeLoginArea;

const sparql = new Sparql();
const proxy = "/proxy?uri="; //"https://solidcommunity.net/proxy?uri=";

class SolidUIcomponent {

skos = UI.rdf.Namespace('http://www.w3.org/2004/02/skos/core#');
ui = UI.rdf.Namespace('http://www.w3.org/ns/ui#');
rdf=UI.rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

  constructor(){
    if(typeof panes !="undefined") {
      window.outliner = panes.getOutliner(document);
    }
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

  async handleLinkClick(event,component){
    let link = event.link;
    let linkType = event.linktype;
    if(event.preventDefault){
      event.preventDefault();
      let elementClicked = event.target;
      link = elementClicked.dataset.link;
      linkType = elementClicked.dataset.linktype || "";
    }
    let displayIn = document.querySelector(component.displayArea);
    if(solidUI.hideTabulator) solidUI.hideTabulator();
    if(linkType==='Replace'){
      window.location.href=link;                   
    }
    else if(linkType==='External'){
      return await u.showIframeSrc(link,component.displayArea);
    }
    else if(linkType==='SolidOS'){
      let so = await u.show('SolidOSLink',link,null,null,null,component)
    }
    else if(linkType==="resourceSelector") {
      return await resourceSelector(component);
    }
    else if(linkType==='Component' && !event.dataOnly) {  // FROM LINK
      let newDiv = document.createElement('DIV');
      newDiv.dataset["suic"]=link;
      displayIn.innerHTML = "";
      displayIn.appendChild(newDiv);
      await solidUI.initInternal(displayIn) ;
    }
    else if(linkType==='Component' && event.dataOnly) {  // FROM MENU
       let newJson=await this.getComponentHash(component.dataSource,component);
       newJson.contentSource = component.dataSource;
       newJson.contentArea = component.contentArea;
       newJson.displayArea = component.displayArea;
       return newJson;
     }
     else {
       let c = await u.show(linkType,link,null,component.displayArea,null,component);
       document.querySelector(component.displayArea).innerHTML="";
       document.querySelector(component.displayArea).appendChild(c);
     }
  }

  async initInternal(containingElement){
    let all = containingElement.querySelectorAll(this.suic)
    for(let element of all) {
      const content = await this.processComponent(element);
      if(content) element.appendChild( content );
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
    if(!plugin || plugin.match(/(PodBrowser|SolidOS|FeedList|ConceptTree)/)) return "builtIn";
    return "";
  }

  async showPage(event,json,obj){
     let content
     if(obj && obj.link){
       obj.cType = obj.dataSourceType ||= 'SolidOSLink';
       if(solidUI.showTabulator) solidUI.showTabulator();
       let displayArea = obj.displayArea || document.body.getAttribute('data-suicDisplay');
       content =  await u.show(obj.cType,obj.link,"",displayArea,true,obj)
       return content;
     }
/* REMOVE ?
alert('showP HERE?')
     if(event && event.preventDefault) event.preventDefault();
     event ||= {target:{tagName:""}};
     if(event.target) event.target.dataset ||= {};
     json ||= {};
     obj ||= json;
     let type;
     let url = event.href || event.value || json.link || json['data'];
     url ||= event.target ?event.target.value :event;
     let plugin = event.target ?event.target.dataset.suicplugin :json.pluginType;
     if(!plugin && event.target.parentElement){
        event.target.parentElement.dataset ||= {};
        plugin = event.target.parentElement.dataset.suicplugin;
     }
     if(plugin && this.pluginType(plugin) != "builtIn"){
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
// ignore draggables for now
     if(0 && obj.displayTarget && obj.displayTarget.match(/#Draggable/)){
       let outerContent = (await u.show(type,url,"","",true,obj)).outerHTML;
       await draggable({
          label : obj.label,
          content : outerContent,
       });
       return;
     }
     else {
       if(obj.plugin) obj.dataSourceType ||= 'SolidOSLink';
       if(solidUI.showTabulator) solidUI.showTabulator();
       content =  await u.show(type,url,"",json.displayArea,true,obj)
     }
     return content;
*/
  }

/* tools and manage menus come here */

  styleButton (button,o) {
    if(!button || !o) return button;
    if(button.id==="login") button.style = o.style || {};
    button.style.display ||= "inline-block";
    button.style.padding ||= "0.5rem";
    let transparent = (button.style.backgroundColor==="transparent");
    if(transparent) {
      button.style.color = this.buttonBackground || solidUI.buttonBackground;
      button.style.border = "none";
    }
    if(!transparent) {
      button.style.border||="1px solid "+this.buttonBackground || o.background;
      button.style["border-radius"] = "0.2rem";
      button.style.backgroundColor ||= this.buttonBackground || o.color;
      button.style.color ||= this.buttonColor || o.background;
    }
    button.style["margin"] = "0.5rem"; 
    button.style["margin-left"] = "0";
    button.style.cursor = "pointer";
    button.style['font-size'] = "100%";
    return button;
  }

  async processComponentJson(json){
    return await this.processComponent(null,null,json);
  }
  async processComponentSubject(subject){
    return await this.processComponent(null,subject);
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
      json ||= subject;
      json.displayArea = element.dataset.display || element.parentNode.dataset.display;
      json.displayArea ||= document.body.getAttribute('data-suicDisplay');
      //if(element.id) json.contentArea = '#' + element.id ;
      //contentArea was here
      json.contentSource = subject.value ?subject.value :subject ; 
    }
    json ||= subject;
    // contentArea - the HTML element to put buttons/menus into
    //
      json.contentArea ||= element;
      if(typeof json.contentArea==="string") json.contentArea = document.querySelector(json.contentArea);

    // DEFAULTS
    //
    if(json.type==="Default") json = this.setDefaults(json);
    else json = this.getDefaults(json);
   if(!json.plugin && element && element.getAttribute) json.plugin = element.getAttribute('data-suicPlugin') || {};
    if(json.type==="Component"){
       if(json.plugin.match(/#ExternalApp/)){
         window.open(json.dataSource)
         return "";
       }
       if(json.plugin.match(/#PodBrowser/))
         return await resourceSelector(json);
       if(json.plugin.match(/#SolidOSLink/))
         return u.show('SolidOSLink',json.href,null,null,null,json)
       let newJson = await this.getComponentHash(json.dataSource,json);
       newJson.contentSource = json.dataSource;
       newJson.contentArea = json.contentArea;
       newJson.displayArea = json.displayArea;
       json = newJson;
   }
   if(json.type === "Plugin"){
/*
     if(solidUI.hideTabulator) solidUI.hideTabulator();
     if(json.pluginType==="Component"){
       let newJson = await this.getComponentHash(json.dataSource,json);
       newJson.contentSource = json.dataSource;
       newJson.contentArea = json.contentArea;
       newJson.displayArea = json.displayArea;
       return newJson;
     }
     else {
*/
       let link = {link:json.dataSource,linktype:json.pluginType,dataOnly:1};
       return this.handleLinkClick(link,json);
//     }
   }


    

//    if(json.type.match(/Link/)){
//      return displayLink(json)
//    }

    // DATASOURCE
    let dataSource = (typeof json.dataSource==="string") ?await this.getComponentHash(json.dataSource) : json.dataSource ;
    if(dataSource && typeof dataSource.dataSource==="string"){
      dataSource = await this.getComponentHash(dataSource.dataSource);
    }
    let script = json.type==="Script" ?json.content :null;
    if(script){
    }
    else if(dataSource && dataSource.type==='Script') {
      script = dataSource.content
      let as=await Function('"use strict";return('+script+')')();
      let el = typeof json.contentArea==="string" ?document.querySelector(json.contentArea) :json.contentArea;
      json.parts = json.dataSource = dataSource = as;
/*
      for(let anchor of as){
        anchor.target = json.displayArea;
        anchor = this.styleButton(anchor,json);
        anchor.addEventListener('click',async (e)=>{
          e.preventDefault();
          anchor.setAttribute('data-contenttype','text/html');
          await u.show('text/html',anchor.href,null,json.displayArea);
        });
        el.classList.add('suic-anchor-list');
        el.appendChild(anchor);      
      }
*/
    }
    if(json.type==='SparqlComponent') {
       if(element && element.dataset && element.dataset.template){
         json.template = element.dataset.template;
       }
       if(element && element.dataset && element.dataset.endpoint){
         json.endpoint = element.dataset.endpoint;
       }
       json.template = 'ui:' + json.template.replace(/^ui:/,'');
       return await runQuery({
         endpoint : json.endpoint,
            query : json.query,
         template : json.template,
      displayArea : json.contentArea
       });
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
    if(json.type==='MediaList') {
       return mediaList(json);       
    }
    if(json.type===UI.ns.schema('MusicRecording').value) {
       return mediaItem(json);       
    }
    if(json.type==='PodSelector') {
       return podSelector(json);
    }
    if(json.type==='PageElement') {
      for(let ds of json.dataSource) {
        ds.contentArea = element;
        ds.targetArea = json.displayArea;
        let x = await this.processComponentJson(ds);
      }
      return document.createElement('SPAN');
    }
    if(json.parts && json.groupOn){
      json.parts = sparql.flatten(json.parts,json.groupOn)
      console.log(json.groupOn,json.parts)
    }

    if(json.type==='App'){
      return await (new App()).render(this,json);
    }
    else if(json.type==='MarkdownContent'){
      return u.show('markdown',null,json.value,json.displayArea,null,json);
    }
    else if(json.type && json.type.match(/Link/)){
      return await window.displayLink(element,json,element);
    }
    else if(json.type && json.type.match(/ButtonListMenu/)){
      return await buttonListMenu(json);
    }
    else if(json.type && json.type.match(/searchButton/)){
      return await searchButton(json);
    }
    else if(json.type==='Menu'){
      return await (new Menu()).render(this,json,element);
    }
    else if(json.type==='CustomTemplate'){
        let recurring = json.recurring
        let before = json.before || "";
        let after = json.after || "";
        recurring = recurring || template;
        let body = this.fillTemplate(recurring,json.parts);
        let contentWrapper = document.createElement('DIV');
        contentWrapper.innerHTML = before + body + after;
        contentWrapper.style.overflow="hidden";
        let tabulator = document.getElementById('solidOSdatabrowser');
        let mainDisplay = document.getElementById('display');
        for(let anchor of contentWrapper.querySelectorAll('A')){
           anchor.addEventListener('click',async(e)=>{
             e.preventDefault();
             if(anchor.dataset.format.match(/SolidOSLink/)){
               tabulator.style.display="block";
               mainDisplay.style.display="none";
               json.dataSourceType ||= 'SolidOSLink';
               return await u.show('rdf',anchor.href,"",null,true,json)
             }
             else {
               tabulator.style.display="none";
               mainDisplay.style.display="block";
               u.showIframeSrc(anchor.href,'#display')
             }
           });
           anchor.style.display="block";
           anchor.style['padding-left']="0.25rem";
           anchor.style.background=solidUI.buttonBackground;
           anchor.style.color=solidUI.buttonColor;
        }
        return contentWrapper;
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
    else if(json.type==='ResourceSelector'){
      return await resourceSelector(json);
    }
    else if(json.type==='FeedList'){
      return await (new Feed()).makeFeedSelector(json.contentSource,json.contentArea,json.displayArea,json);
    }
    else if(json.type==='BookmarkTree'){
      const ul = document.createElement('UL');
      await (new BookmarkTree()).getTopic(json.contentSource,json.contentArea,json.displayArea,'start');
      let elm = typeof json.contentArea==="string" ?document.querySelector(json.contentArea) :json.contentArea;
      elm.style.listStyle="none";
      document.getElementById('ocbStart').click();
    }
    else if(json.type==='OptionSelector'){
      let d = this.setDefaults(json);
      return await optionSelector(json);
    }
    else if(json.type==='ModalButton'){
      // return await (new Modal()).render(this,json)
         return await (new Modal()).render(json,this)
    }
    else if(json.type==='Accordion'){
      return await (new Accordion()).render(this,json)
    }
    else if(json.type==='Form'){
      return await (new Form()).render(json)
    }
    else if(json.type==='Tabset'){
      return await tabSet(json)
//      return await (new Tabs).render(this,json)
    }
    if(json.type==="Table"){
      return await (new builtIn.Table()).render(json);
    }
    else if(json.type && json.type.match(/Button/)){
      return await button(json);
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
        if(typeof template=="string") {
          template = await this.getComponentHash(template);
        }
        recurring = template.recurring;
        before = template.before;
        after = template.after;
//        recurring = recurring || template;
        let body = this.fillTemplate(recurring,results);
        contentWrapper.innerHTML = (before||"") + body + (after||"");
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
  if(!subject.value && typeof subject === "string" && subject.startsWith('/'))
    subject=window.origin+subject;
  subject = await this.loadUnlessLoaded(subject);
  if(!subject) return null;
  let predicatePhrases = UI.store.match(subject,null,null);
  hash = hash || {}
  for(let p of predicatePhrases){
    let pred = p.predicate.value.replace(/http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#/,'').replace(/http:\/\/www.w3.org\/ns\/ui#/,'');
    let obj = p.object;
    let doc = subject.doc ?subject.doc() :subject;
    let items = this.getObjects(UI.store,subject,p.predicate,doc);
    hash[pred] ||= [];
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
  this.proxy = json.proxy

/*
  json.background ||= this.background || "white6";
  json.color ||= this.color || "#000";
  json.secondaryBackground ||= this.secondaryBackground || "gray";
  json.selBackground ||= this.selBackground || "#559";
  json.selColor ||= this.selColor || "#fff";
  json.unselBackground ||= this.unselBackground || "transparent" // "#e0e0e0";
  json.unselColor ||= this.unselColor || "#000";
  json.lightestBackground ||= this.lightestBackground;
  json.lightBackground ||= this.lightBackground;
  json.midBackground ||= this.midBackground;
  json.darkBackground ||= this.darkBackground;
*/
  return(json);
}
setDefaults(json){
  if(typeof json=="string") json = this.processComponent('',json)
  if(json.type==="Default") {
    for(let k of Object.keys(json)){
      this[k] = json[k];
    }
  }

  // COLORS
  this.pageBackground = json.pageBackground || "#ffffff";
  this.pageColor = json.pageColor || "#000000";
  this.pageHighlight = json.pageHightlight || "#666666";
  this.widgetBackground = this.buttonBackground = json.widgetBackground || json.buttonBackground || "#c0c0c0";
  this.widgetColor = this.buttonColor = json.widgetColor || json.buttonColor || "#000000";
  this.widgetHighlight = this.menuBackground = json.widgetHighlight || "#c0c0c0";
  this.menuColor = json.menuColor || "#000000";
  this.menuAltColor = json.menuAltColor || "green";


  document.body.style["background-color"] = this.pageBackground;
  document.body.style["color"] = this.pageColor;
  this.orientation = json.orientation;
  this.position = json.position
  this.proxy = json.proxy

/*
  this.background = json.background;
  this.color = json.color;
  this.secondaryBackground = json.secondaryBackground || "gray";
  this.selBackground = json.selBackground;
  this.selColor = json.selColor;
  this.unselBackground = json.unselBackground;
  this.unselColor = json.unselColor;
*/
  return(this.getDefaults(json));
}

  runBuiltIn(json,template,results){
    if(template.match(/Table/)) return this.results2table(json,results);
    if(template.match(/Modal/)) return this.results2modal(results);
    if(template.match(/Accordion/)) return tabset(results);
    if(template.match(/DescriptionList/)) return this.results2descriptionList(results);
  }

async loadTheme(themeURL){
  try{
    let tName = UI.rdf.Namespace(themeURL+'#');
    await UI.store.fetcher.load(themeURL);
    let theme = UI.store.match(tName('this'))
    if(theme){
      theme = await this.processComponentSubject(theme);
    }
  }
  catch(e){alert(e)}
}
/* TEMPLATING 
*/
async processTemplate(template,results,containingElement){
  let body;
  if(typeof template==='string'){
     if(template.startsWith('ui:')){
       body = await this.builtIn({template,parts:results});
     }
     else {
       body = await this.CustomTemplate({template,parts:results});
     }
  }
  else {
    if(template.groupOn) {
      results = sparql.flatten(results,template.groupOn)
    }   
    let recurring = template.recurring;
    let before = template.before;
    let after = template.after;
    if(recurring) body = recurring.interpolate(results);
    body = (before||"") + (body||"") + (after||"");
  }    
  containingElement ||= document.createElement('DIV');
  if(typeof body != "string") {
    containingElement.innerHTML = "";
    containingElement.appendChild(body);
  }
  else containingElement.innerHTML = body;
  return containingElement;
}
RecordsList = async(options)=>{
  const templateString = suicTemplate.RecordsList;
  let parts = templateString.split(/\[~LOOP~\]/);
  let got = parts.length;
  let mid=got===3 ?parts[1].replace(/\[~/g,'${').replace(/~]/g,'}') :parts[0];
  let all=got===3 ?parts[0] : "";
  let bottom=got===3 ?parts[2] : "";
  for(let row of options.parts){
    let rowStr="";
    for(let col of Object.keys(row)){
      rowStr += mid.interpolate({key:col,val:row[col]});
    }
    all += rowStr+'<hr>';
  }
  all += bottom;
  return(all);
}
CustomTemplate = async(options)=>{
  let blocks = options.template.split(/\[~LOOP~\]/);
  let got = blocks.length;
  let mid=got===3 ?blocks[1].replace(/\[~/g,'${').replace(/~]/g,'}') :blocks[0];
  let all=got===3 ?blocks[0] :"";
  let bottom=got===3 ?blocks[2] : "";
  for(let row of options.parts){
    all += mid.interpolate(row);
  }
  all += bottom;
  return(all);
}
SimpleSelector(options){                                                         
  let select = document.createElement('SELECT');                                    
  select.style=`width:240px;height:2.5rem;font-size: 100%;border-radius: 0.5rem;pad\
ding:0.5rem;background:${solidUI.widgetBackground};font-size:100%;color:${widgetColor};outline:none;`;                                                         
  for(let o of options){                                                            
    let option = document.createElement('OPTION');                                  
    option.value = o.link;                                                          
    option.innerHTML = o.label;                                                     
    option.style=`background:${solidUI.widgetHighlight};font-size:110%;color:black;`  
    select.appendChild(option);                                                     
  }                                                                                 
  return select;                                                                    
}       
templates = {
    Table: async(options)=>{ return await (new Table()).render(options) },
    JSON: (options)=>{ return(JSON.stringify(options.parts,4)); }
};
async builtIn(options){
  options.template = options.template.replace(/^ui:/,'');
  const handler = this[options.template] || this.templates[options.template];
  if(handler) {
    return await handler(options);
  }
  else {
    alert(`Bad template name '${options.template}'!`);
    return "";
  }
}


async processBuiltInTemplate(templateName,results,containingElement){
  templateName = templateName.replace(/^ui:/,'');
  if(templateName==="JSON") { return(JSON.stringify(results,4,4)); }
  if(templateName==="RecordsList") {
    return await this.processCustomTemplate(templateString,results);
  }
}
/*
    
    let tableStr = "<table>";
    for(let row of results){
      let rowStr="";
      for(let col of Object.keys(row)){
        rowStr += `
          <tr style="margin:1rem;border:1px solid black;padding:1rem;">
            <th style="text-align:right">${col}</th>
            <td>${row[col]}</td>
          </tr>
        `;
      }
      tableStr += rowStr;
    }
    return tableStr+'</table>';
  }
  return( (new builtIn[template]).render({parts:results}) )
}
*/
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
    if( UI.store.any(null,null,null,UI.rdf.sym(uri)) ) return UI.rdf.sym(uri);
    let [eName,fragment] = uri.split(/#/);
    let eDoc = document.getElementById(eName)
    let uiString = eDoc.innerText || eDoc.value;
    uiString = uiString.trim()
    if(uiString.startsWith('\<\!\[CDATA\[')) uiString=uiString.replace(/^\<\!\[CDATA\[/,'').replace(/\]\]$/,'').replace(/~~/g,'#');
    try {
      UI.rdf.parse(  uiString, UI.store, uri, "text/turtle" ); 
      return(UI.rdf.sym(uri));
    }
    catch(e) { console.log(e) }
  }

  async  loadUnlessLoaded(uri){
    try {
      if(!uri) return;
      if(uri && uri.termType && uri.termType==="BlankNode") return uri;
      uri = typeof uri==="object" ?uri.uri :uri;
      if(!uri) return;
      if(uri.startsWith('inline')) return this.loadFromMemory(uri);
      if(!uri.startsWith('http')&&!uri.startsWith('ls')) uri = window.location.href.replace(/\/[^\/]*$/,'/') + uri;
    const mungedUri = uri.replace(/\#[^#]*$/,'');
      let graph = UI.rdf.sym(mungedUri);
      if( !UI.store.any(null,null,null,graph) ){
        console.log("loading "+graph.uri+" ...");
        let r = await UI.store.fetcher.load(graph.uri);
        if(UI.store.any(null,null,null,graph)) console.log(`<${graph.uri}> loaded!`);
        else console.log(`<${graph.uri}> could not be loaded!`);
//console.log(UI.store.match(null,null,null,graph));
      }
//      else console.log(`<${graph.uri}> already loaded!`);
      return UI.rdf.sym(uri);
    }
    catch(e) { console.log(e); return UI.rdf.sym(uri) }
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
solidUI.runQuery = runQuery.bind(solidUI);

export default solidUI;

/*
document.addEventListener('DOMContentLoaded', function() {    
  let solidUI = new SolidUIcomponent();
});
*/
[
    {
        "File": "https://solidproject.solidcommunity.net/public/Specification/",
        "Size": "4096",
        "Mtime": "1646836730.88"
    },
    {
        "File": "https://solidproject.solidcommunity.net/public/Public/",
        "Size": "4096",
        "Mtime": "1614079346.793"
    },
    {
        "File": "https://solidproject.solidcommunity.net/public/2021/",
        "Size": "4096",
        "Mtime": "1614079321.425"
    }
]
