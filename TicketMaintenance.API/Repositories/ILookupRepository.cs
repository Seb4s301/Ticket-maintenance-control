using TicketMaintenance.API.Models;

namespace TicketMaintenance.API.Repositories;

public interface ILookupRepository
{
    Task<IEnumerable<LookupItem>> GetStatusesAsync(CancellationToken cancellationToken);
    Task<IEnumerable<LookupItem>> GetPrioritiesAsync(CancellationToken cancellationToken);
    Task<IEnumerable<LookupItem>> GetCategoriesAsync(CancellationToken cancellationToken);
    Task<IEnumerable<OperatorItem>> GetOperatorsAsync(CancellationToken cancellationToken);
}
