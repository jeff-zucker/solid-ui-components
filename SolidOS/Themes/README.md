# Creating a Theme

A theme is essentially an HTML page with template variables and specific DOM elements which will be filled with data on page load.  Themes may use a variety of built-in components and variables as well as components you create yourself.

## Built-In Components

Built-In components will be filled with data automatically. To include a built-in component in a theme, just add any HTML element with the id of the autmoatic component you want.  For example : `<div id="login"></div>`.

### Generic Built-In Components

  * login
  * solidLogo

The login component will add a button that is sensitive to your login state and will display either "login" or "logout" as approriate.  When logged in, the button will contain your nick, name, or WebID. 

### Built-In Components for Pod Being Visited

A theme can include these components generated automatically when visiting a Pod.

    * currentPodName
    * currentPodLogo
    * currentPodHome
    * currentPodPublicStorage
    * currentPodViewProfile
    * currentPodChatWithMe
    * currentPodMessageMe
    * currentPodAddMeAsFriend

### Built-In Components for Logged-in User

A theme can include these automatic components visible only to the logged in user.

    * userPrivateStorage
    * userEditProfile
    * userEditPreferences
    * userCreateNewThing
    * userCustomizeSolidOS

### Built-In Components with Customizable Contents

The following components 

    * currentPodMenu
    * loggedInUserMenu
    * toolsMenu
    * browseMenu
    * helpMenu


You can include any components in the currentPodMenu (eventually with forms or GUI) by editing [currentPodMenu.ttl](`/SolidOS/currentPodMenu.html).  The default is for the currentPod menu to include all of the automatically generated elements related to the Pod being visited.



  * Logged-in User
    * userMenu
      * userPodMenu
        * 
      * userToolsMenu
        *
  * Universal
      * BrowseMenu


