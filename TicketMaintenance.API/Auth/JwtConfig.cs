namespace TicketMaintenance.API.Auth;

public static class JwtConfig
{
    public static string Secret => Environment.GetEnvironmentVariable("JWT_SECRET") ?? "";
    public static string Issuer => Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "ticket-maintenance-api";
    public static string Audience => Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "ticket-maintenance-frontend";
    public static int ExpiryHours =>
        int.TryParse(Environment.GetEnvironmentVariable("JWT_EXPIRY_HOURS"), out var hours) && hours > 0 ? hours : 8;

    public static void Validate()
    {
        if (Secret.Length < 32)
            throw new InvalidOperationException(
                "JWT_SECRET must be configured with at least 32 characters.");
    }
}
