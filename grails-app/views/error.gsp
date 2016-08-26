<!DOCTYPE html>
<html>
<head>
    <title><g:if env="development">Grails Runtime Exception</g:if><g:else>Error</g:else></title>
    <meta name="layout" content="main">
    <g:if env="development"><link rel="stylesheet" href="${resource(dir: 'css', file: 'errors.css')}"
                                  type="text/css"></g:if>
    <g:else>
        <link rel="stylesheet" href="${resource(dir: 'css', file: 'errors.css')}"
              type="text/css">
    </g:else>
</head>

<body>
<g:if env="development">
    <g:renderException exception="${exception}"/>
</g:if>
<g:else>
    <ul class="errors">
        <li>An error has occurred</li>
    </ul>
    <g:renderException exception="${exception}"/>
</g:else>
</body>
</html>
