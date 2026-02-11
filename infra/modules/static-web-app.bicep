@description('Base name for resources.')
param baseName string

@description('Azure region.')
param location string

@description('The backend API base URL for linked backend.')
param apiBaseUrl string

resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: '${baseName}-swa'
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    buildProperties: {
      appLocation: 'src/web'
      outputLocation: 'build'
    }
  }
}

resource linkedBackend 'Microsoft.Web/staticSites/linkedBackends@2023-12-01' = {
  parent: staticWebApp
  name: 'api-backend'
  properties: {
    backendResourceId: ''
    region: location
  }
}

output url string = 'https://${staticWebApp.properties.defaultHostname}'
