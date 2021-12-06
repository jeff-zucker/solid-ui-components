# Solid UI Components - WiP

Use RDF to create data-driven apps, web pages, and user interfaces

This is a *Work in Progress*.  It works fine but I have not finalized the ontology, cleaned the code or re-added things like forms which worked in a previous version.

Please see this [demo](https://jeff-zucker.github.io/solid-ui-components/demo.html) for simple examples and [this website](https://jeff-zucker.solidcommunity.net/sp/) for a website that is entirely built using this library.

## Prerequisites

You need to include mashlib and comunica in your HTML. The easiest way is using CDNs.  See the sample.html.

## Overview

A *Component* combines a way to get data (a *DataSource*) with a way to display it (a *Template*).
```turtle
<#MyMenu>
  a ui:Component ;
  ui:dataSource [a ui:DataSource] ;
  ui:template [a ui:Template] .
```
There are built in templates for many common interactive user interface widgets - menus, tabs, accordions, tables, with slideshows, forms, and more coming soon. For built-in templates, you can simply name the template and optionally use template predicates (see below) to customize the template.
```
<#MyBuiltInTemplate>
  a ui:MenuTemplate ;
  ui:orientation "horizontal" ;
  ui:position "right" .
```
You can also create any template you'd like using Javascript template strings.   For example this would create a list, populating each item with a row of data from the dataSource.
```
<#MyCustomTemplate>
  a ui:Template;
  ui:before "<ul>" ;
  ui:recurring "<li>${data_from_query}</li>" ;
  ui:after "</ul>" .
```
There are three basic kinds of DataSources - SparqlQuery, Collection, and Link.
```
<#MySparqlDataSource>
  a ui:SparqlQuery ;
  endpoint <MyEndpoint-Can-be-Multiple> ;
  query """My SPARQL Query String""" .

<#MyCollectionDataSource>
  a ui:Collection ;
  ui:parts ( <#A> <#B> <#C> ) .

<#MyLinkDataSource>
  a ui:Link ;
  ui:label "MyLabel" ;
  ui:acceptFormat "application/json" ;
  ui:href <URL> .
```
Components may be included anywhere in a web page like so:
```html
Stuff Before
  <div data-solid_uic="myRDF.ttl#myComponent"></div>
Stuff After
```
Coponents can call other components, so it's quite possible to have an entire site or app generated from a single HTML insert.  While the components can make use of Javascript you supply, no coding is necessary - the components have interactivity built in.

Components can also be included as a library and called from a script.  For example, this returns a fully active DOM element.
```Javascript
const element = await solidUIC.processComponent('component-URL');
```
You can now walk the DOM tree of the element or insert it into a page.

&copy; Jeff Zucker, 2021 all rights reserved; May be freely distributed under an MIT license.
