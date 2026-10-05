using TicketMaintenance.API.Models;
using TicketMaintenance.API.Repositories;

namespace TicketMaintenance.API.Services;

public class LookupService : ILookupService
{
    private readonly ILookupRepository _repository;

    public LookupService(ILookupRepository repository) => _repository = repository;

    public async Task<LookupsResponse> GetAllAsync(CancellationToken cancellationToken) => new()
    {
        Statuses = await _repository.GetStatusesAsync(cancellationToken),
        Priorities = await _repository.GetPrioritiesAsync(cancellationToken),
        Categories = await _repository.GetCategoriesAsync(cancellationToken),
        Operators = await _repository.GetOperatorsAsync(cancellationToken)
    };
}
