import geb.spock.GebSpec
import org.apache.http.message.BasicNameValuePair
import org.junit.Test
import org.springframework.util.MultiValueMap
import org.springframework.web.util.UriComponentsBuilder
import spock.lang.Specification

class UtilSpec extends Specification {

    def "requestQuery" () {
        given:
        def url = "http://example.com:8080/?q=1234&fq=tas&fq=act"

        def targetUriBuilder = UriComponentsBuilder.fromUriString(url).build()
        MultiValueMap targetParams = targetUriBuilder.getQueryParams()
        //remove requestQuery from url
        String targetUri = new URI(targetUriBuilder.getScheme() ,targetUriBuilder.getUserInfo(), targetUriBuilder.getHost(), targetUriBuilder.getPort(),targetUriBuilder.getPath(),null, null).toString()

        List nvList = new ArrayList();

        Iterator<String> it = targetParams.keySet().iterator()
        while(it.hasNext()){
            String key = (String)it.next()
            def value = targetParams.get(key) //list

            value.each { i ->
                String item = String.valueOf(i)
                if (item) {
                    nvList.add(new BasicNameValuePair(key, URLDecoder.decode(item, "UTF-8")));
                }
            }
        }

        expect:
        assert targetUri == "http://example.com:8080/"

    }
}