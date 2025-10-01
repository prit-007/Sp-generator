using Microsoft.Data.SqlClient;
using Newtonsoft.Json;
using Sp_Generator.Models;

namespace Sp_Generator.Repos.Services
{
    public class DatabaseRepository
    {
        private readonly ConnectionService _connectionService;
        public DatabaseRepository(ConnectionService connectionService)
        {
            _connectionService = connectionService;
        }

        private string ConnectionString => _connectionService.GetConnectionString();

        public void SetConnectionString(string connectionString)
        {
            _connectionService.SetConnectionString(connectionString);
        }

        #region Table Operations
        public List<string> GetTableNames()
        {
            ValidateConnection();

            var tables = new List<string>();

            using (var connection = new SqlConnection(ConnectionString))
            {
                connection.Open();
                var query = @"
                    SELECT TABLE_NAME
                    FROM INFORMATION_SCHEMA.TABLES
                    WHERE TABLE_TYPE = 'BASE TABLE'
                    ORDER BY TABLE_NAME";

                using (var command = new SqlCommand(query, connection))
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        tables.Add(reader["TABLE_NAME"].ToString());
                    }
                }
            }

            return tables;
        }

        public async Task<List<string>> GetTableNamesAsync()
        {
            ValidateConnection();

            var tables = new List<string>();

            using (var connection = new SqlConnection(ConnectionString))
            {
                await connection.OpenAsync();
                var query = @"
                    SELECT TABLE_NAME
                    FROM INFORMATION_SCHEMA.TABLES
                    WHERE TABLE_TYPE = 'BASE TABLE'
                    ORDER BY TABLE_NAME";

                using (var command = new SqlCommand(query, connection))
                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        tables.Add(reader["TABLE_NAME"].ToString());
                    }
                }
            }

            return tables;
        }
        #endregion

        #region Full Metadata
        public dynamic GetDatabaseMetadata()
        {
            ValidateConnection();

            var tables = GetTableNames();
            var metadata = new Dictionary<string, dynamic>();

            foreach (var table in tables)
            {
                metadata.Add(table, GetTableMetadata(table));
            }

            return JsonConvert.SerializeObject(metadata);
        }

        public async Task<dynamic> GetDatabaseMetadataAsync()
        {
            ValidateConnection();

            var tables = await GetTableNamesAsync();
            var metadata = new Dictionary<string, dynamic>();

            foreach (var table in tables)
            {
                metadata.Add(table, await GetTableMetadataAsync(table));
            }

            return JsonConvert.SerializeObject(metadata);
        }
        #endregion

        #region Partricular Table Metadata
        public dynamic GetTableMetadata(string tableName)
        {
            ValidateConnection();

            using (var connection = new SqlConnection(ConnectionString))
            {
                connection.Open();

                return new
                {
                    Columns = GetColumns(connection, tableName),
                    PrimaryKeys = GetPrimaryKeys(connection, tableName),
                    ForeignKeys = GetForeignKeys(connection, tableName)
                };
            }
        }

        public async Task<dynamic> GetTableMetadataAsync(string tableName)
        {
            ValidateConnection();

            using (var connection = new SqlConnection(ConnectionString))
            {
                await connection.OpenAsync();

                return new
                {
                    Columns = await GetColumnsAsync(connection, tableName),
                    PrimaryKeys = await GetPrimaryKeysAsync(connection, tableName),
                    ForeignKeys = await GetForeignKeysAsync(connection, tableName)
                };
            }
        }

        private List<dynamic> GetColumns(SqlConnection connection, string tableName)
        {
            var columns = new List<dynamic>();
            var query = @"
                    SELECT 
                        COLUMN_NAME AS Name,
                        DATA_TYPE AS Type,
                        IS_NULLABLE AS IsNullable,
                        CHARACTER_MAXIMUM_LENGTH AS MaxLength
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_NAME = @TableName
                    ORDER BY ORDINAL_POSITION";

            using (var command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@TableName", tableName);
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        columns.Add(new
                        {
                            Name = reader["Name"],
                            Type = reader["Type"],
                            IsNullable = reader["IsNullable"].ToString() == "YES",
                            MaxLength = reader["MaxLength"] is DBNull ? null : (int?)reader["MaxLength"]
                        });
                    }
                }
            }
            return columns;
        }
        #endregion

        #region Get Primary Keys
        private List<string> GetPrimaryKeys(SqlConnection connection, string tableName)
        {
            var keys = new List<string>();
            var query = @"
                    SELECT COLUMN_NAME 
                    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                    WHERE TABLE_NAME = @TableName 
                    AND CONSTRAINT_NAME LIKE 'PK%'";

            using (var command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@TableName", tableName);
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        keys.Add(reader["COLUMN_NAME"].ToString());
                    }
                }
            }
            return keys;
        }
        #endregion

        #region Get Foreign Keys
        private List<dynamic> GetForeignKeys(SqlConnection connection, string tableName)
        {
            var foreignKeys = new List<dynamic>();
            var query = @"
                    SELECT
                        fk.name AS ConstraintName,
                        col.name AS ColumnName,
                        referenced_table.name AS ReferencedTable,
                        referenced_col.name AS ReferencedColumn
                    FROM sys.foreign_keys fk
                    INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
                    INNER JOIN sys.tables t ON fk.parent_object_id = t.object_id
                    INNER JOIN sys.columns col ON fkc.parent_object_id = col.object_id AND fkc.parent_column_id = col.column_id
                    INNER JOIN sys.tables referenced_table ON fk.referenced_object_id = referenced_table.object_id
                    INNER JOIN sys.columns referenced_col ON fkc.referenced_object_id = referenced_col.object_id AND fkc.referenced_column_id = referenced_col.column_id
                    WHERE t.name = @TableName";

            using (var command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@TableName", tableName);
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        foreignKeys.Add(new
                        {
                            Column = reader["ColumnName"],
                            ReferenceTable = reader["ReferencedTable"],
                            ReferenceColumn = reader["ReferencedColumn"]
                        });
                    }
                }
            }
            return foreignKeys;
        }
        #endregion

        #region Create Stored Procedure
        private string CreateStoredProcedure(string procedureName, string procedureSql)
        {
            ValidateConnection();

            using (var connection = new SqlConnection(ConnectionString))
            {
                connection.Open();
                using (var command = new SqlCommand(procedureSql, connection))
                {
                    try
                    {
                        command.ExecuteNonQuery();
                        return $"Stored procedure '{procedureName}' created successfully.";
                    }
                    catch (Exception ex)
                    {
                        return $"Error creating stored procedure '{procedureName}': {ex.Message}";
                    }
                }
            }
        }

        private async Task<string> CreateStoredProcedureAsync(string procedureName, string procedureSql)
        {
            ValidateConnection();

            using (var connection = new SqlConnection(ConnectionString))
            {
                await connection.OpenAsync();
                using (var command = new SqlCommand(procedureSql, connection))
                {
                    try
                    {
                        await command.ExecuteNonQueryAsync();
                        return $"Stored procedure '{procedureName}' created successfully.";
                    }
                    catch (Exception ex)
                    {
                        return $"Error creating stored procedure '{procedureName}': {ex.Message}";
                    }
                }
            }
        }
        #endregion

        #region Create Multiple Stored Procedures
        public Dictionary<string, string> CreateStoredProcedures(string tableName, Dictionary<string, string> procedures)
        {
            var results = new Dictionary<string, string>();

            foreach (var procedure in procedures)
            {
                var procedureName = $"SP_{procedure.Key}_{tableName}";
                var result = CreateStoredProcedure(procedureName, procedure.Value);
                results.Add(procedureName, result);
            }

            return results;
        }

        public async Task<Dictionary<string, string>> CreateStoredProceduresAsync(string tableName, Dictionary<string, string> procedures)
        {
            var results = new Dictionary<string, string>();

            foreach (var procedure in procedures)
            {
                var procedureName = $"SP_{procedure.Key}_{tableName}";
                var result = await CreateStoredProcedureAsync(procedureName, procedure.Value);
                results.Add(procedureName, result);
            }

            return results;
        }
        #endregion

        #region Async Helper Methods
        private async Task<List<dynamic>> GetColumnsAsync(SqlConnection connection, string tableName)
        {
            var columns = new List<dynamic>();
            var query = @"
                    SELECT
                        COLUMN_NAME AS Name,
                        DATA_TYPE AS Type,
                        IS_NULLABLE AS IsNullable,
                        CHARACTER_MAXIMUM_LENGTH AS MaxLength
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_NAME = @TableName
                    ORDER BY ORDINAL_POSITION";

            using (var command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@TableName", tableName);
                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        columns.Add(new
                        {
                            Name = reader["Name"],
                            Type = reader["Type"],
                            IsNullable = reader["IsNullable"].ToString() == "YES",
                            MaxLength = reader["MaxLength"] is DBNull ? null : (int?)reader["MaxLength"]
                        });
                    }
                }
            }
            return columns;
        }

        private async Task<List<string>> GetPrimaryKeysAsync(SqlConnection connection, string tableName)
        {
            var primaryKeys = new List<string>();
            var query = @"
                    SELECT COLUMN_NAME
                    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                    WHERE OBJECTPROPERTY(OBJECT_ID(CONSTRAINT_SCHEMA + '.' + CONSTRAINT_NAME), 'IsPrimaryKey') = 1
                    AND TABLE_NAME = @TableName";

            using (var command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@TableName", tableName);
                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        primaryKeys.Add(reader["COLUMN_NAME"].ToString());
                    }
                }
            }
            return primaryKeys;
        }

        private async Task<List<dynamic>> GetForeignKeysAsync(SqlConnection connection, string tableName)
        {
            var foreignKeys = new List<dynamic>();
            var query = @"
                    SELECT
                        fk.name AS ConstraintName,
                        col.name AS ColumnName,
                        referenced_table.name AS ReferencedTable,
                        referenced_col.name AS ReferencedColumn
                    FROM sys.foreign_keys fk
                    INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
                    INNER JOIN sys.tables t ON fk.parent_object_id = t.object_id
                    INNER JOIN sys.columns col ON fkc.parent_object_id = col.object_id AND fkc.parent_column_id = col.column_id
                    INNER JOIN sys.tables referenced_table ON fk.referenced_object_id = referenced_table.object_id
                    INNER JOIN sys.columns referenced_col ON fkc.referenced_object_id = referenced_col.object_id AND fkc.referenced_column_id = referenced_col.column_id
                    WHERE t.name = @TableName";

            using (var command = new SqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@TableName", tableName);
                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        foreignKeys.Add(new
                        {
                            ColumnName = reader["ColumnName"],
                            ReferencedTable = reader["ReferencedTable"],
                            ReferencedColumn = reader["ReferencedColumn"],
                            ConstraintName = reader["ConstraintName"]
                        });
                    }
                }
            }
            return foreignKeys;
        }
        #endregion

        #region Helpers
        private void ValidateConnection()
        {
            if (!_connectionService.IsConnected)
                throw new InvalidOperationException("No active database connection");
        }
        #endregion


    }

}