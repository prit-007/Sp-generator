using System;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace Sp_Generator.Repos.Services
{
    public class ConnectionService
    {
        private string _encryptedConnectionString;
        private readonly byte[] _encryptionKey;
        private readonly byte[] _encryptionIv;
        private readonly IConfiguration _configuration;
        private readonly SqlConnectionStringBuilder _connectionStringBuilder;

        // Constructor injection for configuration
        public ConnectionService(IConfiguration configuration)
        {
            _configuration = configuration;
            
            // Get encryption key and IV from configuration or generate secure ones
            string keyString = _configuration["ConnectionEncryption:Key"];
            string ivString = _configuration["ConnectionEncryption:IV"];
            
            if (string.IsNullOrEmpty(keyString) || string.IsNullOrEmpty(ivString))
            {
                // Generate random key and IV if not configured
                using (var aes = Aes.Create())
                {
                    _encryptionKey = aes.Key;
                    _encryptionIv = aes.IV;
                }
            }
            else
            {
                // Use configured key and IV
                _encryptionKey = Convert.FromBase64String(keyString);
                _encryptionIv = Convert.FromBase64String(ivString);
            }
            
            _connectionStringBuilder = new SqlConnectionStringBuilder();
        }

        public void SetConnectionString(string connectionString)
        {
            if (string.IsNullOrWhiteSpace(connectionString))
                throw new ArgumentException("Connection string cannot be empty");

            // Parse the connection string to validate it and sanitize it
            _connectionStringBuilder.ConnectionString = connectionString;
            
            // Store only the encrypted connection string
            _encryptedConnectionString = EncryptConnectionString(connectionString);
        }

        public string GetConnectionString()
        {
            if (string.IsNullOrWhiteSpace(_encryptedConnectionString))
                throw new InvalidOperationException("No connection string has been set.");

            return DecryptConnectionString(_encryptedConnectionString);
        }

        public bool IsConnected => !string.IsNullOrEmpty(_encryptedConnectionString);

        // Encrypt connection string using AES
        private string EncryptConnectionString(string connectionString)
        {
            try
            {
                using (var aes = Aes.Create())
                {
                    aes.Key = _encryptionKey;
                    aes.IV = _encryptionIv;

                    using (var encryptor = aes.CreateEncryptor(aes.Key, aes.IV))
                    using (var memStream = new System.IO.MemoryStream())
                    using (var cryptoStream = new CryptoStream(memStream, encryptor, CryptoStreamMode.Write))
                    {
                        byte[] plainBytes = Encoding.UTF8.GetBytes(connectionString);
                        cryptoStream.Write(plainBytes, 0, plainBytes.Length);
                        cryptoStream.FlushFinalBlock();
                        return Convert.ToBase64String(memStream.ToArray());
                    }
                }
            }
            catch (Exception ex)
            {
                // Log error but don't expose details
                Console.WriteLine($"Encryption error: {ex.Message}");
                throw new InvalidOperationException("Failed to secure connection string.");
            }
        }

        // Decrypt connection string using AES
        private string DecryptConnectionString(string encryptedConnectionString)
        {
            try
            {
                using (var aes = Aes.Create())
                {
                    aes.Key = _encryptionKey;
                    aes.IV = _encryptionIv;

                    using (var decryptor = aes.CreateDecryptor(aes.Key, aes.IV))
                    using (var memStream = new System.IO.MemoryStream(Convert.FromBase64String(encryptedConnectionString)))
                    using (var cryptoStream = new CryptoStream(memStream, decryptor, CryptoStreamMode.Read))
                    {
                        using (var streamReader = new System.IO.StreamReader(cryptoStream))
                        {
                            return streamReader.ReadToEnd();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // Log error but don't expose details
                Console.WriteLine($"Decryption error: {ex.Message}");
                throw new InvalidOperationException("Failed to retrieve connection string.");
            }
        }
    }
}
