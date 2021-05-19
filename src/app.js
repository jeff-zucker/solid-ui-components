export async function app(o,containingElement) {

  document.body.style.margin="0";
  document.body.style.padding="0";
  document.body.style.overflow="hidden";
  containingElement.style.width="100%";
  containingElement.style.height="100%";
  containingElement.style.display = "grid";
  containingElement.style.gridGap="0";
  containingElement.style.gridTemplateRows="4rem auto";
  let html = `
    <header style="display:grid;grid-template-columns:4rem auto;grid-gap:0; margin:0; background-color:${o.backgroundColor}; color:${o.color}; padding: 0.5rem;">
      <img src="${o.image}" style="height:3rem;cursor:pointer" />
      <div style="font-size:1.5rem;margin-top:0.4rem;">${o.label}</div>
    </header>
    <main style="margin:0;"></main>
  `;
  if(o.footer){
    containingElement.style.gridTemplateRows="4rem auto 3rem";
    html +=`
      <footer style="padding:1rem;text-align:center; background-color:${o.backgroundColor}; color:${o.color};">
        ${o.footer}
      </footer>
    `;
  }
  containingElement.innerHTML = html;
  return containingElement;
}
