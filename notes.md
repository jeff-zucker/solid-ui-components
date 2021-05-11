* Display an RDF group as a set of tabs
```turtle
    [] a ui:Link; ui:dataSource <foo.ttl#MyGroup> ;  ui:transform "tabset" .
```
* Display results of a SPARQL query as an HTML table
```turtle
    [] a ui:Link; ui:dataSource <endPoint> ;  ui:query "SELECT ..."; ui:transform "table" .
```
* Display a markdown file converted to HTML
```turtle
    [] a ui:Link; ui:dataSource <foo.md> ;  ui:transform "markdown" .
```
* Display files with syntax highlighting
```turtle
    [] a ui:Link; ui:dataSource <foo.ttl> ;  ui:transform "highlight-turtle" .
    [] a ui:Link; ui:dataSource <bar.html> ;  ui:transform "highlight-html" .
    [] a ui:Link; ui:dataSource <baz.xyz> ;  ui:transform "highlight" . # guesses langauge if not specified
```

<#MyTabs> a ui:Tabset; dataSource <foo.ttl#MyGroup> .
<#MyTabs> a ui:Link; ui:transform "tabset"; dataSource <foo.ttl#MyGroup> .
