namespace TicketMaintenance.API.Exceptions;

public class AppException : Exception
{
    public int StatusCode { get; }
    public string ErrorCode { get; }

    public AppException(int statusCode, string errorCode, string message, Exception? innerException = null)
        : base(message, innerException)
    {
        StatusCode = statusCode;
        ErrorCode = errorCode;
    }
}
