using TicketMaintenance.API.Dtos;
using TicketMaintenance.API.Exceptions;
using TicketMaintenance.API.Models;
using TicketMaintenance.API.Repositories;

namespace TicketMaintenance.API.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public AuthService(IUserRepository users, IPasswordHasher passwordHasher, ITokenService tokenService)
    {
        _users = users;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await _users.FindByEmailAsync(request.Email.Trim(), cancellationToken);
        if (user is null || !user.IsActive || !_passwordHasher.Verify(request.Password, user.PasswordHash))
            throw new AppException(401, ErrorCodes.Unauthorized, "Invalid email or password");

        return BuildResponse(user);
    }

    public async Task<AuthUserResponse> GetCurrentUserAsync(int userId, CancellationToken cancellationToken)
    {
        var user = await _users.GetByIdAsync(userId, cancellationToken);
        if (user is null || !user.IsActive)
            throw new AppException(401, ErrorCodes.Unauthorized, "Your account is no longer available");
        return ToUserResponse(user);
    }

    public async Task<AuthResponse> UpdateProfileAsync(int userId, UpdateProfileRequest request, CancellationToken cancellationToken)
    {
        var user = await _users.GetByIdAsync(userId, cancellationToken);
        if (user is null || !user.IsActive)
            throw new AppException(401, ErrorCodes.Unauthorized, "Your account is no longer available");

        var name = request.Name.Trim();
        if (name.Length == 0)
            throw new AppException(400, ErrorCodes.ValidationError, "Name: The Name field is required.");

        var email = request.Email.Trim();
        if (!string.Equals(email, user.Email, StringComparison.OrdinalIgnoreCase)
            && await _users.EmailExistsForOtherUserAsync(email, userId, cancellationToken))
            throw new AppException(409, ErrorCodes.Conflict, "Email is already in use");

        var currentPassword = string.IsNullOrWhiteSpace(request.CurrentPassword) ? null : request.CurrentPassword;
        var newPassword = string.IsNullOrWhiteSpace(request.NewPassword) ? null : request.NewPassword;

        string? newPasswordHash = null;
        if (newPassword is not null)
        {
            if (currentPassword is null)
                throw new AppException(400, ErrorCodes.ValidationError,
                    "CurrentPassword: The current password is required to change the password.");
            if (!_passwordHasher.Verify(currentPassword, user.PasswordHash))
                throw new AppException(400, ErrorCodes.ValidationError, "Current password is incorrect.");
            if (newPassword.Length < 8)
                throw new AppException(400, ErrorCodes.ValidationError,
                    "NewPassword: The new password must be at least 8 characters.");
            newPasswordHash = _passwordHasher.Hash(newPassword);
        }

        await _users.UpdateProfileAsync(userId, name, email, newPasswordHash, cancellationToken);
        var updated = user with { Name = name, Email = email };
        return BuildResponse(updated);
    }

    private AuthResponse BuildResponse(UserAccount user) => new()
    {
        Token = _tokenService.CreateToken(user),
        ExpiresInSeconds = _tokenService.ExpiresInSeconds,
        User = ToUserResponse(user)
    };

    private static AuthUserResponse ToUserResponse(UserAccount user) => new()
    {
        Id = user.Id,
        Name = user.Name,
        Email = user.Email,
        Role = user.Role
    };
}
