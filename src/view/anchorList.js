/*
  Creates a menu from a list of anchor elements;
  params
    contentArea - selector for area to put the menu buttons
    displayArea - selector for area to show results of clicks on the buttons
*/
export async function anchorList(o){
  let el = document.querySelector(o.contentArea);
  for(let anchor of as){
    anchor.target = o.displayArea;
    anchor.addEventListener('click',async (e)=>{
      e.preventDefault();
      anchor.setAttribute('data-contentType','text/html');
      await u.show('text/html',anchor.href,null,o.displayArea);
    });
    el.classList.add('suic-anchor-list');
    el.appendChild(anchor);      
  }
}
