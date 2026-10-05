using TicketMaintenance.API.Models;

namespace TicketMaintenance.API.Services;

public interface ILookupService
{
    Task<LookupsResponse> GetAllAsync(CancellationToken cancellationToken);
}
