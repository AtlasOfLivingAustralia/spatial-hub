<!DOCTYPE html>
<html lang="de-AT">
<head>
    <g:if test="${config == null}">
        <g:set var="config" value="${grailsApplication.config}"/>
    </g:if>

    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <meta name="app.version" content="${g.meta(name: 'app.version')}"/>
    <meta name="app.build" content="${g.meta(name: 'app.build')}"/>
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <title>Biodiversitäts-Atlas Österreich &#8211; Frei zugängliches Onlineportal zur Entdeckung der Vielfalt an Organismen und Lebensräumen in Österreich</title>

    <!--<link rel='dns-prefetch' href='//fonts.googleapis.com' />-->
    <link rel='dns-prefetch' href='//use.fontawesome.com' />
    <link rel='dns-prefetch' href='//s.w.org' />
    <link href='https://fonts.gstatic.com' crossorigin rel='preconnect' />
    <link rel="alternate" type="application/rss+xml" title="Biodiversitäts-Atlas Österreich &raquo; Feed" href="https://biodiversityatlas.at/feed/" />
    <link rel="alternate" type="application/rss+xml" title="Biodiversitäts-Atlas Österreich &raquo; Kommentar-Feed" href="https://biodiversityatlas.at/comments/feed/" />
    <link href="https://core.biodiversityatlas.at/css/ala-styles.css" type="text/css" rel="stylesheet" media="screen, projection, print" />
    <link href="https://core.biodiversityatlas.at/css/bootstrap.min.css" type="text/css" rel="stylesheet" />
    <script
            src="https://code.jquery.com/jquery-2.2.4.min.js"
            integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44="
            crossorigin="anonymous"></script>
    <script type="text/javascript">
        window._wpemojiSettings = {"baseUrl":"https:\/\/s.w.org\/images\/core\/emoji\/11.2.0\/72x72\/","ext":".png","svgUrl":"https:\/\/s.w.org\/images\/core\/emoji\/11.2.0\/svg\/","svgExt":".svg","source":{"concatemoji":"https:\/\/core.biodiversityatlas.at\/wp-includes\/js\/wp-emoji-release.min.js?ver=5.1.2"}};
        !function(a,b,c){function d(a,b){var c=String.fromCharCode;l.clearRect(0,0,k.width,k.height),l.fillText(c.apply(this,a),0,0);var d=k.toDataURL();l.clearRect(0,0,k.width,k.height),l.fillText(c.apply(this,b),0,0);var e=k.toDataURL();return d===e}function e(a){var b;if(!l||!l.fillText)return!1;switch(l.textBaseline="top",l.font="600 32px Arial",a){case"flag":return!(b=d([55356,56826,55356,56819],[55356,56826,8203,55356,56819]))&&(b=d([55356,57332,56128,56423,56128,56418,56128,56421,56128,56430,56128,56423,56128,56447],[55356,57332,8203,56128,56423,8203,56128,56418,8203,56128,56421,8203,56128,56430,8203,56128,56423,8203,56128,56447]),!b);case"emoji":return b=d([55358,56760,9792,65039],[55358,56760,8203,9792,65039]),!b}return!1}function f(a){var c=b.createElement("script");c.src=a,c.defer=c.type="text/javascript",b.getElementsByTagName("head")[0].appendChild(c)}var g,h,i,j,k=b.createElement("canvas"),l=k.getContext&&k.getContext("2d");for(j=Array("flag","emoji"),c.supports={everything:!0,everythingExceptFlag:!0},i=0;i<j.length;i++)c.supports[j[i]]=e(j[i]),c.supports.everything=c.supports.everything&&c.supports[j[i]],"flag"!==j[i]&&(c.supports.everythingExceptFlag=c.supports.everythingExceptFlag&&c.supports[j[i]]);c.supports.everythingExceptFlag=c.supports.everythingExceptFlag&&!c.supports.flag,c.DOMReady=!1,c.readyCallback=function(){c.DOMReady=!0},c.supports.everything||(h=function(){c.readyCallback()},b.addEventListener?(b.addEventListener("DOMContentLoaded",h,!1),a.addEventListener("load",h,!1)):(a.attachEvent("onload",h),b.attachEvent("onreadystatechange",function(){"complete"===b.readyState&&c.readyCallback()})),g=c.source||{},g.concatemoji?f(g.concatemoji):g.wpemoji&&g.twemoji&&(f(g.twemoji),f(g.wpemoji)))}(window,document,window._wpemojiSettings);
        function adjustMapHeight() {
            var headerHeight = 0;
            var navbar = $('.navbar')[0];
            if (navbar) {
                headerHeight = getComputedStyle(navbar).height.replace("px", "").replace("auto", "0");
            }
            $("#map").height($(window).height() - headerHeight);
            if ($('#spMenu')[0]) {
                $("#defaultPanel").height($(window).height() - headerHeight - 20 - getComputedStyle($('#spMenu')[0]).height.replace("px", "").replace("auto", "0"));
            }
        }

        $(function () {
            $(window).resize(function () {
                adjustMapHeight();
            });
            setTimeout(adjustMapHeight, 10);
        })
    </script>
    <script type='text/javascript' src='https://core.biodiversityatlas.at/js/application.js'></script>
    <!--<script type='text/javascript' src='https://core.biodiversityatlas.at/js/layout_post.js'></script>-->
    <style type="text/css">
    img.wp-smiley,
    img.emoji {
        display: inline !important;
        border: none !important;
        box-shadow: none !important;
        height: 1em !important;
        width: 1em !important;
        margin: 0 .07em !important;
        vertical-align: -0.1em !important;
        background: none !important;
        padding: 0 !important;
    }
    </style>
    <link rel='stylesheet' id='generate-fonts-css'  href='https://fonts.googleapis.com/css?family=Open+Sans:300,300italic,regular,italic,600,600italic,700,700italic,800,800italic|Roboto:100,100italic,300,300italic,regular,italic,500,500italic,700,700italic,900,900italic' type='text/css' media='all' />
    <link rel='stylesheet' id='wp-block-library-css'  href=https://core.biodiversityatlas.at/wp-includes/css/dist/block-library/style.min.css?ver=5.1.2' type='text/css' media='all' />
    <link rel='stylesheet' id='generate-sections-styles-css'  href='https://core.biodiversityatlas.at/wp-content/plugins/gp-premium/sections/functions/css/style.min.css?ver=5.1.2' type='text/css' media='all' />
    <link rel='stylesheet' id='wp-show-posts-css'  href='https://core.biodiversityatlas.at/wp-content/plugins/wp-show-posts/css/wp-show-posts-min.css?ver=1.1.3' type='text/css' media='all' />
    <link rel='stylesheet' id='font-awesome-css'  href='https://use.fontawesome.com/releases/v5.5.0/css/all.css?ver=5.5.0' type='text/css' media='all' />
    <link rel='stylesheet' id='generate-style-grid-css'  href='https://core.biodiversityatlas.at/wp-content/themes/generatepress/css/unsemantic-grid.min.css?ver=2.3.2' type='text/css' media='all' />
    <link rel='stylesheet' id='generate-style-css'  href='https://core.biodiversityatlas.at/wp-content/themes/generatepress/style.min.css?ver=2.3.2' type='text/css' media='all' />
    <!--<style id='generate-style-inline-css' type='text/css'>
    .entry-header {display:none} .page-content, .entry-content, .entry-summary {margin-top:0}
    body{background-color: #f7f7f7;;color:#3a3a3a;}a, a:visited{color:#0a0101;}a:hover, a:focus, a:active{color:#000000;}body .grid-container{max-width:1600px;}@media (max-width: 500px) and (min-width: 769px){.inside-header{display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;-ms-flex-align:center;align-items:center;}.site-logo, .site-branding{margin-bottom:1.5em;}#site-navigation{margin:0 auto;}.header-widget{margin-top:1.5em;}}body, button, input, select, textarea{font-family:"Open Sans", sans-serif;font-size:15px;}.entry-content > [class*="wp-block-"]:not(:last-child){margin-bottom:1.5em;}.main-navigation a, .menu-toggle{font-family:"Roboto", sans-serif;font-weight:500;text-transform:uppercase;}.main-navigation .main-nav ul ul li a{font-size:14px;}.widget-title{font-weight:500;font-size:15px;margin-bottom:20px;}.sidebar .widget, .footer-widgets .widget{font-size:15px;}h1{font-family:"Roboto", sans-serif;}h2{font-family:"Roboto", sans-serif;}.site-info{font-size:14px;}@media (max-width:768px){.main-title{font-size:30px;}h1{font-size:30px;}h2{font-size:25px;}}.top-bar{background-color:#f7f7f7;color:#0a0a0a;}.top-bar a,.top-bar a:visited{color:#0a0a0a;}.top-bar a:hover{color:#e8402c;}.site-header{background-color:#ffffff;color:#3a3a3a;}.site-header a,.site-header a:visited{color:#3a3a3a;}.main-title a,.main-title a:hover,.main-title a:visited{color:#3a3a3a;}.site-description{color:#757575;}.main-navigation,.main-navigation ul ul{background-color:#ffffff;}.main-navigation .main-nav ul li a,.menu-toggle{color:#0a0a0a;}.main-navigation .main-nav ul li:hover > a,.main-navigation .main-nav ul li:focus > a, .main-navigation .main-nav ul li.sfHover > a{color:#e8402c;background-color:#ffffff;}button.menu-toggle:hover,button.menu-toggle:focus,.main-navigation .mobile-bar-items a,.main-navigation .mobile-bar-items a:hover,.main-navigation .mobile-bar-items a:focus{color:#0a0a0a;}.main-navigation .main-nav ul li[class*="current-menu-"] > a{color:#e8402c;background-color:#ffffff;}.main-navigation .main-nav ul li[class*="current-menu-"] > a:hover,.main-navigation .main-nav ul li[class*="current-menu-"].sfHover > a{color:#e8402c;background-color:#ffffff;}.navigation-search input[type="search"],.navigation-search input[type="search"]:active{color:#ffffff;background-color:#ffffff;}.navigation-search input[type="search"]:focus{color:#e8402c;background-color:#ffffff;}.main-navigation ul ul{background-color:#3f3f3f;}.main-navigation .main-nav ul ul li a{color:#ffffff;}.main-navigation .main-nav ul ul li:hover > a,.main-navigation .main-nav ul ul li:focus > a,.main-navigation .main-nav ul ul li.sfHover > a{color:#ffffff;background-color:#4f4f4f;}.main-navigation .main-nav ul ul li[class*="current-menu-"] > a{color:#ffffff;background-color:#4f4f4f;}.main-navigation .main-nav ul ul li[class*="current-menu-"] > a:hover,.main-navigation .main-nav ul ul li[class*="current-menu-"].sfHover > a{color:#ffffff;background-color:#4f4f4f;}.separate-containers .inside-article, .separate-containers .comments-area, .separate-containers .page-header, .one-container .container, .separate-containers .paging-navigation, .inside-page-header{background-color:#ffffff;}.entry-meta{color:#595959;}.entry-meta a,.entry-meta a:visited{color:#595959;}.entry-meta a:hover{color:#1e73be;}.sidebar .widget{background-color:#ffffff;}.sidebar .widget .widget-title{color:#000000;}.footer-widgets{color:#0a0a0a;background-color:#d4d4d4;}.footer-widgets a,.footer-widgets a:visited{color:#0a0a0a;}.footer-widgets a:hover{color:#406a41;}.footer-widgets .widget-title{color:#000000;}.site-info{color:#ffffff;background-color:#222222;}.site-info a,.site-info a:visited{color:#ffffff;}.site-info a:hover{color:#606060;}.footer-bar .widget_nav_menu .current-menu-item a{color:#606060;}input[type="text"],input[type="email"],input[type="url"],input[type="password"],input[type="search"],input[type="tel"],input[type="number"],textarea,select{color:#666666;background-color:#fafafa;border-color:#cccccc;}input[type="text"]:focus,input[type="email"]:focus,input[type="url"]:focus,input[type="password"]:focus,input[type="search"]:focus,input[type="tel"]:focus,input[type="number"]:focus,textarea:focus,select:focus{color:#666666;background-color:#ffffff;border-color:#bfbfbf;}button,html input[type="button"],input[type="reset"],input[type="submit"],a.button,a.button:visited,a.wp-block-button__link:not(.has-background){color:#ffffff;background-color:#666666;}button:hover,html input[type="button"]:hover,input[type="reset"]:hover,input[type="submit"]:hover,a.button:hover,button:focus,html input[type="button"]:focus,input[type="reset"]:focus,input[type="submit"]:focus,a.button:focus,a.wp-block-button__link:not(.has-background):active,a.wp-block-button__link:not(.has-background):focus,a.wp-block-button__link:not(.has-background):hover{color:#ffffff;background-color:#3f3f3f;}.generate-back-to-top,.generate-back-to-top:visited{background-color:rgba( 0,0,0,0.4 );color:#ffffff;}.generate-back-to-top:hover,.generate-back-to-top:focus{background-color:rgba( 0,0,0,0.6 );color:#ffffff;}.inside-header{padding:0px 40px 7px 40px;background-color: #ffffff}.entry-content .alignwide, body:not(.no-sidebar) .entry-content .alignfull{margin-left:-40px;width:calc(100% + 80px);max-width:calc(100% + 80px);}.main-navigation .main-nav ul li a,.menu-toggle,.main-navigation .mobile-bar-items a{padding-left:25px;padding-right:25px;line-height:50px;}.main-navigation .main-nav ul ul li a{padding:10px 25px 10px 25px;}.navigation-search input{height:50px;}.rtl .menu-item-has-children .dropdown-menu-toggle{padding-left:25px;}.menu-item-has-children .dropdown-menu-toggle{padding-right:25px;}.rtl .main-navigation .main-nav ul li.menu-item-has-children > a{padding-right:25px;}@media (max-width:768px){.separate-containers .inside-article, .separate-containers .comments-area, .separate-containers .page-header, .separate-containers .paging-navigation, .one-container .site-content, .inside-page-header{padding:30px;}.entry-content .alignwide, body:not(.no-sidebar) .entry-content .alignfull{margin-left:-30px;width:calc(100% + 60px);max-width:calc(100% + 60px);}}.one-container .sidebar .widget{padding:0px;}/* End cached CSS */.page .entry-content{margin-top:0px;}@media (max-width: 768px){.main-navigation .menu-toggle,.main-navigation .mobile-bar-items,.sidebar-nav-mobile:not(#sticky-placeholder){display:block;}.main-navigation ul,.gen-sidebar-nav{display:none;}[class*="nav-float-"] .site-header .inside-header > *{float:none;clear:both;}}@font-face {font-family: "GeneratePress";src:  url("https://core.biodiversityatlas.at/wp-content/themes/generatepress/fonts/generatepress.eot");src:  url("https://biodiversityatlas.at/wp-content/themes/generatepress/fonts/generatepress.eot#iefix") format("embedded-opentype"),  url("https://biodiversityatlas.at/wp-content/themes/generatepress/fonts/generatepress.woff2") format("woff2"),  url("https://core.biodiversityatlas.at/wp-content/themes/generatepress/fonts/generatepress.woff") format("woff"),  url("https://core.biodiversityatlas.at/wp-content/themes/generatepress/fonts/generatepress.ttf") format("truetype"),  url("https://core.biodiversityatlas.at/wp-content/themes/generatepress/fonts/generatepress.svg#GeneratePress") format("svg");font-weight: normal;font-style: normal;}.main-navigation .slideout-toggle a:before,.slide-opened .slideout-overlay .slideout-exit:before {font-family: GeneratePress;}.slideout-navigation .dropdown-menu-toggle:before {content: "\f107" !important;}.slideout-navigation .sfHover > a .dropdown-menu-toggle:before {content: "\f106" !important;}
    .site-header{background-repeat:no-repeat;background-size:cover;background-attachment:fixed;}
    .navigation-branding .main-title{font-weight:bold;text-transform:none;font-size:45px;}@media (max-width: 768px){.navigation-branding .main-title{font-size:30px;}}
    .generate-sections-inside-container {padding-left:40px;padding-right:40px;}#home-header.generate-sections-container{background-image:linear-gradient(0deg, rgba(30,115,190,0.3),rgba(30,115,190,0.3)), url(https://core.biodiversityatlas.at/wp-content/uploads/2019/04/Titelbild_AndreaHîltl-e1556258881706.jpg);}#home-header .generate-sections-inside-container{padding-top:40px;padding-bottom:40px;}@media (max-width:768px) {.generate-sections-inside-container {padding-left: 30px;padding-right: 30px;}}#home-5-boxen .generate-sections-inside-container{padding-top:0px;padding-bottom:40px;}@media (max-width:768px) {.generate-sections-inside-container {padding-left: 30px;padding-right: 30px;}}#generate-section-3.generate-sections-container{background-color:#f6f6f6;}#generate-section-3 .generate-sections-inside-container{padding-top:40px;padding-bottom:40px;}@media (max-width:768px) {.generate-sections-inside-container {padding-left: 30px;padding-right: 30px;}}#generate-section-4 .generate-sections-inside-container{padding-top:5px;padding-bottom:5px;}@media (max-width:768px) {.generate-sections-inside-container {padding-left: 30px;padding-right: 30px;}}#home-aktuelle-infos .generate-sections-inside-container{padding-top:40px;padding-bottom:40px;}@media (max-width:768px) {.generate-sections-inside-container {padding-left: 30px;padding-right: 30px;}}#generate-section-6 .generate-sections-inside-container{padding-top:40px;padding-bottom:40px;}@media (max-width:768px) {.generate-sections-inside-container {padding-left: 30px;padding-right: 30px;}}#home-ueber .generate-sections-inside-container{padding-top:80px;padding-bottom:80px;}@media (max-width:768px) {.generate-sections-inside-container {padding-left: 30px;padding-right: 30px;}}#home-dein-feedback .generate-sections-inside-container{padding-top:40px;padding-bottom:40px;}@media (max-width:768px) {.generate-sections-inside-container {padding-left: 30px;padding-right: 30px;}}#home-datenpartner .generate-sections-inside-container{padding-top:40px;padding-bottom:40px;}@media (max-width:768px) {.generate-sections-inside-container {padding-left: 30px;padding-right: 30px;}}
    </style>-->
    <style id='generate-style-inline-css' type='text/css'>
    .entry-header {display:none} .page-content, .entry-content, .entry-summary {margin-top:0}
    body{background-color: #f7f7f7;;color:#3a3a3a;}a, a:visited{color:#0a0101;}a:hover, a:focus, a:active{color:#000000;}body .grid-container{max-width: 100%;}@media (max-width: 500px) and (min-width: 769px){.inside-header{display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;-ms-flex-align:center;align-items:center;}.site-logo, .site-branding{margin-bottom:1.5em;}#site-navigation{margin:0 auto;}.header-widget{margin-top:1.5em;}}body, button, input, select, textarea{font-family:"Open Sans", sans-serif;font-size:15px;}.entry-content > [class*="wp-block-"]:not(:last-child){margin-bottom:1.5em;}.main-navigation a, .menu-toggle{font-family:"Roboto", sans-serif;font-weight:500;text-transform:uppercase;}.main-navigation .main-nav ul ul li a{font-size:14px;}.widget-title{font-weight:500;font-size:15px;margin-bottom:20px;}.sidebar .widget, .footer-widgets .widget{font-size:15px;}h1{font-family:"Roboto", sans-serif;}h2{font-family:"Roboto", sans-serif;}.site-info{font-size:14px;}@media (max-width:768px){.main-title{font-size:30px;}h1{font-size:30px;}h2{font-size:25px;}}.top-bar{background-color:#f7f7f7;color:#0a0a0a;}.top-bar a,.top-bar a:visited{color:#0a0a0a;}.top-bar a:hover{color:#e8402c;}.site-header{background-color:#ffffff;color:#3a3a3a;}.site-header a,.site-header a:visited{color:#3a3a3a;}.main-title a,.main-title a:hover,.main-title a:visited{color:#3a3a3a;}.site-description{color:#757575;}.main-navigation,.main-navigation ul ul{background-color:#ffffff;}.main-navigation .main-nav ul li a,.menu-toggle{color:#0a0a0a;}.main-navigation .main-nav ul li:hover > a,.main-navigation .main-nav ul li:focus > a, .main-navigation .main-nav ul li.sfHover > a{color:#e8402c;background-color:#ffffff;}button.menu-toggle:hover,button.menu-toggle:focus,.main-navigation .mobile-bar-items a,.main-navigation .mobile-bar-items a:hover,.main-navigation .mobile-bar-items a:focus{color:#0a0a0a;}.main-navigation .main-nav ul li[class*="current-menu-"] > a{color:#e8402c;background-color:#ffffff;}.main-navigation .main-nav ul li[class*="current-menu-"] > a:hover,.main-navigation .main-nav ul li[class*="current-menu-"].sfHover > a{color:#e8402c;background-color:#ffffff;}.navigation-search input[type="search"],.navigation-search input[type="search"]:active{color:#ffffff;background-color:#ffffff;}.navigation-search input[type="search"]:focus{color:#e8402c;background-color:#ffffff;}.main-navigation ul ul{background-color:#3f3f3f;}.main-navigation .main-nav ul ul li a{color:#ffffff;}.main-navigation .main-nav ul ul li:hover > a,.main-navigation .main-nav ul ul li:focus > a,.main-navigation .main-nav ul ul li.sfHover > a{color:#ffffff;background-color:#4f4f4f;}.main-navigation .main-nav ul ul li[class*="current-menu-"] > a{color:#ffffff;background-color:#4f4f4f;}.main-navigation .main-nav ul ul li[class*="current-menu-"] > a:hover,.main-navigation .main-nav ul ul li[class*="current-menu-"].sfHover > a{color:#ffffff;background-color:#4f4f4f;}.separate-containers .inside-article, .separate-containers .comments-area, .separate-containers .page-header, .one-container .container, .separate-containers .paging-navigation, .inside-page-header{background-color:#ffffff;}.entry-meta{color:#595959;}.entry-meta a,.entry-meta a:visited{color:#595959;}.entry-meta a:hover{color:#1e73be;}.sidebar .widget{background-color:#ffffff;}.sidebar .widget .widget-title{color:#000000;}.footer-widgets{color:#0a0a0a;background-color:#d4d4d4;}.footer-widgets a,.footer-widgets a:visited{color:#0a0a0a;}.footer-widgets a:hover{color:#406a41;}.footer-widgets .widget-title{color:#000000;}.site-info{color:#ffffff;background-color:#222222;}.site-info a,.site-info a:visited{color:#ffffff;}.site-info a:hover{color:#606060;}.footer-bar .widget_nav_menu .current-menu-item a{color:#606060;}input[type="text"],input[type="email"],input[type="url"],input[type="password"],input[type="search"],input[type="tel"],input[type="number"],textarea,select{color:#666666;background-color:#fafafa;border-color:#cccccc;}input[type="text"]:focus,input[type="email"]:focus,input[type="url"]:focus,input[type="password"]:focus,input[type="search"]:focus,input[type="tel"]:focus,input[type="number"]:focus,textarea:focus,select:focus{color:#666666;background-color:#ffffff;border-color:#bfbfbf;}button,html input[type="button"],input[type="reset"],input[type="submit"],a.button,a.button:visited,a.wp-block-button__link:not(.has-background){color:#ffffff;background-color:#666666;}button:hover,html input[type="button"]:hover,input[type="reset"]:hover,input[type="submit"]:hover,a.button:hover,button:focus,html input[type="button"]:focus,input[type="reset"]:focus,input[type="submit"]:focus,a.button:focus,a.wp-block-button__link:not(.has-background):active,a.wp-block-button__link:not(.has-background):focus,a.wp-block-button__link:not(.has-background):hover{color:#ffffff;background-color:#3f3f3f;}.generate-back-to-top,.generate-back-to-top:visited{background-color:rgba( 0,0,0,0.4 );color:#ffffff;}.generate-back-to-top:hover,.generate-back-to-top:focus{background-color:rgba( 0,0,0,0.6 );color:#ffffff;}.inside-header{padding:0px 40px 7px 40px;background-color: #ffffff}.entry-content .alignwide, body:not(.no-sidebar) .entry-content .alignfull{margin-left:-40px;width:calc(100% + 80px);max-width:calc(100% + 80px);}.main-navigation .main-nav ul li a,.menu-toggle,.main-navigation .mobile-bar-items a{padding-left:25px;padding-right:25px;line-height:50px;}.main-navigation .main-nav ul ul li a{padding:10px 25px 10px 25px;}.navigation-search input{height:50px;}.rtl .menu-item-has-children .dropdown-menu-toggle{padding-left:25px;}.menu-item-has-children .dropdown-menu-toggle{padding-right:25px;}.rtl .main-navigation .main-nav ul li.menu-item-has-children > a{padding-right:25px;}@media (max-width:768px){.separate-containers .inside-article, .separate-containers .comments-area, .separate-containers .page-header, .separate-containers .paging-navigation, .one-container .site-content, .inside-page-header{padding:30px;}.entry-content .alignwide, body:not(.no-sidebar) .entry-content .alignfull{margin-left:-30px;width:calc(100% + 60px);max-width:calc(100% + 60px);}}.one-container .sidebar .widget{padding:0px;}/* End cached CSS */.page .entry-content{margin-top:0px;}@media (max-width: 768px){.main-navigation .menu-toggle,.main-navigation .mobile-bar-items,.sidebar-nav-mobile:not(#sticky-placeholder){display:block;}.main-navigation ul,.gen-sidebar-nav{display:none;}[class*="nav-float-"] .site-header .inside-header > *{float:none;clear:both;}}@font-face {font-family: "GeneratePress";src:  url("https://core.biodiversityatlas.at/wp-content/themes/generatepress/fonts/generatepress.eot");src:  url("https://biodiversityatlas.at/wp-content/themes/generatepress/fonts/generatepress.eot#iefix") format("embedded-opentype"),  url("https://biodiversityatlas.at/wp-content/themes/generatepress/fonts/generatepress.woff2") format("woff2"),  url("https://core.biodiversityatlas.at/wp-content/themes/generatepress/fonts/generatepress.woff") format("woff"),  url("https://core.biodiversityatlas.at/wp-content/themes/generatepress/fonts/generatepress.ttf") format("truetype"),  url("https://core.biodiversityatlas.at/wp-content/themes/generatepress/fonts/generatepress.svg#GeneratePress") format("svg");font-weight: normal;font-style: normal;}.main-navigation .slideout-toggle a:before,.slide-opened .slideout-overlay .slideout-exit:before {font-family: GeneratePress;}.slideout-navigation .dropdown-menu-toggle:before {content: "\f107" !important;}.slideout-navigation .sfHover > a .dropdown-menu-toggle:before {content: "\f106" !important;}
    .site-header{background-repeat:no-repeat;background-size:cover;background-attachment:fixed;}
    .navigation-branding .main-title{font-weight:bold;text-transform:none;font-size:45px;}@media (max-width: 768px){.navigation-branding .main-title{font-size:30px;}}
    .generate-sections-inside-container {padding-left:40px;padding-right:40px;}#home-header.generate-sections-container{background-image:linear-gradient(0deg, rgba(30,115,190,0.3),rgba(30,115,190,0.3)), url(https://core.biodiversityatlas.at/wp-content/uploads/2019/04/Titelbild_AndreaHîltl-e1556258881706.jpg);}#home-header .generate-sections-inside-container{padding-top:40px;padding-bottom:40px;}@media (max-width:768px) {.generate-sections-inside-container {padding-left: 30px;padding-right: 30px;}}#home-5-boxen .generate-sections-inside-container{padding-top:0px;padding-bottom:40px;}@media (max-width:768px) {.generate-sections-inside-container {padding-left: 30px;padding-right: 30px;}}#generate-section-3.generate-sections-container{background-color:#f6f6f6;}#generate-section-3 .generate-sections-inside-container{padding-top:40px;padding-bottom:40px;}@media (max-width:768px) {.generate-sections-inside-container {padding-left: 30px;padding-right: 30px;}}#generate-section-4 .generate-sections-inside-container{padding-top:5px;padding-bottom:5px;}@media (max-width:768px) {.generate-sections-inside-container {padding-left: 30px;padding-right: 30px;}}#home-aktuelle-infos .generate-sections-inside-container{padding-top:40px;padding-bottom:40px;}@media (max-width:768px) {.generate-sections-inside-container {padding-left: 30px;padding-right: 30px;}}#generate-section-6 .generate-sections-inside-container{padding-top:40px;padding-bottom:40px;}@media (max-width:768px) {.generate-sections-inside-container {padding-left: 30px;padding-right: 30px;}}#home-ueber .generate-sections-inside-container{padding-top:80px;padding-bottom:80px;}@media (max-width:768px) {.generate-sections-inside-container {padding-left: 30px;padding-right: 30px;}}#home-dein-feedback .generate-sections-inside-container{padding-top:40px;padding-bottom:40px;}@media (max-width:768px) {.generate-sections-inside-container {padding-left: 30px;padding-right: 30px;}}#home-datenpartner .generate-sections-inside-container{padding-top:40px;padding-bottom:40px;}@media (max-width:768px) {.generate-sections-inside-container {padding-left: 30px;padding-right: 30px;}}
    </style>
    <link rel='stylesheet' id='generate-mobile-style-css'  href='https://core.biodiversityatlas.at/wp-content/themes/generatepress/css/mobile.min.css?ver=2.3.2' type='text/css' media='all' />
    <link rel='stylesheet' id='generate-blog-css'  href='https://core.biodiversityatlas.at/wp-content/plugins/gp-premium/blog/functions/css/style-min.css?ver=1.8.2' type='text/css' media='all' />
    <link rel='stylesheet' id='lgc-unsemantic-grid-responsive-tablet-css'  href='https://core.biodiversityatlas.at/wp-content/plugins/lightweight-grid-columns/css/unsemantic-grid-responsive-tablet.css?ver=1.0' type='text/css' media='all' />
    <link rel='https://api.w.org/' href='https://biodiversityatlas.at/wp-json/' />
    <link rel="EditURI" type="application/rsd+xml" title="RSD" href="https://biodiversityatlas.at/xmlrpc.php?rsd" />
    <link rel="wlwmanifest" type="application/wlwmanifest+xml" href="https://core.biodiversityatlas.at/wp-includes/wlwmanifest.xml" />
    <meta name="generator" content="WordPress 5.1.2" />
    <link rel="canonical" href="https://biodiversityatlas.at/" />
    <link rel='shortlink' href='https://biodiversityatlas.at/' />
    <link rel="alternate" type="application/json+oembed" href="https://biodiversityatlas.at/wp-json/oembed/1.0/embed?url=https%3A%2F%2Fbiodiversityatlas.at%2F" />
    <link rel="alternate" type="text/xml+oembed" href="https://biodiversityatlas.at/wp-json/oembed/1.0/embed?url=https%3A%2F%2Fbiodiversityatlas.at%2F&#038;format=xml" />
    <!--[if lt IE 9]>
	    <link rel="stylesheet" href="https://core.biodiversityatlas.at/wp-content/plugins/lightweight-grid-columns/css/ie.min.css" />
		<![endif]-->
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.0/jquery.min.js"></script>
    <!--<style type="text/css" id="wp-custom-css">
    /* GENERAL */

    .hide {
        display: none !important;
    }

    .text-schmal {
        max-width: 1000px
    }

    .page-id-506 .entry-content,
    .page-id-507 .entry-content,
    .page-id-508 .entry-content {
        max-width: 1000px;
    }

    /* MAIN NAV */

    #site-navigation {
        margin-top: 12px;
    }

    /* TOP BAR NAV */

    #menu-item-240 a,
    #menu-item-241 a {
        font-size: 20px !important;
    }

    #menu-item-240 a {
        color: #2eacf1;
    }

    #menu-item-241 a {
        color: #4563a5;
    }
    #menu-item-244,
    #menu-item-245,
    #menu-item-289,
    #menu-item-288, {
        margin-top: 4px;
    }

    /* HOME HEADER */

    #home-header {
        min-height: 500px;
    }

    #home-header-block {
        max-width: 600px;
        margin: 0 auto;
        height: 100%;
        background-color: rgba(255,255,255,0.8);
        padding: 50px 3%;
        margin-top: 100px;
    }

    #home-header-block p {
        font-weight: 600;
    }

    /* HOME 5 BOXEN */

    #home-5-boxen h2 {
        font-size: 1.5rem;
        font-weight: 400;
        padding: 10px;
        margin-bottom: 15px;
    }

    #home-5-boxen p {
        margin-bottom: 15px;
    }

    #home-5-boxen .inside-grid-column {
        margin-top: -20px;
    }

    .home5boxdiv {
        background-color: #f7f7f7;
        min-height: 450px;
    }

    .home5boxdiv p:last-child {
        padding: 0px 15px 15px 15px;
    }

    /* 1 */

    #home-5-boxen .box1 .home5boxdiv {
        border-top: 20px solid #ef932a;
    }

    /* 2 */

    #home-5-boxen .box2 .home5boxdiv {
        border-top: 20px solid #49754a;
    }

    /* 3 */

    #home-5-boxen .box3 .home5boxdiv {
        border-top: 20px solid #3ebfd1;
    }

    /* 4 */

    #home-5-boxen .box4 .home5boxdiv {
        border-top: 20px solid #d4da2d;
    }

    /* 5 */

    #home-5-boxen .box5 .home5boxdiv {
        border-top: 20px solid #ea5a42;
    }

    /* HOME Suchformular */

    #suchformular {
        display: block;
        text-align: center;
    }

    #suchfeld {
        margin-bottom: 20px;
        width: 300px;
    }

    /* HOME News */

    .home .wp-show-posts-read-more {
        display: none;
    }

    #home-aktuelle-infos {
        box-sizing: border-box;
        border-left: 100px solid #ef7709;
        margin-top: 40px;
        margin-bottom: 40px;
    }

    #home-aktuelle-infos .grid-container {
        margin-left: 150px;
        max-width: 800px;
    }

    /* HOME Dein Feedback */

    #home-dein-feedback {
        box-sizing: border-box;
        border-left: 100px solid #dadf40;
        margin-top: 40px;
        margin-bottom: 40px;
    }

    #home-dein-feedback .grid-container {
        margin-left: 150px;
        max-width: 800px;
    }

    /* HOME Ueber */

    #home-ueber {
        box-sizing: border-box;
        border-left: 100px solid #11acc6;
        margin-top: 40px;
        margin-bottom: 40px;
    }

    #home-ueber .grid-container {
        margin-left: 150px;
        max-width: 800px;
    }

    /* HOME Datenpartner */

    #home-datenpartner {
        box-sizing: border-box;
        border-left: 100px solid #ed7560;
        margin-top: 40px;
        margin-bottom: 40px;
    }

    #home-datenpartner .lgc-column {
        border: 1px solid red;
        padding: 20px;
        margin-right: 10px;
    }

    .wp-image-302 {
        margin-top: 35px
    }


    /* FOOTER */

    .site-info {
        display: none;
    }

    /* TOP FOOTER */

    .top-footer {
        padding: 20px;
        background-color: #f6f6f6;
    }

    .top-footer .widgettitle  {
        font-size: 15px;
        font-weight: 500;
    }

    .top-footer .gallery-item {
        text-align: left;
    }

    .top-footer a  {
        color: black;
    }

    /* SUB FOOTER */

    .sub-footer {
        padding:3px;
        font-size: 14px;
    }

    #menu-sub-footer {
        text-align: right;
        margin-top: 1.3em;
    }

    #menu-sub-footer li  {
        display: inline !important;
    }

    #menu-sub-footer a  {
        padding: 10px;
        color: black;
    }

    /* RESPONSIVE */

    @media only screen and (max-width: 1210px) {
        #site-navigation {
            margin-top: 0;
        }
    }

    @media only screen and (max-width: 1024px) {
        .home5boxdiv {
            margin-bottom: 50px !important;
        }

        #home-aktuelle-infos {
            border-left: 30px solid #ef7709;
        }

        #home-dein-feedback {
            border-left: 30px solid #dadf40;
        }

        #home-ueber {
            border-left: 30px solid #11acc6;
        }

        #home-datenpartner {
            border-left: 30px solid #ed7560;
        }

        #home-dein-feedback .grid-container,
        #home-ueber .grid-container,
        #home-datenpartner .grid-container,
        #home-aktuelle-infos .grid-container {
            margin-left: 10px;
            max-width: 800px;
        }
    }

    </style>-->

    <link href="${config.favicon.url}" rel="shortcut icon" type="image/x-icon"/>
    <!--<link href="${config.headerAndFooter.baseURL}/css/bootstrap.min.css" rel="stylesheet" media="all"/>-->
    <!--<link href="${config.headerAndFooter.baseURL}/css/ala-styles.css" rel="stylesheet" media="all"/>-->
    <title><g:layoutTitle/></title>
    <g:layoutHead/>
    <asset:stylesheet href="generic-application.css" />
    <g:if test="${hub}">
        <!-- Hub is not null-->
        <asset:stylesheet href="css/${hub}.css"/>
    </g:if>
    <g:else>
        <!-- Hub is null wheres the style sheet-->
        <asset:stylesheet href="generic.css"/>
    </g:else>
</head>

<body class="${pageProperty(name: 'body.class')}" id="${pageProperty(name: 'body.id')}"
      onload="${pageProperty(name: 'body.onload')}">

<g:set var="fluidLayout" value="${pageProperty(name: 'meta.fluidLayout') ?: config.skin?.fluidLayout}"/>
<!-- meta breadcrumb (msg spatial ?) -->
<meta name="breadcrumb" content="${pageProperty(name: 'meta.breadcrumb', default: pageProperty(name: 'title').split('\\|')[0].decodeHTML())}"/>
<meta name="breadcrumbParent" content="${pageProperty(name: 'meta.breadcrumbParent', default: "${createLink(action: 'map', controller: 'public')},${message(code: 'breadcrumb.spatial')}")}"/>
<g:set var="containerType" value="${fluidLayout?.toBoolean() ? 'container-fluid' : 'container'}"/>
<!-- Header -->
<nav id="drawer-nav-menu" class="mdl-navigation ::loginStatus::"></nav>
<div id="id_bgMain" class="home page-template-default page page-id-45 wp-custom-logo wp-embed-responsive post-image-aligned-center generate-sections-enabled sections-no-sidebars sticky-menu-fade no-sidebar nav-float-right contained-header separate-containers active-footer-widgets-0 header-aligned-left dropdown-hover">
<div class="top-bar top-bar-align-right">
    <div class="inside-top-bar grid-container grid-parent">
        <aside id="nav_menu-8" class="widget inner-padding widget_nav_menu">
            <ul id="menu-top-bar" class="menu">
                <script type="text/javascript">
                    window.getCookie = function(name) {
                        var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
                        if (match) return match[2];
                    }
                    func_setStorage = function (it_0) {
                        if (it_0 === 0) {
                            document.cookie="lang=de_AT; max-age=86400; path=/; domain=biodiversityatlas.at";
                            if ((location.href.split('?lang=').length <= 1 || location.href.split('&lang=').length <= 1) && location.href.split('?').length <= 1) {
                                location.href = location.href.split("/")[location.href.split("/").length - 1] + '?lang=de_AT';
                            }
                            if (location.href.split('?').length > 1 && location.href.split('lang=').length <= 1) {
                                location.href = location.href + '&lang=de_AT';
                            }
                        }
                        if (it_0 === 1) {
                            document.cookie="lang=en; max-age=86400; path=/; domain=biodiversityatlas.at";
                            if ((location.href.split('?lang=').length <= 1 || location.href.split('&lang=').length <= 1) && location.href.split('?').length <= 1) {
                                location.href = location.href.split("/")[location.href.split("/").length - 1] + '?lang=default';
                            }
                            if (location.href.split('?').length > 1 && location.href.split('lang=').length <= 1) {
                                location.href = location.href + '&lang=default';
                            }

                        }
                    }
                    if(window.getCookie('lang') === undefined) {
                        func_setStorage(0);
                    }
                    if(window.getCookie('lang') === 'de_AT') {
                        func_setStorage(0);
                    }
                    if(window.getCookie('lang') === 'en') {
                        func_setStorage(1);
                    }
                    if(window.getCookie('lang') === 'de_AT') {
                        $('#menu-top-bar').children().remove();
                        $('#menu-top-bar').html("<li id=\"menu-item-243\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-245\"><a href=\"https://auth.biodiversityatlas.at/userdetails/myprofile\">Mein Profil</a></li>\n" +
                            "                    <li id=\"menu-item-245\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-245\"><a href=\"http://living-atlases.gbif.org\">Living Atlas Community</a></li>\n" +
                            "                    <li id=\"menu-item-240\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-240\"><a href=\"https://twitter.com/biodiversity_at\"><i class=\"fab fa-twitter-square\"></i></a></li>\n" +
                            "                    <li id=\"menu-item-241\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-241\"><a href=\"https://www.facebook.com/biodiversityaustria/\"><i class=\"fab fa-facebook-square\"></i></a></li>\n" +
                            "                    <li id=\"menu-item-289\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-289\"><a id=\"loginSW\" href=\"https://auth.biodiversityatlas.at/cas/login\">Login</a></li>");
                    }
                    if(window.getCookie('lang') !== 'de_AT') {
                        $('#menu-top-bar').children().remove();
                        $('#menu-top-bar').html("<li id=\"menu-item-243\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-245\"><a href=\"https://auth.biodiversityatlas.at/userdetails/myprofile\">my profile</a></li>\n" +
                            "                    <li id=\"menu-item-245\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-245\"><a href=\"http://living-atlases.gbif.org\">Living Atlas Community</a></li>\n" +
                            "                    <li id=\"menu-item-240\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-240\"><a href=\"https://twitter.com/biodiversity_at\"><i class=\"fab fa-twitter-square\"></i></a></li>\n" +
                            "                    <li id=\"menu-item-241\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-241\"><a href=\"https://www.facebook.com/biodiversityaustria/\"><i class=\"fab fa-facebook-square\"></i></a></li>\n" +
                            "                    <li id=\"menu-item-289\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-289\"><a id=\"loginSW\" href=\"https://auth.biodiversityatlas.at/cas/login\">Login</a></li>");

                    }
                </script>
            </ul>
        </aside>
    </div>
</div>
<header id="masthead" class="site-header grid-container grid-parent" itemtype="https://schema.org/WPHeader" itemscope>
    <div class="site-logo">
        <a href="https://biodiversityatlas.at/" title="Biodiversitäts-Atlas Österreich" rel="home">
            <img class="header-image" alt="Biodiversitäts-Atlas Österreich" src="https://biodiversityatlas.at/wp-content/uploads/2019/12/Logo-Biodiversitaets-Atlas.png" title="Biodiversitäts-Atlas Österreich">
        </a>
    </div>
    <div class="inside-header grid-container grid-parent">
        <nav style="width: 70%; float:right;" id="site-navigation" class="main-navigation grid-container grid-parent" itemtype="https://schema.org/SiteNavigationElement" itemscope>
            <div style="max-width: fit-content;" class="inside-navigation grid-container grid-parent">
                <button class="menu-toggle" aria-controls="primary-menu" aria-expanded="false">
                    <span class="mobile-menu"></span>
                </button>
                <div id="primary-menu" class="main-nav">
                    <script type="text/javascript">
                    if(window.getCookie('lang') === "de_AT") {
                        $("#primary-menu").children().remove();
                        $("#primary-menu").html("<ul id=\"menu-main\" class=\" menu sf-menu\"><li id=\"menu-item-500\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-500\"><a href=\"#\">Suchen und Erkunden<span role=\"presentation\" class=\"dropdown-menu-toggle\"></span></a>\n" +
                            "                        <ul class=\"sub-menu\">\n" +
                            "                            <li id=\"menu-item-499\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-499\"><a href=\"https://biocache.biodiversityatlas.at/\">Atlas durchsuchen</a></li>\n" +
                            "                            <li id=\"menu-item-501\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-501\"><a href=\"https://biocache.biodiversityatlas.at/explore/your-area\">Umgebung erkunden</a></li>\n" +
                            "                            <li id=\"menu-item-502\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-502\"><a href=\"https://regions.biodiversityatlas.at/\">Biodiversität der Regionen</a></li>\n" +
                            "                        </ul>\n" +
                            "                    </li>\n" +
                            "                        <li id=\"menu-item-498\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-498\"><a href=\"https://spatial.biodiversityatlas.at/\">Spatial Portal</a></li>\n" +
                            "                        <li id=\"menu-item-632\" class=\"menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children menu-item-632\"><a href=\"https://biodiversityatlas.at/beitragen/\">Beitragen<span role=\"presentation\" class=\"dropdown-menu-toggle\"></span></a>\n" +
                            "                            <ul class=\"sub-menu\">\n" +
                            "                                <li id=\"menu-item-633\" class=\"menu-item menu-item-type-post_type menu-item-object-page menu-item-633\"><a href=\"https://biodiversityatlas.at/feedback/\">Feedback</a></li>\n" +
                            "                            </ul>\n" +
                            "                        </li>\n" +
                            "                        <li id=\"menu-item-503\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-503\"><a href=\"#\">Datenpartner_innen<span role=\"presentation\" class=\"dropdown-menu-toggle\"></span></a>\n" +
                            "                            <ul class=\"sub-menu\">\n" +
                            "                                <li id=\"menu-item-504\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-504\"><a href=\"https://collectory.biodiversityatlas.at/datasets\">Datensätze erkunden</a></li>\n" +
                            "                                <li id=\"menu-item-505\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-505\"><a href=\"https://collectory.biodiversityatlas.at/\">Datenpartner_innen erkunden</a></li>\n" +
                            "                                <li id=\"menu-item-634\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-634\"><a href=\"https://dashboard.biodiversityatlas.at/\">Datenübersicht</a></li>\n" +
                            "                            </ul>\n" +
                            "                        </li>\n" +
                            "                        <li id=\"menu-item-518\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-518\"><a href=\"#\">Info &#038; Support<span role=\"presentation\" class=\"dropdown-menu-toggle\"></span></a>\n" +
                            "                            <ul class=\"sub-menu\">\n" +
                            "                                <li id=\"menu-item-517\" class=\"menu-item menu-item-type-post_type menu-item-object-page menu-item-517\"><a href=\"https://biodiversityatlas.at/ueber-den-atlas/\">Über den Atlas</a></li>\n" +
                            "                                <li id=\"menu-item-516\" class=\"menu-item menu-item-type-post_type menu-item-object-page menu-item-516\"><a href=\"https://biodiversityatlas.at/tutorials/\">Tutorials</a></li>\n" +
                            "                                <li id=\"menu-item-515\" class=\"menu-item menu-item-type-post_type menu-item-object-page menu-item-515\"><a href=\"https://biodiversityatlas.at/kontakt/\">Kontakt</a></li>\n" +
                            "                            </ul>\n" +
                            "                        </li>\n" +
                            " <li id='menu-item-775'\n" +
                            "     className='pll-parent-menu-item menu-item menu-item-type-custom menu-item-object-custom current-menu-parent menu-item-has-children menu-item-775'>\n" +
                            "     <a href='#pll_switcher'><img\n" +
                            "         src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAMAAABBPP0LAAAAQlBMVEX+AADzAADrAAD/eXn4cHH3ZWX8Wlr6Tk75QUH4NDT1KCj9o6P9jY78hYX4fHzp6en8/Pz39/fw8PDi4uLhAADzDw99ibtVAAAATUlEQVR4AQXBMQ7CMAAAMV8SJFIGJP7/RdYOVCDsAAjJhCRyLSaR5GftEZGT9qdnQOQ7xgAEMIAArKsSJ7FnblPigff9qJVIxFEEL8AfSIwIeyUkkmsAAAAASUVORK5CYII='\n" +
                            "         alt='Deutsch' width='16' height='11'\n" +
                            "         style='width: 16px; height: 11px;' /> \n" +
                            "     <span role='presentation' class='dropdown-menu-toggle'></span></a> \n" +
                            "     <ul className='sub-menu'>\n" +
                            "         <li id='menu-item-775-en'\n" +
                            "             className='lang-item lang-item-10 lang-item-en lang-item-first menu-item menu-item-type-custom menu-item-object-custom menu-item-775-en'>\n" +
                            "             <a id='aClickEN' onclick='func_setStorage(1);' href='?lang=default' hrefLang='en-GB'\n" +
                            "                lang='en-GB'><img\n" +
                            "                 src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAMAAABBPP0LAAAAt1BMVEWSmb66z+18msdig8La3u+tYX9IaLc7W7BagbmcUW+kqMr/q6n+//+hsNv/lIr/jIGMnNLJyOP9/fyQttT/wb3/////aWn+YWF5kNT0oqz0i4ueqtIZNJjhvt/8gn//WVr/6+rN1+o9RKZwgcMPJpX/VFT9UEn+RUX8Ozv2Ly+FGzdYZrfU1e/8LS/lQkG/mbVUX60AE231hHtcdMb0mp3qYFTFwNu3w9prcqSURGNDaaIUMX5FNW5wYt7AAAAAjklEQVR4AR3HNUJEMQCGwf+L8RR36ajR+1+CEuvRdd8kK9MNAiRQNgJmVDAt1yM6kSzYVJUsPNssAk5N7ZFKjVNFAY4co6TAOI+kyQm+LFUEBEKKzuWUNB7rSH/rSnvOulOGk+QlXTBqMIrfYX4tSe2nP3iRa/KNK7uTmWJ5a9+erZ3d+18od4ytiZdvZyuKWy8o3UpTVAAAAABJRU5ErkJggg=='\n" +
                            "                 alt='English' width='16' height='11'\n" +
                            "                 style='width: 16px; height: 11px;'></a></li>\n" +
                            "         <li id='menu-item-775-de'\n" +
                            "             className='lang-item lang-item-13 lang-item-de current-lang menu-item menu-item-type-custom menu-item-object-custom current_page_item menu-item-home menu-item-775-de'>\n" +
                            "             <a id='aClickDE' onclick='func_setStorage(0);' href='?lang=de_AT' hrefLang='de-AT'\n" +
                            "                lang='de-AT'><img\n" +
                            "                 src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAMAAABBPP0LAAAAQlBMVEX+AADzAADrAAD/eXn4cHH3ZWX8Wlr6Tk75QUH4NDT1KCj9o6P9jY78hYX4fHzp6en8/Pz39/fw8PDi4uLhAADzDw99ibtVAAAATUlEQVR4AQXBMQ7CMAAAMV8SJFIGJP7/RdYOVCDsAAjJhCRyLSaR5GftEZGT9qdnQOQ7xgAEMIAArKsSJ7FnblPigff9qJVIxFEEL8AfSIwIeyUkkmsAAAAASUVORK5CYII='\n" +
                            "                 alt='Deutsch' width='16' height='11'\n" +
                            "                 style='width: 16px; height: 11px;'></a></li>\n" +
                            "     </ul>\n" +
                            " </li>\n" +
                            "                    </ul><p id='idlang' style='visibility: hidden'>de</p>");
                    }
                    if(window.getCookie('lang') !== "de_AT") {
                        $("#primary-menu").children().remove();
                        $("#primary-menu").html("<ul id=\"menu-main\" class=\" menu sf-menu\"><li id=\"menu-item-500\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-500\"><a href=\"#\">Search &#038; discover<span role=\"presentation\" class=\"dropdown-menu-toggle\"></span></a>\n" +
                            "                        <ul class=\"sub-menu\">\n" +
                            "                            <li id=\"menu-item-499\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-499\"><a href=\"https://biocache.biodiversityatlas.at/\">Search the atlas</a></li>\n" +
                            "                            <li id=\"menu-item-501\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-501\"><a href=\"https://biocache.biodiversityatlas.at/explore/your-area\">Explore your area</a></li>\n" +
                            "                            <li id=\"menu-item-502\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-502\"><a href=\"https://regions.biodiversityatlas.at/\">Explore regions</a></li>\n" +
                            "                        </ul>\n" +
                            "                    </li>\n" +
                            "                        <li id=\"menu-item-498\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-498\"><a href=\"https://spatial.biodiversityatlas.at/\">Spatial portal</a></li>\n" +
                            "                        <li id=\"menu-item-632\" class=\"menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children menu-item-632\"><a href=\"https://biodiversityatlas.at/beitragen/\">Contribute<span role=\"presentation\" class=\"dropdown-menu-toggle\"></span></a>\n" +
                            "                            <ul class=\"sub-menu\">\n" +
                            "                                <li id=\"menu-item-633\" class=\"menu-item menu-item-type-post_type menu-item-object-page menu-item-633\"><a href=\"https://biodiversityatlas.at/feedback/\">Feedback</a></li>\n" +
                            "                            </ul>\n" +
                            "                        </li>\n" +
                            "                        <li id=\"menu-item-503\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-503\"><a href=\"#\">Data partners<span role=\"presentation\" class=\"dropdown-menu-toggle\"></span></a>\n" +
                            "                            <ul class=\"sub-menu\">\n" +
                            "                                <li id=\"menu-item-504\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-504\"><a href=\"https://collectory.biodiversityatlas.at/datasets\">Explore datasets</a></li>\n" +
                            "                                <li id=\"menu-item-505\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-505\"><a href=\"https://collectory.biodiversityatlas.at/\">Explore data partners</a></li>\n" +
                            "                                <li id=\"menu-item-634\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-634\"><a href=\"https://dashboard.biodiversityatlas.at/\">Dashboard</a></li>\n" +
                            "                            </ul>\n" +
                            "                        </li>\n" +
                            "                        <li id=\"menu-item-518\" class=\"menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-518\"><a href=\"#\">Info &#038; Support<span role=\"presentation\" class=\"dropdown-menu-toggle\"></span></a>\n" +
                            "                            <ul class=\"sub-menu\">\n" +
                            "                                <li id=\"menu-item-517\" class=\"menu-item menu-item-type-post_type menu-item-object-page menu-item-517\"><a href=\"https://biodiversityatlas.at/ueber-den-atlas/\">about the atlas</a></li>\n" +
                            "                                <li id=\"menu-item-516\" class=\"menu-item menu-item-type-post_type menu-item-object-page menu-item-516\"><a href=\"https://biodiversityatlas.at/tutorials/\">Tutorials</a></li>\n" +
                            "                                <li id=\"menu-item-515\" class=\"menu-item menu-item-type-post_type menu-item-object-page menu-item-515\"><a href=\"https://biodiversityatlas.at/kontakt/\">Contact</a></li>\n" +
                            "                            </ul>\n" +
                            "                        </li>\n" +
                            " <li id='menu-item-775'\n" +
                            "     className='pll-parent-menu-item menu-item menu-item-type-custom menu-item-object-custom current-menu-parent menu-item-has-children menu-item-775'>\n" +
                            "     <a href='#pll_switcher'><img\n" +
                            "         src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAMAAABBPP0LAAAAt1BMVEWSmb66z+18msdig8La3u+tYX9IaLc7W7BagbmcUW+kqMr/q6n+//+hsNv/lIr/jIGMnNLJyOP9/fyQttT/wb3/////aWn+YWF5kNT0oqz0i4ueqtIZNJjhvt/8gn//WVr/6+rN1+o9RKZwgcMPJpX/VFT9UEn+RUX8Ozv2Ly+FGzdYZrfU1e/8LS/lQkG/mbVUX60AE231hHtcdMb0mp3qYFTFwNu3w9prcqSURGNDaaIUMX5FNW5wYt7AAAAAjklEQVR4AR3HNUJEMQCGwf+L8RR36ajR+1+CEuvRdd8kK9MNAiRQNgJmVDAt1yM6kSzYVJUsPNssAk5N7ZFKjVNFAY4co6TAOI+kyQm+LFUEBEKKzuWUNB7rSH/rSnvOulOGk+QlXTBqMIrfYX4tSe2nP3iRa/KNK7uTmWJ5a9+erZ3d+18od4ytiZdvZyuKWy8o3UpTVAAAAABJRU5ErkJggg=='\n" +
                            "         alt='Englisch' width='16' height='11'\n" +
                            "         style='width: 16px; height: 11px;' /> \n" +
                            "     <span role='presentation' class='dropdown-menu-toggle'></span></a> \n" +
                            "     <ul className='sub-menu'>\n" +
                            "         <li id='menu-item-775-en'\n" +
                            "             className='lang-item lang-item-10 lang-item-en lang-item-first menu-item menu-item-type-custom menu-item-object-custom menu-item-775-en'>\n" +
                            "             <a id='aClickEN' onclick='func_setStorage(1);' href='?lang=default' hrefLang='en-GB'\n" +
                            "                lang='en-GB'><img\n" +
                            "                 src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAMAAABBPP0LAAAAt1BMVEWSmb66z+18msdig8La3u+tYX9IaLc7W7BagbmcUW+kqMr/q6n+//+hsNv/lIr/jIGMnNLJyOP9/fyQttT/wb3/////aWn+YWF5kNT0oqz0i4ueqtIZNJjhvt/8gn//WVr/6+rN1+o9RKZwgcMPJpX/VFT9UEn+RUX8Ozv2Ly+FGzdYZrfU1e/8LS/lQkG/mbVUX60AE231hHtcdMb0mp3qYFTFwNu3w9prcqSURGNDaaIUMX5FNW5wYt7AAAAAjklEQVR4AR3HNUJEMQCGwf+L8RR36ajR+1+CEuvRdd8kK9MNAiRQNgJmVDAt1yM6kSzYVJUsPNssAk5N7ZFKjVNFAY4co6TAOI+kyQm+LFUEBEKKzuWUNB7rSH/rSnvOulOGk+QlXTBqMIrfYX4tSe2nP3iRa/KNK7uTmWJ5a9+erZ3d+18od4ytiZdvZyuKWy8o3UpTVAAAAABJRU5ErkJggg=='\n" +
                            "                 alt='English' width='16' height='11'\n" +
                            "                 style='width: 16px; height: 11px;'></a></li>\n" +
                            "         <li id='menu-item-775-de'\n" +
                            "             className='lang-item lang-item-13 lang-item-de current-lang menu-item menu-item-type-custom menu-item-object-custom current_page_item menu-item-home menu-item-775-de'>\n" +
                            "             <a id='aClickDE' onclick='func_setStorage(0);' href='?lang=de_AT' hrefLang='de-AT'\n" +
                            "                lang='de-AT'><img\n" +
                            "                 src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAMAAABBPP0LAAAAQlBMVEX+AADzAADrAAD/eXn4cHH3ZWX8Wlr6Tk75QUH4NDT1KCj9o6P9jY78hYX4fHzp6en8/Pz39/fw8PDi4uLhAADzDw99ibtVAAAATUlEQVR4AQXBMQ7CMAAAMV8SJFIGJP7/RdYOVCDsAAjJhCRyLSaR5GftEZGT9qdnQOQ7xgAEMIAArKsSJ7FnblPigff9qJVIxFEEL8AfSIwIeyUkkmsAAAAASUVORK5CYII='\n" +
                            "                 alt='Deutsch' width='16' height='11'\n" +
                            "                 style='width: 16px; height: 11px;'></a></li>\n" +
                            "     </ul>\n" +
                            " </li>\n" +
                            "                    </ul><p id='idlang' style='visibility: hidden'>en</p>");
                    }
                </script>
                </div><!-- .inside-navigation -->
        </nav><!-- #site-navigation -->
    </div><!-- .inside-header -->
</header><!-- #masthead -->
</div>
<!-- End header -->
<section id="breadcrumb">
    <div class="container-fluid">
        <div class="row">
            <nav aria-label="Breadcrumb" role="navigation">
                <ol class="breadcrumb-list">
                    <li><a href="https://biodiversityatlas.at">Home</a></li>
                    <li class="active">
                        <a href="\">Spatial Portal</a>
                    </li>
                </ol>
            </nav>
        </div>
    </div>
</section>
<!-- End banner -->

<!-- Container -->
<div class="${fluidLayout ? 'container-fluid' : 'container'}" id="main">
    <g:layoutBody/>
</div><!-- End container #main col -->
<!-- Footer -->
<div id="footer">
    <div class="site-footer">
        <footer class="site-info" itemtype="https://schema.org/WPFooter" itemscope>
            <div class="inside-site-info grid-container grid-parent">
                <div class="copyright-bar">
                    <span class="copyright">&copy; 2019 Biodiversitäts-Atlas Österreich</span> &bull; Powered by <a href="https://generatepress.com" itemprop="url">GeneratePress</a>				</div>
            </div>
        </footer><!-- .site-info -->
    </div><!-- .site-footer -->

    <!--<a title="Nach oben scrollen" rel="nofollow" href="#" class="generate-back-to-top" style="opacity:0;visibility:hidden;" data-scroll-speed="400" data-start-scroll="300">-->
    <!--<span class="screen-reader-text">Nach oben scrollen</span>-->

</a><div class="sub-footer generate-sections-inside-container">
        <div class="lgc-column lgc-grid-parent lgc-grid-50 lgc-tablet-grid-50 lgc-mobile-grid-100  "><div class="inside-grid-column">
            <p id="ft_logos"><img class="wp-image-352" src="https://biodiversityatlas.at/wp-content/uploads/2019/04/1200px-Donau_Universität_Krems.svg_.png" alt="" width="50" height="50" /><img class="alignnone size-full wp-image-357" src="https://core.biodiversityatlas.at/wp-content/uploads/2019/04/logo_RGB_RZ_small-e1556642757238.png" alt="" width="93" height="50" /></p>

        </div></div>
        <div class="lgc-column lgc-grid-parent lgc-grid-50 lgc-tablet-grid-50 lgc-mobile-grid-100  "><div class="inside-grid-column">
            <!-- Widget Shortcode --><div id="nav_menu-9" class="widget widget_nav_menu widget-shortcode area-arbitrary"><div class="menu-sub-footer-container"><ul id="menu-sub-footer" class="menu"><li id="menu-item-273" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-273"><a href="https://docs.google.com/forms/d/e/1FAIpQLSdhawtf2C2ZiK8_kczTDoHV8_SS_SdPYjRW-0C_PQrhQoX0cA/viewform?vc=0&#038;c=0&#038;w=1">Feedback</a></li>
                <li id="menu-item-274" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-274"><a href="https://biodiversityatlas.at/kontakt/">Kontakt</a></li>
                <li id="menu-item-275" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-275"><a href="https://biodiversityatlas.at/nutzungsbedingungen/">Nutzungsbedingungen</a></li>
                <li id="menu-item-276" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-276"><a href="https://biodiversityatlas.at/datenschutzerklaerung/">Copyright</a></li>
                <li id="menu-item-277" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-277"><a href="https://biodiversityatlas.at/impressum/">Impressum</a></li>
            </ul></div></div><!-- /Widget Shortcode -->
        </div></div><div class="lgc-clear"></div>
    </div>
</div><!--/#footer -->
<!-- End footer -->

<!-- JS resources-->
<asset:javascript src="generic.js"/>
<asset:deferredScripts />

</body>
</html>

