# Solid UI Components

**-- generate high level HTML UI components from RDF data** (work in progress)

This library supports building apps and websites from an RDF description.
Developers can specify components by combining a UI widget (menu, tabset, form, ...) with a data source used to populate the widget. The resulting components may either be inserted directly into HTML with a placeholder or called from other components.   Here is a minimal but complete working app :
```
    In demo.html  

        <div class="ui-tabset" data-souce="myTurtleDoc.ttl#MyTabs"></div>
        <script src="solid-ui"></script>
        <script src="solid-ui-components"></script>
        
    In myTurtleDoc.ttl

         @prefix : <#> .
         @prefix ui: <https://www.w3.org/ns/ui#> .

         :MyTabs a ui:Tabset; ui:dataSource ( :Home :Editors :Survey ) .
         :Home a ui:Link; ui:dataSource <home.html> .
         :Editors a ui:DescriptionList; ui:dataSource <ourTeam.ttl#Editors> . 
         :Survey a ui:Form; ui:dataSource <mySurvey.ttl#SurveyForm> .
```         
Opening demo.html should display three tabs. When the first tab is clicked,
display the contents of home.html. When the second tab is clicked, display 
a description list of the members of the :Editors group.  When the third tab
is clicked, display a solid-ui form.

### The UI widgets

The goal is to support at least the following widgets :

   * ui:Form
   * ui:Table
   * ui:DescriptionList
   * ui:Tabset
   * ui:SelectorPanel
   * ui:Menu
   * ui:Tree
   * ui:Slideshow
   * ui:Blog

Currently the first five widgets are working and the others are in progress.

### Data Sources

A ui:DataSource is anything that resolves to a membership/containment relationship.  Sources can be expressed as an RDF Collection, as a URI to an RDF Collection or list, or as a SPARQL query resulting in an RDF Collection or list. Here are some examples :

```turtle
   :MyMenu a ui:Menu; ui:dataSource ( :M1 :M2 :M3 ) .
   :MyTabset a ui:Tabset; ui:dataSource <http://examle.com/#Editors> .
   :MyResults a ui:Table; ui:dataSource [ ui:endpoint <x>; ui:query """y""" ] .
```                                  
When only a single page is to be displayed, the data source may be a simple URI
```turtle.
   :MyPage1 a ui:Link; ui:dataSource <foo.html> .
```

### Customizing Data Sources

In the case where the data source is an RDF subject, we need a way to find the subject's members.  By default we look for a ui:part or ui:parts predicate and take its objects as the list of members.  However we can also define a different term for the membership relation or specify an inverse membership style.                                                                               
For example, these are all the same thing as far as solid-ui-components is concerned:
```turtle
  a) :Editors ui:part :X, :Y .
  b) :Editors ui:memberTerm org:hasMember; org:hasMember :X, :Y.
  c) :Editors ui:inverse true. :X ui:partOf :Editors. :Y ui:partOf :Editors.  
```

This one is the same except that it guarantees the order of the members:

```turtle
    d) :Editors ui:parts (:X :Y).
```

Similarly, we may need to adjust some other ontology terms  
  
  * **ui:labelTerm** - term to indicate label, e.g. rdfs:label or dc:title     
  * **ui:linkTerm** - term for links, e.g. schema:url or bookm:recalls         
  * **ui:descriptionTerm** - term for a blog text field e.g. rdfs:comment or schema:description
  * **ui:authorTerm** -- term for the author of a post
  * **ui:dateTerm** -- term for the publish date of a post

The last three terms will be useful for building blogs - it means that we can orgainize the blog as a series of RSS items, as ActivityPub or Schema articles, or any other ontology which has the basic building blocks of short posts.

### Other predicates

Finally, there are some predicates that customize widgets:

  * **ui:orientation** - placement
  * **ui:backgroundColor** -- background color
  * **ui:selected** -- selected item e.g. initally opened tab

copyright &copy; Jeff Zucker 2021, may be freely distributed under an MIT license.