import org.apache.commons.io.FileUtils
import org.apache.commons.lang.StringUtils

def build(String baseDir) {

    println 'Starting NPM install'
    final workdir = new File(baseDir, '')
    final proc = new ProcessBuilder().inheritIO()
    final exec = proc.command('npm', 'install').start()
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

    def files = ['angular/angular.min.js', 'angular-animate/angular-animate.min.js', 'angular-aria/angular-aria.min.js',
                 'angular-leaflet-directive/dist/angular-leaflet-directive.min.js', 'angular-route/angular-route.min.js',
                 'angular-touch/angular-touch.min.js', 'angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
                 'angular-ui-bootstrap/dist/ui-bootstrap-csp.css', 'bootbox/bootbox.min.js', 'jquery/dist/jquery.min.js',
                 'ng-file-upload/dist/ng-file-upload.js', 'ngbootbox/dist/ngBootbox.min.js',
                 'bootstrap/dist/', 'leaflet/dist/', 'leaflet-draw/dist/']
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

    // get last idx value from templates
    for (File f : new File(baseDir + '/grails-app/assets/javascripts/spApp/templates/').listFiles()) {
        String input = FileUtils.readFileToString(f)

        start = 0
        while(start < input.length() && start >= 0) {
            def next = input.indexOf("i18n=\"", start)
            if (next > 0) {
                def end = input.indexOf("\"", next + 6)
                if (end > 0) {
                    def value = Integer.parseInt(input.substring(next + 6, end))
                    idx = Math.max(idx, value)
                }

                start = next + 1
            } else {
                start = -1
            }
        }
    }

    idx++

    println 'i18n next available idx: ' + idx

    def totalNewProperties = 0

    print 'i18n checking files: '
    for (File f : new File(baseDir + '/grails-app/assets/javascripts/spApp/templates/').listFiles()) {

        def label = ' ' + f.name
        print (label)
        def newCount = 0

        String input = FileUtils.readFileToString(f)

        def output = new StringBuilder()

        start = 0
        while (start < input.length() && start != -1) {
            def next = input.indexOf('<', start)

            if (next > start) {
                output.append(input.substring(start, next))
            }

            def writeAt = -1
            for (int i = 0; i < textElements.length && writeAt < 0; i++) {
                String e = textElements[i]

                if (input.startsWith(e, next + 1)) {
                    //very rough matching
                    def end1 = input.indexOf("/>", next)
                    def end2 = input.indexOf(">", next)
                    //check that end2 is not part of ng-*=".*" or {{*}}
                    def s = input.substring(next, end2)
                    while (end2 > 0 && (end1 == -1 || end1 > end2) &&
                            (StringUtils.countMatches(s, "{{") < StringUtils.countMatches(s, "}}") ||
                                    s.matches(".*\\sng-[^\\s=]+=(('[^']*)|(\"[^\"]*))\$"))) {
                        end2 = input.indexOf(">", end2 + 1)
                    }

                    if (end1 == -1 || end1 > end2) {
                        //has interior
                        def txtStart = end2 + 1
                        def txtEnd = input.indexOf("<", txtStart)
                        def str = input.substring(txtStart, txtEnd)
                        // exclude whitespace, anything with angular substitution
                        if (str.length() > 0 && !StringUtils.isWhitespace(str) && !str.contains("{{")) {
                            //has text, insert next attr if missing
                            if (!input.substring(next, end2).contains("i18n")) {
                                writeAt = e.length() + next + 1

                                output.append(input.substring(next, writeAt))
                                def value = input.substring(txtStart, txtEnd).replaceAll("\\s+", ' ').trim()

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

                                output.append(input.substring(writeAt, txtEnd))
                                start = txtEnd
                            }
                        }
                    }
                }
            }

            if (writeAt < 0) {
                def end = input.indexOf(">", next)
                if (next >= 0 && end >= 0) {
                    output.append(input.substring(next, end + 1))

                    start = end + 1
                } else if (next >= 0) {
                    output.append(input.substring(next, input.length()))
                    start = input.length() + 1
                } else {
                    start = input.length() + 1
                }
            }
        }

        // overwrite template file
        FileUtils.writeStringToFile(f, output.toString())

        if (newCount > 0) {
            print " - $newCount new keys, "
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