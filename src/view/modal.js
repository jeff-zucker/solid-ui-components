export class Modal {
  async render (solidUI,json) {
    const modal = document.createElement('SPAN');
    modal.innerHTML = `
  <button style="background-color:${json.unselBackground};color:${json.unselColor};padding:1em;cursor:pointer" onclick="openModal(this)">${json.label}</button>
  <div style="display:none" class="modal">
    <div class="modal-content">
      <div class="close" onclick="closeModal(this)">&times;</div>
      ${json.content}
    </div>
  </div>
    `;
    return await solidUI.initInternal(modal);  
  }
}
