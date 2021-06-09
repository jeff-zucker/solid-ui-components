export async function app(o,containingElement) {
  let f = o.footer;
  if(f) {
    f.backgroundColor ||= o.backgroundColor;
    f.color ||= o.color;
  }
  let b = o.banner;
  b.backgroundColor ||= o.backgroundColor;
  b.color ||= o.color;
  document.body.style.margin="0";
  document.body.style.padding="0";
  document.body.style.overflow="hidden !important";
  containingElement.style.width="100%";
  document.body.style.height="100%";
  containingElement.style.height="100%";
/*
  containingElement.style.display = "grid";
  containingElement.style.gridGap="0";
  containingElement.style.gridTemplateRows="4rem auto";
*/
  let html = `
<div style="display:table;height:100vh;width:100vw;">
  <div style="display:table-row;height:4rem">
    <header style="display:grid;grid-template-columns:4rem auto;grid-gap:0; margin:0; background-color:${b.backgroundColor}; color:${b.color}; padding: 0.5rem;">
      <img src="${b.image}" style="height:3rem;cursor:pointer" />
      <div style="font-size:1.5rem;margin-top:0.4rem;">${b.label}</div>
    </header>
</div>
<div style="display:table-row">
    <main style="margin:0;height:100%"></main>
</div>
  `;
  if(o.footer){
//    containingElement.style.gridTemplateRows="4rem 100% 3rem";
    html +=`
  <div style="display:table-row;height:3rem">
      <footer style="padding:1rem;text-align:center; background-color:${f.backgroundColor}; color:${f.color};">
        ${f.content}
      </footer>
</div>
</div>
    `;
  }
  containingElement.innerHTML = html;
  return containingElement;
}

export async function appOLD(o,containingElement) {
  let f = o.footer;
  f.backgroundColor ||= o.backgroundColor;
  f.color ||= o.color;
  let b = o.banner;
  b.backgroundColor ||= o.backgroundColor;
  b.color ||= o.color;
  document.body.style.margin="0";
  document.body.style.padding="0";
  document.body.style.overflow="hidden !important";
  containingElement.style.width="100%";
  document.body.style.height="100%";
  containingElement.style.height="100%";
  containingElement.style.display = "grid";
  containingElement.style.gridGap="0";
  containingElement.style.gridTemplateRows="4rem auto";
  let html = `
    <header style="display:grid;grid-template-columns:4rem auto;grid-gap:0; margin:0; background-color:${b.backgroundColor}; color:${b.color}; padding: 0.5rem;">
      <img src="${b.image}" style="height:3rem;cursor:pointer" />
      <div style="font-size:1.5rem;margin-top:0.4rem;">${b.label}</div>
    </header>
    <main style="margin:0;height:100%"></main>
  `;
  if(o.footer){
    containingElement.style.gridTemplateRows="4rem 100% 3rem";
    html +=`
      <footer style="padding:1rem;text-align:center; background-color:${f.backgroundColor}; color:${f.color};">
        ${f.content}
      </footer>
    `;
  }
  containingElement.innerHTML = html;
  return containingElement;
}
