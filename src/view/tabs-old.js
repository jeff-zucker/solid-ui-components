export class Tabs {
  async render(solidUI,json) {
    let parts = json.parts
    const tabs = solidUI.createElement('DIV','solid-uic-tabs');
    if(json.style) tabs.style = json.style;
    const nav = solidUI.createElement('NAV');
    if(json.orientation==="vertical")
      nav.style.textAlign = "right";
    else
      nav.style.textAlign = json.position;
    let mainDisplay = solidUI.createElement( 'DIV' );
    mainDisplay.style.backgroundColor = solidUI.pageBackground || json.background;
    mainDisplay.style.color = solidUI.pageColor || json.color;
    let r = 0;    
    if(!parts.length) parts = [parts];
    for(let row of parts){
      r++;
      let rowhead = solidUI.createElement( 'BUTTON',r,row.label );
      rowhead.style.backgroundColor = solidUI.menuBackgroundColor || json.background;
      rowhead.style.color = solidUI.menuColor || json.color;
      rowhead.style.padding="0.5em";
//      rowhead.style.border="1px solid grey";
      rowhead.style.border="none";
      rowhead.style.cursor = "pointer";
      solidUI.currentElement = json.contentArea;
//JZ      let rc = row.dataSource ? await solidUI.processComponentSubject(row.dataSource) : row.content;
      rowhead.setAttribute("name",row.dataSource);
      let rowContent = solidUI.createElement( 'DIV',r );
      if(row.content) rowContent.appendChild(row.content);
      rowContent.style.padding="0.75em";
//      if(json.orientation==="horizontal") rowContent.style.border="1px solid grey";  
      rowContent.style.display = "none";
      if(row.type==="SolidOSLink"){
        let id = `tab-${r}-outline`;
        rowContent.innerHTML = `
          <div class="TabulatorOutline" id="${id}-tabulator" role="main">
            <table id="${id}"></table>
            <div id="GlobalDashboard"></div>
          </div>
        `;
        let subject = window.kb.sym(row.href);
        let targetArea = rowContent.querySelector('#'+id);
        targetArea.style="display:table-row;background-color:c0c0c0"
        window.outliner.GotoSubject(subject,true,undefined,true,undefined,targetArea);
      }
      rowhead.onclick = (e)=>{
        e.preventDefault();
        alert(44,e.target.getAttribute('name'));
        console.log(44,e.target);
        let items = tabs.querySelector('DIV').children;
        for(let i of items) {
          i.style.display="none";
        }
        for(let n of nav.children) {
          n.style.backgroundColor = solidUI.menuBackground || json.background;
          n.style.color = solidUI.menuColor || json.color;
        }
        rowhead.style.backgroundColor = solidUI.menuColor || json.color;
        rowhead.style.color = solidUI.menuBackground || json.background;
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
      rowhead.style.marginRight = "0.25em";
      rowhead.style.borderBottom = "none";
    }
  }
    tabs.appendChild(nav);
      const closeButton = document.createElement('SPAN');
      closeButton.style = `
        color:red;
        text-align:right;
        position:absolute;
        top:0.25rem;
        right:0.25rem;
        font-size: 2rem;
        font-weight: bold;
        cursor:pointer
      `;
      closeButton.addEventListener('click',(e)=>{
        e.preventDefault();
        e.target.parentElement.style.display="none";
      });
      closeButton.innerHTML = "&times";

    tabs.appendChild(closeButton);
    tabs.appendChild(mainDisplay);
console.log(99,json);
    await solidUI.simulateClick(tabs.querySelector('BUTTON'))
    return tabs
//JZ    return await solidUI.initInternal(tabs);  
  }
}
