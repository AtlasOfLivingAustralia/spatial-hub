import groovy.util.slurpersupport.NodeChild
import groovy.xml.DOMBuilder
import org.apache.commons.io.FileUtils
import org.apache.commons.lang.StringUtils
import org.cyberneko.html.parsers.SAXParser

import static com.google.common.base.CaseFormat.LOWER_CAMEL
import static com.google.common.base.CaseFormat.LOWER_HYPHEN
import static com.google.common.base.CaseFormat.LOWER_UNDERSCORE

eventCompileStart = { kind ->
//    println 'Starting NPM install'
//    final workdir = new File(grailsSettings.baseDir, '')
//    final exec = new ProcessBuilder().inheritIO().directory(workdir).command('npm', 'install').start()
//    def exitValue = exec.waitFor()
//    if (exitValue) {
//        println '*****************************************************'
//        println '* `npm install` failed - do you have NPM installed? *'
//        println '* Try `brew install npm` or `apt-get install npm`   *'
//        println "* Exit value: $exitValue                            *"
//        println '*****************************************************'
//    } else {
//        println 'Completed NPM install'
//    }
//
//    println 'Copying files to grails-app/assets/node_modules'
//    new ProcessBuilder().inheritIO().directory(workdir).command('rm', '-r', 'grails-app/assets/node_modules').start().waitFor()
//
//    def files = ['angular/angular.min.js', 'angular-animate/angular-animate.min.js', 'angular-aria/angular-aria.min.js',
//        'angular-leaflet-directive/dist/angular-leaflet-directive.min.js', 'angular-route/angular-route.min.js',
//        'angular-touch/angular-touch.min.js', 'angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
//        'angular-ui-bootstrap/dist/ui-bootstrap-csp.css', 'bootbox/bootbox.min.js', 'jquery/dist/jquery.min.js',
//        'ng-file-upload/dist/ng-file-upload.js', 'ngbootbox/dist/ngBootbox.min.js',
//        'bootstrap/dist/', 'leaflet/dist/', 'leaflet-draw/dist/']
//    files.each { name ->
//        def dst = new File(grailsSettings.baseDir.getPath() + '/grails-app/assets/node_modules/' + name)
//        dst.getParentFile().mkdirs()
//        if (name.endsWith('/')) {
//            FileUtils.copyDirectory(new File(grailsSettings.baseDir.getPath() + '/node_modules/' + name), dst)
//        } else {
//            FileUtils.copyFile(new File(grailsSettings.baseDir.getPath() + '/node_modules/' + name), dst)
//        }
//    }
//
//    println 'Making a list of all spApp modules for importing'
//    def dirs = ['controller', 'directive', 'service']
//    def moduleList = []
//    dirs.each { name ->
//        def list = new File(grailsSettings.baseDir.getPath() + '/grails-app/assets/javascripts/spApp/' + name).listFiles()
//        list.each { file ->
//            if (name == 'directive') {
//                //append -directive to module name
//                moduleList.push(LOWER_CAMEL.to(LOWER_HYPHEN, file.name) + '-directive')
//            } else {
//                moduleList.push(LOWER_CAMEL.to(LOWER_HYPHEN, file.name))
//            }
//        }
//    }
//    def file = new File(grailsSettings.baseDir.getPath() + '/grails-app/assets/compile/spAppModules.js')
//    if (!file.getParentFile().exists()) {
//        file.getParentFile().mkdirs()
//    }
//    FileUtils.writeStringToFile(file,
//            '/* Do not edit. This file built at compile by _Events.groovy */\n$spAppModules = ["' + moduleList.join('","').replaceAll("\\.js",'') + '"];')


    //i18n'ify templates
    String input = FileUtils.readFileToString(new File(grailsSettings.baseDir.getPath() + '/grails-app/assets/javascripts/spApp/templates/optionsContent.tpl.htm'))

//    def parser = new SAXParser()
//    def doc = new XmlSlurper(parser).parse(new File(grailsSettings.baseDir.getPath() + '/grails-app/assets/javascripts/spApp/templates/optionsContent.tpl.htm'))
//
//    def lastIdx = process(doc, 0, false)
//    process(doc, lastIdx + 1, true)
//
//    println (groovy.xml.XmlUtil.serialize(doc))

    String [] textElements = ["h1", "h2", "h3", "h4", "h5", "h6", "label", "span", "div", "input", "p", "button"]



    def start = 0;
    def idx = 0;
    def output = new StringBuilder()
    while(start < input.length() && start >= 0) {
        def next = input.indexOf("i18n=\"", start)
        if (next > 0) {
            def end = input.indexOf("\"", next + 6)
            if (end > 0) {
                def value = Integer.parseInt(input.substring(next + 6, end))
                idx = Math.max(idx, value)
            }
        }
        start = next
    }
    idx++
    start = 0
    while (start < input.length() && start != -1) {
        def next = input.indexOf('<', start)

        if (next > start) {
            output.append(input.substring(start, next))
        }

        def writeAt = -1
        for (int i = 0;i < textElements.length && writeAt < 0; i++) {
            String e = textElements[i]

            if (input.startsWith(e, next + 1)) {
                //very rough matching
                def end1 = input.indexOf("/>", next)
                def end2 = input.indexOf(">", next)
                if (end1 == -1 || end1 > end2) {
                    //has interior
                    def txtStart = end2 + 1
                    def txtEnd = input.indexOf("<", txtStart)
                    if (txtStart != txtEnd && !StringUtils.isWhitespace(input.substring(txtStart, txtEnd))) {
                        //has text, insert next attr if missing
                        if (!input.substring(next, end2).contains("i18n")) {
                            writeAt = e.length() + next + 1

                            output.append(input.substring(next, writeAt))
                            output.append(" i18n=\"${idx}\" ")
                            idx++
                            output.append(input.substring(writeAt, txtEnd))
                            start = txtEnd
                        }
                    }
                }
            }
        }

        if (writeAt < 0) {
            def end = input.indexOf(">", next)
            output.append(input.substring(next, end + 1))
            start = end + 1
        }
    }

    println(output)
    println("done")
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