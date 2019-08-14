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
    <link href="${config.favicon.url}" rel="shortcut icon" type="image/x-icon"/>
    <link href="${config.headerAndFooter.baseURL}/css/bootstrap.min.css" rel="stylesheet" media="all"/>
    <link href="${config.headerAndFooter.baseURL}/css/ala-styles.css" rel="stylesheet" media="all"/>
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

<!-- Banner -->
<g:if test="${config.header}">
    <hf:banner/>
</g:if>
<!-- End banner -->

<!-- Container -->
<div class="${fluidLayout ? 'container-fluid' : 'container'}" id="main">
    <g:layoutBody/>
</div><!-- End container #main col -->

<!-- Footer -->
<g:if test="${config.header}">
    <hf:footer/>
</g:if>
<!-- End footer -->

<!-- JS resources-->
<asset:javascript src="generic.js"/>
<asset:deferredScripts />

</body>
</html>
