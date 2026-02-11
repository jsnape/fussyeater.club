FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /repo

# Copy build infrastructure and project files for restore
COPY src/Directory.Build.props src/Directory.Packages.props src/nuget.config src/
COPY src/FussyEaterClub.Domain/FussyEaterClub.Domain.csproj src/FussyEaterClub.Domain/
COPY src/FussyEaterClub.Application/FussyEaterClub.Application.csproj src/FussyEaterClub.Application/
COPY src/FussyEaterClub.Infrastructure/FussyEaterClub.Infrastructure.csproj src/FussyEaterClub.Infrastructure/
COPY src/FussyEaterClub.Api/FussyEaterClub.Api.csproj src/FussyEaterClub.Api/

RUN dotnet restore src/FussyEaterClub.Api/FussyEaterClub.Api.csproj

# Copy all source and build
COPY src/ src/
RUN dotnet publish src/FussyEaterClub.Api/FussyEaterClub.Api.csproj -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "FussyEaterClub.Api.dll"]
