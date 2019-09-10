<!DOCTYPE html>
<html lang="en-AU">
<head>
    <g:if test="${config == null}">
        <g:set var="config" value="${grailsApplication.config}"/>
    </g:if>

    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <meta name="app.version" content="${g.meta(name: 'app.version')}"/>
    <meta name="app.build" content="${g.meta(name: 'app.build')}"/>
    <meta name="description" content="Atlas of Living Australia"/>
    <meta name="author" content="Atlas of Living Australia">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="${config.favicon.url}" rel="shortcut icon"
          type="image/x-icon"/>

    <title><g:layoutTitle/></title>
    <g:layoutHead/>
    <asset:stylesheet href="application.css" />

    <g:if test="${hub != null}">
        <asset:stylesheet href="css/${hub}.css"/>
    </g:if>
</head>

<body class="${pageProperty(name: 'body.class')}" id="${pageProperty(name: 'body.id')}"
      onload="${pageProperty(name: 'body.onload')}">

<g:if test="${config.skin.header && config.spApp.header}">
    <nav class="navbar navbar-default navbar-fixed-top ::authStatusClass::">
        <div class="container container-navbar">

            <div style="position:absolute; float:right; width:100px; right: -20px" id="expand-div">
                <button type="button" id="expand-button" class="navbar-toggle collapsed" data-toggle="collapse"
                        data-target="#bs-example-navbar-collapse-2">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
            </div>

            <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                <div class="row row-search">
                    <div>
                        <a class="navbar-brand" href="https://www.ala.org.au/">
                            <img alt="Brand" src="${config.headerAndFooter.baseURL}/img/ala-logo-2016-inline.png">
                        </a>
                    </div>

                    <div class="col-md-4" id="biesearch-top">
                        <form id="global-search" class="banner" action="${config.bie.baseURL}${config.bie.searchPath}"
                              method="get" name="search-form">
                            <div class="icon-addon addon-lg">
                                <input type="text" placeholder="Search the Atlas ..."
                                       class="form-control autocomplete ac_input" id="biesearch1" name="q"
                                       autocomplete="off">
                                <label for="biesearch1" class="glyphicon glyphicon-search" rel="tooltip"
                                       title="search"></label>
                            </div>
                        </form>
                    </div>

                    <div class="hidden-xs" id="login-buttons">
                        <g:if test="userId != null">
                            <ul class="nav navbar-nav navbar-right nav-logged-in">
                                <g:if test="config.extraLinkUrl != null">
                                    <li class="dropdown font-xsmall"><a
                                            href="${config.extraLinkUrl}">${config.extraLinkText}</a></li>
                                </g:if>
                                <li class="dropdown font-xsmall"><a href="#"
                                                                    onclick="$('#saveSessionButton')[0].click()"
                                                                    data-toggle="dropdown" role="button"
                                                                    aria-expanded="false">Save</a></li>
                                <li class="dropdown font-xsmall"><a href="#" onclick="$('#sessionsButton')[0].click()"
                                                                    data-toggle="dropdown" role="button"
                                                                    aria-expanded="false">Load</a></li>
                                <g:if test="config.workflow.enabled">
                                    <li class="dropdown font-xsmall"><a href="#"
                                                                        onclick="$('#workflowsButton')[0].click()"
                                                                        data-toggle="dropdown" role="button"
                                                                        aria-expanded="false">Workflows</a></li>
                                </g:if>

                                <li class="dropdown">
                                    <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button"
                                       aria-expanded="false">
                                        <g:if test="${cookie(name: 'ALA-Auth')}">
                                            ${cookie(name: 'ALA-Auth')}
                                        </g:if>
                                        <g:else>
                                            My profile
                                        </g:else>
                                        <span class="caret"></span>
                                    </a>
                                    <ul class="dropdown-menu" role="menu">
                                        <li><a href="${config.userdetails.baseUrl}/myprofile/">View profile</a></li>
                                        <li><a href="${config.userdetails.baseUrl}/registration/editAccount">Account settings</a>
                                        </li>
                                        <li class="divider"></li>
                                        <li><a href="${config.security.cas.logoutUrl}?service=${config.grails.serverURL}"
                                               class="null"><span>Log out</span></a></li>
                                    </ul>
                                </li>
                            </ul>
                        </g:if>
                        <g:else>
                            <ul class="nav navbar-nav navbar-right nav-login" class>
                                <li><a href="${config.security.cas.loginUrl}?service=${config.grails.serverURL}"
                                       class="null"><span>Log in</span></a></li>
                            </ul>
                        </g:else>

                    </div>
                </div><!-- End row -->
            </div>

            <div id="logo-dropdown" style="display:none">
                <a class="navbar-brand-drop" href="https://www.ala.org.au/">
                    <img alt="Brand" src="${config.headerAndFooter.baseURL}/img/ala-logo-2016-inline.png">
                </a>
            </div>

            <div class="collapse" id="bs-example-navbar-collapse-2">
                <div class="header-collapse">

                    <div id="biesearch-dropdown">
                        <form id="global-dropdown" class="banner" action="${config.bie.baseURL}${config.bie.searchPath}"
                              method="get" name="search-form">
                            <div class="icon-addon addon-lg">
                                <input type="text" placeholder="Search the Atlas ...2"
                                       class="form-control autocomplete ac_input" id="biesearch2" name="q"
                                       autocomplete="off">
                                <label for="biesearch2" class="glyphicon glyphicon-search" rel="tooltip"
                                       title="search"></label>
                            </div>
                        </form>
                    </div>

                    <div>
                        <ul class="nav navbar-nav ">
                            <!-- <li class="active"><a href="#">Home</a></li> -->
                            <li class="dropdown">
                                <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button"
                                   aria-expanded="false">
                                    Start exploring
                                    <span class="caret"></span>
                                </a>
                                <ul class="dropdown-menu" role="menu">
                                    <li><a href="https://lists.ala.org.au/iconic-species">Australian iconic species</a>
                                    </li>
                                    <li><a href="https://biocache.ala.org.au/explore/your-area">Explore your area</a>
                                    </li>
                                    <li><a href="https://regions.ala.org.au/">Explore regions</a></li>
                                    <li><a href="https://biocache.ala.org.au/search">Search occurrence records</a></li>
                                    <li class="divider"></li>
                                    <li><a href="https://www.ala.org.au/sites-and-services/">Sites &amp; services</a>
                                    </li>
                                </ul>
                            </li>
                            <li class="dropdown">
                                <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button"
                                   aria-expanded="false">
                                    Search &amp; analyse
                                    <span class="caret"></span>
                                </a>
                                <ul class="dropdown-menu" role="menu">
                                    <li><a href="https://collections.ala.org.au/">Browse natural history collections</a>
                                    </li>
                                    <li><a href="https://collections.ala.org.au/datasets">Search datasets</a></li>
                                    <li><a href="https://downloads.ala.org.au">Download datasets</a>
                                    </li><li><a href="https://spatial.ala.org.au/">Spatial portal</a></li>
                                    <li class="divider"></li>
                                    <li><a href="https://dashboard.ala.org.au/">ALA dashboard</a></li>
                                </ul>
                            </li>
                            <li class="dropdown">
                                <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button"
                                   aria-expanded="false">
                                    Participate
                                    <span class="caret"></span>
                                </a>
                                <ul class="dropdown-menu" role="menu">
                                    <li><a href="https://biocollect.ala.org.au/acsa">Join a Citizen Science project</a>
                                    </li>
                                    <li><a href="https://sightings.ala.org.au/">Record a sighting in the ALA</a></li>
                                    <li><a href="https://www.ala.org.au/submit-dataset-to-ala/">Submit a dataset to the ALA</a>
                                    </li>
                                    <li><a href="https://digivol.ala.org.au/">Digitise a record in DigiVol</a></li>
                                </ul>
                            </li>
                            <li class="dropdown">
                                <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button"
                                   aria-expanded="false">
                                    Learn about the ALA
                                    <span class="caret"></span>
                                </a>
                                <ul class="dropdown-menu" role="menu">
                                    <li><a href="https://www.ala.org.au/who-we-are/">Who we are</a></li>
                                    <li class="divider"></li>
                                    <li><a href="https://www.ala.org.au/how-to-use-ala/">How to use the ALA</a></li>
                                    <li><a href="https://www.ala.org.au/how-to-work-with-data/">How to work with data</a>
                                    </li>
                                    <li><a href="https://www.ala.org.au/how-to-cite-ala/">How to cite the ALA</a></li>
                                    <li class="divider"></li>
                                    <li><a href="https://www.ala.org.au/education-resources/">Education resources</a>
                                    </li>
                                    <li><a href="https://www.ala.org.au/ala-and-indigenous-ecological-knowledge-iek/">Indigenous Ecological Knowledge</a>
                                    </li>
                                    <li class="divider"></li>
                                    <li><a href="https://www.ala.org.au/blogs-news/">ALA News</a></li>
                                    <li class="divider"></li>
                                    <li><a href="https://www.ala.org.au/about-the-atlas/contact-us/">Contact us</a></li>
                                    <li><a href="https://www.ala.org.au/about-the-atlas/feedback-form/">Feedback form</a>
                                    </li>
                                </ul>
                            </li>

                        </ul>
                    </div>

                    <div id="login-buttons-dropdown">
                        <ul class="nav navbar-nav ">
                            <li class="divider"></li>
                            <g:if test="userId != null">
                                <g:if test="config.extraLinkUrl != null">
                                    <li class="dropdown font-xsmall"><a
                                            href="${config.extraLinkUrl}">${config.extraLinkText}</a></li>
                                </g:if>
                                <li class="dropdown font-xsmall"><a href="#"
                                                                    onclick="$('#saveSessionButton')[0].click()"
                                                                    data-toggle="dropdown" role="button"
                                                                    aria-expanded="false">Save</a></li>
                                <li class="dropdown font-xsmall"><a href="#" onclick="$('#sessionsButton')[0].click()"
                                                                    data-toggle="dropdown" role="button"
                                                                    aria-expanded="false">Load</a></li>

                                <li><a href="${config.userdetails.baseUrl}/myprofile/"><span>View profile</span></a>
                                </li>
                                <li><a href="${config.userdetails.baseUrl}/registration/editAccount"><span>Account settings</span>
                                </a></li>
                                <li><a href="${config.security.cas.logoutUrl}?service=${config.grails.serverURL}"><span>Log out</span>
                                </a></li>
                            </g:if>
                            <g:else>
                                <li><a href="${config.security.cas.loginUrl}?service=${config.grails.serverURL}"><span>Log in</span>
                                </a></li>
                            </g:else>
                        </ul>
                    </div>


                    <!-- Footer -->
                    <g:if test="${config.footer}">
                        <hf:footer/>
                    </g:if>
                    <!-- End footer -->
                </div>

            </div><!-- /.navbar-collapse -->
        </div><!-- /.container -->
    </nav>
</g:if>

<g:set var="fluidLayout" value="${pageProperty(name: 'meta.fluidLayout') ?: config.skin?.fluidLayout}"/>

<!-- Container -->
<div class="${fluidLayout ? 'container-fluid' : 'container'}" id="main">
    <g:layoutBody/>
</div><!-- End container #main col -->

<asset:deferredScripts />

<!-- Google Analytics -->
<g:if test="${config.googleAnalyticsId != null}">
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
        ga('create', '${config.googleAnalyticsId}', 'auto');
        ga('send', 'pageview');
    </script>
</g:if>
<!-- End Google Analytics -->

</body>
</html>
