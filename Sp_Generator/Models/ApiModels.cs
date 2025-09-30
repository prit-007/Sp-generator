using System.ComponentModel.DataAnnotations;
using Sp_Generator.Models.ValidationAttributes;

namespace Sp_Generator.Models
{
    public class ConnectionRequest
    {
        [Required(ErrorMessage = "Connection string is required.")]
        [ConnectionStringValidation]
        public string ConnectionString { get; set; } = string.Empty;
    }

    public class CreateStoredProceduresRequest
    {
        [Required(ErrorMessage = "Table name is required.")]
        [TableNameValidation]
        public string TableName { get; set; } = string.Empty;

        [Required(ErrorMessage = "At least one procedure is required.")]
        [MinLength(1, ErrorMessage = "At least one procedure is required.")]
        public Dictionary<string, string> Procedures { get; set; } = new();
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string> Errors { get; set; } = new();
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class ConnectionResponse
    {
        public bool IsConnected { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? ServerVersion { get; set; }
        public string? DatabaseName { get; set; }
    }

    public class TableMetadataResponse
    {
        public string TableName { get; set; } = string.Empty;
        public List<ColumnInfo> Columns { get; set; } = new();
        public List<string> PrimaryKeys { get; set; } = new();
        public List<ForeignKeyInfo> ForeignKeys { get; set; } = new();
        public int RowCount { get; set; }
    }

    public class ColumnInfo
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool IsNullable { get; set; }
        public int? MaxLength { get; set; }
        public bool IsPrimaryKey { get; set; }
        public bool IsIdentity { get; set; }
        public string? DefaultValue { get; set; }
    }

    public class ForeignKeyInfo
    {
        public string ColumnName { get; set; } = string.Empty;
        public string ReferencedTable { get; set; } = string.Empty;
        public string ReferencedColumn { get; set; } = string.Empty;
        public string ConstraintName { get; set; } = string.Empty;
    }

    public class StoredProcedureResult
    {
        public string ProcedureName { get; set; } = string.Empty;
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? ErrorDetails { get; set; }
    }
}
