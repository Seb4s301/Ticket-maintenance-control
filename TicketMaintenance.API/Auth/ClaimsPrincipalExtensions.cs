using System.Security.Claims;
using TicketMaintenance.API.Exceptions;

namespace TicketMaintenance.API.Auth;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal principal)
    {
        var value = principal.FindFirst("sub")?.Value
            ?? principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(value, out var id) || id <= 0)
            throw new AppException(401, ErrorCodes.Unauthorized, "A valid authentication token is required.");
        return id;
    }
}
