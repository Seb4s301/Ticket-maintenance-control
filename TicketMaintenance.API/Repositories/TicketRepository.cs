using System.Data;
using Dapper;
using MySqlConnector;
using TicketMaintenance.API.Data;
using TicketMaintenance.API.Dtos;
using TicketMaintenance.API.Models;

namespace TicketMaintenance.API.Repositories;

public class TicketRepository : ITicketRepository
{
    private const string CreateTicketProcedure = "create_ticket";
    private const string AssignTicketProcedure = "assign_ticket";
    private const string TransitionTicketProcedure = "transition_ticket";

    private const string TicketQuerySql = @"SELECT
            t.id, t.ticket_number, t.title, t.description,
            ts.code AS status_code, ts.name AS status_name,
            p.code AS priority_code, c.code AS category_code,
            t.created_by, creator.name AS created_by_name,
            t.assigned_to, assignee.name AS assigned_to_name, t.assigned_at,
            t.resolution, t.created_at, t.updated_at, t.resolved_at
        FROM tickets t
        JOIN ticket_statuses ts ON ts.id = t.status_id
        JOIN priorities p ON p.id = t.priority_id
        JOIN categories c ON c.id = t.category_id
        JOIN users creator ON creator.id = t.created_by
        LEFT JOIN users assignee ON assignee.id = t.assigned_to";

    private const string SelectByIdSql = TicketQuerySql + " WHERE t.id = @id";

    private const string SelectListSql = TicketQuerySql + @" WHERE
            (@status IS NULL OR ts.code = @status)
            AND (@assignedTo IS NULL OR t.assigned_to = @assignedTo)
            AND (@from IS NULL OR t.created_at >= @from)
            AND (@to IS NULL OR t.created_at < @to)
        ORDER BY t.created_at DESC
        LIMIT @limit OFFSET @offset";

    private const string SelectHistorySql = @"SELECT h.id, h.ticket_id, h.user_id, u.name AS user_name,
                h.event_type, fs.code AS from_status_code, ts.code AS to_status_code,
                h.comment, h.created_at
         FROM ticket_history h
         JOIN users u ON u.id = h.user_id
         LEFT JOIN ticket_statuses fs ON fs.id = h.from_status_id
         LEFT JOIN ticket_statuses ts ON ts.id = h.to_status_id
         WHERE h.ticket_id = @ticketId
         ORDER BY h.created_at, h.id";

    private readonly IDbConnectionFactory _factory;

    public TicketRepository(IDbConnectionFactory factory) => _factory = factory;

    public async Task<int> CreateAsync(CreateTicketRequest request, CancellationToken cancellationToken)
    {
        var parameters = new
        {
            p_title = request.Title.Trim(),
            p_description = request.Description.Trim(),
            p_priority_id = request.PriorityId,
            p_category_id = request.CategoryId,
            p_created_by = request.CreatedBy,
            p_created_at = DateTime.UtcNow
        };

        return await QueryAsync(connection => connection.QuerySingleAsync<int>(
            new CommandDefinition(CreateTicketProcedure, parameters,
                cancellationToken: cancellationToken, commandType: CommandType.StoredProcedure)));
    }

    public Task AssignAsync(int ticketId, AssignTicketRequest request, CancellationToken cancellationToken)
    {
        var parameters = new
        {
            p_ticket_id = ticketId,
            p_operator_id = request.OperatorId,
            p_actor_id = request.PerformedBy,
            p_assigned_at = DateTime.UtcNow
        };

        return QueryAsync(connection => connection.ExecuteAsync(
            new CommandDefinition(AssignTicketProcedure, parameters,
                cancellationToken: cancellationToken, commandType: CommandType.StoredProcedure)));
    }

    public Task TransitionAsync(int ticketId, TransitionTicketRequest request, CancellationToken cancellationToken)
    {
        var parameters = new
        {
            p_ticket_id = ticketId,
            p_target_status_id = request.TargetStatusId,
            p_actor_id = request.PerformedBy,
            p_comment = ToNullIfBlank(request.Comment),
            p_resolution = ToNullIfBlank(request.Resolution),
            p_transition_at = DateTime.UtcNow
        };

        return QueryAsync(connection => connection.ExecuteAsync(
            new CommandDefinition(TransitionTicketProcedure, parameters,
                cancellationToken: cancellationToken, commandType: CommandType.StoredProcedure)));
    }

    public Task<TicketDetails?> GetByIdAsync(int id, CancellationToken cancellationToken) =>
        QueryAsync(connection => connection.QuerySingleOrDefaultAsync<TicketDetails>(
            new CommandDefinition(SelectByIdSql, new { id }, cancellationToken: cancellationToken)));
    
    public Task<IEnumerable<TicketDetails>> ListAsync(string? status, int? assignedTo, DateTime? from, DateTime? to, int limit, int offset, CancellationToken cancellationToken)
    {
        var parameters = new
        {
            status = status?.Trim().ToUpperInvariant(),
            assignedTo,
            from = ToUtc(from),
            to = ToUtc(to),
            limit,
            offset
        };

        return QueryAsync(connection => connection.QueryAsync<TicketDetails>(
            new CommandDefinition(SelectListSql, parameters, cancellationToken: cancellationToken)));
    }

    public Task<IEnumerable<TicketHistoryEntry>> GetHistoryAsync(int ticketId, CancellationToken cancellationToken) =>
        QueryAsync(connection => connection.QueryAsync<TicketHistoryEntry>(
            new CommandDefinition(SelectHistorySql, new { ticketId }, cancellationToken: cancellationToken)));

    private async Task<T> QueryAsync<T>(Func<IDbConnection, Task<T>> operation)
    {
        try
        {
            using var connection = _factory.Create();
            return await operation(connection);
        }
        catch (MySqlException ex)
        {
            throw DbErrorTranslator.Translate(ex);
        }
    }

    private static string? ToNullIfBlank(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static DateTime? ToUtc(DateTime? value) =>
        value?.Kind == DateTimeKind.Local ? value.Value.ToUniversalTime() : value;
}
