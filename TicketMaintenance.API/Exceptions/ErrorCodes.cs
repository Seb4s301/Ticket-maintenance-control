namespace TicketMaintenance.API.Exceptions;

public static class ErrorCodes
{
    public const string NotFound = "NOT_FOUND";
    public const string ValidationError = "VALIDATION_ERROR";
    public const string InvalidTransition = "INVALID_TRANSITION";
    public const string Conflict = "CONFLICT";
    public const string InvalidReference = "INVALID_REFERENCE";
    public const string ServiceUnavailable = "SERVICE_UNAVAILABLE";
}
