using TicketMaintenance.API.Dtos;
using TicketMaintenance.API.Models;

namespace TicketMaintenance.API.Services;

public interface ITicketService
{
    Task<TicketDetails> CreateAsync(CreateTicketRequest request, int actorId, CancellationToken cancellationToken);
    Task<TicketDetails> AssignAsync(int ticketId, AssignTicketRequest request, int actorId, CancellationToken cancellationToken);
    Task<TicketDetails> TransitionAsync(int ticketId, TransitionTicketRequest request, int actorId, CancellationToken cancellationToken);
    Task<TicketDetails> UpdateAsync(int id, UpdateTicketRequest request, int actorId, CancellationToken cancellationToken);
    Task<TicketDetails> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<IEnumerable<TicketDetails>> ListAsync(string? status, int? assignedTo, DateTime? from, DateTime? to, int limit, int offset, CancellationToken cancellationToken);
    Task<IEnumerable<TicketHistoryEntry>> GetHistoryAsync(int id, CancellationToken cancellationToken);
}
