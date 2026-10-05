using Dapper;
using TicketMaintenance.API.Data;
using TicketMaintenance.API.Models;

namespace TicketMaintenance.API.Repositories;

public class UserRepository : IUserRepository
{
    private const string SelectColumns =
        "id, name, email, password_hash, role, is_active FROM users";

    private readonly IDbConnectionFactory _factory;

    public UserRepository(IDbConnectionFactory factory) => _factory = factory;

    public async Task<UserAccount?> FindByEmailAsync(string email, CancellationToken cancellationToken)
    {
        using var connection = _factory.Create();
        var user = await connection.QuerySingleOrDefaultAsync<UserAccount>(new CommandDefinition(
            $"SELECT {SelectColumns} WHERE email = @email",
            new { email },
            cancellationToken: cancellationToken));
        return user;
    }

    public async Task<UserAccount?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        using var connection = _factory.Create();
        var user = await connection.QuerySingleOrDefaultAsync<UserAccount>(new CommandDefinition(
            $"SELECT {SelectColumns} WHERE id = @id",
            new { id },
            cancellationToken: cancellationToken));
        return user;
    }

    public async Task<bool> EmailExistsForOtherUserAsync(string email, int userId, CancellationToken cancellationToken)
    {
        using var connection = _factory.Create();
        var count = await connection.ExecuteScalarAsync<int>(new CommandDefinition(
            "SELECT COUNT(1) FROM users WHERE email = @email AND id <> @userId",
            new { email, userId },
            cancellationToken: cancellationToken));
        return count > 0;
    }

    public async Task UpdateProfileAsync(int id, string name, string email, string? passwordHash, CancellationToken cancellationToken)
    {
        using var connection = _factory.Create();
        await connection.ExecuteAsync(new CommandDefinition(
            "UPDATE users SET name = @name, email = @email, password_hash = COALESCE(@passwordHash, password_hash) WHERE id = @id",
            new { id, name, email, passwordHash },
            cancellationToken: cancellationToken));
    }
}
