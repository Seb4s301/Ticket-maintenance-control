namespace TicketMaintenance.API.Models;

public class TicketDetails
{
    public int Id { get; set; }
    public string TicketNumber { get; set; } = "";
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string StatusCode { get; set; } = "";
    public string StatusName { get; set; } = "";
    public string PriorityCode { get; set; } = "";
    public string CategoryCode { get; set; } = "";
    public int CreatedBy { get; set; }
    public string CreatedByName { get; set; } = "";
    public int? AssignedTo { get; set; }
    public string? AssignedToName { get; set; }
    public DateTime? AssignedAt { get; set; }
    public string? Resolution { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
}
