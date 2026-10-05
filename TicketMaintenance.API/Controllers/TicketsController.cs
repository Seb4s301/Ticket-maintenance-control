using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TicketMaintenance.API.Auth;
using TicketMaintenance.API.Dtos;
using TicketMaintenance.API.Models;
using TicketMaintenance.API.Services;

namespace TicketMaintenance.API.Controllers;

[ApiController]
[Route("api/tickets")]
[Authorize]
[Produces("application/json")]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _service;

    public TicketsController(ITicketService service) => _service = service;

    /// <summary>Creates a ticket in PENDING status (the authenticated user is the creator).</summary>
    [HttpPost]
    [ProducesResponseType(typeof(TicketDetails), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<TicketDetails>> Create(CreateTicketRequest request, CancellationToken cancellationToken)
    {
        var ticket = await _service.CreateAsync(request, User.GetUserId(), cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = ticket.Id }, ticket);
    }

    /// <summary>Lists tickets (newest first). Optional filters: status, assignedTo, from, to, limit (max 200), offset.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TicketDetails>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<TicketDetails>>> List(
        [FromQuery] string? status,
        [FromQuery] int? assignedTo,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int limit = 50,
        [FromQuery] int offset = 0,
        CancellationToken cancellationToken = default)
        => Ok(await _service.ListAsync(status, assignedTo, from, to, limit, offset, cancellationToken));

    /// <summary>Gets a ticket by id.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(TicketDetails), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TicketDetails>> GetById(int id, CancellationToken cancellationToken) =>
        Ok(await _service.GetByIdAsync(id, cancellationToken));

    /// <summary>Gets the full history of a ticket.</summary>
    [HttpGet("{id:int}/history")]
    [ProducesResponseType(typeof(IEnumerable<TicketHistoryEntry>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IEnumerable<TicketHistoryEntry>>> GetHistory(int id, CancellationToken cancellationToken) =>
        Ok(await _service.GetHistoryAsync(id, cancellationToken));

    /// <summary>Assigns an operator to a ticket (target operator id).</summary>
    [HttpPost("{id:int}/assign")]
    [ProducesResponseType(typeof(TicketDetails), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<TicketDetails>> Assign(int id, AssignTicketRequest request, CancellationToken cancellationToken) =>
        Ok(await _service.AssignAsync(id, request, User.GetUserId(), cancellationToken));

    /// <summary>Moves a ticket to another status id (validated by the state machine).</summary>
    [HttpPost("{id:int}/transition")]
    [ProducesResponseType(typeof(TicketDetails), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<TicketDetails>> Transition(int id, TransitionTicketRequest request, CancellationToken cancellationToken) =>
        Ok(await _service.TransitionAsync(id, request, User.GetUserId(), cancellationToken));

    /// <summary>Edits title, description, priority and category; appends an EDITED history entry.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(TicketDetails), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TicketDetails>> Update(int id, UpdateTicketRequest request, CancellationToken cancellationToken) =>
        Ok(await _service.UpdateAsync(id, request, User.GetUserId(), cancellationToken));
}
