import {loadProfile} from './model/profile.js';

export async function applyProfile(domElement,me) {
  domElement  ||= document;
  let origin = window.origin;
  me ||= `${origin}/profile/card#me`;
  me = await loadProfile( me );
  const storage = me.storages ?me.storages[0] :null ; // TBD MULTIPLE STORAGES
  me.name = me.name || me.nick || me.webId;
  let hmenu =   domElement.querySelectorAll('#currentPodMenu LI');
  for(let h of hmenu){
    let uri; try { uri = new URL(h.name) }catch(e){};
    if(!uri) continue;
    let path = uri.pathname.replace(/^\//,'');
    let hash = uri.hash||"";
    if(path.match(/Documents/i)){
//      h.name = storage ;
      h.name = storage.replace(/\/$/,'') + hash;
    }
    else if(path.match(/Inbox/i)){
      h.name = me.inbox ;
    }
    else if(path.match(/profile/i)){
      h.name = me.webId ;
    }
    else {
       h.name = storage+path+hash;
    }
  }
  let logo = domElement.querySelector('#currentPodLogo')
  if(logo) logo.src = me.image;
  let title = domElement.querySelector('#currentPodTitle');
  if(title) title.innerHTML=`${me.name}'s Pod`;
  solidUI.vars = {
    podRoot   : storage,
    podName   : me.name,
    podNick   : me.nick,
    podWebid  : me.webId,
    podImage  : me.image,
    podInbox  : me.inbox,
    podProfile : me.webId,
  };
  console.log(solidUI.vars);
  return me;
}
 
    export function setHistory(uri){
      const params = new URLSearchParams(location.search)
      params.set('uri', (uri||""));
      window.history.replaceState({}, '', `${location.origin}${location.pathname}?${params}`);
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

    async function mungeLoginArea(uri){
      await initAuth();
      loginButtonArea.innerHTML="";
      loginButtonArea.appendChild(UI.authn.loginStatusBox(document, null, {}))
      let loginButtons = loginButtonArea.querySelectorAll('input');
/*
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
*/
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
