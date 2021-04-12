# Solid UI Components

-- generate high level HTML widgets from RDF data (Work in Progress)

This library supports building apps and websites from an RDF description using a proposed expanded version of the solid-ui ontology.  You can use RDF to define a group of things and to specify a UI widget to display the things, then insert the widget into a web page with a brief HTML component.  Here is a minimal but complete working app :
```
    In demo.html  
        <div class="ui-tabset" data-souce="myTurtleDoc.ttl#MyTabs"></div>
        <script src="solid-ui"></script>
        <script src="solid-ui-components"></script>
        
    In myTurtleDoc.ttl
         @prefix : <#> .
         @prefix ui: <https://www.w3.org/ns/ui#> .
         :MyTabs ui:tabset ( :Home :Editors :Survey ) .
         :Home ui:link <home.html> .
         :Editors ui:descriptionList <ourTeam.ttl#Editors> . 
         :Survey ui:form <mySurvey.ttl#SurveyForm> .
```         
Opening demo.html should display three tabs. When the first tab is clicked,
display the contents of home.html. When the second tab is clicked, display 
a description list of the members of the :Editors group.  When the third tab
is clicked, display a solid-ui form.

Each component has actions associated with it in the RDF.  So in addition to opening a web page, links from components may open other components directly from the RDF.  You many have multiple components in a page or you can have a main component such as a dropdown menu with all other components defined in the RDF specified actions for that menu.  

### Predicates to display groups

Developers can specify how a group should be dislayed using the following predicates :

   * **ui:form**
   * **ui:table**
   * **ui:descriptionList**
   * **ui:tabset**
   * **ui:menu**
   * **ui:tree**
   * **ui:slideshow**
   * **ui:blog**

A group, in the current context, is any RDF subject which has a membership/containment relationship with one or more objects.  Groups can be expressed as an RDF Collection, as a URI to an RDF Collection or list, or as a SPARQL query resulting in an RDF Collection or list. Here are some examples :

```turtle
   :MyMenu ui:menu ( :M1 :M2 :M3 ) .
   :MyTabset ui:tabset <http://examle.com/#Editors> .
   :MyResults ui:table [ ui:endpoint <x>; ui:query """y""" ] .
```                                  

If we declare a tabset with these items, when we click on the tab for :MyResults, we will see a table of the data from the specified query.

### Predicates to display single items

When only a single page is to be displayed, use one of these predicates :

   * **ui:link** - a web page to open                                
   * **ui:preformat** - a page to open and display as preformatted text

```turtle
   :MyPage ui:link <http://example.com/my.html> .
   :MyPage ui:preformat <http://example.com/my.html> .
```                                  

### Predicates to handle diverse ontologies                                    
                                                                               
By default, we use ui:parts, and ui:part to find members in a group. 
For other ontologies, we need to define an alternate membership term
and possibly set ui:inverse to true if the group has a "partOf" relationship.

  * **ui:memberTerm** - term to indicate group membership, e.g. vcard:hasMember
  * **ui:inverse** - if true, looks for memberOf relationship rather than default hasMember                                           

For example, these are all the same thing as far as solid-ui-components is concerned:
```turtle
  a) :Editors ui:part :X, :Y .
  b) :Editors ui:memberTerm org:hasMember; org:hasMember :X, :Y.
  c) :Editors ui:inverse true. :X ui:partOf :Editors. :Y ui:partOf :Editors.  
```

This one is the same except that it guarantees the order of the members:

```turtle
    d) :Editors ui:parts (:X, :Y).
```

Similarly, we may need to adjust some other ontology terms  
  
  * **ui:labelTerm** - term to indicate label, e.g. rdfs:label or dc:title     
  * **ui:linkTerm** - term for links, e.g. schema:url or bookm:recalls         
  * **ui:descriptionTerm** - term for a blog text field e.g. rdfs:comment or schema:description
  * **ui:authorTerm** -- term for the author of a post
  * **ui:dateTerm** -- term for the publish date of a post

### Other predicates

Finally, there are some predicates that customize widgets:

  * **ui:orientation** - placement
  * **ui:backgroundColor** -- background color
  * **ui:selected** -- selected item e.g. initally opened tab

### Classes

A class for queries.

  * Class : **ui:SparqlQuery**
      * property : **ui:endpoint** - a SPARQL endpoint
      * property : **ui:query** - a SPARQL query

### Current Status

I have a working demo but I'd like to get feedback on the ontology proposals before proceeding further. 

copyright &copy; Jeff Zucker 2021, may be freely distributed under an MIT license.