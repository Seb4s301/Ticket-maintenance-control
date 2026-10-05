namespace TicketMaintenance.API.Models;

public class TicketHistoryEntry
{
    public int Id { get; set; }
    public int TicketId { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = "";
    public string EventType { get; set; } = "";
    public string? FromStatusCode { get; set; }
    public string? ToStatusCode { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}
