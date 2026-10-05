using MySqlConnector;
using TicketMaintenance.API.Exceptions;

namespace TicketMaintenance.API.Data;

public static class DbErrorTranslator
{
    private const string UserDefinedSqlState = "45000";

    private const string TicketNotFound = "Ticket does not exist";
    private const string InvalidTransition = "Invalid state transition";
    private const string AlreadyAssigned = "Ticket is already assigned to another operator";
    private const string OperatorNotFound = "Operator does not exist";
    private const string TargetStatusNotFound = "Target status does not exist";
    private const string OperatorNotAssigned = "An operator must be assigned before starting the ticket";

    public static Exception Translate(MySqlException ex)
    {
        if (ex.SqlState == UserDefinedSqlState)
            return TranslateBusinessError(ex);

        if (ex.ErrorCode == MySqlErrorCode.NoReferencedRow2)
            return new AppException(400, ErrorCodes.InvalidReference, "One of the referenced ids does not exist.", ex);

        return ex;
    }

    private static Exception TranslateBusinessError(MySqlException ex) => ex.Message switch
    {
        TicketNotFound => new AppException(404, ErrorCodes.NotFound, ex.Message, ex),
        InvalidTransition => new AppException(409, ErrorCodes.InvalidTransition, ex.Message, ex),
        AlreadyAssigned => new AppException(409, ErrorCodes.Conflict, ex.Message, ex),
        OperatorNotFound => new AppException(400, ErrorCodes.InvalidReference, ex.Message, ex),
        TargetStatusNotFound => new AppException(400, ErrorCodes.InvalidReference, ex.Message, ex),
        OperatorNotAssigned => new AppException(409, ErrorCodes.Conflict, ex.Message, ex),
        _ => new AppException(400, ErrorCodes.ValidationError, ex.Message, ex)
    };
}
