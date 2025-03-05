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
import org.apache.commons.httpclient.NameValuePair
import org.apache.commons.httpclient.SimpleHttpConnectionManager
import org.apache.commons.httpclient.methods.*
import org.apache.commons.httpclient.methods.multipart.*
import org.apache.commons.httpclient.params.HttpClientParams
import org.apache.commons.io.IOUtils
import org.apache.http.client.methods.HttpGet
import org.apache.http.client.methods.HttpPost
import org.apache.http.client.methods.HttpPut
import org.apache.http.client.utils.URIBuilder
import org.apache.http.message.BasicNameValuePair
import org.springframework.util.MultiValueMap
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.util.UriComponentsBuilder

import java.util.zip.GZIPInputStream
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

    /**
     * Params of queryString needs be combined into url
     *
     * @param url
     * @param nameValuesInFrom
     * @param headers
     * @param mFile
     * @param doAuthentication
     * @return
     */
    Map postUrl(String url, Map nameValuesInFrom = null, Map headers = null, MultipartFile mFile = null,
                Boolean doAuthentication = null) {
        def entity = null
        def nv = nameValuesInFrom

        if (mFile) {
            PartSource ps = new ByteArrayPartSource(mFile.originalFilename, mFile.getBytes())
            Part part = new FilePart('files', ps, mFile.getContentType(), 'UTF-8')

            PostMethod postMethod = new PostMethod(url)
            nameValuesInFrom.each { key, value ->
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


    /**
     *
     * @param type
     * @param url
     * @param nameValues It is passed as queryString in GET , but pass via BODY in POST
     * @param headers
     * @param entity normally only used for binary content, like file, image etc
     * @param doAuthentication
     * @return
     */
    def urlResponse(String type, String url, Map nameValues = null, Map headers = null,
                    RequestEntity entity = null, Boolean doAuthentication = null) {

        HttpClient client = null
        HttpMethodBase call = null
        try {
            client = new HttpClient()

            HttpClientParams httpParams = client.params
            httpParams.setConnectionManagerTimeout((int) grailsApplication.config.http.timeout)

            //nvList will be added into queryString in GET
            //but in body when POST
            List<BasicNameValuePair> nvList = new ArrayList();
            if (nameValues) {
                nameValues.each { k, v ->
                    String key = String.valueOf(k)
                    if (key != null && v != null) {
                        if (v instanceof List) {
                            v.each { i ->
                                String item = String.valueOf(i)
                                if (item) {
                                    nvList.add(new BasicNameValuePair(key, item));
                                }
                            }
                        } else {
                            nvList.add(new BasicNameValuePair(key, String.valueOf(v)));
                        }
                    }
                }
            }

            //Parse target url
            List<BasicNameValuePair> queryParams = new ArrayList();
            def targetUriBuilder = UriComponentsBuilder.fromUriString(url).build()
            MultiValueMap<String, String> targetParams = targetUriBuilder.getQueryParams()
            //remove requestQuery from url
            String targetUrl = new URI(targetUriBuilder.getScheme() ,targetUriBuilder.getUserInfo(), targetUriBuilder.getHost(), targetUriBuilder.getPort(),targetUriBuilder.getPath(),null, null).toString()

            Iterator<String> it = targetParams.keySet().iterator()
            while(it.hasNext()){
                String key = (String)it.next()
                //list always
                //Support: fq=a&fq=b etc
                def value = targetParams.get(key)

                value.each { i ->
                    String item = String.valueOf(i)
                    if (item) {
                        queryParams.add(new BasicNameValuePair(key, URLDecoder.decode(item, "UTF-8")));
                    }
                }
            }

            if (type == HttpGet.METHOD_NAME) {
                HttpGet httpGet = new HttpGet(targetUrl);
                queryParams.addAll(nvList) //Combine name: value
                URI uri = new URIBuilder(httpGet.getURI())
                        .setParameters(queryParams)
                        .build();
                call = new GetMethod(uri.toString())
            } else if (type == "DELETE") {
                HttpGet httpGet = new HttpGet(targetUrl);
                queryParams.addAll(nvList) //Combine name: value
                java.net.URI uri = new URIBuilder(httpGet.getURI())
                        .setParameters(queryParams)
                        .build();
                call = new DeleteMethod(uri.toString())
            } else {
                HttpPut httpGet = new HttpPut(targetUrl);
                URI uri = new URIBuilder(httpGet.getURI())
                        .setParameters(queryParams)
                        .build();
                if (type == HttpPut.METHOD_NAME) {
                    call = new PutMethod(uri.toString())
                } else if (type == HttpPost.METHOD_NAME) {
                    call = new PostMethod(uri.toString())
                    if (!nvList.isEmpty()) {
                        NameValuePair[] nvs =  new NameValuePair[nvList.size()]
                        for (int i=0; i< nvList.size(); i++){
                            nvs[i]= new NameValuePair(nvList.get(i).name, nvList.get(i).value)
                        }
                        ((PostMethod)call).addParameters(nvs)
                    }
                }

                if (entity) {
                    ((EntityEnclosingMethod) call).setRequestEntity(entity)
                }
            }

            /**
             * HttpHeaders.COOKIE, 'ALA-Auth=   will trigger CAS redirect to login page.
             * Disabling CORS may break it
             */
            if (doAuthentication) {
                def user = authService.userId
                if (user) {
                    call.setRequestHeader((String) grailsApplication.config.app.http.header.userId, user)
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
                        call.setRequestHeader(String.valueOf(k), String.valueOf(v))
                    }
                }
            }

            client.executeMethod(call)

            def responseHeaders = [:]
            call.responseHeaders.each { h -> responseHeaders.put(h.name, h.value) }

            def data
            try {
                def ct = responseHeaders['Content-Type']
                if (ct && !ct.toString().startsWith('image') &&
                        (ct.toString().startsWith("text") || ct.toString().startsWith("application/json"))) {

                    def is
                    if (responseHeaders["Content-Encoding"] == "gzip") {
                        is = new GZIPInputStream(new ByteArrayInputStream(call.getResponseBody()))
                    } else{
                        is  = new ByteArrayInputStream(call.getResponseBody())
                    }
                    data = IOUtils.toString(is, 'UTF-8')
                } else {
                    data = call.responseBody
                }
            } catch (Exception e) {
                log.error(e.getMessage())
            }

            [statusCode : call.statusCode, text: data, headers: responseHeaders,
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
