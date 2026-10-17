package initializers

import (
	"fmt"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// DB is the shared database handle used across the application.
//
// NOTE: This is a package-level global for now to keep the current refactor
// focused. A later step will move toward passing the handle explicitly
// (dependency injection) once the controllers are restructured.
var DB *gorm.DB

// ConnectToDB opens a connection to PostgreSQL using the provided DSN,
// configures the underlying connection pool, and verifies connectivity with a
// ping. It returns an error instead of terminating the process so the caller
// can decide how to handle startup failures.
func ConnectToDB(dsn string) error {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("initializers: failed to open database connection: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("initializers: failed to access underlying sql.DB: %w", err)
	}

	// Connection pool settings. These matter in production (e.g. RDS has a
	// finite connection limit) and keep connections from going stale.
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)
	sqlDB.SetConnMaxIdleTime(5 * time.Minute)

	// Verify the connection is actually reachable at startup rather than
	// discovering the problem on the first request.
	if err := sqlDB.Ping(); err != nil {
		return fmt.Errorf("initializers: failed to ping database: %w", err)
	}

	DB = db
	return nil
}
