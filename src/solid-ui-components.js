( ()=> {
    
  const rdfs = UI.rdf.Namespace('http://www.w3.org/2000/01/rdf-schema#');
  const schema = UI.rdf.Namespace('http://schema.org/');

  async function init(){
    for(let elm of document.getElementsByClassName('solid-ui-tabs')){
      let t = await makeTabs( elm.dataset );
      elm.appendChild( await t.render() );
    }
  }
  
  async function makeTabs(dataset) {
    let source = dataset.source;
    const backgroundColor = dataset.backgroundcolor || undefined;
    let orientation = dataset.orientation || 0;
    if(orientation==="top") orientation = 0;
    if(orientation==="left") orientation = 1;
    if(orientation==="right") orientation = 2;
    if(orientation==="bottom") orientation = 3;
    let selected = dataset.selectedtab || 1;
    selected = selected -1;
    if(selected<0) selected = 0;
    if(!source.startsWith('http')) {
      source = location.href.replace(/\/[^\/]*$/,'/') + source;
    }
    const kb = await load(source);
    const current = UI.rdf.Namespace(source+"#");
    const subject = current('TabSet');
    const predicate = current('hasTabs');
    let items = kb.match( subject, predicate );
    items = (items.length > 0) ? items[0].object.elements : [];
    if(selected>items.length) selected = 0;
    let tabset = {
      render: async () => UI.tabs.tabWidget({
        orientation:orientation,
        backgroundColor:backgroundColor,
        subject,
        predicate,
        items,
        renderTab: async (tabDiv,tabSubject)=>{
          tabDiv.dataset.name = tabSubject.uri;
          let label = kb.any( tabSubject, rdfs('label') );
          if(label) {
            tabDiv.innerText = label.value;
          }
          else {
            tabDiv.innerText = tabSubject.uri.replace(/.*#/,'');
          }
        },
        renderMain: async (bodyMain, subject) => {
          await renderLink( kb, subject, current, bodyMain )
        },
        selectedTab : selected ? items[selected].uri : 0
      })
    };
    return(tabset);
  }

  async function load( uri ){
    let store = UI.rdf.graph();
    let fetcher = UI.rdf.fetcher( store );
    await fetcher.load( uri );
    return store;
  }

  async function renderLink ( kb, subject, current, containingElement ){
    let url = kb.any( subject, schema('url') );
    let handler = kb.any( subject, schema('potentialAction') );
    if( handler ) {
      let content = "";
      let r = await fetch(url.uri);
      content = await r.text();
      if(handler=="preformat") {
        let pre = document.createElement('PRE');
        pre.appendChild( document.createTextNode(content) );
        containingElement.innerHTML = "";
        containingElement.appendChild(pre);
        return;
      }
    }
    let iframe = document.createElement('IFRAME');
    iframe.src = url.uri;
    iframe.width="100%";
    iframe.height="100%";
    iframe.border="none";
    containingElement.innerHTML = "";
    containingElement.appendChild(iframe);
  }

  init();

})();

// THE END!
