import {CU} from    '../utils.js';

/*
 *  myFeed = new Feed(solidUI,feedUri)
 *
 *  feedSelector()
 *  htmlDiv = feed.items2list() which calls feed.fetchAndParse()

proxy
href || link
displayType
standAlone
label
  selBackground
  selColor
  height
  width

 */

/*

      
*/

export class Feed {


async makeFeedSelector(topTopic,targetSelector,displayArea){

  self = this;
  self.displayArea = displayArea;


  const u = new CU();
  const bookm = UI.rdf.Namespace("http://www.w3.org/2002/01/bookmark#");
  const rdfs = UI.rdf.Namespace("http://www.w3.org/2000/01/rdf-schema#");
  let targetElement = document.body;

  await u.crossLoad(topTopic);
  topTopic = UI.rdf.sym(topTopic);
  let topicNodes = UI.store.each(null,bookm('subTopicOf'),topTopic)
  let topics = [];
  for(let n of topicNodes){
     topics.push([n.value, UI.store.any(n,rdfs('label')).value]);
  }
  let onchange = async(e)=>{await collectionSelector(e)};
  let topicSelector = u.makeSelector(topics,onchange,null,null,3);
  topicSelector.id="topicSelector";
  if(targetSelector){
    targetElement = typeof targetSelector==="string" ?document.querySelector(targetSelector) :targetSelector;
    targetElement.innerHTML="";
    let c = u.newElement('DIV','collectionHolder') ;
    let i = u.newElement('DIV','itemSelector') ;
    targetElement.appendChild(topicSelector);
    targetElement.appendChild(c);
    targetElement.appendChild(i);
    await collectionSelector(topics[0][0],targetElement);
  }
  let selectors = targetElement.querySelectorAll('#feedMenu select')
  for(let s of selectors){
    s.style="display:block; width:100%;  padding:0.5rem; margin-bottom:1rem; border-radious:0.02rem;";
  }
//  return topicSelector;

  async function collectionSelector(topTopic,targetElement){
    if(typeof topTopic === "string") topTopic = UI.rdf.sym(topTopic);
    await u.crossLoad(topTopic);
    let topicNodes = UI.store.each(null,bookm('hasTopic'),topTopic)
    let collections = [];
    for(let n of topicNodes){
       let href = UI.store.any(n,bookm('recalls')).value;
       let label = UI.store.any(n,rdfs('label')).value;
       collections.push([href,label]);
    }
    let onchange = async(e)=>{
       await itemSelector(e)
    };
    let colSelector = await u.makeSelector(collections,onchange,null,null,7);
    colSelector.id="collectionSelector";
    let el = (targetElement||document).querySelector('#collectionHolder');
    el.innerHTML="";
    el.appendChild(colSelector);
    let selectors = el.querySelectorAll('#feedMenu select')
    for(let s of selectors){
      s.style="display:block; width:100%;  padding:0.5rem; margin-bottom:1rem; border-radious:0.02rem;";
    }
    await itemSelector(collections[0][0]);
  }

  async function itemSelector(topTopic){
    let elm = document.getElementById('itemSelector');
    elm.innerHTML="";
    elm.appendChild( await self.items2list({href:topTopic})  );
    return;
    if(typeof topTopic === "string") topTopic = UI.rdf.sym(topTopic);
    await u.crossLoad(topTopic);
    let topicNodes = UI.store.each(null,bookm('hasTopic'),topTopic)
    let collections = [];
    for(let n of topicNodes){
       let href = UI.store.any(n,bookm('recalls')).value;
       let label = UI.store.any(n,rdfs('label')).value;
       collections.push([href,label]);
    }
    let onchange = async(e)=>{await itemDisplay(e)};
    let colSelector = await u.makeSelector(collections,onchange,wanted,targetSelector);
    let el = document.querySelector(targetSelector);
    el.appendChild(colSelector);
    await itemSelector(collections[0][0],wanted,targetSelector);
  }

}

  async fetchAndParse(feedUri,proxy){

    // fetch feed URI & parse into a Dom structure
    //
    proxy = typeof proxy==="undefined" ?"https://solidcommunity.net/proxy?uri=" :proxy;
    feedUri = proxy + encodeURI( feedUri );

    let response = await fetch( feedUri )
    let feedContent = await response.text();
    const domParser = new window.DOMParser();
    let feedDom = domParser.parseFromString(feedContent, "text/xml")

    // find items (RSS) or entries (Atom)
    //
    let items = feedDom.querySelectorAll("item") || null;
    items = items.length<1 ?feedDom.querySelectorAll("entry") :items;

    // parse items
    //
    let parsedItems=[];
    items.forEach( el => {

      // find item link, account for specific kinds of quirks
      //
      let link = el.querySelector("link").innerHTML;
      // vox
      if(!link) link = el.querySelector('link').getAttribute('href');
      // reddit
      if(!link || link.match(/ /)){
        link = el.querySelector('content').innerHTML.replace(/.*\[link\]/ ,'').replace(/a href="/,'').replace(/"&gt;.*/,'').replace(/.*&lt;/,'');
      }
      // engadget
      if(!link.match(/^http/)) link = link.replace(/.*\[CDATA\[/,'').replace(/\]\]\>$/,'');

      // always use https, not http
      link = link.replace(/^http:/,'https:');

      // get the title
      let title = el.querySelector("title").innerHTML;
      title = title.replace(/^\<\!\[CDATA\[/,'');
      title = title.replace(/\]\].*\>/,'').trim();

      parsedItems.push({title,link});
    });
    return parsedItems;
  }  // END OF fetchAndParse()


  async items2list(json,solidUI){
    let elm = document.getElementById('itemSelector');
    elm.innerHTML="";
    json.proxy ||= "https://solidcommunity.net/proxy?uri=";
    let items = "";
    let externalLinkIcon = UI.icons.iconBase+`/noun_189137.svg`;
    externalLinkIcon = `<img src="${externalLinkIcon}" style="width:1em;height:1em;display:inline-block; padding-left:0.4em;opacity:1">`;
    for(let i of await this.fetchAndParse((json.href||json.link),json.proxy)){
      if(json.displayTarget==="window"){
/*
        items += `
          <li about="${i.link}" typeof="rss:item">
            <a href="${i.link}" target="_BLANK" property="rss:title">
              ${i.title}
            </a>
          </li>
        `;
*/
      }
      else {
        items += `
          <li about="${i.link}" typeof="rss:item" style="display:none;background:green;border:1px solid grey;">
            <a href="${json.proxy+i.link}" target="#display" property="rss:title" style="background:#999;display:inline-block">
               ${i.title}
            </a>
            <a href="${i.link}" class="skipMunge" target="_BLANK" class="external">${externalLinkIcon}</a>
          </li>
        `;
      }
    }
    const wrapper = document.createElement('DIV');
    wrapper.property = "xmlns:rss";
    wrapper.content = "http://purl.org/rss/1.0/";
    if(json.standAlone) {
    wrapper.innerHTML = `
        <div about="${json.href}" typeof="rss:channel">
          <b property="rss:title">${json.label}</b>
          <ul typeof="rss:items" style="display:table">
            ${items}
          </ul>
        </div>
    `;

    wrapper.querySelector('B').style=`padding:1em;padding-right:0;background:${json.selBackground};color:${json.selColor};border:1px solid grey;width:100%;display:inline-block`;
    }
    else {
    wrapper.innerHTML = `
        <div about="${json.href}" typeof="rss:channel">
<!--          <div property="title" style="background:#d0d0d0;padding:1em;">${json.label}</div>-->
          <ul typeof="rss:items" style="display:table">
            ${items}
          </ul>
        </div>
    `;
    wrapper.querySelector('UL').style=`padding:0;padding-left:0;list-style:none;margin-top:0;width:100%;`;
    }
    wrapper.querySelector('UL').style=`padding:0;border:1px solid grey;list-style:none;margin-top:0;width:100%;height:${json.height};overflow-y:auto;`;
    let anchors = wrapper.querySelectorAll('A');
    for(let anchor of anchors){
      anchor.style="text-decoration:none;"
      anchor.onclick = async (e) => {
        if(e.target.parentNode.classList.contains('skipMunge')) return;
        e.preventDefault();
        let iframe = document.createElement('IFRAME');
        iframe.style="height:100%;width:100%;border:none";
        let  uri = e.target.href
        let r = await window.fetch(uri);
        let content = await r.text();        
        content = content.replace(/X-Frame-Options/g,'');
        uri = uri.replace(/^.*proxy\?uri=/,'');
        uri = new URL(uri);
        const b = `<base href="${uri.origin}/"><base target="_BLANK"><style>body{background:white !important}</style>`;
        iframe.srcdoc = `<body>${b}${content}</body>`
        iframe.scrollTo({ top: 0, behavior: "smooth" });
        let area = document.querySelector(self.displayArea);
        area.innerHTML = "";
        area.appendChild(iframe);        
      }
    }
    let listItems = wrapper.querySelectorAll('LI');
    for(let li of listItems){
      li.style="padding:0.5em;border-bottom:1px solid grey";
    }
    if(json.width) wrapper.style.width = json.width;
    return wrapper;
  }
}

  async function initFeeds(){
    let elms = document.querySelectorAll('[data-suicFeedMenu]');
    for(let e of elms){
      let topTopic = e.dataset.suicfeedmenu;
      if(topTopic.startsWith('/')) topTopic = window.origin + topTopic;
      let displayArea = e.dataset.display;
      let menuArea = '#' + e.id;
      const myFeed = new Feed();
      await myFeed.makeFeedSelector(topTopic,menuArea,displayArea);
    }
  }
  initFeeds();
