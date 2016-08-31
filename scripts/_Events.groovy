eventCompileStart = { kind ->
    println 'Starting NPM install'
    final workdir = new File(grailsSettings.baseDir, 'web-app')
    final exec = new ProcessBuilder().inheritIO().directory(workdir).command('npm', 'install').start()
    def exitValue = exec.waitFor()
    if (exitValue) {
        println '*****************************************************'
        println '* `npm install` failed - do you have NPM installed? *'
        println '* Try `brew install npm` or `apt-get install npm`   *'
        println "* Exit value: $exitValue                                    *"
        println '*****************************************************'
    } else {
        println 'Completed NPM install'
    }
}