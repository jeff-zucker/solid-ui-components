export class App {
  async render(solidUI,app){

    // GET/SET DEFAULTS
    //
    app = solidUI.setDefaults(app);
    document.body.style.overflow="hidden";


    // SET BODY HEIGHT TO FULL MINUS HEADER + MENU 
    app.headerHeight = this.rem2vh(3);
    app.menuHeight = this.rem2vh(2);
    app.mainHeight = ( 100 - (app.headerHeight+app.menuHeight) ).toString() + "vh" ;
    app.headerHeight = (app.headerHeight).toString() + "vh" ;
    app.menuHeight = (app.menuHeight).toString() + "vh" ;

    // DISPLAY HEADER IF app.logo OR app.title
    //
    app.logo ||= "";
    app.title ||= "";
    app.headerHeight = ( app.logo || app.title ) ?app.headerHeight : "0";

    // DISPLAY MENU AT TOP OR LEFT DEPENDING ON app.orientation
    //
    app.leftMenu = "" ;
    app.topMenu = "" ;
    if(app.orientation==="horizontal"){
      app.leftMenuStyle = "display:none";
    }
    else {
      app.leftMenuStyle = `
        display:block;
        width:36vw !important;
        height:${app.mainHeight};
        overflow-y:scroll;
        margin:0;
        padding:0;
      `;
    }

    let appString = this.getHTML(app);
    let element = solidUI.createElement('SPAN','',appString);
    if(typeof app.menu==='object')app.menu.target = element.querySelector('.main');
    let menuElement = element.querySelector("NAV");
    const menu = await solidUI.processComponent(menuElement,app.menu);
    let menuSelector = app.orientation==="horizontal" ?"NAV" :".leftColumn";
    element.querySelector(menuSelector).appendChild(menu);


    if(app.initialContent) {
//      main.appendChild(await solidUI.processComponent('',app.initialContent));
    }  
    return element;
  }
rem2vw(rem) {
  const viewportWithoutScroll = document.body.clientWidth;
  const pxPerVw = 100/viewportWithoutScroll;
  return( rem * pxPerVw);  
}
rem2vh(rem) {
  const viewportWithoutScroll = window.innerHeight;
  const pxPerVw = 100/viewportWithoutScroll;
  return( rem * 16 * pxPerVw);  
}
  getHTML(app){ 
     app.leftColumnColumnStyle ||= "display:none";
     app.leftColumnColumnMenu ||= "";
     app.topMenu ||= "";
     app.leftColumnColumnStyle ||= "";
     app.iframeSrc ||= "";
     app.iframeContent ||= "";
     app.logoStyle = `
             height: 3rem;
            display: inline-block;
       padding-left: 1rem;
     `;
     app.titleStyle = `
       display:inline-block;
       vertical-align:top; align:left;
       font-size: 2rem;
       padding-top: 0.4rem;
       padding-left:1rem;"
     `;
     return `
<div class="solid-uic-app" style="display:flex;flex-direction:column;width:100;height:100%;">
  <header style="height:${app.headerHeight};">
    <img src="${app.logo}" style="${app.logoStyle}" />
    <span style="${app.titleStyle}"> ${app.title} </span>
  </header>
  <nav style="width:100%">
    ${app.topMenu}
  </nav>
  <div style="display:flex;flex-direction:row;width:100%;height:100%">
    <div class="leftColumn" style="${app.leftMenuStyle}">${app.leftMenu}</div>
    <div class="main" style="padding:0rem;overflow:hidden;width:100%;height:${app.mainHeight};"></div>
  </div>
</div>`;
  }
}
