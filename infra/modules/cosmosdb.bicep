@description('Base name for resources.')
param baseName string

@description('Azure region.')
param location string

@description('Database name.')
param databaseName string

resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' = {
  name: '${baseName}-cosmos'
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    enableFreeTier: true
    locations: [
      {
        locationName: location
        failoverPriority: 0
      }
    ]
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
  }
}

resource database 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-05-15' = {
  parent: cosmosAccount
  name: databaseName
  properties: {
    resource: {
      id: databaseName
    }
    options: {
      throughput: 1000 // Shared throughput covered by free tier
    }
  }
}

var containers = [
  { name: 'recipes', partitionKey: '/householdId' }
  { name: 'households', partitionKey: '/id' }
  { name: 'members', partitionKey: '/householdId' }
  { name: 'meal-plans', partitionKey: '/householdId' }
  { name: 'shopping-lists', partitionKey: '/householdId' }
]

resource cosmosContainers 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = [
  for container in containers: {
    parent: database
    name: container.name
    properties: {
      resource: {
        id: container.name
        partitionKey: {
          paths: [container.partitionKey]
          kind: 'Hash'
        }
      }
    }
  }
]

output connectionString string = cosmosAccount.listConnectionStrings().connectionStrings[0].connectionString
output accountName string = cosmosAccount.name
