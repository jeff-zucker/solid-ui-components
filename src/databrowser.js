import {loadProfile} from './model/profile.js';

export async function applyProfile(domElement) {
  if(!domElement) return;
  let origin = window.origin;
  let me = `${origin}/profile/card#me`;
  me = await loadProfile( me );
  me.image = me.image || "";
  me.name = me.name || me.nick || me.webId;
  domElement.querySelector('#currentPodLogo').src = me.image;
  domElement.querySelector('#currentPodTitle').innerHTML=`${me.name}'s Pod`;
}
 

export async function createLoginBox(domElement){
    const loginButtonArea = domElement.querySelector("#loginArea");
    const UI = panes.UI;
    let tabulator = domElement.querySelector('#suicTabulator')
      tabulator.style= `
        display: none; /* Hidden by default */
        position: fixed; /* Stay in place */
        z-index: 1; /* Sit on top */
        left: 0;
        top: 10vh;
        /* height: set in app.js */
        width: 100%; /* Full width */
        overflow: auto; /* Enable scroll if needed */
        background-color: rgb(0,0,0); /* Fallback color */
        background-color: rgba(0,0,0,0.2); /* Black w/ opacity */
      `; 
    async function mungeLoginArea(){
      await initAuth();
      loginButtonArea.innerHTML="";
      loginButtonArea.appendChild(UI.authn.loginStatusBox(document, null, {}))
      let loginButtons = loginButtonArea.querySelectorAll('input');
      for(let button of loginButtons){
        button.style = `
          border:none;
          background:transparent;
          font-size:1rem;
          position: absolute;
          top:3.5rem;
          right:7.2rem;
          cursor:pointer;
        `;
      }
      loginButtons[0].value = loginButtons[0].value.replace(/WebID\s*/,'');
      if(loginButtons[1]) loginButtons[1].style.display="none";
    }      
    async function initAuth(){
      if( !UI.authn.currentUser() ) {
        await UI.authn.checkUser();
      }
    }
    if( UI.authn.authSession ) {
      UI.authn.authSession.onLogin(() => {
        mungeLoginArea();
      })
      UI.authn.authSession.onLogout(() => {
        mungeLoginArea();
      })
      UI.authn.authSession.onSessionRestore((url) => {
        mungeLoginArea();

      })
    }    
//    document.addEventListener('DOMContentLoaded',()=>{mungeLoginArea();});
    mungeLoginArea();
} // ENDS
