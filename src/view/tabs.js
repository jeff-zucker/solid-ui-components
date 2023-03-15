export async function tabSet(options) {
    const items = options.parts.map(part=>part.dataSource);
    if(options.displayArea && options.startingContent){
      await solidUI.processComponentSubject(options.startingContent);
    }
    options.renderTab ||= (div,source)=>{
      const labels = (s)=>{
        for(let p of options.parts){
          if(p.dataSource===s)return p.label
        }
      }
      div.innerHTML = labels(source);
    }
    options.renderMain ||= async (div,source)=>{
      // div = inner main
      div.setAttribute('data-suic-area','tab-display');
      div.innerHTML = "";
      if(options.style) div.style="options.style";
      let c = await solidUI.processComponentSubject(source) ;
      div.appendChild( c );
    }
    const tabOptions = {
      items,
      backgroundColor : options.backgroundColor || solidUI.menuBackground,
      orientation : options.orientation,
      dom : options.dom,
      onClose : options.onClose,
      ordered : options.ordered,
      selectedTab: options.selectedTab,
      startEmpty : options.startEmpty,
      renderTab : options.renderTab,
      renderMain : options.renderMain,
      renderTabSettings : options.renderTabSettings,
    }
    return UI.tabs.tabWidget(tabOptions);
}
