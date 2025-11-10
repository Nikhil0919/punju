pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDENTIALS = credentials('docker-hub-credentials')
        DOCKER_IMAGE_FRONTEND = 'your-docker-hub-username/punju-university-frontend'
        DOCKER_IMAGE_BACKEND = 'your-docker-hub-username/punju-university-backend'
        DOCKER_IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                        }
                    }
                }
            }
        }

        stage('Run Tests') {
            parallel {
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh 'npm test -- --watchAll=false'
                        }
                    }
                }
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh 'npm test'
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Build Frontend Image') {
                    steps {
                        dir('frontend') {
                            script {
                                docker.build("${DOCKER_IMAGE_FRONTEND}:${DOCKER_IMAGE_TAG}")
                            }
                        }
                    }
                }
                stage('Build Backend Image') {
                    steps {
                        dir('backend') {
                            script {
                                docker.build("${DOCKER_IMAGE_BACKEND}:${DOCKER_IMAGE_TAG}")
                            }
                        }
                    }
                }
            }
        }

        stage('Run Security Scans') {
            parallel {
                stage('Frontend Security Scan') {
                    steps {
                        dir('frontend') {
                            sh 'npm audit'
                        }
                    }
                }
                stage('Backend Security Scan') {
                    steps {
                        dir('backend') {
                            sh 'npm audit'
                        }
                    }
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
                        docker.image("${DOCKER_IMAGE_FRONTEND}:${DOCKER_IMAGE_TAG}").push()
                        docker.image("${DOCKER_IMAGE_BACKEND}:${DOCKER_IMAGE_TAG}").push()
                        // Also push as 'latest'
                        docker.image("${DOCKER_IMAGE_FRONTEND}:${DOCKER_IMAGE_TAG}").push('latest')
                        docker.image("${DOCKER_IMAGE_BACKEND}:${DOCKER_IMAGE_TAG}").push('latest')
                    }
                }
            }
        }

        stage('Deploy to Development') {
            when {
                branch 'development'
            }
            steps {
                script {
                    // Update docker-compose with new image tags
                    sh """
                        sed -i 's|${DOCKER_IMAGE_FRONTEND}:.*|${DOCKER_IMAGE_FRONTEND}:${DOCKER_IMAGE_TAG}|g' docker-compose.yml
                        sed -i 's|${DOCKER_IMAGE_BACKEND}:.*|${DOCKER_IMAGE_BACKEND}:${DOCKER_IMAGE_TAG}|g' docker-compose.yml
                    """
                    // Deploy using docker-compose
                    sh 'docker-compose up -d'
                }
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                // Add production deployment steps here
                // This could include deploying to a cloud provider or production servers
                echo 'Deploying to production...'
            }
        }
    }

    post {
        always {
            // Clean up Docker images
            sh """
                docker rmi ${DOCKER_IMAGE_FRONTEND}:${DOCKER_IMAGE_TAG} || true
                docker rmi ${DOCKER_IMAGE_BACKEND}:${DOCKER_IMAGE_TAG} || true
            """
            // Clean up workspace
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
            // Add notification steps here (email, Slack, etc.)
        }
    }
}