# Azure Group Sync API

A Node.js REST API service that synchronizes Azure Active Directory security groups with a MongoDB database. 
## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Azure AD      │    │   Node.js API   │    │   MongoDB       │
│   (Groups)      │◄──►│   Service       │◄──►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

1. **API Request**: Client calls `/v1.0/securitygroup/sync`
2. **Azure AD Query**: Service fetches security groups from Microsoft Graph API
3. **Data Processing**: Groups are filtered and processed in batches
4. **Database Sync**: Bulk upsert operations update MongoDB
5. **Response**: Service returns sync results

## Features

- **Automated Sync**: Synchronizes Azure AD security groups with MongoDB
- **Security Focus**: Filters and syncs only security-enabled groups
- **Retry Logic**: Implements exponential backoff with jitter for reliable API calls
- **Bulk Operations**: Efficient bulk upsert operations for large group datasets
- **Health Check**: Built-in health monitoring endpoint
- **API Documentation**: OpenAPI/Swagger documentation included
- **Docker Support**: Full containerization with Docker Compose
- **Logging**: Comprehensive logging with Winston

## Prerequisites

- Node.js 22+ 
- MongoDB 8+
- Azure AD application with appropriate permissions
- Docker
- IDE e.g. VSCode

## Azure AD Permissions Required

Your Azure AD application needs the following Microsoft Graph permissions:

- `Group.Read.All` - To read all groups

## Quick Start

### Using VSCode (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd AZGroupSync
   ```

2. **Create environment file:**
   ```bash
   copy .env.example .env
   ```

3. **Update the `.env` file with your Azure AD configuration:**
   ```env
   # Azure AD Configuration
   AZURE_CLIENT_ID=your-client-id
   AZURE_CLIENT_SECRET=your-client-secret
   AZURE_TENANT_ID=your-tenant-id

   # Application Configuration
   PORT=8080
   NODE_ENV=production
   ```

4. **Start the services:**
   ```bash
   docker-compose up -d
   ```

5. **Verify the services are running:**
   ```bash
   docker-compose ps
   ```

### Manual Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up MongoDB** 

3. **Configure environment variables** in `.env` file
    ```env
    MONGO_URI="mongodb://<mongodb_container_name>:<port>/<database_name>"
    ```

4. **Start the application:**
   ```bash
   npm start
   ```

## API Endpoints

### Base URL
- Local: `http://localhost:8080`

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health status |
| GET | `/v1.0/securitygroup/sync` | Trigger Azure AD security group sync |
| GET | `/openapi` | Interactive API documentation |

## Usage Examples

### 1. Check Service Health

```bash
curl -X GET http://localhost:8080/health
```

**Response:**
```json
{
  "uptime": 3600.123,
  "message": "OK",
  "timestamp": 1642694400000
}
```

### 2. Trigger Group Synchronization

```bash
curl -X GET http://localhost:8080/v1.0/securitygroup/sync
```

**Response:**
```json
{
  "count": 25,
  "message": "Groups synced successfully."
}
```

### 3. View API Documentation

Open your browser and navigate to:
```
http://localhost:8080/openapi
```

### 4. Access MongoDB Database (Mongo Express)

Open your browser and navigate to:
```
http://localhost:8081
```

**Default Credentials:**
- Username: `admin`
- Password: `pass`

**Features:**
- Browse databases and collections
- View and edit documents
- Execute MongoDB queries
- Database statistics and indexes
- Import/Export data

## Database Schema

The service stores Azure AD groups in MongoDB with the following schema:

```javascript
{
  id: String,              // Azure AD group ID (unique)
  displayName: String,     // Group display name
  mail: String,           // Group email address
  mailEnabled: Boolean,   // Whether group is mail-enabled
  securityEnabled: Boolean, // Whether group is security-enabled (always true)
  createdDateTime: String, // Group creation date from Azure AD
  createdAt: Date,        // MongoDB document creation timestamp
  updatedAt: Date         // MongoDB document update timestamp
}
```

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 8080 |
| `NODE_ENV` | Environment mode | No | development |
| `AZURE_CLIENT_ID` | Azure AD application ID | Yes | - |
| `AZURE_CLIENT_SECRET` | Azure AD application secret | Yes | - |
| `AZURE_TENANT_ID` | Azure AD tenant ID | Yes | - |
| `MONGO_URI` | Mongo DB URI | Yes | - |

### Docker Services

The Docker Compose setup includes:

- **API Service**: 
  - Container: `az-group-sync-api`
  - Port: 8080
  - Auto-restart: enabled
  - Health checks: enabled

- **MongoDB**: 
  - Container: `az-group-sync-mongo`
  - Port: 27017
  - Database: `azuresyncdb`
  - Persistent storage: enabled
  - Health checks: enabled

- **Mongo Express**: 
  - Container: `az-group-sync-mongo-express`
  - Port: 8081
  - Web-based MongoDB administration interface
  - Basic authentication enabled
  - Auto-restart: enabled

## Error Handling & Resilience

### Retry Logic
- **Retryable Errors**: 429 (Rate Limit), 500, 502, 503, 504
- **Max Retries**: 3 attempts
- **Backoff Strategy**: Exponential backoff with jitter
- **Rate Limit Handling**: Respects `Retry-After` headers

### Health Monitoring
- **Application Health**: `/health` endpoint
- **Docker Health Checks**: Built-in container health monitoring
- **Database Connectivity**: Automatic MongoDB connection monitoring

### Logging
- **Structured Logging**: JSON format with Winston
- **Log Levels**: error, warn, info, debug
- **Request Tracking**: Full request/response logging
- **Error Details**: Comprehensive error context

## Development

### Project Structure

```
src/
├── index.js              # Application entry point
├── config/
│   ├── graphClient.js    # Microsoft Graph client setup
│   └── mongo.js          # MongoDB connection configuration
├── controller/
│   └── syncController.js # HTTP request handlers
├── model/
│   └── group.js          # MongoDB group schema
├── service/
│   └── groupService.js   # Business logic for group synchronization
├── route/
│   └── apiRouter.js      # API route definitions
├── logger/
│   └── winstonLogger.js  # Logging configuration
└── openapi/
    └── api_specification.yml # OpenAPI/Swagger documentation
```

### Running in Development Mode

```bash
# Install dependencies
npm install

# Set up environment variables
copy .env.example .env
# Edit .env with your configuration

# Start in development mode
npm start
```

### Docker Development

```bash
# Build and start services
docker-compose up --build

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Remove volumes (reset database)
docker-compose down -v
```

### MongoDB Management with Mongo Express

Mongo Express provides a web-based MongoDB administration interface that's included in the Docker Compose setup.

**Access the Interface:**
```
http://localhost:8081
```

**Default Login Credentials:**
- Username: `admin`
- Password: `pass`

**Common Operations:**

1. **View Synced Groups:**
   - Navigate to `azuresyncdb` database
   - Click on `groups` collection
   - Browse synchronized Azure AD groups

2. **Search for Specific Groups:**
   - Use the search functionality in Mongo Express
   - Filter by `displayName`, `mail`, or other fields

3. **Monitor Sync Results:**
   - Check `createdAt` and `updatedAt` timestamps
   - Verify data consistency after sync operations`
