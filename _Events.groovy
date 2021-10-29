import org.apache.commons.io.FileUtils
import org.apache.commons.lang.StringUtils

def build(String baseDir) {

    println 'Starting NPM install'
    final workdir = new File(baseDir, '')
    final proc = new ProcessBuilder().inheritIO()
    final exec = proc.command('npm', '-dd', 'install').start()
    def exitValue = exec.waitFor()
    if (exitValue) {
        println '*****************************************************'
        println '* `npm install` failed - do you have NPM installed? *'
        println '* Try `brew install npm` or `apt-get install npm`   *'
        println "* Exit value: $exitValue                            *"
        println '*****************************************************'
    } else {
        println 'Completed NPM install'
    }

    println 'Copying files to grails-app/assets/node_modules'
    new ProcessBuilder().inheritIO().command('rm', '-r', 'grails-app/assets/node_modules').start().waitFor()

    def files = ['angular/angular.js', 'angular/angular.min.js', 'angular-animate/angular-animate.min.js', 'angular-aria/angular-aria.min.js',
                 'angular-leaflet-directive/dist/angular-leaflet-directive.min.js', 'angular-route/angular-route.min.js',
                 'angular-touch/angular-touch.min.js', 'angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
                 'angular-ui-bootstrap/dist/ui-bootstrap-csp.css', 'bootbox/dist/bootbox.min.js', 'jquery/dist/jquery.min.js',
                 'ng-file-upload/dist/ng-file-upload.js', 'ngbootbox/dist/ngBootbox.min.js',
                 'bootstrap/dist/', 'leaflet/dist/', 'leaflet-draw/dist/', 'leaflet-measure/dist/', 'proj4/dist/proj4.js',
                 'proj4leaflet/src/proj4leaflet.js', 'lz-string/libs/lz-string.min.js']
    files.each { name ->
        def dst = new File(baseDir + '/grails-app/assets/node_modules/' + name)
        dst.getParentFile().mkdirs()
        if (name.endsWith('/')) {
            FileUtils.copyDirectory(new File(baseDir + '/node_modules/' + name), dst)
        } else {
            FileUtils.copyFile(new File(baseDir + '/node_modules/' + name), dst)
        }
    }

    println 'Making a list of all spApp modules for importing'
    def dirs = ['controller', 'directive', 'service']
    def moduleList = []
    dirs.each { name ->
        def list = new File(baseDir + '/grails-app/assets/javascripts/spApp/' + name).listFiles()
        list.each { file ->
            if (name == 'directive') {
                //append -directive to module name
                moduleList.push(com.google.common.base.CaseFormat.LOWER_CAMEL.to(com.google.common.base.CaseFormat.LOWER_HYPHEN, file.name) + '-directive')
            } else {
                moduleList.push(com.google.common.base.CaseFormat.LOWER_CAMEL.to(com.google.common.base.CaseFormat.LOWER_HYPHEN, file.name))
            }
        }
    }
    def file = new File(baseDir + '/grails-app/assets/compile/spAppModules.js')
    if (!file.getParentFile().exists()) {
        file.getParentFile().mkdirs()
    }
    FileUtils.writeStringToFile(file,
            '/* Do not edit. This file built at compile by _Events.groovy */\n$spAppModules = ["' + moduleList.join('","').replaceAll("\\.js",'') + '"];')


    // jsdoc
    println 'Starting JSDoc'
    final exec2 = proc.command('npm', 'run', 'jsdoc').start()
    def exitValue2 = exec2.waitFor()
    if (exitValue2) {
        println '*****************************************************'
        println '* `npm run jsdoc` failed'
        println "* Exit value: $exitValue                            *"
        println '*****************************************************'
    } else {
        println 'Completed jsdoc'
    }

    //i18n'ify templates
    // This extracts text content from angular html template elements for the values,
    // creates an attribute 'i18n' for the key,
    // and stores the key value pairs in grails-app/i18n/messages.properties
    println 'Starting i18n build from templates'
    String [] textElements = ["h1", "h2", "h3", "h4", "h5", "h6", "label", "span", "div", "input", "p", "button", "td", "option"]

    def start;
    def idx = 0;

    def newProperties = new StringBuilder()

    // load existing defaults
    def p = new File(baseDir + '/grails-app/i18n/messages.properties')
    def prop = new Properties()
    prop.load(new FileReader(p))
    // reverse lookup
    def all = [:]
    prop.each {
        k, v -> all.put(v, k)
    }

    println 'existing i18n keys: ' + prop.size()

    // get last idx value from templates. looking for attributes i18n="#"
    idx = findLastIndex(baseDir + '/grails-app/assets/javascripts/spApp/templates', "i18n=\"", "\"")

    // get last idx value from javascript. looking for function '$i18n(#, "default")'
    def jsDirs = ['controller', 'directive', 'leaflet', 'service']
    for (String jsDir : jsDirs) {
        idx = Math.max(idx, findLastIndex(baseDir + '/grails-app/assets/javascripts/spApp/' + jsDir, "\$i18n(", ", \""))
    }

    // get max prop id
    for (def kv : prop) {
        try {
            idx = Math.max(idx, Integer.parseInt(kv.key))
        } catch (e) {}
    }

    idx++

    println 'i18n next available idx: ' + idx

    def totalNewProperties = 0

    def dir = baseDir + '/grails-app/assets/javascripts/spApp/templates/'
    print 'i18n - find new in templates : ' + dir
    for (File f : new File(dir).listFiles()) {
        try {
            def label = ' ' + f.name
            print(label)
            def newCount = 0

            String input = FileUtils.readFileToString(f)

            if (!input.contains("skipI18n")) {
                def output = new StringBuilder()

                def previousPos = 0
                start = input.indexOf('<')
                while (start < input.length() && start != -1) {

                    if (start > previousPos) {
                        output.append(input.substring(previousPos, start))
                        previousPos = start
                    }

                    def readPos = -1
                    for (int i = 0; i < textElements.length && readPos < 0; i++) {
                        String e = textElements[i]

                        // match <tag...> and <tag.../>
                        if (input.startsWith(e, start + 1)) {
                            // break out of for loop
                            readPos = 0

                            //very rough matching
                            def end1 = input.indexOf("/>", start)
                            def end2 = input.indexOf(">", start)

                            //skip over attr ng-*=".*" and substitution strings {{*}}
                            def s = input.substring(start, end2)
                            while (end2 > 0 && (end1 == -1 || end1 > end2) &&
                                    (StringUtils.countMatches(s, "{{") < StringUtils.countMatches(s, "}}") ||
                                            s.matches(".*\\sng-[^\\s=]+=(('[^']*)|(\"[^\"]*))\$"))) {
                                end2 = input.indexOf(">", end2 + 1)
                            }

                            def tagEnd = "</" + e + ">"
                            if (end1 == -1 || end1 > end2) {
                                //get innerText of <tag...></tag>
                                def txtStart = end2 + 1
                                def txtEnd = input.indexOf(tagEnd, txtStart)
                                if (txtEnd > 0 && txtEnd < input.length()) {
                                    def innerText = input.substring(txtStart, txtEnd)
                                    // exclude whitespace, anything with angular substitution or tag start/end characters '<' '>'
                                    if (innerText.length() > 0 && !innerText.contains('>') && !innerText.contains('<') && !StringUtils.isWhitespace(innerText) && !innerText.contains("{{")) {
                                        //insert i18n attr if missing
                                        if (!input.substring(start, end2).contains("i18n")) {
                                            readPos = e.length() + start + 1

                                            output.append(input.substring(start, readPos))
                                            def value = input.substring(txtStart, txtEnd).replaceAll("\\s+", ' ').trim()

                                            if (value != "&nbsp;") {
                                                def currentIdx = idx
                                                if (all.containsKey(value)) {
                                                    currentIdx = all.get(value)
                                                } else {
                                                    all.put(value, idx)
                                                    idx++

                                                    newProperties.append("\n${currentIdx}=${value}")
                                                    newCount++
                                                    totalNewProperties++
                                                }

                                                output.append(" i18n=\"${currentIdx}\" ")
                                            }

                                            output.append(input.substring(readPos, txtEnd + tagEnd.length()))
                                            previousPos = txtEnd + tagEnd.length()
                                            start = previousPos
                                        }
                                    }
                                }
                            }
                        }
                    }

                    start = input.indexOf('<', start + 1)
                }

                if (previousPos < input.length()) {
                    output.append(input.substring(previousPos))
                }

                if (newCount > 0) {
                    // overwrite template file
                    FileUtils.writeStringToFile(f, output.toString())

                    print " - $newCount new keys, "
                }
            }
        } catch (err) {
            println f.name
            err.printStackTrace()
        }
    }

    for (def jsDir : jsDirs) {
        print 'i18n - find new in scripts : ' + dir
        dir = baseDir + '/grails-app/assets/javascripts/spApp/'
        for (File f : new File(baseDir + '/grails-app/assets/javascripts/spApp/' + jsDir).listFiles()) {

            def label = ' ' + f.name
            print(label)
            def newCount = 0

        String input = FileUtils.readFileToString(f)

            def output = new StringBuilder()

            start = 0
            while (start < input.length() && start != -1) {
                // indexOf next $i18n call that does not have a messages.properties entry
                def quote = "\'"
                def dblQuote = "\""
                def dblNext = input.indexOf("\$i18n(" + dblQuote, start)
                def quoteNext = input.indexOf("\$i18n(" + quote, start)
                def next = dblNext
                def txtWrapper = dblQuote
                if (dblNext < 0 || (quoteNext >= 0 && quoteNext < dblNext)) {
                    next = quoteNext
                    txtWrapper = quote
                }

                if (next > start) {
                    output.append(input.substring(start, next))

                    // find end of the default value that is wrapped in " or ' and may contain escaped values \" or \'
                    def end = input.indexOf(txtWrapper + ")", next + 7)
                    while (input.indexOf("\\" + txtWrapper, end - 1) == end - 1) {
                        end = input.indexOf(txtWrapper + ")", end + 1)
                    }

                    // find or create the properties idx for this value
                    if (end > next + 6) {
                        def value = input.substring(next + 7, end)
                        def currentIdx = idx
                        if (all.containsKey(value)) {
                            currentIdx = all.get(value)
                        } else {
                            all.put(value, idx)
                            idx++

                            newProperties.append("\n${currentIdx}=${value}")
                            newCount++
                            totalNewProperties++
                        }

                        output.append("\$i18n(${currentIdx}, \"${value}\")")
                        start = end + 2
                    } else {
                        // write the failed match so it is not found on the next loop
                        output.append(input.substring(next, next + 6))
                        start = next + 6
                    }
                } else {
                    // write the remaining text and exit loop
                    output.append(input.substring(start, input.length()))
                    start = -1
                }
            }

            if (newCount > 0) {
                // overwrite template file
                FileUtils.writeStringToFile(f, output.toString())

                print " - $newCount new keys, "
            }
        }
    }

    // append new properties to messages.properties
    if (totalNewProperties == 0) {
        println("\ni18n no new keys")
    } else {
        println("\ni18n appended ${totalNewProperties} new entries to ${p.path}")
    }
    FileUtils.writeStringToFile(p, newProperties.toString(), true)
    println("i18n done")
}

def findLastIndex(directory, startString, endString) {
    int last_idx = 0
    int startStringLen = startString.length()
    for (File f : new File(directory).listFiles()) {
        String input = FileUtils.readFileToString(f)

        start = 0
        while (start < input.length() && start >= 0) {
            def next = input.indexOf(startString, start)
            if (next > 0) {
                def end = input.indexOf(endString, next + startStringLen)
                if (end > 0) {
                    def value = input.substring(next + startStringLen, end)
                    if (value.isNumber()) {
                        last_idx = Math.max(last_idx, Integer.parseInt(value))
                    }
                }
            }

                start = next + 1
            } else {
                start = -1
            }
        }
    }

    return last_idx
}

def process(doc, nextIdx, update) {
    doc.depthFirst().collect {
        for (def a : it.getAt(0).children()) {
            if (a instanceof String) {
                if (it.getAt(0).attributes().containsKey("i18n")) {
                    nextIdx = Math.max(nextIdx, Integer.parseInt(it.getAt(0).attributes().get("i18n")))
                } else if (update) {
                    it.getAt(0).attributes().put("i18n", String.valueOf(nextIdx))
                    nextIdx ++;
                }
            }
        }
    }

    return nextIdx
}

build("./")