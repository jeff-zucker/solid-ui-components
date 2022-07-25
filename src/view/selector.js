  /* containerSelector
       url
       targetSelector
       resourceOnChange
       collectionSize
       resourceSize
  */
  export async function containerSelector(json){
    let url = json.dataSource;
    let targetSelector = json.contentArea;
    let collectionSize = json.collectionSize;
    let resourceSize = json.resourceSize;
    let resourceOnchange = async (e)=>{await solidUI.showPage(e,json)};
    const ldp = UI.rdf.Namespace("http://www.w3.org/ns/ldp#");
    if(!url) return "";
    let container = url.replace(/\/[^\/]*$/,'/'); // in case we get passed a resource
    let host = _host(container);
    const base = UI.rdf.sym(container);
    await UI.store.fetcher.load(base);
    let files = UI.store.each(base,ldp("contains"),null,base);
    let resources = [];
    let containers=[];
    containers.push({value:base.uri,label:_pathname(base.uri)});
    for(let file of files.sort()){
      let name = file.value
      let contentType=_findContentType(file);
      if( _isHidden(name) ) continue; 
      if(name.endsWith('/')) containers.push({value:name,label:_pathname(name),contentType});
      else resources.push({value:name,label:_pathname(name),contentType});
    }
    let parent = base.uri.replace(/\/$/,'').replace(/\/[^\/]*$/,'/');
    if(parent) {
      if(!parent.endsWith("//")) {
        containers.splice(1,0,{value:parent,label:"../"});
      }
    }
    let x = ()=>{};
    let hostEl = document.createElement('DIV');
    hostEl.innerHTML = host;
    let containerOnchange = async (selectorElement)=>{
       let newContainer = selectorElement.value;
       json.dataSource = newContainer;
       return await containerSelector(json);
    };
    containers = await selector(containers,containerOnchange,url,null,collectionSize)
    resources =  await selector(resources,resourceOnchange,url,null,resourceSize)
    containers.classList = ["containerSelector"];
    resources.classList = ["resourceSelector"];
    if(targetSelector && typeof targetSelector==="string") targetSelector = document.querySelector(targetSelector);
    let div = targetSelector ?targetSelector :document.createElement('DIV');
    div.innerHTML = "";
    div.appendChild(hostEl);    
    div.appendChild(containers);    
    div.appendChild(resources);    
    return div;
  }

  function _findContentType(fileNode){
    const isa = UI.rdf.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
    let types = UI.store.each(fileNode,isa).map((s)=>{return s.value});
    for(let type of types){
      if(type.match(/http:\/\/www.w3.org\/ns\/iana\/media-types/))
       return type.replace(/http:\/\/www.w3.org\/ns\/iana\/media-types\//,'').replace(/\#Resource/,'');
    }
  }

  function _isHidden(path){
    if(!path) return true;
    let name = new URL(path);
    name = name.pathname;
    name= name.endsWith('/') ?name.replace(/^\//,'') :name.replace(/.*\//,'');
    if(name.startsWith('.') ) return true;
    if(name.endsWith('~') ) return true;
  }
  function _pathname(path){
    try{ 
      let p = new URL(path); 
      return p.pathname
    }
    catch(e){console.log(path,e); return path }; 
  }
  function _host(path){
    try{ 
      let p = new URL(path); 
      return p.host
    }
    catch(e){console.log(path,e); return path }; 
  }



  /*
     @paramoptions : an array of arrays [ [value1,label1], [value2,label2] ]
     onchange : callback function when item selected
     selected : value to select (from options)
     targetSelector :  an optional css selector e.g. "#foo .bar" where output should be placed
     size : optional integer size of selector
     returns an HTML select element
   */
  export function selector(options,onchange,selected,targetSelector,size){
    let selectEl = document.createElement('SELECT');
    for(let option of options){
      let value,label;
      if(typeof option==="string") value = label = option;
      else {
        value = option.value
        label = option.label || option.value
      }
      if(!label || !option) continue;
      label = decodeURI(label);
      if(!label.endsWith("/"))
         label = label.replace(/.*\//,'')
      label ||= "/";
      let optionEl = document.createElement('OPTION');
      optionEl.value = optionEl.title = value;
      optionEl.innerHTML = label;
      optionEl.style = "padding:0.25em;";
      if(Object.keys(option).length>2){
        for(let k of Object.keys(option)){
          if(k==="value"||k==="label")continue;
          optionEl.dataset ||= {};
          optionEl.dataset[k] = option[k];
        }
      }
      selectEl.appendChild(optionEl);
    }

    /* HIGHLIGHT SELECTED */
    if(selected) selectEl.value = selected;
//    selectEl.value ||= selectEl.childNodes[0].value;

    selectEl.addEventListener('click',async(e)=>{
      onchange(e.target)
    })
    selectEl.addEventListener('change',async(e)=>{
      onchange(e.target)
    })
    let computedSize = options.length;
    if(size){
      selectEl.size = computedSize <= size ?computedSize :size;
    }
    selectEl.style="padding:0.5em;width:100%"
    if(targetSelector) {
      let targetEl = document.querySelector(targetSelector)
      targetEl.innerHTML = ""
      targetEl.appendChild(selectEl);
    }
    return selectEl;
  }
