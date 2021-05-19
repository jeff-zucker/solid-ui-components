  async function selectorPanel( options,containingElement ) {
    const box = document.createElement('TABLE');
    const callback= (label,link,options,event)=>{
      event.preventDefault()
      let clickedElement = event.target || event.srcElement;
      let targetElement = options.targetElement || clickedElement.closest('TABLE').parentElement;
      renderLink(options,UI.rdf.namedNode(link),targetElement)
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

