export async function menuOfMenus(json){
    let div = document.createElement('DIV');
    div.id =  json.contentSource.replace(/.*\#/,'');
    let html = "";
    for(let ds of json.dataSource){
      let component = ds.directDisplay ?ds.dataSource :ds.id
      ds.directDisplay ||= "";
      html += `<button about="${component}" data-directDisplay="${ds.directDisplay}">${ds.label}</button>`;
    }
    div.innerHTML = html;
    let targetElement = document.querySelector(json.contentArea);
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
      let tag  = button.getAttribute('about');
      button.addEventListener('click',async(e)=>{
        e.preventDefault();
        if(button.getAttribute('data-directDisplay')){
          await solidUI.showPage(null,{link:button.getAttribute('about'),displayArea:targetElement}); 
          return;
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
