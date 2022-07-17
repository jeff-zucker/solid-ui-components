export class BookmarkTree {

  constructor(){
    this.store = UI.rdf.graph();
    this.fetcher = UI.rdf.fetcher(this.store);
  }
  async init(){
    for(let containerElm of document.getElementsByClassName('ocb')){
      let subject = containerElm.dataset.component
      this.bookmarksDisplay = containerElm.dataset.display
      try {
        subject = await this.loadUnlessLoaded(subject)
        containerElm = containerElm.appendChild(document.createElement('UL') )
        await this.getTopic(subject,containerElm,this.bookmarksDisplay,'start')
        document.getElementById('ocbStart').click();
      }
      catch(e){ alert(e) }
    }
  }
  async getTopic(topic,containingElement,bookmarksDisplay,start){
    const self=this
    if(typeof containingElement==="string") containingElement = document.querySelector(containingElement);
    bookmarksDisplay ||= containingElement.dataset.display;
    this.bookmarksDisplay ||= bookmarksDisplay;

    let book = UI.rdf.Namespace("http://www.w3.org/2002/01/bookmark#")
    const rdf= UI.rdf.Namespace('http://www.w3.org/2000/01/rdf-schema#')
    const rdfs=UI.rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
    const ui=UI.rdf.Namespace('http://www.w3.org/ns/ui#');

    topic = await this.loadUnlessLoaded(topic);
    let topicTitle = this.store.any( topic, rdf('label'),null,topic.doc() )
    topicTitle = (typeof topicTitle ==="undefined") ? "???" : topicTitle.value
    let span = document.createElement('SPAN')
    span.appendChild(document.createTextNode(topicTitle))
    span.classList.add('caret')
    span.addEventListener("click", function() {
      let elm = this.parentElement.querySelector(".nested")
      if(elm) elm.classList.toggle("active");
      this.classList.toggle("caret-down");
    });
    let li = document.createElement('LI')
    if(start){
      span.id = "ocbStart";
//      containingElement.appendChild(span)
    }
//    else {
      li.appendChild(span)
      containingElement.appendChild(li)
//    }
    let subTopics  = this.store.each( null, book('subTopicOf'), topic )
    if(subTopics.length>0){
      let ul = document.createElement('UL')
      ul.classList.add('nested')
      li.appendChild(ul)
      for(let t in subTopics){
        this.getTopic(subTopics[t],ul)
      }
    }
    else {
      let bookmarks = this.store.each( null, book('hasTopic'), topic )
      let ul2 = document.createElement('UL')
      ul2.classList.add('nested')
      for(let b in bookmarks){
        let bookmark = bookmarks[b]
        let  bookmarkTitle = this.store.any( bookmark, rdf('label'),null,topic.doc() )
        let isFeed=(this.store.match(bookmark,rdfs('type'),ui('Feed'))).length;
        bookmarkTitle = bookmarkTitle ? bookmarkTitle.value : "???"
        let bookmarkLink  = this.store.any( bookmark, book('recalls'),null,topic.doc() )
        let bookElement = document.createElement("LI")
        if(isFeed) bookElement.classList.add('caret')
        else bookElement.classList.add('item')
        if(isFeed){
          bookElement.addEventListener("click", async function() {
            alert("Feed Me!");
          });
        }
        else {
          bookElement.addEventListener("click", async function() {
            document.querySelector(self.bookmarksDisplay).innerHTML=`<iframe src="${bookmarkLink.uri}"></iframe>`;
          });
        }
        bookElement.appendChild(document.createTextNode(bookmarkTitle))
        let d = document.createElement('DIV')
        d.classList.add('closed')
        bookElement.appendChild(d)
        ul2.appendChild(bookElement)
      }
      li.appendChild(ul2)
    }
  }
  async loadUnlessLoaded(subject){
    try {
      const base = document.location.href.replace(/\/[^\/]*$/,'/')
      subject  = (typeof subject==="string") ? subject : subject.uri
      subject = subject.match('//') ? subject : base + subject
      subject  = UI.rdf.sym(subject)
      if(subject.termType==='BlankNode') return subject
      if(!this.store.any(null,null,null,subject.doc())) 
        await this.fetcher.load(subject)
    }
    catch(e) { alert(e) }
    return subject
  }
}

/*
window.addEventListener('DOMContentLoaded', async (event) => {
  const ocb = new BookmarkTree()
  ocb.init()
})
*/
