( ()=> {
    
  const kb = UI.rdf.graph();
  const uix = UI.rdf.Namespace('https://solid-uix.solidcommunity.net/ns#');
  const ui = UI.rdf.Namespace('https://www.w3.org/ns/ui#');

  async function init(){
    for(let elm of document.getElementsByClassName('ui-selectorPanel')){
      let widget = await parseOptions( elm.dataset );
      let b = await selectorPanel( widget);
      elm.appendChild( b );
    }
    for(let elm of document.getElementsByClassName('ui-selectorButton')){
      let widget = await parseOptions( elm.dataset );
      let b = await makeSelectorButton( widget,elm);
      elm.appendChild( b );
    }
    for(let elm of document.getElementsByClassName('ui-tabset')){
      let iface = elm.dataset.ui;
      if(iface && !iface.startsWith('http')) {
        iface = location.href.replace(/\/[^\/]*$/,'/') + iface;
        await load( iface );
        elm.dataset.iface = iface;
      }
      let widget = await parseOptions( elm.dataset );
      let t = await tabs( widget, elm );
      elm.appendChild(t );
    }
  }

  async function parseOptions(o){
    let w = {};
    let source = o.source;
    if(!source.startsWith('http')) {
      source = location.href.replace(/\/[^\/]*$/,'/') + source;
    }

    // subject, uri, doc()
    w.subject = UI.rdf.namedNode(source);
    w.uri = w.subject.doc().value;
    w.doc = UI.rdf.Namespace( w.uri + '#' );

    w.store ||= kb
    w.store = await load( w.uri );

    let defaults = getDefaults();
    let cfg = defaults.setting || {};

    // membershipStyle 
    //   hasMember or memberOf
    w.listType = w.store.any( w.subject, uix("membershipStyle") );
    w.listType = w.listType ? w.listType.value : "hasMember";

    // memberTerm
    w.memberTerm = getMemberTerm(w.subject)

    if(w.listType==="hasMember")  w.memberTerm ||= ui("parts");
    else  w.memberTerm ||= uix("memberOf");

    // labelTerm
    w.labelTerm = w.store.any( w.subject, uix("labelTerm") )
    w.labelTerm ||= ui("label");
    w.labelTerm ||= w.store.any( uix('Default'), uix('labelTerm') );

    // linkTerm
    w.linkTerm = w.store.any( w.subject, uix("linkTerm") ) 
    w.linkTerm ||= ui("target");

    // orientation / selectedtab / backgroundcolor
    w.orientation = getOrientation(w.subject);
    w.selectedtab = getSelectedTab(w.subject);
    w.backgroundcolor = getBackgroundColor(w.subject);

    // items
    w.items = w.store.match( w.subject, w.memberTerm );

    if(!w.items || w.items.length===0) {
      console.error("No items for " + w.subject);
      return w;
    }

    if(w.items[0].object && w.items[0].object.termType==="Collection"){
      w.items = (w.items.length === 1 ) ? w.items[0].object.elements : [];
    }
    else {
      if(w.listType==="memberOf"){
        w.items = w.store.each( undefined, w.memberTerm, w.subject );
      }
      else {
        w.items = w.store.each( w.subject, w.memberTerm );
      }
    }
    for(var i of w.items){
       fixLink(i);
    }
    return w;
  }
  function getDefaults (){
    let js = {};
    let defaults = kb.match( uix('Default' ) ) ;
    for(var d of defaults){
      let label = UI.utils.label(d.predicate);
      if(label==="setting") {
        let pair = d.object.value.split(/ /);
        js[label]={};
        js[label][pair[0]] = pair[1]
      }
    }
    return(js);
  }
  function getBackgroundColor( subject ){
      let pred = kb.any(subject,ui('backgroundColor')) 
              || kb.any(uix('Default'),ui('backgroundColor'));
      return pred ? pred.value : null;
  }
  function getOrientation( subject ){
      let pred = kb.any(subject,ui('orientation'),undefined) 
              || kb.any(uix('Default'),ui('orientation'),undefined);
      return pred ? pred.value : 0;
  }
  function getSelectedTab( subject ){
      let pred = kb.any(subject,ui('selectedTab')) 
              || kb.any(uix('Default'),ui('selectedTab'));
      return pred ? pred.value : 0;
  }
  function fixLink( subject ){
      let pred = kb.any(subject,uix('linkTerm')) || ui("target")
      link = kb.any( subject,pred );
      if(!link) {
        kb.add( subject,pred,UI.rdf.namedNode('http://example.org/') );
      }
  }
  function getLabel( subject, parent ){
      let doc = UI.rdf.Namespace( subject.doc().uri + "#" );
      let pred = kb.any(subject,uix('labelTerm')) 
              || kb.any( doc('default'),ui('labelTerm') )
              || kb.any(subject,ui('label'));
      return( pred ? pred.value : UI.utils.label(subject) );
  }
  function getLabelTerm( subject, parent ){
      let doc = UI.rdf.Namespace( subject.doc().uri + "#" );
      let pred = kb.any(subject,uix('labelTerm')) 
              || kb.any( doc('default'),ui('labelTerm') )
              || kb.any(subject,ui('label'))
      return( pred ? pred : subject );
  }
  function getMemberTerm( subject ){
      let doc = UI.rdf.Namespace( subject.doc().uri + "#" );
      let pred = kb.any(subject,ui('memberTerm')) 
              || kb.any( doc('default'),ui('memberTerm') )
      return( pred ? pred : ui("parts") );
  }
  function getMemberTermOLD( subject ){
      let pred = kb.any(subject,uix('memberTerm')) 
              || kb.any( uix('Default'),uix('memberTerm') )
      return( pred ? pred : ui("parts") );
  }
  function getMemberPred( subject ){
      let doc = UI.rdf.Namespace( subject.doc().uri + "#" );
      let pred = kb.any(subject,uix('memberTerm')) 
              || kb.any( doc('default'),ui('memberTerm') )
      return( pred ? pred.value : ui("parts").value );
  }


  async function makeSelectorButton( o,containingElement ) {
     let button = document.createElement('BUTTON');
     let div =  document.createElement('DIV');
     let table =  document.createElement('DIV');
     button.innerText = getLabel(o.subject,uix('label'));
     button.addEventListener('click', async(event)=> {
       let content = await selectorPanel(o,containingElement);
       table.appendChild(content)
    });
     div.appendChild(button);
     div.appendChild(table);
     return div;
  }

  async function selectorPanel( options,containingElement ) {
    const box = document.createElement('TABLE');
    const callback= (label,link,options,event)=>{
      event.preventDefault()
      let clickedElement = event.target || event.srcElement;
      let targetElement = options.targetElement || clickedElement.closest('TABLE').parentElement;
      renderLink(link,options,UI.rdf.namedNode(link),targetElement)
    };
    for(let i in options.items){
       let o = options.items[i];
       let label = options.store.any( o, options.labelTerm );
       let link  = options.store.any( o, options.linkTerm );
       label = label ? label.value : "?";
       link = link ? link.value : "?";
       let row = document.createElement('DIV');
       row.style.padding="0.5em";
       row.style.cursor="pointer";
       row.style.border = "0.1em solid #ddd";
//       if(i != options.items.length-1)
//         row.style.borderBottom = "none";
       let text = document.createTextNode(label);
       let td = document.createElement('TD');
       let tr = document.createElement('TR');
       row.appendChild(text);
       row.addEventListener('click', function (event) {
         callback(label,link,options,event);
       });
       td.appendChild(row);
       tr.appendChild(td)
       box.style.width="auto";
       box.appendChild(tr);
    }
    // console.log(box);
    return box;
  }

  async function tabs(o,containingElement) {
    const backgroundcolor = o.backgroundcolor || undefined;
    let orientation = o.orientation || 0;
    let selected = o.selectedtab || 1;
    selected = selected -1;
    if(selected<0) selected = 0;
    if(selected>o.items.length) selected = 0;

    // Add in extra tabs
    let xtras=o.store.each(o.subject,uix('additionalTabs'))
    if( xtras && xtras[0] ){
      xtras = xtras[0].elements; // get items from Collection
      for(x of xtras.reverse() ){
        o.items.unshift(x);
      }
    }

    for(var i of o.items){
       fixLink(i);
    }

    // the call to Solid-UI
    let tabset = {
      render: async () => UI.tabs.tabWidget({
        orientation: orientation,
        backgroundColor : backgroundcolor,
        subject : o.subject,
        predicate : o.memberTerm,
        items : o.items,
        renderTab: async (tabDiv,tabSubject)=>{
          tabDiv.dataset.name = tabSubject.uri;
          let label = o.store.any( tabSubject, o.labelTerm );
          if(label) {
            tabDiv.innerText = label.value;
          }
          else {
            tabDiv.innerText = tabSubject.uri.replace(/.*#/,'');
          }
        },
        renderMain: async (bodyMain, subject) => {
          let link = o.store.any( subject, o.linkTerm ).value;
          await renderLink( link, o, subject, bodyMain )
        },
        selectedTab : selected ? o.items[selected].uri : 0
      })
    };
    tabsetDOM = await tabset.render();
    tabsetDOM.classList.add("ui-tabset-container");
    // post-process the tabset dom we got from Solid-UI

    // main[0] underlies the mains of each tab 
    let main = tabsetDOM.querySelectorAll('MAIN')[0];
    main.style.backgroundColor="white";
    main.style.overflow="hidden";

    // Force refresh of first tab
/*
    let tabsList = tabsetDOM.querySelectorAll('NAV UL LI DIV');
    tabsList[0].addEventListener('click', async (event) => {
      let subject = o.items[0]
      let clickedElement = event.target || event.srcElement;
      let targetElement = tabsetDOM.querySelectorAll('MAIN')[1];
      let link = o.store.any( subject, o.linkTerm );
      await renderLink( link.uri, o, link, targetElement )
    });
*/
    return(tabsetDOM);
  }

  function simulateClick(el){
    if (el.fireEvent) {
      el.fireEvent('on' + 'click');
    } else {
      var evObj = document.createEvent('Events');
      evObj.initEvent('click', true, false);
      el.dispatchEvent(evObj);
    }
  }

  async function loadFromContent( body, uri ){
    let store = UI.rdf.graph();
    UI.rdf.parse(  body, store, uri, "text/turtle")     
    return store;
  }
  async function load( uri ){
    uri = UI.rdf.namedNode(uri)
    let alreadyLoaded =  kb.any( undefined,undefined,undefined,uri.doc()); 
    if( !alreadyLoaded ){
      let fetcher = UI.rdf.fetcher( kb ); // only load if not yet loaded
      await fetcher.load( uri );
    }
    return kb;
  }

  function descriptionList(subject,{},o){
     let doc = UI.rdf.Namespace(subject.doc().uri+"#");
     let listName = kb.any(subject,getLabelTerm(subject));
     let members = kb.each(subject,getMemberTerm(subject));
     let div = document.createElement('DIV');
     let listTemplate = "";
     if(listName){
       listTemplate = `<h1>${listName}</h1>`;
       let h1 = document.createElement('H1');
       h1.innerText = listName.value;
       h1.style.marginBottom="0";
       h1.style.paddingBottom="0";
       div.appendChild(h1);
     }
     let dl = document.createElement('DL');
     let d = document.createElement('DT');
     d = _props2dd(d,subject);
     dl.appendChild(d);
     for(var i of members){
       let dt = document.createElement('DT');
       let memberName = kb.any( i, getLabelTerm(i) ) || {};
       let h2 = document.createElement('b');
       h2.innerText = memberName.value;
       dt.appendChild(h2);
       dt = _props2dd(dt,i,subject);
       dt.style.marginLeft="1em";
       dt.style.marginTop="1em";
       dl.appendChild(dt);
     }
     div.appendChild(dl);
     return div;
  }

  function _props2dd(dt,subject,parent){
    let props = kb.match(subject)
    for(var p of props){
      let memberPred = getMemberPred(subject,parent);
      let labelPred = getLabel(subject,parent);
      if( labelPred && p.predicate.value.match(labelPred) ) continue;
      if( memberPred && p.predicate.value.match(memberPred)  ) continue;
      if( p.predicate.value.match(uix('').value)  ) continue;
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

  function makeIframe(){
    let iframe = document.createElement('IFRAME');
    iframe.width="100%";
    iframe.height="100%";
    iframe.style.border="none";
    iframe.sandbox = 'allow-forms allow-scripts allow-same-origin allow-modals allow-popups';
    return iframe;
  }
  async function fillIframe( iframe, content, type ){
    type ||= "text/html";
    const blobObj = await new Blob( [content], {type:type} ) ;
    iframe.src = URL.createObjectURL( blobObj );
    return iframe
  }

  function findAction( subject ){
    let actions = (
       "inline preformat descriptionList selectorPanel tabSet"
    ).split(/ /);
    for(var a of actions){
      if( kb.any( subject, ui(a) ) ) { return a; }
    }
  }
  function findLink( subject ){
    let link = kb.any( subject, uix('linkTerm') )  
            || kb.any( subject, ui('target') );  
    link = link ? link.value :null;
    if(link.match(/http:.?\/\/example/)) link = null;
    return link;
  }

  async function renderLink ( url, options, subject, containingElement ){
    let action = findAction(subject) || "showWebPage";
    let link = findLink(subject);
    let iframe = makeIframe();
    let content;
    if(action==="inline"){
      content = kb.any(subject,ui('inline'));
      content = content ? content.value : "";
      let div = document.createElement('DIV');
      div.classList.add = "inline";
      div.innerHTML = content;
      content = div;
      content.style.overflow="auto";
      content.style.height="100%";
    }
    else if( action==="preformat" ) {
      let thing = kb.any(subject, ui('preformat')) || {};
      let r = await fetch(thing.value);
      let text = await r.text();
      content = document.createElement('PRE');
      content.innerText = text;
      content.style.overflow="auto";
    }
    else if( action==="tabSet" ) {
      let w = await parseOptions({source:subject.uri});
      content = await tabs( w );
    }
    else if( action==="descriptionList" ) {
      let list = kb.any(subject,ui('descriptionList'));
      let w = await parseOptions({source:list.uri,store:kb});
      let b = await descriptionList( list,kb,w );
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
    else if(action==="showWebPage") {
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
