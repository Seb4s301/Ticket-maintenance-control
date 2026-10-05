using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using TicketMaintenance.API.Auth;
using TicketMaintenance.API.Models;

namespace TicketMaintenance.API.Services;

public class TokenService : ITokenService
{
    public int ExpiresInSeconds => JwtConfig.ExpiryHours * 3600;

    public string CreateToken(UserAccount user)
    {
        var claims = new[]
        {
            new Claim("sub", user.Id.ToString()),
            new Claim("role", user.Role)
        };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtConfig.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: JwtConfig.Issuer,
            audience: JwtConfig.Audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.AddHours(JwtConfig.ExpiryHours),
            signingCredentials: credentials);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
