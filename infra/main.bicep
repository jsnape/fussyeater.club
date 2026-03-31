targetScope = 'resourceGroup'

@description('The base name for all resources.')
param baseName string = 'fussyeaterclub'

@description('The Azure region for resources.')
param location string = resourceGroup().location

@description('The Cosmos DB database name.')
param cosmosDbDatabaseName string = 'fussy-eater-club'

@description('The container app image to deploy (e.g., ghcr.io/jsnape/fussyeaterclub-api:latest).')
param apiImageName string = ''

@description('GitHub Container Registry username.')
param ghcrUsername string = ''

@description('GitHub Container Registry PAT (read:packages scope).')
@secure()
param ghcrToken string = ''

// Cosmos DB
module cosmosDb 'modules/cosmosdb.bicep' = {
  name: 'cosmosdb'
  params: {
    baseName: baseName
    location: location
    databaseName: cosmosDbDatabaseName
  }
}

// Container Apps Environment + API
module containerApp 'modules/container-app.bicep' = {
  name: 'containerapp'
  params: {
    baseName: baseName
    location: location
    cosmosDbConnectionString: cosmosDb.outputs.connectionString
    cosmosDbDatabaseName: cosmosDbDatabaseName
    apiImageName: apiImageName
    ghcrUsername: ghcrUsername
    ghcrToken: ghcrToken
  }
}

// Static Web App
module staticWebApp 'modules/static-web-app.bicep' = {
  name: 'staticwebapp'
  params: {
    baseName: baseName
    location: location
    apiBaseUrl: containerApp.outputs.apiUrl
  }
}

output apiUrl string = containerApp.outputs.apiUrl
output staticWebAppUrl string = staticWebApp.outputs.url
output cosmosDbAccountName string = cosmosDb.outputs.accountName
