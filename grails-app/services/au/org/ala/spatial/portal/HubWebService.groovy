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

import org.apache.commons.httpclient.*
import org.apache.commons.httpclient.methods.*
import org.apache.commons.httpclient.methods.multipart.ByteArrayPartSource
import org.apache.commons.httpclient.methods.multipart.FilePart
import org.apache.commons.httpclient.methods.multipart.MultipartRequestEntity
import org.apache.commons.httpclient.methods.multipart.Part
import org.apache.commons.httpclient.methods.multipart.PartSource
import org.apache.commons.httpclient.params.HttpClientParams
import org.apache.http.client.methods.HttpGet
import org.apache.http.client.methods.HttpPost
import org.apache.http.client.methods.HttpPut
//import org.codehaus.groovy.grails.web.servlet.HttpHeaders
import grails.web.http.HttpHeaders
import org.springframework.web.multipart.commons.CommonsMultipartFile

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
        urlResponse(HttpGet.METHOD_NAME, url, null, headers, null, doAuthentication)?.text
    }

    Map postUrl(String url, Map nameValues = null, Map headers = null, CommonsMultipartFile mFile = null,
                Boolean doAuthentication = null) {
        def entity = null
        def nv = nameValues

        if (mFile) {
            PartSource ps = new ByteArrayPartSource(mFile.originalFilename, mFile.bytes)
            Part part = new FilePart('files', ps, mFile.fileItem.contentType, 'UTF-8')

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
                call = new PostMethod()
                if (inputStream) {
                    call.setRequestEntity(new InputStreamRequestEntity(inputStream))
                }
            } else {
                //GET
                call = new GetMethod()
            }
            if (contentType) {
                call.setRequestHeader(HttpHeaders.CONTENT_TYPE, contentType)
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

            if (type == HttpGet.METHOD_NAME) {
                call = new GetMethod(url)
            } else {
                if (type == HttpPut.METHOD_NAME) {
                    call = new PutMethod(url)
                } else if (type == HttpPost.METHOD_NAME) {
                    call = new PostMethod(url)

                    if (nameValues) {
                        nameValues.each { k, v ->
                            if (v instanceof List) {
                                v.each { i ->
                                    ((PostMethod) call).addParameter(String.valueOf(k), String.valueOf(i))
                                }
                            } else {
                                ((PostMethod) call).addParameter(String.valueOf(k), String.valueOf(v))
                            }

                        }
                    }
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
                    if (!excludedHeaders.contains(k.toString().toLowerCase()) && !HttpHeaders.COOKIE.equalsIgnoreCase(k.toString())) {
                        call.addRequestHeader(String.valueOf(k), String.valueOf(v))
                    }
                }
            }

            client.executeMethod(call)

            def responseHeaders = [:]
            call.responseHeaders.each { h -> responseHeaders.put(h.name, h.value) }

            [statusCode: call.statusCode, text: call.responseBodyAsString, headers: responseHeaders,
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
