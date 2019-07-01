<!DOCTYPE html>
<html>
<head>
    <g:if test="${config == null}">
        <g:set var="config" value="${grailsApplication.config}"/>
    </g:if>

    <meta name="layout" content="${config.skin.layout}">
    <g:if env="development"><asset:stylesheet src="errors.css"/></g:if>
</head>

<body>
<g:if env="development">
    <ul class="errors">
        <li>An error has occurred ${response.status}</li>
    </ul>
    <g:renderException exception="${exception}"/>
</g:if>
<g:else>
    <ul class="errors">
        <li>An error has occurred</li>
    </ul>
</g:else>
</body>
</html>
