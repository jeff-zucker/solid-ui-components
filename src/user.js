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
    const contentElement = this.createElement('SPAN','',content);
    displayArea.contentWindow.document.body.innerHTML = "";
    displayArea.contentWindow.document.body.appendChild(contentElement);
  }
  window.openModal = function (element,action){
    element.parentElement.children[1].style.display = "block" ;
  }
  window.closeModal = function (element,action){
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
    //  if(element.classList.contains(wanted)) element.style.display="block";
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
  window.displayLink = async function( e, item, element ){
    if(typeof item==='string') item = { href:item }
    item.href = item.href || item.link;
    item.type = item.type || 'Link';
    item.type = item.type.replace(/http:\/\/www.w3.org\/ns\/ui#/,'');

    // IF POPOUT, DISPLAY IN ITS OWN OVERLAY AND RETURN
    if(item.popout) {
      let newElement = await solidUI.processComponent('',item.href)
      newElement.style.display="block";
      document.body.appendChild(newElement);
      return newElement;
    }

    // IF SOLIDOS LINK, DISPLAY WITH GOTOSUBJECT, RETURN
    if(item.type === "SolidOSLink") {
      const targetElement = document.getElementById('suicTabulator')
      targetElement.style.display="block";
      document.getElementById('mainMain').style.display="none";
       window.outliner.GotoSubject(window.kb.sym(item.href),true,undefined,true);
      return;
    }

    // IF SOLIDOS PANE, DISPLAY WITH GOTOSUBJECT, RETURN
    if(item.type === "SolidOSPane") {
      const targetElement = document.getElementById('suicTabulator')
      targetElement.style.display="block";
      document.getElementById('mainMain').style.display="none";
      var subject = panes.UI.rdf.sym(item.href);
      var wantedPane = panes.byName(item.pane);
      outliner.GotoSubject(subject,true,wantedPane,true,null,targetElement);
      return;
    }

    // FIND CONTAINING ELEMENT
    let containingEl;
    if(element && !e){
      containingEl = element;
    }
    // let wrapper =e.target.closest('.solid-ui-component')
    let wrapper = e && e.target ?e.target.closest('.solid-uic-app') :null;
    if(wrapper && wrapper.classList.contains('solid-main-app')) {
      containingEl = wrapper.querySelector('#mainMain');
    }
    else if(wrapper) {
      containingEl = wrapper.querySelector('.main');
    } 
    document.getElementById('mainMain').style.display="block";
    document.getElementById('suicTabulator').style.display="none";
    containingEl=containingEl||document.body.querySelector('.main')||document.body;
    if(containingEl) containingEl.innerHTML="";

    let content = item.content;
    if(content){
      let span = document.createElement('SPAN')
      span.innerHTML = content;
      span = mungeAnchors(span);
      containingEl.innerHTML=""
      containingEl.appendChild(span);
      return await solidUI.initInternal(containingEl);  
    }
    // SolidOsLink
    if(item.type==="SolidOSLink") {
        return;
    }
    // FEED 
    if(item.type==="Feed"||item.linkType==="Feed") {
      let newItem = {
        type:"App",
        orientation:"vertical",
        menu:item
      }
      let content = await solidUI.processComponent('','',newItem)
      content = mungeAnchors(content,"noStyle");
      containingEl.innerHTML=""
      containingEl.appendChild(content);
      return containingEl;
    }
    // MARKDOWN
    else if(item.type==='TransformLink'){
      if(item.href && item.format && item.format.match(/markdown/)){
        return showMarkdown(item,containingEl);
      }
    }
    else if(item.type==="Link") {
      if(content){
        containingEl.innerHTML = content;
        return await this.initInternal(containingEl);  
      }
      else if(item.script){
        let content = await Function('"use strict";return (' + item.script + ')')();
        content = mungeAnchors(content) ;
//        containingEl.innerHTML=""
        return(content);
      }
      else if(item.href){
        let content = await getIframe(item,containingEl,item.nativeIframe);
//        containingEl.innerHTML=""
        containingEl.appendChild(content);
        return containingEl;
      }
    }
    else {
      content = await window.solidUI.processComponent('',item) ;
      if(!item.format) content = mungeAnchors(content);
      containingEl.innerHTML=""
      containingEl.appendChild(content);
      return containingEl;
    }
  }
  async function showMarkdown(item,containingEl){
    let content = await fetch(item.href);
    content = await content.text();
    containingEl.innerHTML=""
    let style =`
<style>
  h1 {display:none;}
//  a{text-decoration:none; padding-top:0.25em;display:inline-block;padding-left:1em;}
  ul {list-style:none;padding-left:0;margin-top:0;}
</style>`;
    let wrapper = document.createElement('SPAN');
    wrapper.innerHTML = style + marked.parse( content );
    wrapper = mungeAnchors(wrapper,"noStyle");
    return wrapper;
  }

  function mungeAnchors(element,noStyle){
    const anchors = element.querySelectorAll('A');
    for(var anchor of anchors){
      if(anchor.classList.contains('skipMunge')) continue;
      anchor.addEventListener('click',async(event)=>{
        event.preventDefault();
        let display = event.target.closest('.solid-uic-app')
        display = display.querySelector('.main');
       let href = event.target.href || event.target.parentElement.href
        displayLink(null,{href,needsIframe:true},display);
      });
      if(noStyle) continue;
      anchor.style="display:block;text-decoration:none;padding:0.5em; border-bottom:1px solid grey;";
    }
    return element;
  }
  async function getIframe(item,containingEl,nativeIframe){
    let uri = item.href;
    const iframe = document.createElement("IFRAME");
    iframe.style="width:100%;height:90vh;border:none;margin:0;padding:0;";
    iframe.src = "";
    if(nativeIframe) {
      iframe.src=uri;
    }
    else {
      try{
        let content = await fetch(uri);
        if(content){
          content = await content.text()
//        if(!content.match(/^\s*</)) return await goto(uri,containingEl);
          containingEl.innerHTML="";
          uri = uri.replace(/^.*proxy\?uri=/,'');
          uri = new URL(uri);
          const b = `<base href="${uri.origin}/"><base target="_BLANK">`;
          iframe.srcdoc = `<body>${b}${content}</body>`
          iframe.scrollTo({ top: 0, behavior: "smooth" });
        }
        else {
          console.log("Fetched but no content!");
        }
      }
      catch(e){console.log("Couldn't fetch!",e)}
    }
    return iframe;
  }

  async function goto(uri,domElement){
    var kb = UI.store;
    var outliner = panes.getOutliner(window.document)
    var subject = kb.sym(uri);
    const pane = panes.byName('dataContents');
    outliner.GotoSubject(subject, true, pane, true, undefined);
  }

  function gotoPane(uri,paneName,targetElement){
    var subject = panes.UI.rdf.sym(uri);
    var wantedPane = panes.byName(paneName);
    outliner.GotoSubject(subject,true,wantedPane,true,null,targetElement);
  }

  function renderSolidOSpage(item){
     const targetElement = document.getElementById('suicTabulator')
     targetElement.style.display="block";
     window.outliner.GotoSubject(window.kb.sym(item.href),true,undefined,true);
  }
