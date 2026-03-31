@description('Base name for resources.')
param baseName string

@description('Azure region.')
param location string

@description('The backend API base URL for linked backend.')
param apiBaseUrl string

// Static Web Apps are only available in specific regions
// Using westeurope as it's closest to uksouth
var swaLocation = 'westeurope'

resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: '${baseName}-swa'
  location: swaLocation
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    buildProperties: {
      appLocation: 'web'
      outputLocation: 'build'
    }
  }
}

// Note: Linked backends require Standard tier SWA
// For Free tier, the frontend calls the Container App API directly via apiBaseUrl

output url string = 'https://${staticWebApp.properties.defaultHostname}'
output apiUrl string = apiBaseUrl
