export class Modal {
/*
<#MyModal>
  a ui:Modal ;
  ui:label           "BUTTON_LABEL" ;
  ui:unselColor      "BUTTON_COLOR" ;
  ui:unselBackground "BUTTON_BACKGROUND_COLOR" ;
  ui:width           "POPUP-BOX_WIDTH" .

Modal.render({
  label             // button label
  unselColor        // button color
  unselBackground   // button background color
  width             // popup-box width
  height            // popup-box height
  content           // popup-box content string
  iframe            // popup-box url for iframe
});
*/

  async render (o,solidUI) {
    let dom = o.dom || document;
    let modal = document.createElement('SPAN');
    if(o.targetSelector){
      modal = dom.querySelector(o.targetSelector);
    }
    const s = _getCSS(o);
    if(o.iframe){
      let iframe = document.createElement("IFRAME");
      o.content = `<iframe src="${o.iframe}" style="width:100%;height:90%;border:none"></iframe>`;
    }
    if(!o.content && o.dataSource){
      o.content = (await solidUI.processComponentSubject(o.dataSource)).outerHTML;
    }
    modal.innerHTML = `
      <button style="${o.style}" title="${o.title}" onclick="window.openModal(this)">
        ${o.label}
      </button>
      <div style="${s['.modal']}">
        <div class="suic-modal-content" style="${s['.modal-content']}">
          <div style="${s['.close']}" onclick="window.closeModal(this)">
            &times;
          </div>
          ${o.content}
        </div>
      </div>
    `;
    let button = modal.querySelector('button')
    button = solidUI.styleButton(button,o);    
    if(solidUI) modal = await solidUI.initInternal(modal);  
    if(o.contentArea) o.contentArea.appendChild(modal)
    return modal;
  }
}
  window.openModal = function (element,action){
    element.parentElement.children[1].style.display = "block" ;
  }
  window.closeModal = function (element,action){
    element.parentElement.parentElement.style.display = "none" ;
  }

  function _getCSS(current){
    return {
    "button": `
      background-color:${current.darkBackground};
      color:${current.unselColor};
      cursor:pointer;
    `,
    ".modal": `
      display: none; /* Hidden by default */
      position: fixed; /* Stay in place */
      left: 0;
      top: 0;
      overflow: auto; /* Enable scroll if needed */
      background-color: rgb(0,0,0); /* Fallback color */
      background-color: rgba(0,0,0,0.8); /* Black w/ opacity */
      width: 100%; /* Full width */
      height: 100%; /* Full height */
      z-index:20000;
      text-align:center;
    `,
    ".modal-content": `
//      background-color: #fefefe;
      background-color: ${current.lightBackground};
      margin: 5% auto; /* 15% from the top and centered */
      width:80vw;
      height:85vh;
      padding: 1rem;
      border: 1px solid #888;
      border-radius:0.5rem;
    `,
    ".close": `
      color:red;
      text-align:right;
      margin-bottom: 0.25rem;
      font-size: 2rem;
      font-weight: bold;
      cursor:pointer;
    `
    }
  }
