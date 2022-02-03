export class Sparql {

  async rdflibQuery(kb,endpoint,queryString){
    await this.loadUnlessLoaded(endpoint);
    return new Promise(async (resolve,reject)=>{
      try {
        const preparedQuery=await $rdf.SPARQLToQuery(queryString,false,kb);
        let wanted = preparedQuery.vars.map( stm=>stm.label );
        let table = [];
        kb.query(preparedQuery, (results)=>{
          let row = {};
          for(let r in results){
            let rmunged = r.replace(/^\?/,'');
            if( wanted.includes(rmunged) ){
              row[rmunged] = results[r].value;
            }
          }
          table.push(row);
          table = table.sort((a,b)=>a.label > b.label ?1 :-1);
          resolve(table)
        })
      }
      catch(e) { console.log(e); resolve() }
    })
  }

  async  comunicaQuery(endpoint,sparqlStr){
   try {
    let comunica = Comunica.newEngine() ;
    function munge(x){
       return x ? x.replace(/^"/,'').replace(/"[^"]*$/,'') :"";
    }
    let result = await comunica.query(sparqlStr,{sources:[endpoint]}) ;
    let wanted = result.variables;
    result = await result.bindings()
    let table = [];
    let hash = {};
    for(let e of result.entries()) {
      if( !e[1] ||  !e[1]._root || !e[1]._root.entries ) continue;
      e = e[1]._root.entries
      let row = {} ;
      for(let i in e){
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

