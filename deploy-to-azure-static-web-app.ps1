# PowerShell script to deploy Next.js app to Azure Static Web Apps
# Prerequisites: Azure CLI installed and logged in, and your app code pushed to GitHub
# Usage: .\deploy-to-azure-static-web-app.ps1 -appName <your-app-name> -resourceGroup <your-resource-group> -location <azure-region> -githubRepo <owner/repo> -branch <branch>

param(
    [string]$appName = "aichat-app",
    [string]$resourceGroup = "aichat-rg",
    [string]$location = "eastus2",
    [string]$githubRepo = "tbaillis/aibilchat",
    [string]$branch = "solaireai"
)

# Create resource group if it doesn't exist
az group create --name $resourceGroup --location $location

# Create Azure Static Web App (free tier)
az staticwebapp create `
  --name $appName `
  --resource-group $resourceGroup `
  --location $location `
  --source $githubRepo `
  --branch $branch `
  --login-with-github `
  --sku Free `
  --app-location "/" `
  --output-location ".next" `
  --verbose

Write-Host "Deployment initiated! Check the Azure Portal for status and configuration."
