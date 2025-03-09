using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Sp_Generator.Repos.Services;
using System.Collections.Generic;

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
        public IActionResult Connect([FromBody] ConnectionRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.ConnectionString))
            {
                return BadRequest("Connection string is required.");
            }

            try
            {
                using (var connection = new SqlConnection(request.ConnectionString))
                {
                    connection.Open();
                    using (var command = new SqlCommand("SELECT 1 AS Test", connection))
                    {
                        var result = command.ExecuteScalar();
                        if (result != null && result.ToString() == "1")
                        {
                            _repository.SetConnectionString(request.ConnectionString);
                            return Ok(new { message = "Connected to the database successfully." });
                        }
                        else
                        {
                            return StatusCode(500, new { error = "Failed to verify connection." });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to connect to the database.", details = ex.Message });
            }
        }
        #endregion

        #region GET table names
        [HttpGet("tables")]
        public IActionResult GetTableNames()
        {
            try
            {
                var tableNames = _repository.GetTableNames();
                return Ok(tableNames);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to fetch table names.", details = ex.Message });
            }
        }
        #endregion

        #region GET full database metadata
        [HttpGet("metadata")]
        public IActionResult GetDatabaseMetadata()
        {
            try
            {
                var metadata = _repository.GetDatabaseMetadata();
                return Ok(metadata);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to fetch database metadata.", details = ex.Message });
            }
        }
        #endregion

        #region GET metadata for a specific table
        [HttpGet("metadata/{tableName}")]
        public IActionResult GetTableMetadata(string tableName)
        {
            if (string.IsNullOrEmpty(tableName))
            {
                return BadRequest("Table name is required.");
            }

            try
            {
                var metadata = _repository.GetTableMetadata(tableName);
                return Ok(metadata);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to fetch table metadata.", details = ex.Message });
            }
        }
        #endregion

        #region POST create stored procedures

        [HttpPost("create-stored-procedures")]
        public IActionResult CreateStoredProcedures([FromBody] CreateStoredProceduresRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.TableName) || request.Procedures == null || request.Procedures.Count == 0)
            {
                return BadRequest("Invalid request data.");
            }

            var results = _repository.CreateStoredProcedures(request.TableName, request.Procedures);
            return Ok(results);
        }
        #endregion

    }
    public class CreateStoredProceduresRequest
    {
        public string TableName { get; set; }
        public Dictionary<string, string> Procedures { get; set; }
    }
    public class ConnectionRequest
    {
        public string ConnectionString { get; set; }
    }
}
