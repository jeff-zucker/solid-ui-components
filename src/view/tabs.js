export class Tabs {
  async render(solidUI,json) {
    const parts = json.parts
    const tabs = solidUI.createElement('DIV','solid-uic-tabs');
    const nav = solidUI.createElement('NAV');
    if(json.orientation==="vertical")
      nav.style.textAlign = "right";
    else
      nav.style.textAlign = json.position;
    let mainDisplay = solidUI.createElement( 'DIV' );
    mainDisplay.style.backgroundColor = json.background;
    mainDisplay.style.color = json.color;
    let r = 0;    
    for(let row of parts){
      r++;
      let rowhead = solidUI.createElement( 'BUTTON',r,row.label );
      rowhead.style.backgroundColor = json.unselBackground;
      rowhead.style.color = json.unselColor;
      rowhead.style.padding="0.75em";
      rowhead.style.border="1px solid grey";
      rowhead.style.cursor = "pointer";
      let rowContent = solidUI.createElement( 'DIV',r,row.content );
      rowContent.style.padding="0.75em";
      if(json.orientation==="horizontal") rowContent.style.border="1px solid grey";  
      rowContent.style.display = "none";
      rowhead.onclick = (e)=>{
        let items = tabs.querySelector('DIV').children;
        for(let i of items) {
          i.style.display="none";
        }
        for(let n of nav.children) {
          n.style.backgroundColor=json.unselBackground;
          n.style.color=json.unselColor;
        }
        rowhead.style.backgroundColor = json.selBackground;
        rowhead.style.color = json.selColor;
        rowContent.style.display = "block";
      }
      nav.appendChild(rowhead);
      mainDisplay.appendChild(rowContent);
    if(json.orientation==="vertical"){
      rowhead.style.display="block";
      rowhead.style.marginBottom = "0.5em";
      rowhead.style.width="100%"
      tabs.style.width="100%";
      tabs.style.height="100%";
      tabs.style.display = "table-row";
      nav.style.display = "table-cell";
      mainDisplay.style.display = "table-cell";
      mainDisplay.style.display="block"
      mainDisplay.style.height = "100%";
      rowContent.style.height = "100%";
    }
    else {
      rowhead.style.marginRight = "0.5em";
      rowhead.style.borderBottom = "none";
    }
  }
    tabs.appendChild(nav);
    tabs.appendChild(mainDisplay);
    solidUI.simulateClick(tabs.querySelector('BUTTON'))
    return await solidUI.initInternal(tabs);  
  }
}
