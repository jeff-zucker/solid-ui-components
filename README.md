# Solid UIX

- generate high level HTML widgets from RDF data

**WORK-IN-PROGRES** - not ready for use yet

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
  <div class = "solid-ui-tabs" data-source = "tabs.ttl"></div>
  <script src="../node_modules/solid-ui/lib/webpack-bundle.js"></script>
  <script src="../src/solid-ui-components.js"></script>
```
3. All done.  Now when you open tabs.html it will show an interactive tabset.

@prefix : <#> .
:Tabset :hasTabs ( :T1 :T2 ) .
:T1 :label "x"; :uri <x> .
:T2 :label "y"; :uri <y> .

@prefix : <#> .
@prefix n: <http://www.w3.org/2006/vcard/ns#>.

:MyGroup a vcard:Group; vcard:hasMember :M1, :M2 .
:M1 vcard:fn "x"; :tabUri <x> .
:M2 :tabLabel "y"; :tabUri <y> .



