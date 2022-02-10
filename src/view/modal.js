export class Modal {
  async render (solidUI,json) {
    const modal = document.createElement('SPAN');
    const s = _getCSS(json);
    modal.innerHTML = `
      <button style="${s['button']}" onclick="window.openModal(this)">
        ${json.label}
      </button>
      <div style="${s['.modal']}">
        <div style="${s['.modal-content']}">
          <div style="${s['.close']}" onclick="window.closeModal(this)">
            &times;
          </div>
          ${json.content}
        </div>
      </div>
    `;
    return await solidUI.initInternal(modal);  
  }
}
  function _getCSS(current){
    return {
    "button": `
      background-color:${current.unselBackground};
      color:${current.unselColor};
      padding:1rem;
      cursor:pointer;
    `,
    ".modal": `
      display: none; /* Hidden by default */
      position: fixed; /* Stay in place */
      z-index: 1; /* Sit on top */
      left: 0;
      top: 0;
      width: 100%; /* Full width */
      height: 100%; /* Full height */
      overflow: auto; /* Enable scroll if needed */
      background-color: rgb(0,0,0); /* Fallback color */
      background-color: rgba(0,0,0,0.2); /* Black w/ opacity */
    `,
    ".modal-content": `
      background-color: #fefefe;
      margin: 15% auto; /* 15% from the top and centered */
      padding: 1rem;
      border: 1px solid #888;
      border-radius:0.5rem;
      width: ${current.width};
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
