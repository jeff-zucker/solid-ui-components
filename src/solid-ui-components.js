import {tabset}  from './tabset.js';
import {app}  from './app.js';
import * as utils from './utils.js';

( ()=> {

  const kb = UI.store;
  const rdf = UI.rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
  const ui = UI.rdf.Namespace('https://www.w3.org/ns/ui#');

  async function init(){
    for(let elm of document.getElementsByClassName('ui-selectorPanel')){
      let widget = await parseOptions( elm.dataset );
      let b = await selectorPanel( widget);
      elm.appendChild( b );
    }
    for(let elm of document.getElementsByClassName('ui-tabset')){
      let widget = await parseOptions( elm.dataset );
      let t = await tabs( widget, elm );
      elm.appendChild( t );
    }
    for(let elm of document.getElementsByClassName('ui-app')){
      let widget = await parseOptions( elm.dataset );
      let t = await makeApp( widget, elm);
//      let t = await makeApp( elm.dataset.source, kb );
      //elm.appendChild( t );
    }
    for(let elm of document.getElementsByClassName('ui-menu')){
      let widget = await parseOptions( elm.dataset );
      let m = await menu( widget, elm );
  //    elm.appendChild( m );
    }
    for(let elm of document.getElementsByClassName('ui-banner')){
      let widget = await parseOptions( elm.dataset );
      let m = await banner( widget, elm );
      elm.appendChild( m );
    }
  }

  async function parseOptions(o){
    let source = o.source;
    if(!source.startsWith('http')) {
      source = location.href.replace(/\/[^\/]*$/,'/') + source;
    }

    // subject, uri, doc()
    let subject = UI.rdf.sym(source);
    await utils.load( subject.uri,kb );

    let w = await utils.getProperties(UI.rdf.namedNode(source),kb);
    w.uri = w.subject.doc().value;
    w.doc = UI.rdf.Namespace( w.uri + '#' );


//    w = getProperties(w.subject,w);

    w.dataSource =  findWidgetDataSource(w.subject);
    w.uiType = findUiType(w.subject);

    // membershipStyle 
    //   hasMember or memberOf
    w.listType = kb.any( w.subject, ui("inverse") );
    w.listType = w.listType ?"memberOf" :"hasMember";

    // memberTer
    w.memberTerm = getMemberTerm(w.subject)

    if(w.listType==="hasMember")  w.memberTerm ||= ui("parts");
    else  w.memberTerm ||= ui("partOf");

    // labelTerm
    w.labelTerm = kb.any( w.subject, ui("labelTerm") )
    w.labelTerm ||= ui("label");

    // linkTerm
    w.linkTerm = kb.any( w.subject, ui("linkTerm") ) 
    w.linkTerm ||= ui("target");

    w.items = await getItems(w);
    if(!w.items || w.items.length===0) {
      console.log("No items for " + w.subject);
      return w;
    }
//    w.items = populateItems(w.items);
    return w;
  }

  async function getItems(w,populatedItems){
    populatedItems ||= [];
let x=0
    if(w.dataSource.termType != "Collection")
      await utils.load(w.dataSource,kb);
    if(typeof w.dataSource==="string"){
x=1
// console.log(w.subject,w.dataSource);
        w.dataSource = UI.rdf.sym(w.dataSource);
        w.memberTerm = getMemberTerm(w.dataSource)
        let ds  = kb.each(w.dataSource,w.memberTerm)
        if(ds.length){
          w.dataSource=ds[0];
          w.memberTerm = getMemberTerm(w.dataSource)
        }
    }
    if(w.dataSource.termType==="Collection"){
      w.items = w.dataSource.elements || [];
    }
    else {
      if(w.listType==="memberOf"){
        w.items = kb.each( undefined, w.memberTerm, w.subject );
      }
      else {
        w.items = kb.each( w.subject, w.memberTerm );
      }
    }
    for(var i of w.items){
      let dSource = findWidgetDataSource(i);
      dSource = typeof dSource==="string" ?UI.rdf.sym(dSource) :dSource;
//      console.log(77,dSource);
//      if(dSource.termType != "Collection")
        await utils.load(dSource,kb);
      let membTerm = getMemberTerm(dSource);
      dSource = kb.each(dSource,membTerm)
      let subItems = dSource && dSource[0] ? dSource[0].elements : [];
      let sItems=false
      if( subItems.length ){
        sItems=[];
        for(var s of subItems){
          sItems.push( await populateItem(s,false) );
        }
      }
      populatedItems.push(await populateItem(i,sItems))
    }
//  console.log(8,dSource[0].elements);
// let membTerm = getMemberTerm(i.dSource);
//console.log(9,i)
//       let subItems = kb.each(i,w.memberTerm);
//console.log(9,i.value,membTerm.value,subItems)
/*       let sItems=false
       if( subItems.length ){
         sItems=[];
         for(s of subItems){
           sItems.push( getItems({dataSource:s},populatedItems));
         }
      }
      populatedItems.push(await populateItem(i,sItems))
    }
    if(x) console.log(99,populatedItems);
*/
    return populatedItems;
  }

  async function populateItem(item,subItems){
    let label = await getLabel(item);
    return {
      uri : item.uri,
      label : label,
      subItems : subItems
    }
  }

  function findUiType(subject){
    let type = kb.match(subject,rdf('type')).filter(t=>{ 
      return t.object.value.match(ui('').value)
    })
    type = type && type.length ? type[0].object.value : "";
    return type.replace( ui('').value, '' );
  }

  async function getLabel( subject, parent ){
      await utils.load(subject,kb);
//      if(typeof subject.doc != "function") return;
      let doc = UI.rdf.Namespace( subject.doc().uri );
      let pred = kb.any(subject,ui('labelTerm')) 
              || kb.any( doc(''),ui('labelTerm') )
              || kb.any(subject,ui('label'));
//alert(subject+"  "+(pred ?pred.value : "",doc('')))
      return( pred ? pred.value : UI.utils.label(subject) );
  }
  function getLabelTerm( subject, parent ){
      let doc = UI.rdf.Namespace( subject.doc().uri + "#" );
      let pred = kb.any(subject,ui('labelTerm')) 
              || kb.any( doc(''),ui('labelTerm') )
              || kb.any(subject,ui('label'))
      return( pred ? pred : subject );
  }
  function getMemberTerm( subject ){
      if(typeof subject.doc != "function") return;
      let doc = UI.rdf.Namespace( subject.doc().uri + "#" );
      let pred = kb.any(subject,ui('memberTerm')) 
              || kb.any( doc(''),ui('memberTerm') )
      return( pred ? pred : ui("parts") );
  }
  function getMemberPred( subject ){
      let doc = UI.rdf.Namespace( subject.doc().uri + "#" );
      let pred = kb.any(subject,ui('memberTerm')) 
              || kb.any( doc(''),ui('memberTerm') )
      return( pred ? pred.value : ui("parts").value );
  }


  async function makeSelectorButton( o,containingElement ) {
     let button = document.createElement('BUTTON');
     let div =  document.createElement('DIV');
     let table =  document.createElement('DIV');
     button.innerText = await getLabel(o.subject,ui('label'));
     button.addEventListener('click', async(event)=> {
       let content = await selectorPanel(o,containingElement);
       table.appendChild(content)
    });
     div.appendChild(button);
     div.appendChild(table);
     return div;
  }

  async function descriptionList(subject,{},o){
     let doc = UI.rdf.Namespace(subject.doc().uri+"#");
     let listName = kb.any(subject,getLabelTerm(subject));
     let members = kb.each(subject,getMemberTerm(subject));
     let div = document.createElement('DIV');
     let listTemplate = "";
/*
`
<div>
  <h1>${listName}</h1>
  <dl>
    <dt>${listProperties}</dt>
</div>
`
*/
     if(listName){
       listTemplate = `<h1>${listName}</h1>`;
       let h1 = document.createElement('H1');
       h1.innerText = listName.value;
       h1.style.marginBottom="0";
       h1.style.paddingBottom="0";
       h1.style.fontSize="1.6rem";
       h1.style.fontWeight="550";
       div.appendChild(h1);
     }
     let dl = document.createElement('DL');
     let d = document.createElement('DT');
     d = await _props2dd(d,subject);
     d.style.maxWidth="640px";
     dl.appendChild(d);
     for(var i of members){
       let dt = document.createElement('DT');
       let memberName = kb.any( i, getLabelTerm(i) ) || {};
       let h2 = document.createElement('b');
       h2.innerText = memberName.value;
       dt.appendChild(h2);
       dt = await _props2dd(dt,i,subject);
       dt.style.marginLeft="1em";
       dt.style.marginTop="1em";
       dl.appendChild(dt);
     }
     div.appendChild(dl);
     div.style.paddingLeft="1rem";
     return div;
  }

  async function _props2dd(dt,subject,parent){
    let props = kb.match(subject)
    for(var p of props){
      let memberPred = getMemberPred(subject,parent);
      let labelPred = await getLabelTerm(subject,parent);
      if( labelPred && p.predicate.value.match(labelPred.value) ) continue;
      if( memberPred && p.predicate.value.match(memberPred)  ) continue;
      if( p.predicate.value.match(ui('').value)  ) continue;
      let dd = document.createElement('DD');
      let i = document.createElement('I');
      i.innerText =  ( UI.utils.label(p.predicate)+" - " ).toLowerCase();
      let s = document.createElement('SPAN');
      s.appendChild( i );
      s.appendChild( document.createTextNode(UI.utils.label(p.object)));
      dd.appendChild(s);
      dd.style.marginLeft="1em";
      dt.appendChild(dd);
    }
    return(dt)
  }
  function findAction( subject ){
    let actions = (
       "inline preformat descriptionList selectorPanel tabSet app menu"
    ).split(/ /);
    for(var a of actions){
      if( kb.any( subject, ui(a) ) ) { return a; }
    }
  }
  function findLink( subject ){
//    let link = kb.any( subject, uix('linkTerm') )  
//            || kb.any( subject, ui('target') );  
    let link = kb.any( subject, ui('linkTerm') )  
            || kb.any( subject, ui('target') );  
    link = link ? link.value :null;
    if(link.match(/http:.?\/\/example/)) link = null;
    return link;
  }

  function findWidgetDataSource (subject){
    let sourceNode =  kb.any(subject,ui('dataSource')) || {};
    if(!sourceNode.termType) return sourceNode;
    if(sourceNode.termType==="Collection")
      return sourceNode
    if(sourceNode.termType==="BlankNode") {
      sourceNode =  kb.any(subject,ui('dataSource'))
    }
    if(sourceNode.termType==="NamedNode") {
      return sourceNode.value;
    }
  }

  async function tabs(o,containingElement){
    if(typeof tabset === "function") {
      let tabDom = await tabset(o,containingElement) ;
      let links = tabDom.querySelectorAll('LI A');
      let ind=-1;
      for(var l of links){
        ind++;
        let subject = UI.rdf.sym(l.dataset.name);
        l.addEventListener('click',e=>{
           let ancestor = e.target.parentNode.parentNode.parentNode.parentNode;
           let containingElement = ancestor.querySelector('MAIN');
           for(var lin of links){
             lin.style.backgroundColor = o.altBackgroundColor;
             let subItems = lin.parentNode.querySelector('UL');
             if(subItems){
               subItems.style.display="none";
             }
           }
           e.target.style.backgroundColor = o.backgroundColor;
           let subItems = e.target.parentNode.querySelector('UL');
           if(subItems){
             subItems.style.display="block";
             utils.simulateClick(subItems.querySelectorAll('LI SPAN')[0]);
           }
           else {
            renderLink( {},subject,containingElement);
           }
        });
        let subLinks = l.parentNode.querySelectorAll('UL LI SPAN') || [];
        let dup = subLinks;
        for(var l2 of subLinks){
          l2.style.fontWeight="600";
          l2.addEventListener('click',e=>{
            for(var l3 of dup){
               l3.style.fontWeight="600";
               l3.style.color=o.altBackgroundColor;
            }
            e.target.style.color=o.backgroundColor;
            let subject = UI.rdf.sym(e.target.dataset.name);
            let anc = e.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
            let containingE = anc.querySelector('MAIN');
            renderLink( {},subject,containingE);
            
return;
             let ancestor = e.target.parentNode.parentNode.parentNode.parentNode;
             let containingElement = ancestor.querySelector('MAIN');
             for(var lin of links){
               lin.style.backgroundColor = o.altBackgroundColor;
               let subItems = lin.parentNode.querySelector('UL');
               if(subItems){
                 subItems.style.display="none";
               }
             }
             e.target.style.backgroundColor = o.backgroundColor;
          })
        }
        if(ind.toString()==o.selected){
            l.style.backgroundColor =  o.backgroundColor;
        }
        else {
          l.style.backgroundColor = o.altBackgroundColor;
        }
      }
      utils.simulateClick(links[o.selected]);
      return tabDom;
    }
  }

  async function form(o){
    const already = {};
    const container = o.container || document.createElement("div");
    const doc = o.document || o.subject.doc();
    const dom = o.dom || window.document;
    await UI.store.fetcher.utils.load(o.form,kb);
    await UI.store.fetcher.utils.load(o.subject,kb);
    UI.widgets.appendForm(dom, container, already, o.subject, o.form, doc);
    return container;
  }

  async function makeApp(o,containingElement){
    let appDom = await app(o,containingElement,kb) ;
//    let appDom = await app(source,kb) ;
    let displayArea = (appDom.getElementsByTagName('main'))[0];
    renderLink(o,o.dataSource,displayArea);
  }

  async function renderLink ( options, subject, containingElement ){
    if(typeof subject==="string") subject = UI.rdf.sym(subject);
    let action = findUiType(subject) || "showWebPage";
    let link = findWidgetDataSource(subject);
    let iframe = utils.makeIframe();
    let content;
    if(action==="FormDefinition"){
       content = await form({
         form :  kb.any(subject,ui('form')),
         subject : kb.any(subject,ui('formSubject')),
         document : kb.any(subject,ui('formSubjectDocument')),
       });    
       console.log(content);
    }
    if(action==="Inline"){
      content = kb.any(subject,ui('inlineContent'));
      content = content ? content.value : "";
      let div = document.createElement('DIV');
      div.classList.add = "inline";
      div.innerHTML = content;
      content = div;
      content.style.overflow="auto";
      content.style.height="100%";
    }
    else if( action==="Markdown" ) {
      iframe.src = "../markdown/?q="+link;
      containingElement.innerHTML = "";
      containingElement.appendChild(iframe);
      return;
    }
    else if( action==="Preformat" ) {
      // let thing = kb.any(subject, ui('Preformat')) || {};
      // let r = await fetch(thing.value);
      let r = await fetch(link);
      let text = await r.text();
      content = document.createElement('PRE');
      content.innerText = text;
      content.style.overflow="auto";
    }
    else if( action==="Tabset" ) {
      let w = await parseOptions({source:subject.uri});
      content = await tabs(w,containingElement) ;
    }
    else if( action==="DescriptionList" ) {
      link = UI.rdf.namedNode(link);
      let w = await parseOptions({source:link.uri,store:kb});
      let b = await descriptionList( link,kb,w );
      content = document.createElement('DIV');
      content.appendChild(b);
      content.style.overflow="auto";
      // content.style.height="100%";
      //      content.style.overflow="auto";
      //      containingElement.innerHTML="";
      //      containingElement.appendChild(content);
      //      return;
      //      content = content.innerHTML;
    }
    else if(action==="selectorPanel") {
      let w = await parseOptions({source:subject.uri,store:kb});
      content = await selectorPanel( w );
      content.style.backgroundColor="#e7e7db";
      content.style.marginTop = "-17px";
      content.style.marginLeft = "-17px";
      content = content.innerHTML;
      content.style.overflow="auto";
    }
    else if(action==="Link" || action==="showWebPage") {
      iframe.src = link;
      containingElement.innerHTML = "";
      containingElement.appendChild(iframe);
    }
    if(content){
      content.style.height="100%";
      // content.style.overflow="auto !important";
      containingElement.innerHTML="";
      containingElement.appendChild(content);
      //content = content.innerHTML;
      //const blobObj = await new Blob( [content], {type:'text/html'} ) ;
      //iframe.src = URL.createObjectURL( blobObj );
      //containingElement.appendChild(iframe);
    }
  }
  init();

})(); // EXECUTE THIS ANONYMOUS FUNCTION

// THE END!
