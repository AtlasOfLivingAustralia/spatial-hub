/*
 * Copyright (C) 2013 Atlas of Living Australia
 * All Rights Reserved.
 *
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the 'License'); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 */

package au.org.ala.spatial.portal

import grails.web.http.HttpHeaders
import org.apache.commons.httpclient.HttpClient
import org.apache.commons.httpclient.HttpMethodBase
import org.apache.commons.httpclient.SimpleHttpConnectionManager
import org.apache.commons.httpclient.methods.*
import org.apache.commons.httpclient.methods.multipart.*
import org.apache.commons.httpclient.params.HttpClientParams
import org.apache.http.client.methods.HttpGet
import org.apache.http.client.methods.HttpPost
import org.apache.http.client.methods.HttpPut
import org.apache.http.client.methods.HttpRequestBase
import org.apache.http.client.utils.URIBuilder
import org.apache.http.message.BasicNameValuePair
import org.springframework.web.multipart.MultipartFile

//import org.codehaus.groovy.grails.web.servlet.HttpHeaders
/**
 * Helper class for invoking other ALA web services.
 */
class HubWebService {

    def authService
    def grailsApplication

    Map getUrlMap(String url, Map headers = null, Boolean doAuthentication = null) {
        urlResponse(HttpGet.METHOD_NAME, url, null, headers, null, doAuthentication)
    }

    String getUrl(String url, Map headers = null, Boolean doAuthentication = null) {
        new String(urlResponse(HttpGet.METHOD_NAME, url, null, headers, null, doAuthentication)?.text ?: "")
    }

    Map postUrl(String url, Map nameValues = null, Map headers = null, MultipartFile mFile = null,
                Boolean doAuthentication = null) {
        def entity = null
        def nv = nameValues

        if (mFile) {
            PartSource ps = new ByteArrayPartSource(mFile.originalFilename, mFile.getBytes())
            Part part = new FilePart('files', ps, mFile.getContentType(), 'UTF-8')

            PostMethod postMethod = new PostMethod(url)
            nameValues.each { key, value ->
                if (value) {
                    postMethod.setParameter(String.valueOf(key), String.valueOf(value))
                }
            }

            entity = new MultipartRequestEntity([part].toArray(new Part[0]), postMethod.params)

            nv = null
        }

        urlResponse(HttpPost.METHOD_NAME, url, nv, headers, entity, doAuthentication)
    }

    Map getStream(String url, String type, String contentType, InputStream inputStream) {
        HttpClient client = new HttpClient()
        HttpMethodBase call = null

        HttpClientParams httpParams = client.params
        httpParams.setSoTimeout((Integer) grailsApplication.config.http.so.timeout)
        httpParams.setConnectionManagerTimeout((Integer) grailsApplication.config.http.timeout)

        try {
            if (type == HttpPost.METHOD_NAME) {
                call = new PostMethod(url)
                if (inputStream) {
                    call.setRequestEntity(new InputStreamRequestEntity(inputStream))
                }
            } else {
                //GET
                call = new GetMethod(url)
            }
            if (contentType) {
                call.setRequestHeader(HttpHeaders.CONTENT_TYPE, contentType)
            }
            //Todo Test of supporting UserPrincipal
            def user = authService.userId
            if (user) {
                call.addRequestHeader((String) grailsApplication.config.app.http.header.userId, user)
                call.addRequestHeader("apiKey", (String) grailsApplication.config.api_key)
                call.addRequestHeader(HttpHeaders.COOKIE, 'ALA-Auth=' +
                        URLEncoder.encode(authService.userDetails().email,
                                (String) grailsApplication.config.character.encoding))
            }

            client.executeMethod(call)
        } catch (IOException e) {
            log.error url, e
        }

        [client: client, call: call]
    }

    def closeStream(streamObj) {
        if (streamObj?.call) {
            streamObj.call.releaseConnection()
        }

        if (streamObj?.client) {
            def connectionManager = streamObj.client?.httpConnectionManager
            if (connectionManager && connectionManager instanceof SimpleHttpConnectionManager) {
                ((SimpleHttpConnectionManager) streamObj.client.httpConnectionManager).shutdown()
            }
        }
    }

    def excludedHeaders = org.apache.http.HttpHeaders.fields.collect( { it ->
        it.get(org.apache.http.HttpHeaders).toLowerCase()
    }) as Set

    def urlResponse(String type, String url, Map nameValues = null, Map headers = null,
                    RequestEntity entity = null, Boolean doAuthentication = null) {

        HttpClient client = null
        HttpMethodBase call = null
        try {
            client = new HttpClient()

            HttpClientParams httpParams = client.params
            httpParams.setConnectionManagerTimeout((int) grailsApplication.config.http.timeout)
            List nameValuePairs = new ArrayList();
            if (nameValues) {
                nameValues.each { k, v ->
                    String key = String.valueOf(k)
                    String value = String.valueOf(v)
                    if (key != null && value != null) {
                        if (v instanceof List) {
                            v.each { i ->
                                String item = String.valueOf(i)
                                if (item) {
                                    nameValuePairs.add(new BasicNameValuePair(key, value));
                                }
                            }
                        } else {
                            nameValuePairs.add(new BasicNameValuePair(key, value));
                        }
                    }
                }
            }

            HttpGet httpGet = new HttpGet(url);
            URI uri = new URIBuilder(httpGet.getURI())
                    .addParameters(nameValuePairs)
                    .build();

            if (type == HttpGet.METHOD_NAME) {
                call = new GetMethod(uri.toString())
            } else {
                if (type == HttpPut.METHOD_NAME) {
                    call = new PutMethod(uri.toString())
                } else if (type == HttpPost.METHOD_NAME) {
                    call = new PostMethod(uri.toString())
                }
                if (entity) {
                    ((EntityEnclosingMethod) call).setRequestEntity(entity)
                }
            }

            if (doAuthentication) {
                def user = authService.userId
                if (user) {
                    call.addRequestHeader((String) grailsApplication.config.app.http.header.userId, user)
                    call.addRequestHeader(HttpHeaders.COOKIE, 'ALA-Auth=' +
                            URLEncoder.encode(authService.userDetails().email,
                                    (String) grailsApplication.config.character.encoding))
                }
            }

            if (headers) {
                headers.each { k, v ->
                    /*
                    //Why excludes default headers, like Accept
                    if (k != null && !excludedHeaders.contains(k.toString().toLowerCase()) && !HttpHeaders.COOKIE.equalsIgnoreCase(k.toString())) {
                        call.addRequestHeader(String.valueOf(k), String.valueOf(v))
                    }
                    */
                    if (k != null && !HttpHeaders.COOKIE.equalsIgnoreCase(k.toString())) {
                        call.addRequestHeader(String.valueOf(k), String.valueOf(v))
                    }
                }
            }

            client.executeMethod(call)

            def responseHeaders = [:]
            call.responseHeaders.each { h -> responseHeaders.put(h.name, h.value) }

            // use responseBodyAsString for text (UTF-8)
            def responseBody = call.responseBody
            try {
                def ct = responseHeaders['Content-Type']
                if (ct && !ct.toString().startsWith('image') &&
                        (ct.toString().startsWith("text") || ct.toString().startsWith("application/json"))) {
                    responseBody = new String(responseBody, 'UTF-8')
                }
            } catch (Exception e) {
                log.error(e.getMessage())
            }

            [statusCode : call.statusCode, text: responseBody, headers: responseHeaders,
             contentType: call.getResponseHeader(HttpHeaders.CONTENT_TYPE)?.value]
        } catch (IOException e) {
            log.error url, e
            [statusCode: HttpURLConnection.HTTP_INTERNAL_ERROR]
        } finally {
            if (call) {
                call.releaseConnection()
            }
            if (client) {
                if (client instanceof SimpleHttpConnectionManager) {
                    ((SimpleHttpConnectionManager) client.httpConnectionManager).shutdown()
                }
            }
        }
    }
}
