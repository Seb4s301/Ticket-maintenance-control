using TicketMaintenance.API.Dtos;
using TicketMaintenance.API.Exceptions;
using TicketMaintenance.API.Models;
using TicketMaintenance.API.Repositories;

namespace TicketMaintenance.API.Services;

public class TicketService : ITicketService
{
    private const int MaxPageSize = 200;

    private readonly ITicketRepository _repository;

    public TicketService(ITicketRepository repository) => _repository = repository;

    public async Task<TicketDetails> CreateAsync(CreateTicketRequest request, CancellationToken cancellationToken)
    {
        var ticketId = await _repository.CreateAsync(request, cancellationToken);
        return await GetByIdAsync(ticketId, cancellationToken);
    }

    public async Task<TicketDetails> AssignAsync(int ticketId, AssignTicketRequest request, CancellationToken cancellationToken)
    {
        await _repository.AssignAsync(ticketId, request, cancellationToken);
        return await GetByIdAsync(ticketId, cancellationToken);
    }

    public async Task<TicketDetails> TransitionAsync(int ticketId, TransitionTicketRequest request, CancellationToken cancellationToken)
    {
        await _repository.TransitionAsync(ticketId, request, cancellationToken);
        return await GetByIdAsync(ticketId, cancellationToken);
    }

    public async Task<TicketDetails> GetByIdAsync(int id, CancellationToken cancellationToken) =>
        await _repository.GetByIdAsync(id, cancellationToken)
        ?? throw new AppException(404, ErrorCodes.NotFound, "Ticket does not exist");

    public Task<IEnumerable<TicketDetails>> ListAsync(string? status, int? assignedTo, DateTime? from, DateTime? to, int limit, int offset, CancellationToken cancellationToken) =>
        _repository.ListAsync(
            status,
            assignedTo,
            from,
            to,
            Math.Clamp(limit, 1, MaxPageSize),
            Math.Max(offset, 0),
            cancellationToken);

    public async Task<IEnumerable<TicketHistoryEntry>> GetHistoryAsync(int id, CancellationToken cancellationToken)
    {
        await GetByIdAsync(id, cancellationToken);
        return await _repository.GetHistoryAsync(id, cancellationToken);
    }
}
