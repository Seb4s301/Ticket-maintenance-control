using TicketMaintenance.API.Dtos;

namespace TicketMaintenance.API.Services;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
    Task<AuthUserResponse> GetCurrentUserAsync(int userId, CancellationToken cancellationToken);
    Task<AuthResponse> UpdateProfileAsync(int userId, UpdateProfileRequest request, CancellationToken cancellationToken);
}
