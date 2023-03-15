  /*
     const results = runQuery({
       ?template : String|Null,
       ?displayArea : String|Null,
       endpoint : String,
       query : String
     });

     Note : If template is provided, results will be an HTMLElement, else an array.
     Note : If template and displayArea are provided, the displayArea will be populated
     with the template interpolated with the results.
     
  */

export async function runQuery(options){
   const sparql = new Sparql();
   let results = await sparql.sparqlQuery(options.endpoint,options.query);
   options.template ||= 'ui:Table';
   results = await solidUI.processTemplate(options.template,results);
   if(options.displayArea){
     const d = (typeof options.displayArea==="string") ?document.querySelector(options.displayArea) :options.displayArea;
     d.innerHTML="";
     d.appendChild(results);
   }
   return results;
}

export class Sparql {

  async sparqlQuery(endpoint,queryString,forceReload){
    if( endpoint.startsWith('/') ){
      endpoint = window.origin + endpoint;
    }
    else if( endpoint.startsWith('./') ){
      let loc = window.location.href;
      endpoint = loc.replace(/\/[^\/]*$/,'') + endpoint.replace(/^\./,'');
    }
    if(typeof Comunica !="undefined")
      return await this.comunicaQuery(endpoint,queryString,forceReload);
    else   
      return await this.rdflibQuery(endpoint,queryString,forceReload);  
  }

  async rdflibQuery(endpoint,queryString,forceReload){
/*
    kb = UI.store
    const fetcher = UI.store.fetcher;
*/
    const kb = UI.rdf.graph();
    const fetcher = UI.rdf.fetcher(kb);
    await kb.fetcher.load(endpoint);
    try {
      const preparedQuery=await UI.rdf.SPARQLToQuery(queryString,false,kb);
      let wanted = preparedQuery.vars.map( stm=>stm.label );
      let table = [];
      let results = kb.querySync(preparedQuery);
      for(let r of results){
        let row = {};
        for(let w of wanted){
          let value = r['?'+w];
          row[w] = value ?value.value :"";
        }
        table.push(row);
      }
      table = table.sort((a,b)=>a.label > b.label ?1 :-1);
      return table
    }
    catch(e) { console.log(e); }
  }

  async  comunicaQuery(endpoint,sparqlStr,forceReload){
   try {
    let comunica = Comunica.newEngine() ;
    if(forceReload) comunica.invalidateHttpCache();
    function munge(x){
       return x ? x.replace(/^"/,'').replace(/"[^"]*$/,'') :"";
    }
    let result;
    let r = await UI.store.fetcher.webOperation('GET',endpoint);
    if(!r.ok) { alert(r.statusText); return; }
    try { result = await comunica.query(sparqlStr,{sources:[endpoint]}) ; }
    catch(e){alert(e); return};
    let wanted = result.variables;
    result = await result.bindings()
    let table = [];
    let hash = {};
    for(let e of result.entries()) {
      if( !e[1] ||  !e[1]._root || !e[1]._root.entries ) continue;
      e = e[1]._root.entries
      let row = {} ;
      for(let i in e.reverse()){
        let key = munge( e[i][0].replace(/^\?/,''))
        row[key] = row[key] || "";
        let value = munge(e[i][1].id)
        if( typeof row[key] != 'ARRAY' ) row[key]= [row[key]]
        if( typeof row[key] === "ARRAY" ) row[key].push(value)
        else row[key] = value;
      }
      // include keys even for empty values
      for(let key of wanted){
        key = key.replace(/^\?/,'');
        row[key] = row[key] || ""
      }
      table.push(row);
    }
    if(!table.length) console.log('No results!');
    return table;
   }
   catch(e){console.log(e)}
  }
flatten(results,groupOn){
  const newResults = {};
  for(let row of results) {
    let key = row[groupOn];
    if(!newResults[key]) newResults[key]={};
    for(let k of Object.keys(row)){
      if(!newResults[key][k]) {
        newResults[key][k]=row[k];
        continue;
      }  
      if(newResults[key][k].includes(row[k])) continue;
      if(typeof newResults[key][k]!="object") newResults[key][k]=[newResults[key][k]]
      newResults[key][k].push(row[k])
    }
  }
  results = [];
  for(let n of Object.keys(newResults)){
    results.push(newResults[n])
  }
  return results;
} 

} // class Sparql  

