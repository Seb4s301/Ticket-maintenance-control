using System.ComponentModel.DataAnnotations;

namespace TicketMaintenance.API.Dtos;

public class CreateTicketRequest
{
    [Required, StringLength(150)]
    public string Title { get; set; } = "";

    [Required, StringLength(2000)]
    public string Description { get; set; } = "";

    [Required, Range(1, int.MaxValue)]
    public int PriorityId { get; set; }

    [Required, Range(1, int.MaxValue)]
    public int CategoryId { get; set; }
}

public class AssignTicketRequest
{
    [Required, Range(1, int.MaxValue)]
    public int OperatorId { get; set; }
}

public class TransitionTicketRequest
{
    [Required, Range(1, int.MaxValue)]
    public int TargetStatusId { get; set; }

    [StringLength(2000)]
    public string? Comment { get; set; }

    [StringLength(2000)]
    public string? Resolution { get; set; }
}

public class UpdateTicketRequest
{
    [Required, StringLength(150)]
    public string Title { get; set; } = "";

    [Required, StringLength(2000)]
    public string Description { get; set; } = "";

    [Required, Range(1, int.MaxValue)]
    public int PriorityId { get; set; }

    [Required, Range(1, int.MaxValue)]
    public int CategoryId { get; set; }
}
