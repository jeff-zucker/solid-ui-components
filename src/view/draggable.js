
export async function draggable(thing){
  let component = thing;
  if(typeof thing!="object") component = await getFloatComponent(thing);
  let id = getDraggableId(component);
  let draggableDomElement = document.getElementById(id);

  /* If it already exists, show it and return
  */
  if(draggableDomElement){
    draggableDomElement.style.display = "block";
    return;   
  }

  let div = document.createElement('DIV');
  let header =  document.createElement('DIV');
  let close =  document.createElement('SPAN');
  let content =  document.createElement('DIV');
  let pageEl = document.getElementById('right-column-tabulator');
  content.innerHTML = pageEl.innerHTML;
  pageEl.innerHTML = "";
//  pageEl.style.display="none";
//  content = await getDraggableContent(component,content);
  div.id = id;

  close.innerHTML=" X ";
  close.style.color = "#ffeeee";
  close.style["font-weight"] = "bold";
  close.style["margin-left"] = "2em";
  close.style.background = "#000000";
  close.style.padding = "0.2em;"
  close.style["border-radius"] ||= "0.2em";
  close.addEventListener('click',(e)=>{
     e.target.parentNode.parentNode.style.display = "none";
  });


  /* STYLE OF THE DRAGGABLE DIV */
  div.style = component.style || {};
  div.style.position ||= "absolute";
  div.style["z-index"] ||= 3;
  div.style.background ||= "#f1f1f1";
  div.style.border ||= "1px solid #d3d3d3";
  div.style["text-align"] ||= ":center";
//  div.style.height="80%";
//  div.style.width="80%";

  /* STYLE OF DRAGGABLE DIV'S HEADER */
  header.style = component.headerStyle || {};
  header.style.padding ||= "10px";
  header.style.cursor ||= "move";
  header.style["z-index"] ||= 4;
  header.style["text-align"] ||= "center";
  header.style.background ||= "#2196F3";
  header.style.color ||= "#ffffff";

  /* STYLE OF DRAGGABLE DIV'S CONTENT */
  content.style = component.style || {};
  content.style.padding ||= "1em";

  /* MOUSE ACTIONS */ 
  let pos1,pos2,pos3,pos4;
  div.onmousedown = (e)=>{          /* DRAG ELEMENT CLICK */
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = (e)=>{      /* DRAG ELEMNT DROP */
      document.onmouseup = null;
      document.onmousemove = null;
    }
    document.onmousemove = (e)=>{    /* DRAG ELEMENT DRAG */
      e = e || window.event;
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      div.style.top = (div.offsetTop - pos2) + "px";
      div.style.left = (div.offsetLeft - pos1) + "px";
    }
  };

  header.appendChild(close);
  div.appendChild(header);
  div.appendChild(content);
  document.body.appendChild(div);
  return div;

  /* UTILITY FUNCTIONS */
  function getDraggableId(component){
    return component.label.replace(/\s+/g,"_");
  }
  async function getDraggableContent(component,content){
    let ds;
    header.innerHTML = `<span>${component.label}</span>`;
    if(component.content) {
      content.innerHTML = component.content;
    }
    else if(component.dataSource) {
      ds = await solidUI.processComponent(null,component.dataSource);
      content.appendChild( ds );
    }
    else if(component.dataSourceType) {
      ds=await solidUI.util.show(component.dataSourceType,null,null,null,null,component);
      content.appendChild( ds );
    }
    return content;
  }
  async function getDraggableComponent(uri){
    let ui = UI.rdf.Namespace("http://www.w3.org/ns/ui#");
    let c = {};
    uri = UI.rdf.sym(uri);
    await UI.store.fetcher.load(uri);
    c.label = (UI.store.any(uri,ui('label'))||{}).value;    
    c.content = (UI.store.any(uri,ui('content'))||{}).value;
    c.style =  (UI.store.any(uri,ui('style'))||{}).value;
    c.headerstyle =  (UI.store.any(uri,ui('headerStyle'))||{}).value;
    c.dataSource =  (UI.store.any(uri,ui('dataSource'))||{}).value;
    return c;
  }

}

