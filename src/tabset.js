export async function tabset(o,containingElement) {
  o.orientation ||= 0;
  o.selected ||= 1;
  o.selected = o.selected -1;
  if(o.selected<0) o.selected = 0;
  if(o.selected>o.items.length) o.selected = 0;
  o.backgroundColor ||= "#666";
  o.color ||= "#fff";
  let items = "";
  let itemTemplate = o.orientation==1
      ? `<li><a style="display:block;
        padding: 0.4rem; cursor:pointer; margin: 0.3em 0 0.3em 0.3em;
width:12rem;
        color:${o.color}; background-color:${o.altBackgroundColor}" 
        `
      : `<li><a style="display:inline-block; border-radius: 0.2em 0.2em 0 0;
        padding: 0.7em; cursor:pointer; margin: 0.3em 0 0.3em 0.3em;
        color:${o.color}; background-color:${o.altBackgroundColor}" 
        `
  for(var i of o.items){
    items +=  itemTemplate + `
        data-name='${i.uri}'
        >
          ${i.label}
        </a>
    `;
    if( i.subItems ) {
      items += `<ul style="margin-top:-0.3em;display:none">`
      for(var s of i.subItems){
        items += `<li><span style="display:block; padding: 0.3em; cursor:pointer; margin-left:0.3em; color:${o.altBackgroundColor}; background-color:${o.color};" data-name="${s.uri}">${s.label}</span></li> 
        `
      }
        items += "</ul>"
    }
    items +=  "</li>"
  }
  let tabs = o.orientation==1
    ?`
<div style="display: flex; height:100%; width: 100%; flex-direction: row;" class="ui-tabset-container">
  <nav style="margin: 0;">
    <ul style="list-style-type: none; display: flex; height: 100%; 

        margin: 0; padding: 0; flex-direction: column"

    >
     ${items}
    </ul>
  </nav>
  <main style="flex:1; width:auto; height:100% !important; border:none;">

  </main>
</div>
`
    :`
<div style="display:flex; height:100%; width: 100%; flex-direction: row;" class="ui-tabset-container">
  <nav style="margin:0; flex;">
    <ul style="list-style-type: flex; none; display: height: 100%; 
        margin: 0; padding: 0;"
    >
     ${items}
    </ul>
  </nav>
  <main style="flex:1; width:auto; height:100% !important; border: none;">

  </main>
</div>
`;
  let div=document.createElement('DIV');
  div.style.height="100%";
  div.innerHTML = tabs;
  return(div);
}
