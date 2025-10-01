
# 🚀 SP Generator

> *Revolutionizing database management with seamless stored procedure generation*

SP Generator is a powerful web application crafted to transform how developers create and manage stored procedures (SPs) for database systems. Combining a sleek React frontend with a robust .NET API backend, this tool eliminates the tedium of manual SP creation while providing advanced customization options for database professionals of all experience levels.

---

## ✨ Key Features

### 🎨 Frontend Experience (React)
- **Intuitive Dashboard Interface** - Navigate effortlessly through a thoughtfully designed UI that simplifies complex database operations
- **Smart Form Generation** - Dynamically adapts input fields based on your database schema and selected operations
- **Live Code Preview** - Watch your stored procedures take shape in real-time with syntax highlighting as you adjust parameters
- **Responsive Across Devices** - Enjoy a consistent experience whether on desktop workstations, tablets, or mobile devices
- **Template Management System** - Save, load, and modify your custom SP templates to maintain consistency across projects

### ⚙️ Backend Architecture (.NET API)
- **Universal Database Compatibility** - Seamlessly connect to SQL Server, MySQL, PostgreSQL, and other major database systems
- **Intelligent SP Generation Engine** - Creates optimized CRUD operations with support for complex joins, filtering, and pagination
- **Comprehensive Validation Framework** - Prevents errors with thorough input validation and detailed feedback
- **API Architecture** - Built on RESTful principles with clear documentation via Swagger/OpenAPI
- **Enterprise-Grade Security** - Implements JWT authentication, role-based permissions, and connection string encryption

### 🔍 Advanced Capabilities
- **Version Control Integration** - Track changes and maintain a complete history of all generated procedures
- **Multi-Format Export Options** - Download as .sql files, script bundles, or documentation with embedded SQL
- **Database Schema Analysis** - Automatically identifies relationships and suggests optimized procedure designs
- **Performance Insights** - Provides recommendations for indexing and query optimization
- **Cross-Database Migration** - Helps adapt stored procedures when moving between different database systems

---

## 🛠️ Technology Stack

### Frontend
- **Core Framework**: React 18+
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **UI Components**: Tailwind CSS with custom component library
- **Animations**: Framer Motion
- **Icons**: React Icons

### Backend
- **.NET Core**: 8.0+
- **Database Connectivity**: Microsoft.Data.SqlClient
- **Database Exploration**: SQL Server Management Objects (SMO)
- **Error Handling**: Global exception middleware
- **Documentation**: Swagger/OpenAPI

## Project Structure

The SP Generator project is organized into two main components:

### `/pro` - Frontend React Application
Contains the React frontend application that provides the user interface for the SP Generator tool.

### `/Sp_Generator` - Backend .NET API
Houses the ASP.NET Core API that handles database connections, queries, and stored procedure generation.

### DevOps & Tools
- **Version Control**: Git
- **CI/CD**: GitHub Actions
- **Container Support**: Docker & Docker Compose
- **Development Environment**: Visual Studio 2022, VS Code
- **API Testing**: Postman, Insomnia

---

## 🚦 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- .NET 7 SDK or later
- Database instance (SQL Server, MySQL, etc.)
- Git

### Step-by-Step Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/prit-007/Sp-generator.git
   cd sp-generator
   ```

2. **Configure the Backend**
   ```bash
   cd Sp_Generator
   
   # Restore dependencies
   dotnet restore
   
   # Then run the application
   dotnet run
   ```
   The API will be available at `https://localhost:61205` by default

3. **Launch the Frontend**
   ```bash
   cd ../pro
   
   # Install dependencies
   npm install
   
   # Start development server
   npm start
   ```
   The application will open automatically at `http://localhost:3000`

4. **Verify the Installation**
   - Navigate to the dashboard
   - Connect to your database using the connection form
   - Explore available tables and start generating procedures!

---

## 📘 Usage Guide

### Basic Workflow

1. **Connect to Your Database**
   - Enter connection details or select from saved connections
   - Test the connection to ensure proper configuration

2. **Select Database Objects**
   - Browse and select tables, views, or existing procedures
   - Review schema information including columns, data types, and relationships

3. **Configure Procedure Options**
   - Choose operation type (Select, Insert, Update, Delete)
   - Set parameter handling, transaction behavior, and error handling
   - Configure pagination, filtering, and sorting for Select procedures

4. **Customize and Generate**
   - Modify the procedure template if needed
   - Generate and preview the procedure code
   - Execute directly or export to file

5. **Save and Manage**
   - Store generated procedures in your project library
   - Add documentation and version notes
   - Schedule for deployment in your database

### Advanced Usage

- **Batch Generation**: Create multiple related procedures simultaneously
- **Custom Templates**: Develop organization-specific templates with placeholders
- **Schema Analysis**: Identify optimization opportunities in your database
- **Procedure Testing**: Validate generated procedures against test data

---

## 🤝 Contributing

We welcome contributions from developers of all skill levels! Here's how to get involved:

1. **Fork the Repository**
   - Create your feature branch (`git checkout -b feature/amazing-feature`)

2. **Implement Your Changes**
   - Write clean, documented code
   - Add tests for new functionality

3. **Ensure Quality**
   - Run existing tests (`npm test` for frontend, `dotnet test` for backend)
   - Follow the established code style

4. **Submit Your Contribution**
   - Commit your changes (`git commit -m 'Add amazing feature'`)
   - Push to your branch (`git push origin feature/amazing-feature`)
   - Open a Pull Request with a detailed description

5. **Code Review**
   - Address feedback from maintainers
   - Work collaboratively to refine your contribution

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for complete details.

---

## 💐 Acknowledgments

- Special thanks to the React and .NET communities for their invaluable resources
- Gratitude to early adopters who provided feedback and feature suggestions
- Appreciation to all contributors who have helped shape this tool

---

## 📬 Contact & Support

### Project Maintainer
**VASANI PRIT**  
📧 Email: pritvasani2@gmail.com  
💻 GitHub: [prit-007](https://github.com/prit-007)

### Community
- **Issues & Feature Requests**: Submit via GitHub Issues
- **Discussions**: Join our GitHub Discussions board
- **Updates**: Star the repository to receive notifications

---