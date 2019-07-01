<!doctype html>
<html>
<head>
    <g:if test="${config == null}">
        <g:set var="config" value="${grailsApplication.config}"/>
    </g:if>

    <meta name="layout" content="${config.skin.layout}">
    <g:if env="development"><asset:stylesheet src="errors.css"/></g:if>
</head>

<body>
<ul class="errors">
    <li>Error: Access Denied (401)</li>
</ul>
</body>
</html>