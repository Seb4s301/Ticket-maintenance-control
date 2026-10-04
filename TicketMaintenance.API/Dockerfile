FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY TicketMaintenance.API.csproj TicketMaintenance.API/
RUN dotnet restore TicketMaintenance.API/TicketMaintenance.API.csproj
COPY . .
RUN dotnet publish TicketMaintenance.API/TicketMaintenance.API.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .
CMD ["sh", "-c", "ASPNETCORE_URLS=http://0.0.0.0:${PORT:-8080} dotnet TicketMaintenance.API.dll"]
