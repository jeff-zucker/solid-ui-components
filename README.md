# Solid UIX

- generate high level HTML widgets from RDF data

## Overview

This library aims to support creating tabs, menus, tables, lists and other widgets directly from RDF.  It can be used dynamically in browser-based apps or can be run on the command line to create static HTML pages.  It is basically a front-end for the solid-ui library which allows you to use the powerful widgets of the SolidOS databrowser in your own apps without the complexity of the full SolidOS stack.

Please check out the [online demo](TBD).

## A Simple Example of the Tabs Component

1. Create tabs.ttl
```turtle
@prefix : <#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix schema: <http://schema.org/> .

:TabSet :hasTabs ( :Tab1 :Tab2 ) .
:Tab1 rdfs:label "Home";  schema:url <https://example.org/home> .
:Tab2 rdfs:label "Work";  schema:url <https://example.org/work> .
```
2. Create tabs.html
```html
  <div class = "solid-ui-tabs"
       data-source = "tabs.ttl"
       data-selectedTab = 4
  ></div>
  <script src="../solid-ui/lib/webpack-bundle.js"></script>
  <script src="./solid-ui-components.js"></script>
```


