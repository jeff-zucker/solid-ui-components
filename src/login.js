const authSession = UI.authn.authSession;
const loginButtonArea = document.querySelector("[data-suic=login]");

document.addEventListener('DOMContentLoaded', function() {

    if (authSession && loginButtonArea) {
        loginButtonArea.style.display="none";
        authSession.onLogin(mungeLoginArea);
        authSession.onLogout(mungeLoginArea);
        authSession.onSessionRestore(mungeLoginArea);
    }    
    mungeLoginArea();

}); 

export async function mungeLoginArea(appearanceOnly){
    solidUI.initApp ||= async()=>{};
    if(!loginButtonArea && !appearanceOnly) return await solidUI.initApp();
    loginButtonArea.innerHTML="";
    loginButtonArea.appendChild(UI.login.loginStatusBox(document, null, {}));
    const signupButton = loginButtonArea.querySelectorAll('input')[1];
    if(signupButton) signupButton.style.display="none";
    let me = await UI.authn.checkUser();
    let button = loginButtonArea.querySelector('input');         
    let dataset = loginButtonArea.dataset;
    let inLabel = dataset.inlabel;
    let outLabel = dataset.outlabel;
    let transparent = dataset.transparent;
    if (me) {       
        loginButtonArea.style.display="inline-block";
        button.value = outLabel || "Log out!";           
        button.title = "--- logged in as " + me.value + "\n--- click to logout";
    }
    else {
        loginButtonArea.style.display="inline-block";
        button.value = inLabel || "Log in!";           
        button.title = "--- click to log in!";
    }
    if(transparent) button.style.backgroundColor="transparent";
    button = solidUI.styleButton(button,{});
    if(me) button.style.color="green";
    if(typeof solidUI !="undefined" && !appearanceOnly) await solidUI.initApp();
}      
