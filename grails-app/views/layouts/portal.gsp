<!DOCTYPE html>
<html lang="en-AU">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <meta name="app.version" content="${g.meta(name: 'app.version')}"/>
    <meta name="app.build" content="${g.meta(name: 'app.build')}"/>
    <meta name="description" content="Atlas of Living Australia"/>
    <meta name="author" content="Atlas of Living Australia">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="http://www.ala.org.au/wp-content/themes/ala2011/images/favicon.ico" rel="shortcut icon"
          type="image/x-icon"/>

    <title><g:layoutTitle/></title>
    <g:layoutHead/>
    <asset:stylesheet href="application.css" />
</head>

<body class="${pageProperty(name: 'body.class')}" id="${pageProperty(name: 'body.id')}"
      onload="${pageProperty(name: 'body.onload')}">

<!-- Header -->
<hf:banner logoutUrl="${g.createLink(controller: "logout", action: "logout", absolute: true)}" ignoreCookie="true"/>
<!-- End header -->
<g:set var="fluidLayout" value="${pageProperty(name: 'meta.fluidLayout') ?: grailsApplication.config.skin?.fluidLayout}"/>

<!-- Container -->
<div class="${fluidLayout ? 'container-fluid' : 'container'}" id="main">
    <g:layoutBody/>
</div><!-- End container #main col -->

<!-- Footer -->
%{--<hf:footer/>--}%
<!-- End footer -->

<!-- JS resources-->
<asset:javascript src="application.js" />
<asset:deferredScripts />

</body>
</html>