/*
  mediaList()
  mediaItem()
  _fillMediaTemplate()
*/

export async function mediaList(options){
  const elm = document.createElement('SPAN');
  for(let track of options.parts){
    options.id = track.id;
    elm.appendChild( await mediaItem(options) );
  }
  return elm;
}

export async function mediaItem(options){
  options.orientation ||= options.contentArea.dataset.orientation;
  options.compact ||= 1;
  if(options.includeMetadata || options.contentArea.dataset.includemetadata){options.compact=0};
  options.allowDownload ||= options.contentArea.dataset.allowdownload;
  let subject = UI.rdf.sym(options.id);
  await UI.store.fetcher.load(subject);
  let item = _getItemFromStore(subject);
  item. vertical = document.body.offsetWidth<750 || options.orientation==1;
  item.isVideo = false;
  let types = UI.store.match(subject,UI.ns.rdf('type'));
  for(let t of types){
    if(t.object.value.match(/video/i)) item.isVideo =true;
  }
  return(_fillMediaTemplate(item,options) );
}

function _getItemFromStore(subject){
  return({
    byArtist : (UI.store.any(subject,UI.ns.schema('byArtist'))||{}).value,
    encoding : (UI.store.any(subject,UI.ns.schema('encoding'))||{}).value,
    image : (UI.store.any(subject,UI.ns.schema('image'))||{}).value,
    description : (UI.store.any(subject,UI.ns.schema('description'))||{}).value,
   country : (UI.store.any(subject,UI.ns.schema('countryOfOrigin'))||{}).value,
  });
}

function _fillMediaTemplate(i,options){
  let table = document.createElement('DIV');
  i.download = options.allowDownload ?"" :`controlslist="nodownload"`;
  if(i.vertical){
    i.align ="center";
    i.width="310px";
    i.audioWidth="272px !important";
    i.imageStyle = "width:272px;margin-top:0.5rem;margin-bottom:0.4rem;";
  }
  else {
    i.audioWidth="272px !important";
    i.imageStyle = "height:180px;float:left;margin-right:1rem;margin-top:0.5rem;";
    i.width = "590px";
    i.align ="left";
  }
  if(i.isVideo){
    i.audio = "";
    i.visual = `<iframe height="200" src="${i.encoding}" title="YouTube video player" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="float:left;margin:1rem;margin-left:0;margin-bottom:0;"></iframe>`;
  }
  else {
   i.visual = `<img src="${i.image}" style="${i.imageStyle}">`;
   i.audio = `<audio title="${i.byArtist}" controls ${i.download} preload="metadata" style="width:${i.audioWidth}"><source src="${i.encoding}" type="audio/mpeg"></audio>`
  }
  if(options.compact) {
    let wrapper = document.createElement('SPAN');
    wrapper.innerHTML = i.isVideo ?i.visual :i.audio;
    return wrapper;
  }
    table.style = `min-height:212px; margin:0.8rem;text-align:${i.align}; padding:0.5rem; border-radius:0.5rem; background:#bb99ff; color:black; width:${i.width}`;
    table.innerHTML = `
  <div>
    <b>${i.byArtist}</b> - ${i.country}
  </div>
  ${i.visual}
  <p>${i.description}</p>
  ${i.audio}
    `;
return table;
//  else {
    table.innerHTML = `
  <tr>
    <td colspan=2>
        <b>${i.byArtist}</b> - ${i.country}
    </td>
  </tr>
  <tr>
    <th>
        <img src="${i.image}">
    </th>
    <td>
        <p>${i.description}</p>
        <audio controls controlsList="nodownload" preload="metadata">
         <source src="${i.encoding}" type="audio/mpeg">
        </audio>
    </td>
  </tr>
`;
//  }
  return table;
}
