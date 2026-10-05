using TicketMaintenance.API.Models;

namespace TicketMaintenance.API.Services;

public interface ITokenService
{
    string CreateToken(UserAccount user);
    int ExpiresInSeconds { get; }
}
