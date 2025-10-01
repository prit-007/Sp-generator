# SP Generator - Backend API

## Overview
The backend API for SP Generator Pro provides a robust set of endpoints to interact with SQL Server databases. Built with ASP.NET Core, it enables secure database connections, schema exploration, and generation of optimized database artifacts.

## Features
- **Secure Connection Management**: Connect to SQL Server databases with encrypted credentials
- **Database Schema Retrieval**: Fetch tables, views, columns, and relationships
- **Stored Procedure Generation**: Generate optimized T-SQL stored procedures for CRUD operations
- **Code Generation**: Create C# models and controllers based on database schema
- **Error Handling**: Comprehensive error handling with detailed diagnostics

## Technology Stack
- ASP.NET Core 8
- Entity Framework Core
- Microsoft.Data.SqlClient for database connectivity
- .NET Core Dependency Injection

## Getting Started

### Prerequisites
- .NET 8 SDK or later
- Visual Studio 2022 or Visual Studio Code
- SQL Server (local or remote) for testing

### Running the API
1. Clone the repository
2. Navigate to the `Sp_Generator` directory
3. Run the application:
```
dotnet run
```
This will start the API on `https://localhost:7184` and `http://localhost:5090`.

### Building the Application
```
dotnet build
```

### Publishing the Application
```
dotnet publish -c Release
```

## API Endpoints

### Connection Management
- `POST /api/connection/test` - Test a database connection
- `POST /api/connection/save` - Save connection details

### Database Metadata
- `GET /api/database/metadata` - Retrieve database schema information
- `GET /api/database/tables` - List all tables
- `GET /api/database/tables/{tableName}` - Get specific table details

### Stored Procedures
- `POST /api/database/generate-procedures` - Generate stored procedures for tables

### Code Generation
- `POST /api/database/generate-models` - Generate C# models
- `POST /api/database/generate-controllers` - Generate ASP.NET controllers

## Configuration
- Update database connection settings in `appsettings.json`
- Configure CORS policy for frontend access
- Set logging levels for development and production environments

## Security Notes
- Connection strings are encrypted in transit
- The API implements proper authentication and authorization
- SQL injection protection is built into the query generation