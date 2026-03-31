FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy build infrastructure
COPY Directory.Build.props Directory.Packages.props nuget.config ./

# Copy project files for restore
COPY FussyEaterClub.Domain/FussyEaterClub.Domain.csproj FussyEaterClub.Domain/
COPY FussyEaterClub.Application/FussyEaterClub.Application.csproj FussyEaterClub.Application/
COPY FussyEaterClub.Infrastructure/FussyEaterClub.Infrastructure.csproj FussyEaterClub.Infrastructure/
COPY FussyEaterClub.Api/FussyEaterClub.Api.csproj FussyEaterClub.Api/

RUN dotnet restore FussyEaterClub.Api/FussyEaterClub.Api.csproj

# Copy all source and build
COPY . .
RUN dotnet publish FussyEaterClub.Api/FussyEaterClub.Api.csproj -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "FussyEaterClub.Api.dll"]
