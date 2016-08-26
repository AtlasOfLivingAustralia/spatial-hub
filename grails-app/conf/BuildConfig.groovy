grails.servlet.version = "3.0" // Change depending on target container compliance (2.5 or 3.0)
grails.project.class.dir = "target/classes"
grails.project.test.class.dir = "target/test-classes"
grails.project.test.reports.dir = "target/test-reports"
grails.project.work.dir = "target/work"
grails.project.target.level = 1.7
grails.project.source.level = 1.7
//grails.project.war.file = "target/${appName}-${appVersion}.war"

grails.server.port.http = 8081

grails.project.fork = [
        // configure settings for compilation JVM, note that if you alter the Groovy version forked compilation is required
        //  compile: [maxMemory: 256, minMemory: 64, debug: false, maxPerm: 256, daemon:true],

        // configure settings for the test-app JVM, uses the daemon by default
        //test: [maxMemory: 768, minMemory: 64, debug: false, maxPerm: 256, daemon:true, test:false, run:false],
        // configure settings for the run-app JVM
        //run: [maxMemory: 768, minMemory: 64, debug: false, maxPerm: 256, forkReserve:false, test:false, run:false],

        // configure settings for the run-war JVM
        //war: [maxMemory: 768, minMemory: 642, debug: false, maxPerm: 256, forkReserve:false, test:false, run:false],
        // configure settings for the Console UI JVM
        //console: [maxMemory: 768, minMemory: 64, debug: false, maxPerm: 256, test:false, run:false]
        run: false, test: false
]

grails.project.dependency.resolver = "maven" // or ivy
grails.project.dependency.resolution = {
    // inherit Grails' default dependencies
    inherits("global") {
        // specify dependency exclusions here; for example, uncomment this to disable ehcache:
        // excludes 'ehcache'
    }
    log "error" // log level of Ivy resolver, either 'error', 'warn', 'info', 'debug' or 'verbose'
    checksums true // Whether to verify checksums on resolve
    legacyResolve true
    // whether to do a secondary resolve on plugin installation, not advised and here for backwards compatibility

    repositories {
        mavenLocal()
        mavenRepo("http://nexus.ala.org.au/content/groups/public/") {
            updatePolicy 'always'
        }
    }

    dependencies {
        // specify dependencies here under either 'build', 'compile', 'runtime', 'test' or 'provided' scopes e.g.
    }

    plugins {
        compile ":quartz:1.0.2"
        compile ':cache-ehcache:1.0.0'

        compile ":jsonp:0.2"
        compile ":build-info:1.2.8"

        build ":release:3.0.1"

        // plugins for the build system only
        build ":tomcat:7.0.54"

        // plugins for the compile step
        compile ":scaffolding:2.0.3"
        compile ':cache:1.1.7'

        // plugins needed at runtime but not for compilation
        runtime ":resources:1.2.8"
        // Uncomment these (or add new ones) to enable additional resources capabilities
        //runtime ":zipped-resources:1.0.1"
        //runtime ":cached-resources:1.1"
        //runtime ":yui-minify-resources:0.1.5"

        // An alternative to the default resources plugin is the asset-pipeline plugin
        //compile ":asset-pipeline:1.6.1"

        // Uncomment these to enable additional asset-pipeline capabilities
        //compile ":sass-asset-pipeline:1.5.5"
        //compile ":less-asset-pipeline:1.5.3"
        //compile ":coffee-asset-pipeliney:1.5.0"
        //compile ":handlebars-asset-pipeline:1.3.0.1"

        //runtime ":ala-bootstrap3:1.3"
        runtime ":ala-bootstrap2:2.4.2"
        runtime ":ala-auth:1.3.2-SNAPSHOT"
    }
}
