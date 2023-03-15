data-renew
  always - performs the query every time // the default
  never  - always uses cached results
  daily  - re-runs the query if cached results are older than 24 hours

data-replace
  <div data-suic="myQueryLibrary.ttl#ContainerSearch"
       data-replace="endpoint:https://solidos.solidcommunity.net/public/";
  ></div>

## Embedding Query Results in an HTML Page

Once you have created and stored a SPARQL query component (see below), you can embed it in a web page using the Solid UI Components (SUIC) framework.  This example would look in the "myQueries.ttl" document for the stored query named "ContainerSearch".  The stored query would contain the query, its endpoint, and a specifier for a display format, e.g. an HTML table.  The table will be displayed in the div on page load:

  <div data-suic="./myQueryLibrary.ttl#ContainerSearch"></div>

data-suic attribute and also optionally specify , data-renrew, data-replace, and data-display attributes.

* **data-suic** : the suic (Solid UI Component) for a SPARQL query can be specified using the library name and the component name e.g. this uses the "ContainerSearch" query in the "myQueryLibrary.ttl" library. The library address may be either absolute or relative.


This will perform the query, format it as specified in the component and place the results inside the div.


*SPARQL Fiddle* supports creating, testing, storing, embeding, reusing, and sharing SPARQL queries using a variety of built-in and custom display formats .

### Embedding 
You can directly embed a query in an HTML page like so :

  <div data-endpoint="https://solidproject.solidcommunity.net/public"
       data-template="ui:Table"
       data-query="PREFIX ldp: <http://www.w3.org/ns/ldp#>                                   
      PREFIX stat: <http://www.w3.org/ns/posix/stat#>                           
      SELECT ?File ?Size ?Mtime WHERE {                                         
          ?container ldp:contains ?File.                                        
          ?File stat:size ?Size; stat:mtime ?Mtime.                             
      }  

       
  ></div>
  