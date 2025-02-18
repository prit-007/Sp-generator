namespace Sp_Generator.Repos.Services
{
    public class ConnectionService
    {
        private string _connectionString;

        public void SetConnectionString(string connectionString)
        {
            if (string.IsNullOrWhiteSpace(connectionString))
                throw new ArgumentException("Connection string cannot be empty");

            _connectionString = connectionString;
        }

        public string GetConnectionString()
        {
            if (string.IsNullOrWhiteSpace(_connectionString))
                throw new InvalidOperationException("No connection string has been set.");

            return _connectionString;
        }

        public bool IsConnected => !string.IsNullOrEmpty(_connectionString);
    }
}
