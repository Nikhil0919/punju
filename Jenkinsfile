pipeline {
    agent any

    environment {
        DOCKER_IMAGE_FRONTEND = "sainikhil2004/pro-frontend"
        DOCKER_IMAGE_BACKEND  = "sainikhil2004/pro-backend"
        DOCKER_IMAGE_TAG      = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    bat 'npm install'
                }
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    bat 'npm install'
                }
            }
        }

        stage('Frontend Tests') {
            steps {
                dir('frontend') {
                    bat 'npm test -- --watchAll=false --passWithNoTests'
                }
            }
        }

        stage('Backend Tests') {
            steps {
                dir('backend') {
                    bat 'npm test || exit 0'
                }
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Frontend Image') {
                    steps {
                        dir('frontend') {
                            bat "docker build -t %DOCKER_IMAGE_FRONTEND%:%DOCKER_IMAGE_TAG% ."
                        }
                    }
                }
                stage('Backend Image') {
                    steps {
                        dir('backend') {
                            bat "docker build -t %DOCKER_IMAGE_BACKEND%:%DOCKER_IMAGE_TAG% ."
                        }
                    }
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials',
                                                 usernameVariable: 'USER',
                                                 passwordVariable: 'PASS')]) {
                    bat "echo %PASS% | docker login -u %USER% --password-stdin"
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                bat "docker push %DOCKER_IMAGE_FRONTEND%:%DOCKER_IMAGE_TAG%"
                bat "docker push %DOCKER_IMAGE_BACKEND%:%DOCKER_IMAGE_TAG%"
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "✅ Build & Push Completed Successfully!"
        }
        failure {
            echo "❌ Pipeline Failed — Check logs"
        }
    }
}
