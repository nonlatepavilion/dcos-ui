#!/usr/bin/env groovy
pipeline {
  agent {
    dockerfile true
  }

  environment {
    JENKINS_VERSION = 'yes'
    NODE_PATH = 'node_modules'
  }

  options {
    timeout(time: 1, unit: 'HOURS')
  }

  stages {
    stage('Initialization') {
      steps {
        ansiColor('xterm') {
          retry(2) {
            sh '''npm --unsafe-perm install'''
          }

          sh '''npm run scaffold'''
        }
      }
    }

    stage('Lint and Unit Test') {
      steps {
        parallel(
          'Lint': {
            ansiColor('xterm') {
              sh ''''npm run lint'''
            }
          },
          'Unit Tests': {
            ansiColor('xterm') {
              sh '''npm run test'''
            }
          }, failFast: true)
      }

      post {
        always {
          junit 'jest/test-results/*.xml'
        }
      }
    }

    stage('Build') {
      steps {
        ansiColor('xterm') {
          sh '''npm run build-assets'''
        }

        post {
          always {
            stash includes: 'dist/*', name: 'dist'
          }
        }
      }
    }

    stage('Integration Test and System Test') {
      steps {

        parallel(
          'Integration Tests': {
            node('mesos') {
              // Run a simple webserver serving the dist folder statically
              // before we run the cypress tests
              writeFile file: 'integration-tests.sh', text: [
                'export PATH=`pwd`/node_modules/.bin:$PATH',
                'http-server -p 4200 dist&',
                'SERVER_PID=$!',
                'cypress run --reporter junit --reporter-options \'mochaFile=cypress/results.xml\'',
                'RET=$?',
                'kill $SERVER_PID',
                'exit $RET'
              ].join('\n')

              unstash 'dist'

              ansiColor('xterm') {
                retry(2) {
                  sh '''bash integration-tests.sh'''
                }
              }
            }
          },
          'System Tests': {
            node('mesos') {
              withCredentials(
                [
                  string(
                    credentialsId: '8e2b2400-0f14-4e4d-b319-e1360f97627d',
                    variable: 'CCM_AUTH_TOKEN'
                  )
                ]
              ) {
                unstash 'dist'

                ansiColor('xterm') {
                  retry(2) {
                    sh '''dcos-system-test-driver -v ./system-tests/driver-config/jenkins.sh'''
                  }
                }
              }
            }
          }, failFast: true)
      }

      post {
        always {
          archiveArtifacts 'results/**/*'
          archiveArtifacts 'cypress/**/*'
          junit 'results/results.xml'
          junit 'cypress/*.xml'
        }
      }
    }
  }
}
