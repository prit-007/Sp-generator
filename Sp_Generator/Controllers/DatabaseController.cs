using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Sp_Generator.Repos.Services;
using Sp_Generator.Models;
using Sp_Generator.Models.ValidationAttributes;
using System.ComponentModel.DataAnnotations;

namespace Sp_Generator.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DatabaseController : ControllerBase
    {
        private readonly DatabaseRepository _repository;

        public DatabaseController(DatabaseRepository repository)
        {
            _repository = repository;
        }

        #region POST connect
        [HttpPost("connect")]
        public async Task<IActionResult> Connect([FromBody] ConnectionRequest request)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Validation failed",
                    Errors = errors
                });
            }

            using (var connection = new SqlConnection(request.ConnectionString))
            {
                await connection.OpenAsync();

                // Get server and database information
                var serverVersionCommand = new SqlCommand("SELECT @@VERSION", connection);
                var databaseNameCommand = new SqlCommand("SELECT DB_NAME()", connection);

                var serverVersion = (await serverVersionCommand.ExecuteScalarAsync())?.ToString();
                var databaseName = (await databaseNameCommand.ExecuteScalarAsync())?.ToString();

                _repository.SetConnectionString(request.ConnectionString);

                return Ok(new ApiResponse<ConnectionResponse>
                {
                    Success = true,
                    Message = "Connected to the database successfully.",
                    Data = new ConnectionResponse
                    {
                        IsConnected = true,
                        Message = "Connection established successfully",
                        ServerVersion = serverVersion,
                        DatabaseName = databaseName
                    }
                });
            }
        }
        #endregion

        #region GET table names
        [HttpGet("tables")]
        public async Task<IActionResult> GetTableNames()
        {
            var tableNames = await _repository.GetTableNamesAsync();
            return Ok(new ApiResponse<List<string>>
            {
                Success = true,
                Message = "Table names retrieved successfully.",
                Data = tableNames
            });
        }
        #endregion

        #region GET full database metadata
        [HttpGet("metadata")]
        public async Task<IActionResult> GetDatabaseMetadata()
        {
            var metadata = await _repository.GetDatabaseMetadataAsync();
            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Database metadata retrieved successfully.",
                Data = metadata
            });
        }
        #endregion

        #region GET metadata for a specific table
        [HttpGet("metadata/{tableName}")]
        public async Task<IActionResult> GetTableMetadata([TableNameValidation] string tableName)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Invalid table name",
                    Errors = errors
                });
            }

            var metadata = await _repository.GetTableMetadataAsync(tableName);
            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = $"Metadata for table '{tableName}' retrieved successfully.",
                Data = metadata
            });
        }
        #endregion

        #region POST create stored procedures
        [HttpPost("create-stored-procedures")]
        public async Task<IActionResult> CreateStoredProcedures([FromBody] CreateStoredProceduresRequest request)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Validation failed",
                    Errors = errors
                });
            }

            var results = await _repository.CreateStoredProceduresAsync(request.TableName, request.Procedures);

            var procedureResults = results.Select(r => new StoredProcedureResult
            {
                ProcedureName = r.Key,
                Success = !r.Value.Contains("Error"),
                Message = r.Value,
                ErrorDetails = r.Value.Contains("Error") ? r.Value : null
            }).ToList();

            var hasErrors = procedureResults.Any(r => !r.Success);

            return Ok(new ApiResponse<List<StoredProcedureResult>>
            {
                Success = !hasErrors,
                Message = hasErrors
                    ? "Some stored procedures failed to create"
                    : "All stored procedures created successfully",
                Data = procedureResults
            });
        }
        #endregion

    }
}