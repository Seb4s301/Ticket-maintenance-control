using Microsoft.AspNetCore.Mvc;
using TicketMaintenance.API.Models;
using TicketMaintenance.API.Services;

namespace TicketMaintenance.API.Controllers;

[ApiController]
[Route("api/lookups")]
[Produces("application/json")]
public class LookupsController : ControllerBase
{
    private readonly ILookupService _service;

    public LookupsController(ILookupService service) => _service = service;

    /// <summary>Returns statuses, priorities, categories and active operators (for form dropdowns).</summary>
    [HttpGet]
    [ProducesResponseType(typeof(LookupsResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<LookupsResponse>> GetAll(CancellationToken cancellationToken) =>
        Ok(await _service.GetAllAsync(cancellationToken));
}
