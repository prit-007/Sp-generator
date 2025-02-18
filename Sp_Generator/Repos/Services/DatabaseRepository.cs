using Microsoft.Data.SqlClient;
using Newtonsoft.Json;

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
                        fk.COLUMN_NAME AS ColumnName,
                        pk.TABLE_NAME AS ReferencedTable,
                        pk.COLUMN_NAME AS ReferencedColumn
                    FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
                    INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE fk 
                        ON rc.CONSTRAINT_NAME = fk.CONSTRAINT_NAME
                    INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE pk 
                        ON rc.UNIQUE_CONSTRAINT_NAME = pk.CONSTRAINT_NAME
                    WHERE fk.TABLE_NAME = @TableName";

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

        #region Helpers
        private void ValidateConnection()
        {
            if (!_connectionService.IsConnected)
                throw new InvalidOperationException("No active database connection");
        }
        #endregion
    }

}
