@description('Base name for resources.')
param baseName string

@description('Azure region.')
param location string

@description('Cosmos DB connection string.')
@secure()
param cosmosDbConnectionString string

@description('Cosmos DB database name.')
param cosmosDbDatabaseName string

@description('Container image name (e.g., ghcr.io/owner/repo:tag).')
param apiImageName string

@description('GitHub Container Registry username.')
param ghcrUsername string = ''

@description('GitHub Container Registry PAT (read:packages scope).')
@secure()
param ghcrToken string = ''

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: '${baseName}-logs'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource containerAppEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: '${baseName}-env'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: '${baseName}-api'
  location: location
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8080
        transport: 'auto'
        corsPolicy: {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
          allowedHeaders: ['*']
        }
      }
      registries: !empty(ghcrToken) ? [
        {
          server: 'ghcr.io'
          username: ghcrUsername
          passwordSecretRef: 'ghcr-token'
        }
      ] : []
      secrets: concat([
        {
          name: 'cosmosdb-connection'
          value: cosmosDbConnectionString
        }
      ], !empty(ghcrToken) ? [
        {
          name: 'ghcr-token'
          value: ghcrToken
        }
      ] : [])
    }
    template: {
      containers: [
        {
          name: 'api'
          image: !empty(apiImageName) ? apiImageName : 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            {
              name: 'ConnectionStrings__CosmosDb'
              secretRef: 'cosmosdb-connection'
            }
            {
              name: 'CosmosDb__DatabaseName'
              value: cosmosDbDatabaseName
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 5
        rules: [
          {
            name: 'http-rule'
            http: {
              metadata: {
                concurrentRequests: '50'
              }
            }
          }
        ]
      }
    }
  }
}

output apiUrl string = 'https://${containerApp.properties.configuration.ingress.fqdn}'
