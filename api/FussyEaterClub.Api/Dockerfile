FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /repo

# Copy build infrastructure and project files for restore
COPY api/Directory.Build.props api/Directory.Packages.props api/nuget.config api/
COPY api/FussyEaterClub.Domain/FussyEaterClub.Domain.csproj api/FussyEaterClub.Domain/
COPY api/FussyEaterClub.Application/FussyEaterClub.Application.csproj api/FussyEaterClub.Application/
COPY api/FussyEaterClub.Infrastructure/FussyEaterClub.Infrastructure.csproj api/FussyEaterClub.Infrastructure/
COPY api/FussyEaterClub.Api/FussyEaterClub.Api.csproj api/FussyEaterClub.Api/

RUN dotnet restore api/FussyEaterClub.Api/FussyEaterClub.Api.csproj

# Copy all source and build
COPY api/ api/
RUN dotnet publish api/FussyEaterClub.Api/FussyEaterClub.Api.csproj -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "FussyEaterClub.Api.dll"]
