package main

import (
	"log"
	"net/http"

	"wifitics-backend/config"
	"wifitics-backend/database"
	"wifitics-backend/handlers"
	"wifitics-backend/poller"

	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func main() {
	cfg := config.LoadConfig()

	// Connect to Database
	db, err := database.InitDB(cfg)
	if err != nil {
		log.Fatalf("Database initialization failed: %v", err)
	}

	// WebSocket Hub
	wsHub := handlers.NewWsHub()
	go wsHub.Run()

	// Background Poller Worker
	worker := poller.NewPoller(db, wsHub.Broadcast)
	worker.Start()
	defer worker.Stop()

	// Handlers
	deviceHandler := handlers.NewDeviceHandler(db, worker)
	incidentHandler := handlers.NewIncidentHandler(db)
	notificationHandler := handlers.NewNotificationHandler(db, wsHub.Broadcast)
	topologyHandler := handlers.NewTopologyHandler(db)

	router := gin.Default()
	router.Use(CORSMiddleware())

	// Health Check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "Wifitics Network Monitoring Backend",
			"version": "v4.2.0",
		})
	})

	// WebSocket Stream
	router.GET("/ws", wsHub.HandleWS)

	// REST API Routes
	api := router.Group("/api")
	{
		// Devices
		api.GET("/devices", deviceHandler.GetDevices)
		api.GET("/devices/subnet-scan", deviceHandler.SubnetScan)
		api.GET("/devices/export-csv", deviceHandler.ExportCSV)
		api.POST("/devices/import-csv", deviceHandler.ImportCSV)
		api.POST("/devices/ping-all", deviceHandler.PingAll)
		api.GET("/devices/:id", deviceHandler.GetDevice)
		api.POST("/devices", deviceHandler.CreateDevice)
		api.PUT("/devices/:id", deviceHandler.UpdateDevice)
		api.DELETE("/devices/:id", deviceHandler.DeleteDevice)
		api.POST("/devices/:id/ping", deviceHandler.ManualPing)
		api.POST("/devices/:id/maintenance", deviceHandler.ToggleMaintenance)

		// Dedicated LAN (Aruba Switches, PC, Printer)
		api.GET("/lan/overview", deviceHandler.GetLANOverview)

		// Incidents & SLA
		api.GET("/incidents", incidentHandler.GetIncidents)
		api.GET("/incidents/sla", incidentHandler.GetSLAStats)
		api.GET("/incidents/export", incidentHandler.ExportIncidentsReport)

		// Notifications
		api.GET("/notifications", notificationHandler.GetSettings)
		api.PUT("/notifications/:channel", notificationHandler.UpdateSetting)
		api.POST("/notifications/test", notificationHandler.TestDispatch)

		// Topology
		api.GET("/topology", topologyHandler.GetTopology)
	}

	log.Printf("Starting Wifitics Network Monitoring Server on port %s...", cfg.ServerPort)
	if err := router.Run(":" + cfg.ServerPort); err != nil {
		log.Fatalf("Server failed to run: %v", err)
	}
}
