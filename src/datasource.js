import * as utils from './utils.js';

const rdf = UI.rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
const ui = UI.rdf.Namespace('https://www.w3.org/ns/ui#');

  export async function getDataSource (subject,kb){
    await utils.load(subject,kb);
    return kb.any(subject,ui('dataSource'));
  }
  async function getItemsFromDataSource(subject,ds,inverse,kb){
    let memberTerm = getMemberTerm(subject,kb) 
    let items=[];
    if(ds && ds.termType==="Collection"){
      items = ds.elements || [];
    }
    else {
      if(ds) await utils.load(ds,kb);
      else { 
        if(subject) await utils.load(subject,kb); 
      }
      if(inverse){
        items = kb.each( undefined, memberTerm, subject );
      }
      else {
        items = kb.each( subject, memberTerm );
      }
    }
    if(items.length && items.length===1 && items[0].termType==="Collection")
      items = items[0].elements;
    let length = items.length ?` and ${items.length} items` :"";
    console.log("Loaded "+UI.utils.label(subject) + " " +length);
    return items;
  }
  export async function getItems(w,populatedItems,kb){ 
    populatedItems ||= [];
    w.items = await getItemsFromDataSource(w.subject,w.dataSource,w.inverse,kb)
    for(var i of w.items){
      let subItems=[];
      let dSource = await getDataSource(i,kb);
      subItems=await getItemsFromDataSource(dSource,dSource,w.inverse,kb)||[];
      let sItems=false
      if( subItems.length ){
        sItems=[];
        for(var s of subItems){
          sItems.push( await populateItem(s,false,kb) );
        }
      }
      populatedItems.push(await populateItem(i,sItems,kb))
    }
    return populatedItems;
  }
  async function populateItem(item,subItems,kb){
    let label = await getLabel(item,kb);
    if(typeof label==="object"){
      if(label.termType && label.termType==="Literal"){
         label = label.value;
      }
      else {
        label = UI.utils.label(item) 
      }
    }
    return {
      uri : item.uri,
      label : label,
      subItems : subItems
    }
  }
  export function getLabel( subject, kb ){
    let definedInSubject = kb.any(subject,ui('label'));
    if(definedInSubject) return definedInSubject;
    return kb.any(subject,getLabelTerm(subject,kb)) || UI.utils.label(subject);
  }

  /*
    1.defined by class - org:OrganizationalUnit ui:labelTerm skos:prefLabel.
    2.defined by instance - :Foo ui:labelTerm skos:prefLabel.
    ... defaults to ui:label
  */
  export function getLabelTerm( subject, kb ){
    let definedInSubject = kb.any(subject,ui('labelTerm')) ;
    if(definedInSubject) return definedInSubject;
    let classLabels = kb.match( null, ui('labelTerm'), null, null);
    for(var c of classLabels){
      let x = kb.match(subject,rdf('type'),c.subject );
      if(x) return c.object; 
    }
  }
  export function getInverseValue( subject, kb ){
    let definedInSubject = kb.any(subject,ui('inverse')) ;
    if(definedInSubject) return definedInSubject;
    let classLabels = kb.match( null, ui('inverse'), null, null);
    for(var c of classLabels){
      let x = kb.match(subject,rdf('type'),c.subject );
      if(x.length && x.length>0) return c.object; 
    }
  }
  export function getMemberTerm( subject, kb ){
    let definedInSubject = kb.any(subject,ui('memberTerm')) ;
    if(definedInSubject) return definedInSubject;
    let definedInClass = kb.match( null, ui('memberTerm'), null, null);
    for(var c of definedInClass){
      let x = kb.match(subject,rdf('type'),c.subject );
      if(x) { 
        return c.object; 
      }
    }
    return ui('parts');
  }

