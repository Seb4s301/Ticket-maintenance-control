using System.Data;

namespace TicketMaintenance.API.Data;

public interface IDbConnectionFactory
{
    IDbConnection Create();
}
