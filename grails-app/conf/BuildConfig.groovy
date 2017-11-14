grails.servlet.version = '3.0' // Change depending on target container compliance (2.5 or 3.0)
grails.project.class.dir = 'target/classes'
grails.project.test.class.dir = 'target/test-classes'
grails.project.test.reports.dir = 'target/test-reports'
grails.project.work.dir = 'target/work'
grails.project.target.level = 1.7
grails.project.source.level = 1.7
//grails.plugin.location.'sandbox-hub' = '../sandbox-hub'
//grails.plugin.location.'ala-charts-plugin' = '../ala-charts-plugin'
//grails.plugin.location.'downloads-plugin' = '../downloads-plugin'

grails.server.port.http = 8082

grails.project.war.file = "target/${appName}-${appVersion}.war"

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

grails.project.dependency.resolver = 'maven' // or ivy
grails.project.dependency.resolution = {
    // inherit Grails' default dependencies
    inherits('global') {
        // specify dependency exclusions here; for example, uncomment this to disable ehcache:
        // excludes 'ehcache'
    }
    log 'error' // log level of Ivy resolver, either 'error', 'warn', 'info', 'debug' or 'verbose'
    checksums true // Whether to verify checksums on resolve
    legacyResolve true
    // whether to do a secondary resolve on plugin installation, not advised and here for backwards compatibility

    repositories {
        mavenLocal()
        mavenRepo('https://nexus.ala.org.au/content/groups/public/') {
            updatePolicy 'always'
        }
    }

    dependencies {
        // specify dependencies here under either 'build', 'compile', 'runtime', 'test' or 'provided' scopes e.g.
        compile 'au.org.ala:ala-cas-client:2.2.1-SNAPSHOT'
    }

    plugins {
        compile ':cache:1.1.8'
        compile ':cache-ehcache:1.0.0'

        compile ':jsonp:0.2'
        compile ':build-info:1.2.8'

        build ':release:3.0.1'

        // plugins for the build system only
        build ':tomcat:7.0.54'

        compile ':asset-pipeline:2.14.1'
        runtime ':angular-annotate-asset-pipeline:2.4.1'
        runtime ':angular-template-asset-pipeline:2.3.0'

        runtime(':ala-bootstrap3:1.6') {
            excludes 'jquery', 'resources', 'ala-cas-client'
        }

        runtime(':ala-auth:1.3.4') {
            excludes 'commons-httpclient', 'resources'
        }

        runtime(':sandbox-hub:0.1') {
            excludes 'resources'
        }

        runtime(':ala-admin-plugin:1.3-SNAPSHOT')

        compile 'org.grails.plugins:ziplet:0.4'
    }
}
