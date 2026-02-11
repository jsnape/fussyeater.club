using MediatR;
using Microsoft.Extensions.Logging;

namespace FussyEaterClub.Application.Common.Behaviours;

/// <summary>
/// MediatR pipeline behaviour that logs requests.
/// </summary>
/// <typeparam name="TRequest">The request type.</typeparam>
/// <typeparam name="TResponse">The response type.</typeparam>
public sealed class LoggingBehaviour<TRequest, TResponse>(
    ILogger<LoggingBehaviour<TRequest, TResponse>> logger) : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    /// <inheritdoc />
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        string requestName = typeof(TRequest).Name;
        logger.LogInformation("Handling {RequestName}", requestName);

        TResponse response = await next(cancellationToken);

        logger.LogInformation("Handled {RequestName}", requestName);

        return response;
    }
}
