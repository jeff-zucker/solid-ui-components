export async function componentButton(thing){

  let component = thing;
  if(typeof thing!="object") component = await getButtonComponent(thing);
  let button = document.createElement('BUTTON');
  button.innerHTML = component.icon ?component.icon :component.label;
  button.addEventListener('click',async (e)=>{
    await solidUI.processComponent(null,component.dataSource);     
  });
  button.style = component.style;
  button.style.cursor ||= "pointer";
  button.style.background ||= "#2196F3";
  button.style.color ||= "#ffffff";
  button.style.padding ||= "0.5em";
  button.style["border-radius"] ||= "0.2em";
  if(component.targetSelector) component.targetSelector.appendChild(button);
  return button;

  async function getButtonComponent(uri){
    let ui = UI.rdf.Namespace("http://www.w3.org/ns/ui#");
    let c = {};
    uri = UI.rdf.sym(uri);
    await UI.store.fetcher.load(uri);
    c.label = (UI.store.any(uri,ui('label'))||{}).value;    
    c.content = (UI.store.any(uri,ui('icon'))||{}).value;
    c.style =  (UI.store.any(uri,ui('style'))||{}).value;
    c.headerstyle =  (UI.store.any(uri,ui('headerStyle'))||{}).value;
    c.dataSource =  (UI.store.any(uri,ui('dataSource'))||{}).value;
    return c;
  }

}
