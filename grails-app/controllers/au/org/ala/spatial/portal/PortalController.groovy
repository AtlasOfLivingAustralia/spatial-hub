package au.org.ala.spatial.portal

import au.org.ala.web.AuthService
import grails.converters.JSON
import org.apache.commons.io.IOUtils

import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse


class PortalController {

    def webService
    AuthService authService
    def grailsApplication

    def index() {
        def userId = authService.getUserId()
        render(view: "index", model: [config: grailsApplication.config, userId: userId])
    }

    def wkt() {
        def json = request.getJSON()

        json.putAt('api_key', grailsApplication.config.api_key)

        def r = webService.doPostJSON(grailsApplication.config.layersService.url + "/shape/upload/wkt", json)

        render JSON.parse(r) as JSON
    }

    def createTask() {
        def json = request.getJSON()

        json.putAt('api_key', grailsApplication.config.api_key)

        def r = webService.doPost(grailsApplication.config.layersService.url + "/tasks/create", json)

        if (r == null)
            render [:] as JSON

        render JSON.parse(r) as JSON
    }

    def q() {
        def json = request.getJSON()

        def r = webService.doPost(json.ws + "/webportal/params", json)

        render([qid: r] as JSON)
    }

    def proxy() {
        def url = params.url

        def requestBody = IOUtils.toString(request.getReader()).getBytes("UTF-8");

        String extra = rebuildParameters(request.getParameterMap());
        if (url.contains("?") && extra.startsWith("?")) {
            extra = "&" + extra.substring(1);
        }
        String target = url + extra;

        fetchAndOutputUrl(target, response, request, requestBody);
    }

    private String rebuildParameters(Map params) {
        StringBuilder uri = new StringBuilder();
        String delim = "?";
        for (Object o : params.entrySet()) {
            Map.Entry entry = (Map.Entry) o;
            // skip the url parameter - removal from the map is not allowed
            if (!"url".equalsIgnoreCase((String) entry.getKey())) {
                String[] value = (String[]) entry.getValue();
                try {
                    uri.append(delim).append(entry.getKey()).append("=").append(URLEncoder.encode(value[0], "UTF-8"));
                    delim = "&";
                } catch (UnsupportedEncodingException e) {
                }
            }
        }
        return uri.toString();
    }

    private void fetchAndOutputUrl(String url, HttpServletResponse response, HttpServletRequest request, byte[] requestBody) {
        URLConnection con = new URL(url).openConnection()
        InputStream is = null;
        try {
            log.debug("will request '" + url + "' from remote server");

            // POST parameters
            if ("POST".equals(request.getMethod())) {
                HttpURLConnection hc = (HttpURLConnection) new URL(url).openConnection();
                if (request.getContentType() != null) {
                    hc.setRequestProperty("Content-Type", request.getContentType());
                }
                hc.setRequestMethod("POST");
                hc.setDoInput(true);
                hc.setDoOutput(true);

                if (requestBody != null && requestBody.length > 0) {
                    hc.getOutputStream().write(requestBody);
                }

                con = hc;
            }

            // force the url to be cached by adding/replaceing the cache-control header
            response.addHeader(
                    "Cache-Control",
                    "max-age=" + 360000 + "public must-revalidate");

            // get the data...
            is = con.getInputStream();
            byte[] data = IOUtils.toByteArray(is);

            // restore the MIME type for correct handling
            response.setContentType(con.getContentType());

            // flush to client
            response.getOutputStream().write(data);

        } catch (IOException e) {
            log.debug("IO error doing remote request: " + e.getMessage());
        } finally {
            if (is != null) {
                try {
                    is.close();
                } catch (IOException e) {
                    log.error("Error closing stream to " + url, e);
                }
            }
        }
    }
}
