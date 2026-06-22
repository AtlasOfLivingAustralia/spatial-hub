<!DOCTYPE html>
<html lang="en-AU">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <meta name="app.version" content="${g.meta(name: 'info.app.version')}"/>
    <meta name="app.build" content="${g.meta(name: 'info.app.build')}"/>
    <meta name="description" content="${grailsApplication.config.skin?.orgNameLong?:'Atlas of Living Australia'}"/>
    <meta name="author" content="${grailsApplication.config.skin?.orgNameLong?:'Atlas of Living Australia'}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Favicon -->
    <link href="${grailsApplication.config.favicon.url}" rel="shortcut icon"  type="image/x-icon"/>

    <title><g:layoutTitle/></title>
    <g:layoutHead/>
    <asset:stylesheet href="application.css" />
    <g:if test="${grailsApplication.config.fathomId != null && grailsApplication.config.fathomId != ''}">
        <script src="https://cdn.usefathom.com/script.js" data-site="${grailsApplication.config.fathomId}" defer></script>
    </g:if>

</head>

<body class="${pageProperty(name: 'body.class')}" id="${pageProperty(name: 'body.id')}"
      onload="${pageProperty(name: 'body.onload')}">
<g:set var="fluidLayout" value="${pageProperty(name: 'meta.fluidLayout') ?: grailsApplication.config.skin.fluidLayout}"/>
<g:set var="loginStatus" value="${request.userPrincipal ? 'signedIn' : 'signedOut'}"/>
<g:set var="hideLoggedOut" value="${request.userPrincipal ? '' : 'hidden'}"/>

<!-- Header -->
<g:set var="headerVisiblity" value="${(grailsApplication.config.skin.header && grailsApplication.config.spApp.header) ? '' : 'hidden'}"/>

<div id="wrapper-navbar" itemscope="" itemtype="http://schema.org/WebSite" class="${headerVisiblity}">
    <a class="skip-link sr-only sr-only-focusable" href="#INSERT_CONTENT_ID_HERE">Skip to content</a>

    <nav class="navbar navbar-inverse navbar-expand-md">
        <div class="container-fluid header-logo-menu">
            <!-- Your site title as branding in the menu -->
            <div class="navbar-header">
                <div>
                    <a href="https://www.ala.org.au/" class="custom-logo-link navbar-brand" itemprop="url">
                        <img width="1005" height="150" src="https://www.ala.org.au/app/uploads/2019/01/logo.png"
                             class="custom-logo" alt="Atlas of Living Australia" itemprop="image"
                             srcset="https://www.ala.org.au/app/uploads/2019/01/logo.png 1005w, https://www.ala.org.au/app/uploads/2019/01/logo-300x45.png 300w, https://www.ala.org.au/app/uploads/2019/01/logo-768x115.png 768w"
                             sizes="(max-width: 1005px) 100vw, 1005px"></a>
                    <!-- end custom logo -->
                </div>

                <div class="display-flex ${loginStatus}">
                    <g:if test="${request.userPrincipal != null}">
                        <a href="#" class="save-load"
                           onclick="$('#saveSessionButton')[0].click()"
                           data-toggle="dropdown" role="button"
                           aria-expanded="false">Save</a>
                        <a href="#" class="save-load"
                           onclick="$('#sessionsButton')[0].click()"
                           data-toggle="dropdown" role="button"
                           aria-expanded="false">Load</a>
                        <g:if test="grailsApplication.config.workflow.enabled">
                            <a href="#" class="save-load"
                               onclick="$('#workflowsButton')[0].click()"
                               data-toggle="dropdown" role="button"
                               aria-expanded="false">Workflows</a>
                        </g:if>
                    </g:if>
                    <button class="display-flex search-trigger hidden-md hidden-lg collapsed collapse-trigger-button"
                            title="Open search dialog"
                            data-toggle="collapse" data-target="#autocompleteSearchALA"
                            onclick="focusOnClickSearchButton()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="18" viewBox="0 0 22 22">
                            <defs>
                                <style>
                                .search-icon {
                                    fill: #fff;
                                    fill-rule: evenodd;
                                }
                                </style>
                            </defs>
                            <path class="search-icon"
                                  d="M1524.33,60v1.151a7.183,7.183,0,1,1-2.69.523,7.213,7.213,0,0,1,2.69-.523V60m0,0a8.333,8.333,0,1,0,7.72,5.217A8.323,8.323,0,0,0,1524.33,60h0Zm6.25,13.772-0.82.813,7.25,7.254a0.583,0.583,0,0,0,.82,0,0.583,0.583,0,0,0,0-.812l-7.25-7.254h0Zm-0.69-7.684,0.01,0c0-.006-0.01-0.012-0.01-0.018s-0.01-.015-0.01-0.024a6,6,0,0,0-7.75-3.3l-0.03.009-0.02.006v0a0.6,0.6,0,0,0-.29.293,0.585,0.585,0,0,0,.31.756,0.566,0.566,0,0,0,.41.01V63.83a4.858,4.858,0,0,1,6.32,2.688l0.01,0a0.559,0.559,0,0,0,.29.29,0.57,0.57,0,0,0,.75-0.305A0.534,0.534,0,0,0,1529.89,66.089Z"
                                  transform="translate(-1516 -60)"></path>
                        </svg>
                        <span class="collapse visible-on-show" aria-hidden="true">&times;</span>
                    </button>
                    <g:if test="${request.userPrincipal == null}">
                        <hf:loginLogout role="button"
                                        class="account-mobile hidden-md hidden-lg loginBtn mobile-login-btn"/>
                    </g:if>
                    <g:if test="${request.userPrincipal != null}">
                        <a href="${grailsApplication.config.userdetails.web.url+'profile'}" role="button"
                           class="account-mobile hidden-md hidden-lg myProfileBtn hideLoggedOut" title="My Account">
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="18" viewBox="0 0 37 41">
                                <defs>
                                    <style>
                                    .account-icon {
                                        fill: #212121;
                                        fill-rule: evenodd;
                                    }
                                    </style>
                                </defs>
                                <path id="Account" class="account-icon"
                                      d="M614.5,107.1a11.549,11.549,0,1,0-11.459-11.549A11.516,11.516,0,0,0,614.5,107.1Zm0-21.288a9.739,9.739,0,1,1-9.664,9.739A9.711,9.711,0,0,1,614.5,85.81Zm9.621,23.452H604.874a8.927,8.927,0,0,0-8.881,8.949V125h37v-6.785A8.925,8.925,0,0,0,624.118,109.262Zm7.084,13.924H597.789v-4.975a7.12,7.12,0,0,1,7.085-7.139h19.244a7.119,7.119,0,0,1,7.084,7.139v4.975Z"
                                      transform="translate(-596 -84)"></path>
                            </svg>
                        </a>

                        <g:link url="${grailsApplication.config.grails.serverURL}/logout"  role="button"
                                class="account-mobile hidden-md hidden-lg logoutBtn mobile-logout-btn" title="Logout link">
                            <i class="fas fa-sign-out"></i>
                        </g:link>

                    </g:if>
                    <button class="navbar-toggle collapsed collapse-trigger-button" type="button"
                            data-toggle="collapse" data-target="#navbarOuterWrapper" aria-controls="navbarOuterWrapper"
                            aria-expanded="false" aria-label="Toggle navigation">
                        <div class="horizontal-line"></div>

                        <div class="horizontal-line"></div>

                        <div class="horizontal-line"></div>
                        <span class="collapse visible-on-show" aria-hidden="true">&times;</span>
                    </button>
                </div>
            </div>

            <div id="navbarOuterWrapper" class="outer-nav-wrapper navbar-collapse collapse">
                <div class="main-nav-wrapper">
                    <!-- The WordPress Menu goes here -->
                    <div id="navbarNavDropdown">
                        <ul id="main-menu" class="nav navbar-nav" role="menubar">
                            <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                id="menu-item-22"
                                class="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children dropdown menu-item-22 nav-item show">
                                <a title="Search &amp; analyse" href="#" data-toggle="dropdown" aria-haspopup="true"
                                   aria-expanded="true" class="dropdown-toggle nav-link"
                                   id="menu-item-dropdown-22">Search
                                &amp; analyse <span class="caret"></span></a>
                                <ul class="dropdown-menu" aria-labelledby="menu-item-dropdown-22" role="menu">
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-41958"
                                        class="menu-item menu-item-type-custom menu-item-object-custom menu-item-41958 nav-item">
                                        <a title="Search species" href="https://bie.ala.org.au/"
                                           class="dropdown-item">Search
                                        species</a></li>
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-23"
                                        class="menu-item menu-item-type-custom menu-item-object-custom menu-item-23 nav-item">
                                        <a title="Search &amp; download records"
                                           href="https://biocache.ala.org.au/search#tab_simpleSearch"
                                           class="dropdown-item">Search &amp; download records</a></li>
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-28"
                                        class="menu-item menu-item-type-custom menu-item-object-custom menu-item-28 nav-item">
                                        <a title="Search datasets" href="https://collections.ala.org.au/datasets"
                                           class="dropdown-item">Search datasets</a></li>
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-41967" role="separator" class="divider"></li>
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-24"
                                        class="menu-item menu-item-type-custom menu-item-object-custom menu-item-24 nav-item">
                                        <a title="Spatial analysis (Spatial Portal)" href="https://spatial.ala.org.au/"
                                           class="dropdown-item">Spatial analysis (Spatial Portal)</a></li>
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-26"
                                        class="menu-item menu-item-type-custom menu-item-object-custom menu-item-26 nav-item">
                                        <a title="Explore your area"
                                           href="https://biocache.ala.org.au/explore/your-area"
                                           class="dropdown-item">Explore
                                        your area</a></li>
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-31"
                                        class="menu-item menu-item-type-custom menu-item-object-custom menu-item-31 nav-item">
                                        <a title="Explore natural history collections"
                                           href="https://collections.ala.org.au/" class="dropdown-item">Explore natural
                                        history collections</a></li>
                                </ul>
                            </li>
                            <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                id="menu-item-32"
                                class="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children dropdown menu-item-32 nav-item">
                                <a title="Contribute" href="#" data-toggle="dropdown" aria-haspopup="true"
                                   aria-expanded="false" class="dropdown-toggle nav-link"
                                   id="menu-item-dropdown-32">Contribute
                                    <span class="caret"></span></a>
                                <ul class="dropdown-menu" aria-labelledby="menu-item-dropdown-32" role="menu">
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-40773"
                                        class="menu-item menu-item-type-custom menu-item-object-custom menu-item-40773 nav-item">
                                        <a title="Share your dataset"
                                           href="https://support.ala.org.au/support/solutions/articles/6000195493-how-to-submit-a-data-set"
                                           class="dropdown-item">Share your dataset</a></li>
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-40728"
                                        class="menu-item menu-item-type-custom menu-item-object-custom menu-item-40728 nav-item">
                                        <a title="Upload species list"
                                           href="https://lists.ala.org.au/public/speciesLists"
                                           class="dropdown-item">Upload
                                        species list</a></li>
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-41968" role="separator" class="divider"></li>
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-33"
                                        class="menu-item menu-item-type-custom menu-item-object-custom menu-item-33 nav-item">
                                        <a title="Record a sighting"
                                           href="https://biocollect.ala.org.au/bioActivity/create/e61eb018-02a9-4e3b-a4b3-9d6be33d9cbb?returnTo=%2Fsightings%2FbioActivity%2FprojectRecords%2Ff813c99c-1a1d-4096-8eeb-cbc40e321101&amp;hub=sightings"
                                           class="dropdown-item">Record a sighting</a></li>
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-35"
                                        class="menu-item menu-item-type-custom menu-item-object-custom menu-item-35 nav-item">
                                        <a title="Transcribe &amp; digitise (DigiVol)"
                                           href="https://volunteer.ala.org.au/" class="dropdown-item">Transcribe &amp;
                                        digitise (DigiVol)</a></li>
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-37"
                                        class="menu-item menu-item-type-custom menu-item-object-custom menu-item-37 nav-item">
                                        <a title="Discover citizen science projects"
                                           href="https://biocollect.ala.org.au/acsa?hub=ala-cs#isCitizenScience%3Dtrue%26isWorldWide%3Dfalse%26max%3D20%26sort%3DdateCreatedSort"
                                           class="dropdown-item">Discover citizen science projects</a></li>
                                </ul>
                            </li>
                            <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                id="menu-item-178"
                                class="menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children dropdown menu-item-178 nav-item">
                                <a title="About" href="#" data-toggle="dropdown" aria-haspopup="true"
                                   aria-expanded="false" class="dropdown-toggle nav-link"
                                   id="menu-item-dropdown-178">About
                                    <span class="caret"></span></a>
                                <ul class="dropdown-menu" aria-labelledby="menu-item-dropdown-178" role="menu">
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-179"
                                        class="menu-item menu-item-type-post_type menu-item-object-page menu-item-179 nav-item">
                                        <a title="About us" href="https://www.ala.org.au/about-ala/"
                                           class="dropdown-item">About us</a></li>
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-40734"
                                        class="menu-item menu-item-type-post_type menu-item-object-page current_page_parent menu-item-40734 nav-item">
                                        <a title="News &amp; media" href="https://www.ala.org.au/blog/"
                                           class="dropdown-item">News &amp; media</a></li>
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-175"
                                        class="menu-item menu-item-type-post_type menu-item-object-page menu-item-175 nav-item">
                                        <a title="Contact us" href="https://www.ala.org.au/contact-us/"
                                           class="dropdown-item">Contact us</a></li>
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-41969" role="separator" class="divider"></li>
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-40731"
                                        class="menu-item menu-item-type-custom menu-item-object-custom menu-item-40731 nav-item">
                                        <a title="International Living Atlases" href="https://living-atlases.gbif.org/"
                                           class="dropdown-item">International Living Atlases</a></li>
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-40730"
                                        class="menu-item menu-item-type-post_type menu-item-object-page menu-item-40730 nav-item">
                                        <a title="Education resources"
                                           href="https://www.ala.org.au/education-resources/"
                                           class="dropdown-item">Education
                                        resources</a></li>
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-177"
                                        class="menu-item menu-item-type-post_type menu-item-object-page menu-item-177 nav-item">
                                        <a title="Indigenous ecological knowledge"
                                           href="https://www.ala.org.au/indigenous-ecological-knowledge/"
                                           class="dropdown-item">Indigenous ecological knowledge</a></li>
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-41970" role="separator" class="divider"></li>
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-41796"
                                        class="menu-item menu-item-type-post_type menu-item-object-page menu-item-41796 nav-item">
                                        <a title="All sites, services &amp; tools"
                                           href="https://www.ala.org.au/sites-and-services/" class="dropdown-item">All
                                        sites, services &amp; tools</a></li>
                                </ul>
                            </li>
                            <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                id="menu-item-41391"
                                class="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children dropdown menu-item-41391 nav-item">
                                <a title="Help" href="#" data-toggle="dropdown" aria-haspopup="true"
                                   aria-expanded="false" class="dropdown-toggle nav-link"
                                   id="menu-item-dropdown-41391">Help
                                    <span class="caret"></span></a>
                                <ul class="dropdown-menu" aria-labelledby="menu-item-dropdown-41391" role="menu">
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-41959"
                                        class="menu-item menu-item-type-custom menu-item-object-custom menu-item-41959 nav-item">
                                        <a title="Browse all articles (FAQs)"
                                           href="https://support.ala.org.au/support/home" class="dropdown-item">Browse
                                        all articles (FAQs)</a></li>
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-41960"
                                        class="menu-item menu-item-type-custom menu-item-object-custom menu-item-41960 nav-item">
                                        <a title="ALA Data help"
                                           href="https://support.ala.org.au/support/solutions/6000137994"
                                           class="dropdown-item">ALA Data help</a></li>
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-41961"
                                        class="menu-item menu-item-type-custom menu-item-object-custom menu-item-41961 nav-item">
                                        <a title="ALA Tools &amp; Apps help"
                                           href="https://support.ala.org.au/support/solutions/6000138053"
                                           class="dropdown-item">ALA Tools &amp; Apps help</a></li>
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-41962"
                                        class="menu-item menu-item-type-custom menu-item-object-custom menu-item-41962 nav-item">
                                        <a title="ALA Spatial Portal help"
                                           href="https://support.ala.org.au/support/solutions/6000138349"
                                           class="dropdown-item">ALA Spatial Portal help</a></li>
                                    <li itemscope="itemscope" itemtype="https://www.schema.org/SiteNavigationElement"
                                        id="menu-item-41963"
                                        class="menu-item menu-item-type-custom menu-item-object-custom menu-item-41963 nav-item">
                                        <a title="Contact us" href="https://www.ala.org.au/contact-us/"
                                           class="dropdown-item">Contact us</a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>

                    <button class="search-trigger hidden-xs hidden-sm collapsed collapse-trigger-button"
                            data-toggle="collapse"
                            data-target="#autocompleteSearchALA" onclick="focusOnClickSearchButton()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 22 22"
                             title="Open search control">
                            <defs>
                                <style>
                                .search-icon {
                                    fill: #fff;
                                    fill-rule: evenodd;
                                }
                                </style>
                            </defs>
                            <path class="search-icon"
                                  d="M1524.33,60v1.151a7.183,7.183,0,1,1-2.69.523,7.213,7.213,0,0,1,2.69-.523V60m0,0a8.333,8.333,0,1,0,7.72,5.217A8.323,8.323,0,0,0,1524.33,60h0Zm6.25,13.772-0.82.813,7.25,7.254a0.583,0.583,0,0,0,.82,0,0.583,0.583,0,0,0,0-.812l-7.25-7.254h0Zm-0.69-7.684,0.01,0c0-.006-0.01-0.012-0.01-0.018s-0.01-.015-0.01-0.024a6,6,0,0,0-7.75-3.3l-0.03.009-0.02.006v0a0.6,0.6,0,0,0-.29.293,0.585,0.585,0,0,0,.31.756,0.566,0.566,0,0,0,.41.01V63.83a4.858,4.858,0,0,1,6.32,2.688l0.01,0a0.559,0.559,0,0,0,.29.29,0.57,0.57,0,0,0,.75-0.305A0.534,0.534,0,0,0,1529.89,66.089Z"
                                  transform="translate(-1516 -60)"></path>
                        </svg>
                        <span class="collapse visible-on-show" aria-hidden="true" title="Close">&times;</span>
                    </button>
                </div>

            </div>
        </div><!-- .container -->
        <div class="container-fluid">
            <div id="autocompleteSearchALA" class="collapse">
                <form method="get" action="${grailsApplication.config.bie.baseURL}${grailsApplication.config.bie.searchPath}" class="search-form">
                    <div class="space-between">
                        <input id="autocompleteHeader" type="text" name="q"
                               placeholder="Search species, datasets, and more..." class="search-input"
                               autocomplete="off"/>
                        <button class="search-submit" title="submit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 22 22">
                                <defs>
                                    <style>
                                    .search-icon {
                                        fill: #fff;
                                        fill-rule: evenodd;
                                    }
                                    </style>
                                </defs>
                                <path class="search-icon"
                                      d="M1524.33,60v1.151a7.183,7.183,0,1,1-2.69.523,7.213,7.213,0,0,1,2.69-.523V60m0,0a8.333,8.333,0,1,0,7.72,5.217A8.323,8.323,0,0,0,1524.33,60h0Zm6.25,13.772-0.82.813,7.25,7.254a0.583,0.583,0,0,0,.82,0,0.583,0.583,0,0,0,0-.812l-7.25-7.254h0Zm-0.69-7.684,0.01,0c0-.006-0.01-0.012-0.01-0.018s-0.01-.015-0.01-0.024a6,6,0,0,0-7.75-3.3l-0.03.009-0.02.006v0a0.6,0.6,0,0,0-.29.293,0.585,0.585,0,0,0,.31.756,0.566,0.566,0,0,0,.41.01V63.83a4.858,4.858,0,0,1,6.32,2.688l0.01,0a0.559,0.559,0,0,0,.29.29,0.57,0.57,0,0,0,.75-0.305A0.534,0.534,0,0,0,1529.89,66.089Z"
                                      transform="translate(-1516 -60)"></path>
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>

    </nav><!-- .site-navigation -->



</div>
<script type="text/html" id="autoCompleteTemplate">
<li class="autocomplete-item striped">
    <div class="content-spacing">
        <div class="autocomplete-heading">
            ${'<% if (commonNameMatches.length > 0) { %><%=commonNameMatches[0]%><% } else if (scientificNameMatches.length > 0) { %><%=scientificNameMatches[0]%><% } else { %><%=matchedNames[0]%><% } %>'.encodeAsRaw()}
        </div>
    </div>
</li>
</script>

<!-- End header -->
<!-- end banner message -->
<ala:systemMessage/>
<!-- Container -->
<div class="${fluidLayout ? 'container-fluid' : 'container'}" id="main">
    <g:layoutBody/>
</div><!-- End container #main col -->

<asset:deferredScripts/>

<asset:javascript src="commonui-bs3-2019/js/application.min.js"/>
<asset:javascript src="commonui-bs3-2019.js"/>

<!-- Google Analytics -->
<g:if test="${grailsApplication.config.googleAnalyticsId != null && grailsApplication.config.googleAnalyticsId != ''}">
    <script>
        (function (i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r;
            i[r] = i[r] || function () {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new Date();
            a = s.createElement(o),
                m = s.getElementsByTagName(o)[0];
            a.async = 1;
            a.src = g;
            m.parentNode.insertBefore(a, m)
        })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
        ga('create', '${grailsApplication.config.googleAnalyticsId}', 'auto');
        ga('send', 'pageview');
    </script>
</g:if>
<!-- End Google Analytics -->
</body>
</html>
