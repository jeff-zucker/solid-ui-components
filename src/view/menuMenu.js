export async function menuOfMenus(json){
    let target = document.querySelector(json.displayArea);
    if(target && json.startingContent){
      let content = await solidUI.processComponentSubject(json.startingContent)
      if(content) target.appendChild(content)
//      await solidUI.util.show('',content,'',json.displayArea);
    }
    let div = document.createElement('DIV');
    div.id =  json.contentSource.replace(/.*\#/,'');
    let html = "";
//    if(!json.dataSource.dataSource) json.dataSource.dataSource = json.dataSource;
    for(let ds of json.dataSource){
      let component = ds.directDisplay ?ds.dataSource :ds.id
      ds.directDisplay ||= "";
      if(ds.plugin && ds.plugin.match(/External/)) ds.external = "true";
      html += `<button about="${component}" data-directDisplay="${ds.directDisplay}" data-external="${ds.external}">${ds.label}</button>`;
    }
    div.innerHTML = html;
    let targetElement = typeof json.contentArea==="string" ?document.querySelector(json.contentArea) :solidUI.currentElement;
    targetElement.innerHTML = "";
    targetElement.appendChild(div)
    let moreHtml = ""
    for(let ds2 of json.dataSource){
      let div2 = document.createElement('DIV'); 
      div2.id=ds2.label.replace(/\s*/g,'_');
      div2.setAttribute('data-suic',ds2.id);
      div2.style="display:none";
      targetElement.appendChild(div2);
    }
    let buttons = targetElement.querySelectorAll('BUTTON');
    for(let button of buttons){
      button = solidUI.styleButton(button,json);
      let tag  = button.getAttribute('about');
      button.addEventListener('click',async(e)=>{
        e.preventDefault();
        let external = button.getAttribute('data-external');
        external = external==="undefined" ?null :external;
        let direct = button.getAttribute('data-directDisplay');
        direct = direct==="undefined" ?null :direct;
        let href = button.getAttribute('about');
        if(direct){
          await solidUI.showPage(null,{link:href,displayArea:targetElement}); 
          return;
        }
        if(external) {
          return solidUI.processComponentSubject(href)
        }
        let divs = targetElement.querySelectorAll(json.contentArea + ' > DIV');
        for(let d of divs){
          let target = d.getAttribute('data-suic');
          if(target===tag){
            d.style.display="block";
            await solidUI.activateComponent(d,targetElement);
          }
          else d.style.display="none";
        }
      });
    }
    return targetElement;
}
