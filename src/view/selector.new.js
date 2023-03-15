  /*
     containerSelector
       url
       targetSelector
       resourceOnChange
       collectionSize
       resourceSize

podSelector({
           parts : [ {label,dataSource}, ... ],
     contentArea : display target of resource-picker
     displayArea : display target of resource 
  collectionSize : integer, max height of selector element for collections
    resourceSize : integer, max height of selector element for resources
        onchange : action to occur when resource is selected
});

podSelector({
           parts : [ {label,dataSource}, ... ],
     contentArea : display target of resource-picker
     displayArea : display target of resource 
  collectionSize : integer, max height of selector element for collections
    resourceSize : integer, max height of selector element for resources
        onchange : action to occur when resource is selected
});

  */
export async function podSelector(component){
  let pods = [];
  for(let pod of component.parts){
    pods.push({value:pod.dataSource,label:pod.label});
  }
  let podsOnchange = async (selectorElement)=>{
     let newHost = selectorElement.target.value;
     component.dataSource = newHost;
     return await resourceSelector(component);
  };
  pods = await selector(pods,podsOnchange,null,null,6,component);
//  pods.style.height="2rem";
  let container = pods[0].value;
/*
  let hostEl = document.createElement('DIV');
    hostEl.style = "width:100% !important;text-align:right";
    hostEl.innerHTML = `
       <span style="color:white !important">Pod Explorer</span>
       <a href="${container}" style="display:inline-block !important;color:gold !important;text-align:right !important;"><img src="https://solidproject.org/assets/img/solid-emblem.svg" style="height:2rem;width:2rem;margin-left:2rem;" /></a>
    `;
*/
    let targetArea = typeof component.contentArea==="string" ?document.querySelector(component.contentArea) :component.contentArea;
console.log(78,targetArea);
  targetArea.innerHTML="";
//  targetArea.appendChild(hostEl);
  targetArea.appendChild(pods);
  component.dataSource = pods[0].value;
  let resources = await resourceSelector(component);
}

export async function resourceSelector(json){
    let url = json.dataSource || json.podLink;
    let targetSelector = json.contentArea;
    let collectionSize = json.collectionSize || 6;
    let resourceSize = json.resourceSize || 10;
    let resourceOnchange = json.onchange;
    if(typeof solidUI !="undefined") resourceOnchange ||= async (e)=>{await solidUI.showPage(e,json)};
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
    let containerOnchange = async (selectorElement)=>{
       let newContainer = selectorElement.target.value;
       json.dataSource = newContainer;
       let thisContainerArea = document.querySelector('#PodSelector .containerSelector');
       let newC =  await resourceSelector(json);
       thisContainerArea.replaceWith(newC);
console.log(88,newC)
       return thisContainerArea;
    };
    containers = await selector(containers,containerOnchange,url,null,collectionSize,json)
    resources =  await selector(resources,resourceOnchange,url,null,resourceSize,json)
    containers.classList = ["containerSelector"];
    if(resources) resources.classList = ["resourceSelector"];
    if(targetSelector && typeof targetSelector==="string") targetSelector = document.querySelector(targetSelector);
    if(!targetSelector){
       let myid = json.label.replace(/\s/g,"_");
       targetSelector = document.getElementById(myid);
    }
//    if(targetSelector) div = targetSelector.querySelector("#PodSelector");
    let div=document.createElement('DIV');
    div.innerHTML = "";
    div.id = "PodSelector"
    if(containers) div.appendChild(containers);    
    if(resources) div.appendChild(resources);    
/*
    let anchor = targetSelector.querySelector('A')
    if(anchor)anchor.addEventListener('click',(e)=>{
        e.preventDefault();
        solidUI.showPage(e,{link:container,displayArea:json.displayArea});
    });
*/
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
  function _origin(path){
    try{ 
      let p = new URL(path); 
      return p.origin
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
  export function selector(options,onchange,selected,targetSelector,size,o){

    function mungeLabel(label){
      if(!label) return "";
      label = decodeURI(label);
      if(!label.endsWith("/")) label = label.replace(/.*\//,'')
      return label || "/";
    }
    function addAttributes(option,optionEl){
      if(Object.keys(option).length>2){
        for(let k of Object.keys(option)){
          if(k==="value"||k==="label")continue;
          optionEl.dataset ||= {};
          optionEl.dataset[k] = option[k];
        }
      }
      return optionEl;
    }

    let computedSize = options.length;
    size ||= 0;
    size = computedSize <= size ?computedSize :size;
    size ||=1;
/*
    if(size ===1) {
      let button = document.createElement('BUTTON');
      button.value = options[0].value;
      button.innerHTML = mungeLabel(options[0].label);
      button.addEventListener('click',(e)=>{
        onchange(e)
//        onchange(e.target)
      })
      return button;
    }
*/
    let selectEl = document.createElement('SELECT');
    let optgroupEl = document.createElement('OPTGROUP');
    optgroupEl.style.margin=0;
    optgroupEl.style.padding=0;
//    selectEl.appendChild(optgroupEl);
    selectEl.style.background = o.darkBackground;
    selectEl.style["margin-top"] = "1rem";
    for(let option of options){
      let value,label;
      if(typeof option==="string") value = label = option;
      else {
        value = option.value
        label = option.label || option.value
      }
      if(!label || !option) continue;
      label=mungeLabel(label);
//      label = decodeURI(label);
//      if(!label.endsWith("/"))
//         label = label.replace(/.*\//,'')
//      label ||= "/";
      let optionEl = document.createElement('OPTION');
      optionEl.style["font-size"]="18px";
//      optionEl.style = "padding:0.25em;";
      optionEl.style.background = o.lightBackground;
      optionEl.style.color = o.lightBackground;
      optionEl.value = value;
      optionEl.title = value+"\n"+(option.contentType||"");
      optionEl.dataset ||= {};
      optionEl.dataset.contenttype=option.contentType||"";
      optionEl.innerHTML = label;
      optionEl = addAttributes(option,optionEl);
/*
      if(Object.keys(option).length>2){
        for(let k of Object.keys(option)){
          if(k==="value"||k==="label")continue;
          optionEl.dataset ||= {};
          optionEl.dataset[k] = option[k];
        }
      }
*/
      //optgroupEl.appendChild(optionEl);
      selectEl.appendChild(optionEl);
    }

    /* HIGHLIGHT SELECTED */
    if(selected) selectEl.value = selected;
//    selectEl.value ||= selectEl.childNodes[0].value;

//    selectEl.addEventListener('click',async(e)=>{
//      onchange(e.target)
//    })
    selectEl.addEventListener('change',async(e)=>{
      onchange(e)
//      onchange(e.target)
    })
    selectEl.size = size
    selectEl.style.width="100%";
    if(targetSelector) {
      let targetEl = document.querySelector(targetSelector)
      targetEl.innerHTML = ""
      targetEl.appendChild(selectEl);
    }
    return selectEl;
  }

