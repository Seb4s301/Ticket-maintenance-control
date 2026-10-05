using TicketMaintenance.API.Dtos;
using TicketMaintenance.API.Models;

namespace TicketMaintenance.API.Repositories;

public interface ITicketRepository
{
    Task<int> CreateAsync(CreateTicketRequest request, int actorId, CancellationToken cancellationToken);
    Task AssignAsync(int ticketId, AssignTicketRequest request, int actorId, CancellationToken cancellationToken);
    Task TransitionAsync(int ticketId, TransitionTicketRequest request, int actorId, CancellationToken cancellationToken);
    Task UpdateTicketAsync(int id, UpdateTicketRequest request, int actorId, CancellationToken cancellationToken);
    Task<TicketDetails?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<IEnumerable<TicketDetails>> ListAsync(string? status, int? assignedTo, DateTime? from, DateTime? to, int limit, int offset, CancellationToken cancellationToken);
    Task<IEnumerable<TicketHistoryEntry>> GetHistoryAsync(int ticketId, CancellationToken cancellationToken);
}
