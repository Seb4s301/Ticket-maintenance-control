using System.ComponentModel.DataAnnotations;

namespace TicketMaintenance.API.Dtos;

public class LoginRequest
{
    [Required, EmailAddress, StringLength(150)]
    public string Email { get; set; } = "";

    [Required, StringLength(100)]
    public string Password { get; set; } = "";
}

public class UpdateProfileRequest
{
    [Required, StringLength(100)]
    public string Name { get; set; } = "";

    [Required, EmailAddress, StringLength(150)]
    public string Email { get; set; } = "";

    [StringLength(100)]
    public string? CurrentPassword { get; set; }

    [StringLength(100)]
    public string? NewPassword { get; set; }
}

public class AuthUserResponse
{
    public int Id { get; init; }
    public string Name { get; init; } = "";
    public string Email { get; init; } = "";
    public string Role { get; init; } = "";
}

public class AuthResponse
{
    public string Token { get; init; } = "";
    public int ExpiresInSeconds { get; init; }
    public AuthUserResponse User { get; init; } = new();
}
