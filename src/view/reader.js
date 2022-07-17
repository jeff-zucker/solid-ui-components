export class FeedReader {
  async makeTopicSelector(options,targetSelector){
  }
}

:myFeedReader

  :topics [
    a ui:SparqlQuery ;
    ui:endpoint <feeds.ttl> ;
    ui:query """
      PREFIX schema: <http://schema.org/> 
      PREFIX ui: <http://www.w3.org/ns/ui#>
      SELECT DISTINCT ?label WHERE {
        ?x a ui:Feed; schema:about ?label .
      }
    """
  ] .

  :collections [
    a ui:SparqlQuery ;
    ui:endpoint <feeds.ttl> ;
    ui:query """
      PREFIX schema: <http://schema.org/> 
      PREFIX ui: <http://www.w3.org/ns/ui#>
      SELECT DISTINCT ?label ?href WHERE {
        ?x a ui:Feed;
           schema:about ${wantedTopic} ;
           ui:label ?label ;
           ui:href ?href .
      }
    """
  ] .
