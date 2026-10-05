using Dapper;
using TicketMaintenance.API.Data;
using TicketMaintenance.API.Models;

namespace TicketMaintenance.API.Repositories;

public class LookupRepository : ILookupRepository
{
    private const string SelectStatusesSql = "SELECT id, code, name FROM ticket_statuses ORDER BY id";
    private const string SelectPrioritiesSql = "SELECT id, code, name FROM priorities ORDER BY id";
    private const string SelectCategoriesSql = "SELECT id, code, name FROM categories ORDER BY id";
    private const string SelectOperatorsSql =
        "SELECT id, name, email FROM users WHERE role = 'OPERATOR' AND is_active = TRUE ORDER BY name";

    private readonly IDbConnectionFactory _factory;

    public LookupRepository(IDbConnectionFactory factory) => _factory = factory;

    public async Task<IEnumerable<LookupItem>> GetStatusesAsync(CancellationToken cancellationToken)
    {
        using var connection = _factory.Create();
        return await connection.QueryAsync<LookupItem>(
            new CommandDefinition(SelectStatusesSql, cancellationToken: cancellationToken));
    }

    public async Task<IEnumerable<LookupItem>> GetPrioritiesAsync(CancellationToken cancellationToken)
    {
        using var connection = _factory.Create();
        return await connection.QueryAsync<LookupItem>(
            new CommandDefinition(SelectPrioritiesSql, cancellationToken: cancellationToken));
    }

    public async Task<IEnumerable<LookupItem>> GetCategoriesAsync(CancellationToken cancellationToken)
    {
        using var connection = _factory.Create();
        return await connection.QueryAsync<LookupItem>(
            new CommandDefinition(SelectCategoriesSql, cancellationToken: cancellationToken));
    }

    public async Task<IEnumerable<OperatorItem>> GetOperatorsAsync(CancellationToken cancellationToken)
    {
        using var connection = _factory.Create();
        return await connection.QueryAsync<OperatorItem>(
            new CommandDefinition(SelectOperatorsSql, cancellationToken: cancellationToken));
    }
}
