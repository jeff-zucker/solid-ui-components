# Notes on UI ontology needs of Solid UI Components

* Classes
  * ui:Component
    * ui:Form
    * ui:DataSource
      * ui:SparqlQuery
      * ui:Collection
      * ui:Link
      * ui:Container
      * ui:Feed
    * ui:Template
      * ui:AppTemplate
      * ui:AccordionTemplate
      * ui:TableTemplate
      * ui:SlideshowTemplate
      * ui:ModalTemplate
      * ui:MenuTemplate
      * ui:TabsetTemplate
* Properties
    * Domain ui:Component
      * ui:template
      * ui:dataSource
    * Domain ui:Form
      * ui:dataSource  (the Form subject)
      * ui:template    (the From field definitions)
      * ui:results     (where to place results  if different from subject)
    * Domain ui:Template
      * ui:before (top of template pattern)
      * ui:recurring (recurring portion of template pattern)
      * ui:after (bottom portion of template pattern)
    * Domain ui:AppTemplate
      * ui:logo
      * ui:title
      * ui:menu
      * ui:stylesheet
      * ui:initialContent
    * Domain ui:SlideshowTemplate
      * ui:delay
      * ui:autoplay
    * Domain ui:Collection
      * ui:parts (x y z) where x/y/z are any ui:Component   
    * Domain ui:SparqlQuery
      * ui:endpoint (can be multiple)
      * ui:query  
    * Domain ui:Link
      * ui:content (use instead of href for direct inclusion of content)
      * ui:href
      * ui:acceptType [a media-type]
      * ui:outputFormat [a media-type] (e.g. to display markdown as HTML or HTML as text/plain)
      * ui:needsProxy
      * ui:canBeIframed

These existing properties may be used on most components
    ui:label, ui:background, ui:color, ui:orientation, ui:position, ui:height, ui:width
