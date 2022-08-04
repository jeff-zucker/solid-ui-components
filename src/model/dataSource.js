export async function getDataSource(DataSource){
  if(typeof DataSource==="string") DataSource = await this.getComponentHash(DataSource);
    if(dataSource && dataSource.type==='SparqlQuery') {
      let endpoint = dataSource.endpoint;
      let query = dataSource.query.replace(/\$\{[^\}]*\}/g,'');
      json.parts = await this.sparqlQuery(endpoint,query,json);
      if(json.type==='SparqlQuery') return json.parts;
    }
    if(json.type==='SparqlQuery') {
      json.parts = await this.sparqlQuery(json.endpoint,json.query,json);
      if(json.type==='SparqlQuery') return json.parts;
    }
    if(json.type==='AnchorList') {
      for(let l of json.content.split(/\n/) ){

      }
    }
    if(json.parts && json.groupOn){
      json.parts = sparql.flatten(json.parts,json.groupOn)
      console.log(json.groupOn,json.parts)
    }
