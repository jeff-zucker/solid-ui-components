/*
<style>
#searchBox {
  display:none;
  z-index:10;
  position : absolute;
  left:2rem;
  margin-top:-2.8rem;
  padding:1rem;
  background:brown;
  border-radius:0.4px;
}
#searchBox input {
  font-size:large;
  padding:0.5rem;
  width:50ch;
}
#searchBox button {
  font-size:large !important;
  padding:0.5rem;
}
.search.button {
  font-size:1.75rem;
  display:block;
  color:gray;
  margin-bottom:0.5rem;
}
</style>

<div class="search button" title="--- SEARCH">&#x26B2;</div>
<div id="searchBox">
  <input><button>go</button>
</div>
*/
export async function searchButton(component){

   const searchBox = document.createElement('DIV');
   const targetElement = component.contentArea || document.body;
   const searchButton = document.createElement('BUTTON');
   const searchInput =  document.createElement('INPUT');

   searchButton.title = component.title;
   searchBox.appendChild(searchInput);
   targetElement.appendChild(searchButton);   
   targetElement.appendChild(searchBox);   

   searchBox.style = "display:none;z-index:10;position:absolute;left:2.2rem; margin-top:-1rem; padding:0.4rem;background:brown;border-radius:0.4rem;"

   searchButton.innerHTML = component.label || "&#x26B2;"
   searchButton.style = "transform:rotate(315deg);font-size:1.75rem;";
   searchButton.addEventListener("click",async()=>{
     searchBox.style.display="block";
   });

   searchInput.style= "padding:0.5rem;width:60ch;border-radius:0.2rem";
   searchInput.placeholder = component.placeholder;
   searchInput.addEventListener("keypress",async(event)=>{
    if (event.key === "Enter") {
      searchBox.style.display="none";
      const term = searchInput.value;
      if(term) solidUI.util.show('SolidOSLink',term,'','#display')  
    }
   });

}
