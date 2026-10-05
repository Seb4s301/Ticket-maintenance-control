namespace TicketMaintenance.API.Models;

public record UserAccount
{
    public int Id { get; init; }
    public string Name { get; init; } = "";
    public string Email { get; init; } = "";
    public string PasswordHash { get; init; } = "";
    public string Role { get; init; } = "";
    public bool IsActive { get; init; }
}
