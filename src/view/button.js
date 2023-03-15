export async function button(component){
   const targetElement = component.contentArea || document.body;
   let button = document.createElement('BUTTON');
   button.innerHTML = component.label;
   if(component.title) button.title = component.title;
   if(component.style) button.style = component.style;
/*
   button.style = component.style;
   button.style.cursor ||= "pointer";
   button.style.color ||= solidUI.buttonColor;
   button.style.backgroundColor ||= solidUI.buttonBackgroundColor;
*/
   button = solidUI.styleButton(button,component);

   button.addEventListener('click',(e)=>{
alert(component.onclick)
      window[component.onclick](e);  
   });
/*
   let script = `(()=>{${component.onclick}})()`;
   button.onclick = async ()=>{
     Function('"use strict";return ('+script+')')();
   };
*/
   targetElement.appendChild(button);
}
