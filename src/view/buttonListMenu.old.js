

export async function buttonListMenu(json){
    if(json.displayArea && json.startingContent){
      await solidUI.util.show('',json.startingContent,'',json.displayArea);
    }
    let div = document.createElement('DIV');
    div.id =  json.contentSource.replace(/.*\#/,'');
    let html = "";
//    if(typeof json.dataSource==="string") json.dataSource = await solidUI.processComponentSubject(json.dataSource);
//console.log(33,json.dataSource)
    for(let ds of json.dataSource){
      let attrs = "";
      if(!ds.dataSource) {
        ds = await solidUI.getComponentHash(ds);
      }
      let b = document.createElement('BUTTON');
      for(let k of Object.keys(ds)){
          b.setAttribute(`data-${k}`,ds[k]);
      }
      b.innerHTML = ds.label;
      b = solidUI.styleButton(b,json);
      b.addEventListener('click',async(e)=>{
        e.preventDefault();
        let link = b.getAttribute('data-link') || b.getAttribute('data-dataSource')
        await solidUI.showPage(null,{link,displayArea:json.displayArea},ds); 
      });
      div.appendChild(b)
    }
    let targetElement;
    try{ targetElement = document.querySelector(json.contentArea); }
    catch(e) { targetElement = document.createElement('DIV'); }
    targetElement.innerHTML = "";
    targetElement.appendChild(div)
    return targetElement

    let buttons = targetElement.querySelectorAll('BUTTON');
    for(let button of buttons){
      button = solidUI.styleButton(button,json);
      let tag  = button.getAttribute('about');
      button.addEventListener('click',async(e)=>{
        e.preventDefault();
        let link = button.getAttribute('data-link') || button.getAttribute('data-dataSource')
       await solidUI.showPage(null,{link,displayArea:targetElement}); 
      });
    }
    return targetElement;
}
