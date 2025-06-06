pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'your-registry.com'
        APP_NAME = 'cameroon-legal-assistant'
        DOCKER_CREDENTIALS = credentials('docker-creds')
        KUBE_CONFIG = credentials('kube-config')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
                
                // Build Docker image
                sh """
                    docker build -t ${DOCKER_REGISTRY}/${APP_NAME}:${BUILD_NUMBER} .
                    docker tag ${DOCKER_REGISTRY}/${APP_NAME}:${BUILD_NUMBER} ${DOCKER_REGISTRY}/${APP_NAME}:latest
                """
            }
        }

        stage('Push to Registry') {
            steps {
                // Login to Docker registry
                sh """
                    echo ${DOCKER_CREDENTIALS_PSW} | docker login ${DOCKER_REGISTRY} -u ${DOCKER_CREDENTIALS_USR} --password-stdin
                    docker push ${DOCKER_REGISTRY}/${APP_NAME}:${BUILD_NUMBER}
                    docker push ${DOCKER_REGISTRY}/${APP_NAME}:latest
                """
            }
        }

        stage('Deploy to Development') {
            when {
                branch 'develop'
            }
            steps {
                // Configure kubectl
                sh """
                    mkdir -p ~/.kube
                    echo ${KUBE_CONFIG} > ~/.kube/config
                    
                    # Update Kubernetes deployments
                    kubectl set image deployment/frontend frontend=${DOCKER_REGISTRY}/${APP_NAME}:${BUILD_NUMBER} -n lawhelp
                    kubectl set image deployment/api-gateway api-gateway=${DOCKER_REGISTRY}/${APP_NAME}:${BUILD_NUMBER} -n lawhelp
                """
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                // Manual approval for production deployment
                input message: 'Deploy to production?'
                
                // Deploy to production namespace
                sh """
                    kubectl set image deployment/frontend frontend=${DOCKER_REGISTRY}/${APP_NAME}:${BUILD_NUMBER} -n lawhelp-prod
                    kubectl set image deployment/api-gateway api-gateway=${DOCKER_REGISTRY}/${APP_NAME}:${BUILD_NUMBER} -n lawhelp-prod
                """
            }
        }
    }

    post {
        always {
            // Clean up Docker images
            sh """
                docker rmi ${DOCKER_REGISTRY}/${APP_NAME}:${BUILD_NUMBER} || true
                docker rmi ${DOCKER_REGISTRY}/${APP_NAME}:latest || true
            """
        }
        
        success {
            slackSend(
                color: 'good',
                message: "Build #${BUILD_NUMBER} succeeded! App: ${APP_NAME}"
            )
        }
        
        failure {
            slackSend(
                color: 'danger',
                message: "Build #${BUILD_NUMBER} failed! App: ${APP_NAME}"
            )
        }
    }
}