# Chama - E-commerce Product Management API

  Chama is a Ruby on Rails API application for managing an e-commerce product catalog. It provides endpoints for managing categories, products, and their variants with features like image handling, authentication, and more.

## Technology Stack

- Ruby 3.3.8
- Rails 8.0.2
- PostgreSQL database
- Rodauth for authentication
- Blueprinter for JSON serialization
- RSpec for testing

## Development Setup

### Prerequisites

- Ruby 3.3.8
- PostgreSQL
- Git

### Local Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd chama
   ```

2. Install dependencies:
   ```
   bundle install
   ```

3. Configure database credentials:

   Before setting up the database, make sure to update the PostgreSQL username and password in the database configuration file to use your own credentials:
   ```
   # config/database.yml
   username: your_postgres_username
   password: your_postgres_password
   ```

4. Set up the database:
   ```
   rails db:create
   rails db:migrate
   rails db:seed  # if seed data is available
   ```

4. Start the server:
   ```
   rails server
   ```

5. The API will be available at http://localhost:3000
