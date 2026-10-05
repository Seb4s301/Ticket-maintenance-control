namespace TicketMaintenance.API.Models;

public class LookupItem
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
}

public class OperatorItem
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
}

public class LookupsResponse
{
    public IEnumerable<LookupItem> Statuses { get; set; } = [];
    public IEnumerable<LookupItem> Priorities { get; set; } = [];
    public IEnumerable<LookupItem> Categories { get; set; } = [];
    public IEnumerable<OperatorItem> Operators { get; set; } = [];
}
