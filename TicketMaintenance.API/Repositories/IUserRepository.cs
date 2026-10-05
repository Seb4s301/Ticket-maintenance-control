using TicketMaintenance.API.Models;

namespace TicketMaintenance.API.Repositories;

public interface IUserRepository
{
    Task<UserAccount?> FindByEmailAsync(string email, CancellationToken cancellationToken);
    Task<UserAccount?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<bool> EmailExistsForOtherUserAsync(string email, int userId, CancellationToken cancellationToken);
    Task UpdateProfileAsync(int id, string name, string email, string? passwordHash, CancellationToken cancellationToken);
}
