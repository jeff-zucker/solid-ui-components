/*
  NON-RDF 
   image pdf video audio text html graphviz markdown
  RDF
   SolidOSLink Form SparqlQuery DataTemplate PageDefinition 
*/


/*
  show[rdf|markdown|graphviz](uri,string,targetSelector)
  mungeLabel(label)
  PUT(url,content,contentType)
*/
import {Sparql} from './model/sparql.js';
import {Table} from './view/table.js';
import {Form} from './view/form.js';
//import mime from "https://cdn.skypack.dev/mime";

export class CU {

  constructor(){
    this.UIO = UI.rdf.Namespace("http://www.w3.org/ns/ui#");
    this.ISA = UI.rdf.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
    this.PIM = UI.rdf.Namespace("http://www.w3.org/ns/pim/space#");
  }


removeClass(tag,cl){
    document.querySelector(tag).classList.remove(cl);
}
addClass(tag,cl){
    document.querySelector(tag).classList.add(cl);
}

newElement(tag,id,classList,value){
   let thing = document.createElement(tag);
   if(id) thing.id = id;
   if(classList) thing.classList = classList;
   if(value) thing.value = value;
   return thing;
}

  getProperty(subject,curie){
    let [vocab,predicate] = curie.split(/:/);
    return UI.store.any(subject,UI.ns[vocab](predicate)) || "";
  }
  getProperties(subject,curie){
    let [vocab,predicate] = curie.split(/:/);
    return UI.store.each(subject,UI.ns[vocab](predicate))  || [];
  }
  getValues(subject,curie){
    let all = [];
    let some = this.getProperties(subject,curie) || [];
    for(let one of some){
      all.push(one.value);
    }
    return all;
  }

  getObjects(subject,predicate){
    return UI.store.each(subject,predicate).map((s)=>{return s.value});
  }
  getObject(subject,predicate){
    let val = UI.store.any(subject,predicate);
    return val && val.value ?val.value :"";
  }

  /*
  displays rendered component in targetSelector if it is not null
  returns rendereed component as an HTML-element

  renderFromURL(url,targetSelector,forceReload);
   

  load from URL - renderComponent({url:""});
  load from STRING - renderComponent({url:"",string:""});
  load from HTML-ELEMENT - renderComponent({element:""});

    1. loads from url, string, or html-element
       * if string, parses it into store
       * else if !url, gets url from element dataset, loads into store
       * else if !string && !element loads url into store
       * if forceReload, does store.removeDocument before loading
    2. finds subject from url or #this
       * if url contains #, use it as subject
       * else use url+#this as subject
    3. 
 
            loads uri into store

   renderComponent({
     url,
     string,
     element,
     forceReload,
   })
     
  async renderComponent(url,string,element){
    url = url.value ?url.value :UI.rdf.sym(url)
    let uiType = this.getUItype(url);
    let mainSubject = UI.store.rdf.sym( url.match(/\#/) ?url :url+"#this" );
    let node = await this.crossLoad(url,string,forceReload);
    let subjectType = this.getUItype(mainSubject);
  }
   */

  menuize(buttonGroupElement){
    buttonGroupElement = document.querySelector(buttonGroupElement);
    if(!buttonGroupElement) return;
    let buttons = buttonGroupElement.querySelectorAll('BUTTON');
    for(let b of buttons){
      b.addEventListener('click',(e)=>{
        let clicked = e.target;
        for(let b2 of buttons){ b2.classList.remove('selected') }
        b.classList.add('selected');
      });
    }
  }

  findType(uri,string){
    if(!uri && typeof sourceFile != "undefined") uri = sourceFile;
    if(!uri) return "unknown";
    let type = uri.replace(/\#.*/,'').replace(/\?.*/,'').replace(/.*\./,'');
    if(!type) return "unknown";
    if(type.match(/(md)|(markdown)/)) return "markdown";
    if(type.match(/(dot)|(gv)/)) return "graphviz";
    if(type.match(/(ttl)|(rdf)|(n3)/)) return "rdf";
    if(type.match(/(html)|(css)|(js)/)) return type;
    return "unknown";
  }
  async show(type,uri,string,targetSelector,forceReload,obj){
    if(solidUI.hideTabulator) solidUI.hideTabulator();
    if(targetSelector && typeof targetSelector != "string"){
//      targetSelector = targetSelector.id;
    }
    /*
     NEW (NO ACE)
    */

    type = type ?type.replace(/.*\//,'') :null;
    if(!type || !type.match(/html/)) type = "rdf";
    return await this._show[type](uri,string,targetSelector,forceReload,obj);

    /*
     OLD
    */
    if(type.match(/(turtle)|(rdf)|(n3)/)) type = "rdf";
    if(type.match(/image/)) type = "image";
    if(type.match(/video/)) type = "video";
    if(type.match(/audio/)) type = "audio";
    if(type.match(/graphviz/)) type = "graphviz";
    if(type.match(/(javascript|json|text)/)) type = "text";
    type = type.replace(/.*\//,'');
    if(this._show[type])
       return await this._show[type](uri,string,targetSelector,forceReload,obj);
  }

  _show = {

  image : async(uri,string,targetSelector) => {
    if(targetSelector) return this.showIframeSrc(uri,targetSelector);
  },
  pdf : async(uri,string,targetSelector) => {
    if(targetSelector) return this.showIframeSrc(uri,targetSelector);
  },
  video : async(uri,string,targetSelector) => {
    if(targetSelector) return this.showIframeSrcDoc(`<video controls="yes" src="`+uri+`" style="max-width:100vw;max-height:100vh"></video>`,uri,targetSelector);
  },
  audio : async(uri,string,targetSelector) => {
    if(targetSelector) return this.showIframeSrcDoc(`<audio controls="yes" src="`+uri+`" style="margin-top:2em;"></audio>`,uri,targetSelector);
  },
  text : async (uri,string,targetSelector) => {
    string ||= (await this.loadFile(uri)).body;
    if(targetSelector) return this.showIframeSrcDoc(string,uri,targetSelector);
    let div = document.createElement("DIV");
    div.innerHTML = string;
    return div;
  },
  html : async (uri,string,targetSelector) => {
    if(uri.match(/\.(md|markdown)$/)) return this._show['markdown'](uri,string,targetSelector);
    string ||= (await this.loadFile(uri)).body;
    if(targetSelector) return this.showIframeSrcDoc(string,uri,targetSelector);
    let div = document.createElement("DIV");
    div.innerHTML = string;
    return div;
  },
  graphviz : async (uri,string,targetSelector) => {
    string ||= (await this.loadFile(uri)).body;
    if(targetSelector) {
      document.querySelector(targetSelector).innerHTML = "";
      try {
        d3.select(targetSelector).graphviz().renderDot(string, ()=>{} );
      } catch(e){ alert(e); }
    }
    else {
      let div = document.createElement("DIV");
      try {
        d3.select(div).graphviz().renderDot(string, ()=>{} );
      } catch(e){ alert(e); }
      return div;
    }
  },
  markdown : async (uri,string,targetSelector) => {
    string ||= (await this.loadFile(uri)).body;
    let parsedString = marked.parse(string);
    if(targetSelector){
      return this.showIframeSrcDoc(parsedString,uri,targetSelector);
    }
    let div = document.createElement("DIV");
    div.innerHTML = parsedString;
    return div; 
  },
  Component : ()=>{
    alert("utils.js Component")
  },
  SolidOSLink : async (url,string,targetSelector,forceReload,obj)=>{
    url ||= obj.href;
    if(solidUI.showTabulator) solidUI.showTabulator();
      let targetElement = document.getElementById('suicTabulator') || targetSelector
      if(targetElement) targetElement.style.display="block";
      let targetOutline = targetElement ?targetElement.querySelector('#outline') || targetElement.querySelector('.outline') :null;
      if(!targetOutline) {
        targetElement=makeOutline();
        targetOutline =  targetElement.querySelector('.outline') ;
      }
      let subject = UI.rdf.sym(url);
      // let wantedPane = obj && obj.pane ?panes.byName(obj.pane) :null;
      let wantedPane = obj && obj.pane ?obj.pane :null;
      let plugin = obj ?obj.plugin :"";
      plugin ||= "";
      let displayTarget = obj ?obj.displayTarget :"";
      if(plugin.match(/ProfileEditor/)) wantedPane = "editProfile";
      if(plugin.match(/PreferencesEditor/)) wantedPane = "basicPreferences";
//console.log(obj);
      wantedPane = wantedPane ?panes.byName(wantedPane) :null;
      const params = new URLSearchParams(location.search)
      url = url.uri ?url.uri :url;
      params.set('uri', url);
      //setHistory(window.orgin+'/cm/?uri='+url);
      let thisApp = '/cm/'
      window.outliner.GotoSubject(subject,true,wantedPane,true,null,targetOutline);
//      window.history.replaceState({}, '', `${thisApp}?${params}`);
      return targetOutline;
      function makeOutline(){
        let div = document.createElement('DIV');
        div.classList.add('TabulatorOutline');
        let table = document.createElement('TABLE');
        table.classList.add('outline');
        div.appendChild(table);
        return div;
      }
  },
  Form : async(subject,targetSelector,forceReload)=>{
    let uri = subject.doc ?subject.doc() :subject;
    if(uri.value) uri = uri.value;
    const form = await (await new Form()).render({ form:subject.value });
    if(targetSelector){
if(!targetSelector.startsWith('#')) targetSelector = '#'+targetSelector;
      document.querySelector(targetSelector).innerHTML = "";
      document.querySelector(targetSelector).appendChild(form);
      // return await this.showIframeSrcDoc( form.outerHTML, targetSelector );
      // let src =  "showForm.html?uri=" + encodeURI(uri) ;
      // return this.showIframeSrc( src, targetSelector );
    }
    return form;
  },
  SparqlQuery : async(subject,targetSelector,forceReload)=>{
    let e = (UI.store.any(subject,this.UIO('endpoint'),null)||"").value;
    let q = (UI.store.any(subject,this.UIO('query'),null)||"").value;
    q = q.replace(/\$\{[^\}]*\}/g,'');
    let table = (new Table()).render({
      parts : await (new Sparql()).sparqlQuery(e,q,forceReload),
      cleanNodes : true,
      sortOn : 'term'
    });
    if(targetSelector) {
      document.querySelector(targetSelector).innerHTML="";
      document.querySelector(targetSelector).appendChild(table);
    }
    return table;
  },
  DataTemplate : async(subject,targetSelector,store)=>{
    store ||= UI.store;
    let query =  this.getUIterm(subject,'query');
    let endpoint =  this.getUIterm(subject,'endpoint');
    let template = this.getUIterm(subject,'template');
    let data = await (new Sparql()).sparqlQuery(endpoint,query,store);
    let interpolated = "";
    for(let row of data.reverse()){
      interpolated += template.interpolate(row);
    }
    if(targetSelector) {
      this.showIframeSrcDoc(interpolated,subject,targetSelector);
    }
    let div = document.createElement("DIV");
    div.innerHTML = interpolated;
    return div;
  },
  PageDefinition : async(subject,targetSelector)=>{
    subject = this.getMainSubject(subject);
    let DM = new DOMParser();
    let XS = new XMLSerializer();
    let templateURL = this.getUIterm(subject,'pageTemplate');
    let templateInfo = await this.loadFile(templateURL)
    let dom = DM.parseFromString( templateInfo.body,"text/html");
//alert( XS.serializeToString(dom) );
    let parts =  UI.store.match(subject,this.UIO('component'));
    for(let p of parts){
      p=p.object;
      let component = "";
      let label, url;
        label = this.getObject(p,this.UIO("label"));
        url = this.getObject(p,this.UIO("href"));
/*
        if(pstmt.predicate.value.match("pagePart")) url = pstmt.object.value;
      for(let pstmt of p){
        if(pstmt.predicate.value.match("label")) label = pstmt.object.value;
        if(pstmt.predicate.value.match("pagePart")) url = pstmt.object.value;
      }
*/
      let i = this.fileInfo(url);
      if(i && label)
        dom.querySelector('#'+label).appendChild( await this.show(i.contentType,url) );
    }
    dom = XS.serializeToString(dom);    
    if(targetSelector) await this.showIframeSrcDoc(dom,url,targetSelector);
    return dom;
/*
    let div = document.createElement("DIV");
    div.innerHTML = this.getUIterm(subject,'template');
    let x = this.getUIterm(subject,'template');
alert(x)
    let parts =  this.getUIterm(subject,'parts');
    for(let p of parts){
      let component = "";
      let label, url;
      for(let pstmt of p){
        if(pstmt.predicate.value.match("label")) label = pstmt.object.value;
        if(pstmt.predicate.value.match("pagePart")) url = pstmt.object.value;
      }
      let type = this.findType(url);
      div.querySelector('#'+label).appendChild( await this.show(type,url) );
    }
    if(targetSelector) await this.showIframeSrcDoc(div.innerHTML,targetSelector);
    return div;
*/
  },
  rdf : async (uri,string,targetSelector,forceReload,obj) => {
    obj ||= {};
    if(obj.dataSourceType){
        return await this._show[obj.dataSourceType](uri,string,targetSelector,forceReload,obj);
    }
    try {
      let mainSubject = UI.rdf.sym( uri.match(/\#/) ?uri :uri+"#this" );
      let node = mainSubject;
      await this.crossLoad(uri,string,forceReload);
      let subjectType = this.getUItype(mainSubject);
      if(subjectType && subjectType.match(/(Form)/)) {
//OLD      if(subjectType && this._show[subjectType]) {
        return await this._show[subjectType](mainSubject,targetSelector,forceReload);
      }
      else {
        return await this._show.SolidOSLink(UI.rdf.sym(uri),targetSelector,forceReload,obj);
      }
      let subjects = UI.store.each(null,null,null,node.doc());
      let visitedSubject = {}
      let str = "";
      for(let subject of subjects){
        if(visitedSubject[subject.value]===1) continue;
        visitedSubject[subject.value]=1;
        str += `<br><div style="font-weight:bold">${this.mungeLabel(subject)}</div>`;
        let stmts = UI.store.match(subject,null,null,node.doc());
        for(let stmt of stmts){
          let p = this.mungeLabel(stmt.predicate);
          let o = stmt.object.value;
          str += `&nbsp;&nbsp;&nbsp;<b>${p}</b> : ${o}<br />`
        }
      }
      if(targetSelector) {
        return this.showIframeSrcDoc(str,uri,targetSelector);
      }
      let div = document.createElement("DIV");
      div.innerHTML = str;
      div.style.width="640px;";
      return div;
    } catch(e) { alert(e); return e; }
  },
}

mungeHash(uri){
  return UI.rdf.sym( uri.match(/\#/) ?uri :uri+"#this" );
}
async dataTemplate2Iframe(mainSubject,targetSelector){
  let query =  this.getUIterm(mainSubject,'query');
  let endpoint =  this.getUIterm(mainSubject,'endpoint');
  let template = this.getUIterm(mainSubject,'template');
  let data = await (new Sparql()).sparqlQuery(endpoint,query,UI.store);
  let interpolated = "";
  for(let row of data.reverse()){
    interpolated += template.interpolate(row);
  }
  this.showIframeSrcDoc(interpolated,mainSubject,targetSelector);
  return interpolated;
}
async template2Iframe(mainSubject,targetSelector){
       let queryURL =  this.getUIterm(mainSubject,'query');
        await UI.store.fetcher.load(queryURL);
        let querySubject = UI.rdf.sym(queryURL+"#this");
        let endpoint =  this.getUIterm(querySubject,'endpoint');
        let query =  this.getUIterm(querySubject,'query');
        let before =  this.getUIterm(mainSubject,'before');
        let beforeQueryURL =  this.getUIterm(mainSubject,'beforeQuery');
        await UI.store.fetcher.load(beforeQueryURL)
        let beforeQuerySubject = UI.rdf.sym(beforeQueryURL+"#this");
        let beforeEndpoint=this.getUIterm(beforeQuerySubject,'endpoint');
        let beforeQuery=this.getUIterm(beforeQuerySubject,'query');
        let beforeData = await (new Sparql()).sparqlQuery(beforeEndpoint,beforeQuery,UI.store);
        before = before.interpolate(beforeData[0])
        let data = await (new Sparql()).sparqlQuery(endpoint,query,UI.store);
        let recurring =  this.getUIterm(mainSubject,'recurring');
        let after =  this.getUIterm(mainSubject,'after');
        let middle = "";
        for(let row of data.reverse()){
          middle += recurring.interpolate(row);
        }
        let interpolated = before + middle + after;
        this.showIframeSrcDoc(interpolated,targetSelector);
        return interpolated;
}
makeIframe(){
  let iframe = document.createElement('IFRAME');
  iframe.style = "height:100%;width:100%;border:none";
  return iframe;
}
show_iframe(iframe,targetSelector){
  document.querySelector(targetSelector).innerHTML="";
  document.querySelector(targetSelector).appendChild(iframe);
}
showIframeSrc(src,targetSelector){
  let iframe = this.makeIframe();
  iframe.src = src;
  if(targetSelector) this.show_iframe(iframe,targetSelector);
  else return iframe;
}
showIframeSrcDoc(content,uri,targetSelector){
  let iframe = this.makeIframe();
   content = content.replace(/X-Frame-Options/g,'');
   uri = new URL(uri);
   const b = `<base href="${uri.origin}${uri.pathname}">`; // <base target="_BLANK" />`;
   iframe.srcdoc = `<body>${b}${content}</body>`
   iframe.scrollTo({ top: 0, behavior: "smooth" });
   this.show_iframe(iframe,targetSelector);
}

  /* makeSelector(options,onchange,selected,targetSelector,size,)
       options : array
       onchange : function
       selected : string,      // must be in options array
       targetSelector : string // = a css selector e.g. "#foo .bar"
     returns an HTML select element
   */
  makeSelector(options,onchange,selected,targetSelector,size){
    let selectEl = document.createElement('SELECT');
    for(let option of options){
      let value,label;
      if(typeof option==="string") value = label = option;
      else {
        value = option[0]
        label = option[1]
      }
      label=(label||value).replace(/^http:\/\//,'').replace(/^https:\/\//,'');
      if(!label.endsWith("/"))
         label = label.replace(/.*\//,'')
      if(!label || !option) continue;
      label ||= "/";
      let optionEl = document.createElement('OPTION');
//      optionEl.innerHTML = option.replace(/http[s]*:\/\/[^\/]*\//,'') || option;
      optionEl.value = optionEl.title = value;
      optionEl.innerHTML = label;
      selectEl.appendChild(optionEl);
    }

    /* HIGHLIGHT SELECTED */
    if(selected) selectEl.value = selected;
    selectEl.value ||= selectEl.childNodes[0].value;

//    selectEl.addEventListener('click',async(e)=>{
//      onchange(e.target.value)
//    })
    selectEl.addEventListener('change',async(e)=>{
      onchange(e.target.value)
    })
    if(size) selectEl.size=size;
    if(targetSelector) {
      let targetEl = document.querySelector(targetSelector)
      targetEl.innerHTML = ""
      targetEl.appendChild(selectEl);
    }
    return selectEl;
  }
  getParent(url){
    let parent = url.replace(/\/$/,'').replace(/\/[^\/]*$/,'/');
    return parent;
  }
  fileInfo(url){
    if(!url) return;
    if(typeof url!="string") url = url.url || url.uri;
    let newu;
    try{ newu = new URL(url); }
    catch(e){console.log(77,url,e); return {} };
    let file = newu.pathname.replace(/.*\//,'').replace(/\.[^\.]*$/,'');;
    file = file===newu ?"" :file;
    let ext = newu.pathname.replace(/.*\//,'').replace(/.*\./,'');
    ext = ext===file ?"" :ext;
    /*
     * type is  the Ace-Editor type e.g. turtle, html, markdown
     * contentType is Iana media type e.g. text/turtle, etc.
    */
    let type,contentType;
    if(ext.match(/(md)|(markdown)/)) type = "markdown";
    if(ext.match(/(dot|gv)/)) type = "graphviz";
    if(ext.match(/(ttl|rdf|n3)/)) type = "rdf";
    if(ext.match(/txt/)) { type="text"; contentType="text/plain" }
    if(ext.match(/(html)|(css)|(js)/)) type = ext;
    if(ext.match(/(gif|jpg|jpeg)/)) type = ext;
    type ||= "unknown";
    let path = newu.pathname.replace(/[^\/]*$/,'');
    file = decodeURI(file);
    let isContainer = !file && path.endsWith("/");
    contentType = "unknown";    
    if(isContainer) contentType = "text/turtle";
    else if(window.mime) contentType = window.mime.getType(url);
    let editable = contentType && !contentType.match(/(image|video|audio|unknown)/);
    return {
      url,
      file,
      path,
      ext,
      label : (file||path) + (ext ?"."+ext :""),
      editable,
      type,         // markdown, graphviz, html, rdf ...
      contentType,  // text/vnd.graphviz, text/turtle ...
      host : newu.origin + "/",
      isHidden : url.match(/\/\./) ?true :false,
      isContainer,
    }
  }


async crossLoad(uri,string,forceReload){
  if(forceReload) {
//     UI.store.removeDocument(UI.rdf.sym(uri));
  }
  if(string) UI.rdf.parse(string,UI.store,uri,'text/turtle');
  else await UI.store.fetcher.load(uri);
  let i = this.fileInfo(uri);
  i.contentType = "text/turtle";
  i.type = "rdf";
  i.editable = true;
  return i;
} 
async gitApiFetch(uri){
  uri = uri.replace(/https:\/\/github.com/,'https://api.github.com/repos');
  uri = uri.replace(/blob\/main\//,'contents');
  const options = {Accept: "application/vnd.github.v3+html"};
  let response = await fetch(uri,options);
console.log(await response.text() );
//  let json = await response.json();
//  return atob(json.content);
}     

async loadFile(uri,isRepeat){
  let fileInfo = this.fileInfo(uri);
  if(uri.match(/https:\/\/github.com/)) {
    fileInfo.body = await this.gitApiFetch(uri);
    fileInfo.editable = !fileInfo.contentType.match(/(image|video|audio|pdf|unknown)/);
    fileInfo.ok=true;
    return fileInfo;  
  }
  try {
     // OMIT CREDENTIALS NEEDED FOR MOST FETCHES
     let creds = isRepeat ?{mode:"no-cors"} :{credentials:"omit"}
     let response = await UI.store.fetcher.webOperation("GET",uri,creds);
     if(response.ok) {
       fileInfo.contentType = response.headers.get("Content-Type");
       fileInfo.editable = !fileInfo.contentType.match(/(image|video|audio|pdf|unknown)/);
       fileInfo.body = response.responseText;
       fileInfo.ok=response.ok
     }
     else alert("utils.loadFile() "+response.status)
     return fileInfo
  }
  catch(e) {
     console.log('failed load, trying proxy'+e)
     if(!isRepeat) return this.loadFile("https://solidcommunity.net/proxy?uri="+encodeURI(uri),'repeat');
//   alert("network loadFile() "+e); return fileInfo 
  }
}

getUItype(subject){
  subject = this.getMainSubject(subject);
  let types = UI.store.each(subject,this.ISA,null);
  for(let type of types){
    if(type.value.match(/ui\#/)) return type.value.replace(/.*\#/,'');
  }
}
getUIterm(subject,term){
   subject = this.getMainSubject(subject);
   let val = UI.store.each(subject,this.UIO(term));
   let newval = [];
   if(val && val[0] && val[0].termType==="Collection"){
     for(let e of val[0].elements){
        newval.push( UI.store.match(e) );
     }
     return newval;
   }
   return val[0] ?val[0].value :val;
}
getMainSubject(uri){
  uri = uri.uri ?uri.uri :uri;
  uri = uri.match(/\#/) ?uri :uri+"#this";
  try { return UI.rdf.sym(uri) }
  catch(e){console.log(e)}
}
mungeLabel = (label)=>{ 
 if(!label)return "";
 if(label.termType==="Literal"){
    return `"${label}"`;
  }
  label = label.value.replace(/.*\#/,'').replace(/.*\//,'');
  if(label==="type") label = "a";
  return label;
}
mungeURL = (url)=>{
  let URL = document.getElementById(url).value;
  if(!URL.startsWith('http')){
    URL = window.location.href.replace('index.html','')+URL;
  }
  return URL;
}
PUT = async (url,content,cType)=>{
  url = url.replace(/\#[^\#]*$/,'')
  try {
    let response = await UI.store.fetcher.webOperation('PUT',url,{
      contentType : cType,
      body: content,
    });
    return(response);
  }
  catch(e) {return e;}
}
}

/* https://stackoverflow.com/a/41015840/15781258
 * usage :
 *   const template = 'Hello ${var1}!';
 *   const data     = { var1: 'world'};
 *   const interpolated = template.interpolate(data);
 */
String.prototype.interpolate = function(params) {
  const names = Object.keys(params);
  const vals = Object.values(params);
  return new Function(...names, `return \`${this}\`;`)(...vals);
}
