import org.apache.commons.io.FileUtils

eventCompileStart = { kind ->
    println 'Starting NPM install'
    final workdir = new File(grailsSettings.baseDir, '')
    final exec = new ProcessBuilder().inheritIO().directory(workdir).command('npm', 'install').start()
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
    new ProcessBuilder().inheritIO().directory(workdir).command('rm', '-r', 'grails-app/assets/node_modules').start().waitFor()

    def files = ['angular/angular.min.js', 'angular-animate/angular-animate.min.js', 'angular-aria/angular-aria.min.js',
        'angular-leaflet-directive/dist/angular-leaflet-directive.min.js', 'angular-route/angular-route.min.js',
        'angular-touch/angular-touch.min.js', 'angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
        'angular-ui-bootstrap/dist/ui-bootstrap-csp.css', 'bootbox/bootbox.min.js', 'jquery/dist/jquery.min.js',
        'ng-file-upload/dist/ng-file-upload.js', 'ngbootbox/dist/ngBootbox.min.js',
        'bootstrap/dist/', 'leaflet/dist/', 'leaflet-draw/dist/']
    files.each { name ->
        def dst = new File(grailsSettings.baseDir.getPath() + '/grails-app/assets/node_modules/' + name)
        dst.getParentFile().mkdirs()
        if (name.endsWith('/')) {
            FileUtils.copyDirectory(new File(grailsSettings.baseDir.getPath() + '/node_modules/' + name), dst)
        } else {
            FileUtils.copyFile(new File(grailsSettings.baseDir.getPath() + '/node_modules/' + name), dst)
        }
    }
}