export class Form {
  async render(solidUI,json){
    const container = document.createElement("DIV",'uic-form');
    const dom = window.document;
    const form = await solidUI.loadUnlessLoaded(json.form);
    await solidUI.loadUnlessLoaded(json.formSubject);
    const subject = await solidUI.loadUnlessLoaded(json.formSubject);
    if(!subject) return console.log("ERROR : Couldn not load form subject ",json.formSubject)
    let doc = json.formResultDocument;
    if(!doc && subject.doc) doc = subject.doc();
    const script = json.script || function(){};
    try {
      UI.widgets.appendForm(dom, container, {}, subject, form, doc, script);
    }
    catch(e){return console.log(e)}  
    if(json.onchange) {
      const vals = container.querySelectorAll('.formFieldValue button');
      for(let v of vals){
        v.onclick = "alert(3)";
      }
    }
    return container;
  }

}
