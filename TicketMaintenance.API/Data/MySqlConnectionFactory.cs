using System.Data;
using MySqlConnector;

namespace TicketMaintenance.API.Data;

public class MySqlConnectionFactory : IDbConnectionFactory
{
    private readonly Lazy<string> _connectionString = new(BuildConnectionString);

    public IDbConnection Create() => new MySqlConnection(_connectionString.Value);

    private static string BuildConnectionString()
    {
        var builder = new MySqlConnectionStringBuilder
        {
            Server = GetRequiredVariable("DB_HOST"),
            Port = uint.Parse(GetRequiredVariable("DB_PORT")),
            Database = GetRequiredVariable("DB_NAME"),
            UserID = GetRequiredVariable("DB_USER"),
            Password = GetRequiredVariable("DB_PASSWORD"),
        };
        return builder.ConnectionString;
    }

    private static string GetRequiredVariable(string name) =>
        Environment.GetEnvironmentVariable(name)
        ?? throw new InvalidOperationException($"Missing environment variable: {name}");
}
