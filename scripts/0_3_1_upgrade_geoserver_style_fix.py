#
# Run this when upgrading to spatial-hub 0.3.1, only required when there is a contextual `layer` with > 1 `fields`.
#
# A python2 script to apply non-default styles to contextual layers that were added to geoserver with spatial-service.
#
# 1. Edit config section
# 2. Run script
#

import urllib2
import json
import base64

#
# config
#
spatialServiceUrl = 'https://spatial.ala.org.au/ws'
geoserverUrl = 'https://spatial.ala.org.au/geoserver'
geoserverUsername = 'admin'
geoserverPassword = 'geoserver'


geoserverWorkspace = 'ALA'

print ''
print 'spatialServiceUrl=', spatialServiceUrl
print 'geoserverUrl=', geoserverUrl
print 'geoserverUsername=', geoserverUsername
print 'geoserverPassword=', geoserverPassword
print ''

# list fields
fieldsUrl = spatialServiceUrl + '/fields/search?q='
response = urllib2.urlopen(fieldsUrl)
fields = json.load(response)

# register all associated styles with layers in geoserver
for field in fields:
  style = field.get('id')
  if (style.startswith('cl') and field.get('enabled') == True):
    layer = field.get('layer').get('name')
    print 'registering style (' + style + ') with layer (' + layer + ') ... ', 

    postUrl = geoserverUrl + '/rest/layers/' + geoserverWorkspace + ':' + layer + '/styles'
    postData = '<style><name>' + style + '</name></style>'
    request = urllib2.Request(url=postUrl, data=postData)
    request.get_method = lambda: 'POST'
    base64string = base64.encodestring('%s:%s' % (geoserverUsername, geoserverPassword))[:-1]
    request.add_header("Authorization", "Basic %s" % base64string) 
    request.add_header("Content-Type", "application/xml")
  
    try:
      handle = urllib2.urlopen(request)
    except IOError, e:
      if not hasattr(e, 'code') or e.code != 201:
        print 'failed, response code (', e.code, ')'
      else:
        print 'failed'
    else:
      print 'successful'
