const ui = UI.rdf.Namespace('https://www.w3.org/ns/ui#');
const rdf = UI.rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

  export function getProperties(subject,kb){
     let props = kb.match(subject);
     let p = {subject:subject};
     for(var pr of props){
        let prop = UI.utils.label( pr.predicate.value.replace(/.*\/ui#/,'') );
        p[prop]=UI.utils.label(pr.object.value)
     }     
     p.contentBackgroundColor ||= _thingOrDefault(subject,'contentBackgroundColor',kb);
     p.contentColor ||= _thingOrDefault(subject,'contentColor',kb);
     p.backgroundColor ||= _thingOrDefault(subject,'backgroundColor',kb);
     p.color ||= _thingOrDefault(subject,'color',kb);
     p.altBackgroundColor ||= _thingOrDefault(subject,'altBackgroundColor',kb);
     p.altColor ||= _thingOrDefault(subject,'altColor',kb);
     return p;
  }
  export function simulateClick(el){
    if (el.fireEvent) {
      el.fireEvent('on' + 'click');
    } else {
      var evObj = document.createEvent('Events');
      evObj.initEvent('click', true, false);
      el.dispatchEvent(evObj);
    }
  }
  export async function loadFromContent( body, uri ){
    let store = UI.rdf.graph();
    UI.rdf.parse(  body, store, uri, "text/turtle")     
    return store;
  }
  export async function load( uri,kb ){
    if(typeof uri==="string" && !uri.startsWith('http')) {
      uri = location.href.replace(/\/[^\/]*$/,'/') + uri;
    }
    uri = typeof uri==="string" ? UI.rdf.namedNode(uri) :uri;
    if(uri.termType != "NamedNode") return;
    let alreadyLoaded =  kb.any( undefined,undefined,undefined,uri.doc()); 
    if( !alreadyLoaded ){
      let fetcher = UI.rdf.fetcher( kb ); // only load if not yet loaded
      await fetcher.load( uri );
    }
    return uri;
  }
  export function makeIframe(){
    let iframe = document.createElement('IFRAME');
    iframe.width="100%";
    iframe.height="100%";
    iframe.style.border="none";
    iframe.sandbox = 'allow-forms allow-scripts allow-same-origin allow-modals allow-popups';
    return iframe;
  }

  function _thingOrDefault( subject,key,kb ){
/*
    let thing = kb.any( subject, ui(key) );
    if( thing )
      return thing.value;
    else
      return getAppDefault(key,kb)
*/
      let doc = UI.rdf.Namespace( subject.doc().uri );
      let pred = kb.any( doc(''),ui(key) )
      return pred ? pred.value : null;

  }
  export function getAppDefault(key,kb){
    let app = kb.any( null, rdf('type'), ui('App') );
    if(!app) return null;
    let value = kb.any( app, ui(key), null );
    value = value ?value.value :null;
  }
