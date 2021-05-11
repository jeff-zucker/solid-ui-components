# Solid-UI-Components

The basic idea : turn groups of things into widgets.  Groups can be people in a team, pages in a website, or anything which has a membership/containment relatationship and is stored as RDF. The widget can be a a set of tabs, a dropdown menu, a description list, or other UI component.  

Links in widgets can go to other widgets, thus supporting the use of RDF to define the complete interface of an app or site.  Here's the interface for this demo.  See the CodeMenu tab for the complete code

```turtle
:MainTabset
  a ui:Tabset ;
  ui:dataSource ( 
    :Home :Administrators :Editors :Creators :CodeMenu :Presentation
  ) .

:CodeMenu
  a ui:Tabset ;
  ui:orientation 1 ;
  ui:backgroundColor "#6699ff" ;
  ui:dataSource (
    [ ui:label "demo.html" ; a ui:Preformat ; ui:dataSource &lt;demo.html> ] 
    [ ui:label "ui.ttl" ; a ui:Link; ui:dataSource &lt;ui.ttl> ] 
    [ ui:label "source.ttl" ; a ui:Link; ui:dataSource &lt;source.ttl> ] 
  ) .
```

