import {CU} from    '../utils.js';
import {optionSelector} from    '../view/optionSelector.js';

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

async makeFeedSelector(topTopic,targetSelector,displayArea,o){
  self = this;
  self.displayArea = displayArea;

  const u = new CU();
  const ui = UI.rdf.Namespace("http://www.w3.org/ns/ui#");
  const skos = UI.rdf.Namespace("http://www.w3.org/2004/02/skos/core#");
  const rdf = UI.rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
  let targetElement = document.body;

  await u.crossLoad(topTopic);
  topTopic = UI.rdf.sym(topTopic);
//  let topicNodes = UI.store.each(null,bookm('subTopicOf'),topTopic)
//  let topicNodes = UI.store.each(topTopic,skos('memberList'))
//  let topicNodes = UI.store.each(topTopic,ui('feedTopicList'))
  let topicNodes = UI.store.each(null,rdf('type'),ui('FeedTopic'))
//  topicNodes = topicNodes[0].elements;
  let topics = [];
  let onchange = async(label,link,type)=>{
     await collectionSelector(link,targetSelector,o);
     document.querySelector('#collectionSelector A').style.backgroundColor=solidUI.menuBackground;
  };

//  for(let n of topicNodes){
//     topics.push([n.value, UI.store.any(n,ui('label')).value]);
//  }
//  let topicSelector = u.makeSelector(topics,onchange,null,null,3,o);
  for(let n of topicNodes){
     topics.push({link:n.value, label:UI.store.any(n,ui('label')).value,linkType:'Feed'});
  }
  let topicSelector = optionSelector({
    parts : topics,
    onchange,
    size:3,
  });
  topicSelector.id="topicSelector";
  if(targetSelector){
    targetElement = typeof targetSelector==="string" ?document.querySelector(targetSelector) :targetSelector;
    targetElement.innerHTML="";
    let c = u.newElement('DIV','collectionHolder') ;
    let i = u.newElement('DIV','itemSelector') ;
    targetElement.appendChild(topicSelector);
    targetElement.appendChild(c);
    targetElement.appendChild(i);
//    await collectionSelector(topics[0][0],targetElement,o);
    await collectionSelector(topics[0].link,targetElement,o);
  }
  let selectors = targetElement.querySelectorAll('#feedMenu select')
  for(let s of selectors){
    s.style="display:block; width:100%;  padding:0.5rem; margin-bottom:1rem; border-radious:0.02rem;";
  }
  document.querySelector('#topicSelector A').style.backgroundColor=solidUI.menuBackground;
  document.querySelector('#collectionSelector A').style.backgroundColor=solidUI.menuBackground;
  document.querySelector('#itemSelector A').style.backgroundColor=solidUI.menuHighlight;
    
  // end of makeFeedSelector main function;

  async function collectionSelector(topTopic,targetElement,o){
    if(typeof topTopic === "string") topTopic = UI.rdf.sym(topTopic);
    await u.crossLoad(topTopic);
//    let topicNodes = UI.store.each(null,bookm('hasTopic'),topTopic)
//    let topicNodes = UI.store.each(topTopic,skos('memberList'))
    let topicNodes = UI.store.each(null,skos('broader'),topTopic)
//    topicNodes = topicNodes[0].elements;
    let collections = [];
  let onchange = async(label,link,type)=>{await itemSelector(link,targetSelector,o)};
/*
    let onchange = async(e)=>{
       await itemSelector(e,targetSelector,o)
    };
    for(let n of topicNodes){
       let href = UI.store.any(n,ui('href')).value;
       let label = UI.store.any(n,ui('label')).value;
       collections.push([href,label]);
    }
    let colSelector = await makeSelector(collections,onchange,null,null,6,o);
*/
    for(let n of topicNodes){
       let link = UI.store.any(n,ui('href')).value;
       let label = UI.store.any(n,ui('label')).value;
       let linkType = 'Feed-Article';
       collections.push({link,label,linkType});
    }
  let colSelector = optionSelector({
    parts : collections,
    onchange,
    size:5,
  });
    colSelector.id="collectionSelector";
    let el = (targetElement||document).querySelector('#collectionHolder');
    el.innerHTML="";
    el.appendChild(colSelector);
    let selectors = el.querySelectorAll('#feedMenu select')
    for(let s of selectors){
      s.style="display:block; width:100%;  padding:0.5rem; margin-bottom:1rem; border-radious:0.02rem;";
    }
    let options = el.querySelectorAll('#feedMenu option')
    for(let o of options){
      o.style.fontSize = "large";
      o.style.color = json.color || solidUI.buttonColor;
      o.style.backgroundColor = json.background || solidUI.buttonBackground;
    }
//    await itemSelector(collections[0][0],o);
    await itemSelector(collections[0].link,o);
  }

  async function itemSelector(topTopic,o){
    let elm = document.getElementById('itemSelector');
    elm.innerHTML="";
    elm.appendChild( await self.items2list({href:topTopic},o)  );
  }

}

  async fetchAndParse(feedUri,proxy){

    // fetch feed URI & parse into a Dom structure
    //
//    proxy = typeof proxy==="undefined" ?window.origin+"/proxy?uri=" :proxy;
proxy = typeof proxy==="undefined" ?"https://solidcommunity.net/proxy?uri=" :proxy;
    feedUri = proxy + encodeURI( feedUri );

    let feedDom;
    try {
      let response = await fetch( feedUri );
      let feedContent = await response.text();
      const domParser = new window.DOMParser();
      feedDom = domParser.parseFromString(feedContent, "text/xml")
    }
    catch(e) { alert(e) };
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


  async items2list(json,o){

    let elm = document.getElementById('itemSelector');
    elm.style = `
      margin-top:0.5rem;
      margin-top:1rem;
      border:1px solid gray;
      border-radius:0.4rem;
      height:50vh;
      overflow-y:scroll;
      overflow-x:hidden; 
    `;
    elm.innerHTML="";
    json.proxy ||= "https://solidcommunity.net/proxy?uri=";
//    json.proxy ||= window.origin + "/proxy?uri=";
    let items = "";
    let externalLinkIcon = UI.icons.iconBase+`/noun_189137.svg`;
    externalLinkIcon = `<img src="${externalLinkIcon}" style="width:1em;height:1em;display:inline-block; padding-left:0.4em;opacity:1">`;
    for(let i of await this.fetchAndParse((json.href||json.link),json.proxy)){
      if(json.displayTarget==="window"){
/*
        items += `
          <li about="${i.link}" typeof="rss:item" style="color:${json.color||solidUI.buttonColor};background-color:${json.background||solidUI.buttonBackground};border:none !important">
            <a href="${i.link}" target="_BLANK" property="rss:title">
              ${i.title}
            </a>
          </li>
        `;
*/
      }
      else {
        items += `
          <li about="${i.link}" typeof="rss:item" style="color:${json.color||solidUI.buttonColor};background-color:${json.background||solidUI.buttonBackground}">
            <a href="${json.proxy+i.link}" target="#display" property="rss:title" style="display:inline-block;border:none !important">
               <span style="color:${o.color||solidUI.buttonColor} !important;background:${o.background||solidUI.buttonBackground};display:inline-block;font-size:large">${i.title}</span>
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
        <div about="${json.href}" typeof="rss:channel" style="color:${json.color||solidUI.buttonColor};background-color:${json.background||solidUI.buttonBackground}">
          <b property="rss:title">${json.label}</b>
          <ul typeof="rss:items" style="display:table;backgroundColor:${json.background||solidUI.buttonBackground}">
            ${items}
          </ul>
        </div>
    `;

    wrapper.querySelector('B').style=`padding:1em;padding-right:0;background:${json.background||solidUI.buttonBackground};color:${json.color||solidUI.buttonColor};border:1px solid grey;width:100%;display:inline-block`;
    }
    else {
    wrapper.innerHTML = `
        <div about="${json.href}" typeof="rss:channel" style="color:${json.color||solidUI.buttonColor};background-color:${json.background||solidUI.buttonBackground}">
<!--          <div property="title" style="background:${json.background||solidUI.buttonBackground};padding:1em;">${json.label}</div>-->
          <ul typeof="rss:items" style="display:table">
            ${items}
          </ul>
        </div>
    `;
    wrapper.querySelector('UL').style=`padding:0;padding-left:0;list-style:none;margin-top:0;width:100%;`;
    }
    wrapper.querySelector('UL').style=`padding:0;border:1px solid grey;list-style:none;margin-top:0;width:100%;height:${json.height};overflow-y:auto;`;
    let anchors = wrapper.querySelectorAll('A');
    solidUI.simulateClick(anchors[0]);
    for(let anchor of anchors){
      anchor.style="text-decoration:none;"
      anchor.fontSize="large";
      anchor.color = json.color || solidUI.buttonColor + " !important";
      anchor.onclick = async (e) => {
        if(e.target.parentNode.classList.contains('skipMunge')) return;
        e.preventDefault();
        let href = e.target.parentNode.href
        await solidUI.util.show('rss',href,self.displayArea);
        for(let an of anchors){
          if(an==anchor) an.style.backgroundColor = json.menuBackground;
          else an.style.backgroundColor = json.menuHightlight;
        }
/*
        let iframe = document.createElement('IFRAME');
        iframe.style="height:100%;width:100%;border:none";
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
*/
      }
    }
    let listItems = wrapper.querySelectorAll('LI');
    for(let li of listItems){
      li.style="padding:0.5em;border-radius:0.4em;background:${json.background||solidUI.buttonBackground}";
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
      await myFeed.makeFeedSelector(topTopic,menuArea,displayArea,);
    }
  }
  initFeeds();
