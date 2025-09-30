using System.ComponentModel.DataAnnotations;
using Microsoft.Data.SqlClient;

namespace Sp_Generator.Models.ValidationAttributes
{
    public class ConnectionStringValidationAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            if (value is not string connectionString || string.IsNullOrWhiteSpace(connectionString))
            {
                ErrorMessage = "Connection string is required.";
                return false;
            }

            try
            {
                var builder = new SqlConnectionStringBuilder(connectionString);
                
                if (string.IsNullOrWhiteSpace(builder.DataSource))
                {
                    ErrorMessage = "Connection string must include a valid server name.";
                    return false;
                }

                if (string.IsNullOrWhiteSpace(builder.InitialCatalog))
                {
                    ErrorMessage = "Connection string must include a valid database name.";
                    return false;
                }

                return true;
            }
            catch (ArgumentException)
            {
                ErrorMessage = "Invalid connection string format.";
                return false;
            }
        }
    }

    public class TableNameValidationAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            if (value is not string tableName || string.IsNullOrWhiteSpace(tableName))
            {
                ErrorMessage = "Table name is required.";
                return false;
            }

            // Check for SQL injection patterns
            var invalidChars = new[] { "'", "\"", ";", "--", "/*", "*/" };
            if (invalidChars.Any(tableName.Contains))
            {
                ErrorMessage = "Table name contains invalid characters.";
                return false;
            }

            // Check length
            if (tableName.Length > 128)
            {
                ErrorMessage = "Table name cannot exceed 128 characters.";
                return false;
            }

            return true;
        }
    }
}
