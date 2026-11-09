package handlers

import (
	"encoding/csv"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"strconv"
	"strings"
	"time"

	"wifitics-backend/models"
	"wifitics-backend/poller"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type DeviceHandler struct {
	db     *gorm.DB
	poller *poller.Poller
}

func NewDeviceHandler(db *gorm.DB, p *poller.Poller) *DeviceHandler {
	return &DeviceHandler{db: db, poller: p}
}

func (h *DeviceHandler) GetDevices(c *gin.Context) {
	var devices []models.Device
	query := h.db.Model(&models.Device{})

	if search := c.Query("search"); search != "" {
		s := "%" + search + "%"
		query = query.Where("hostname ILIKE ? OR ip ILIKE ? OR mac ILIKE ? OR location ILIKE ?", s, s, s, s)
	}

	if status := c.Query("status"); status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}

	if location := c.Query("location"); location != "" && location != "all" {
		query = query.Where("location = ?", location)
	}

	if category := c.Query("category"); category != "" && category != "all" {
		query = query.Where("category = ?", category)
	}

	// Offline devices should be prioritized on top (PRD F-15)
	query = query.Order("CASE WHEN status = 'offline' THEN 1 WHEN status = 'unreachable' THEN 2 WHEN status = 'maintenance' THEN 3 ELSE 4 END, hostname ASC")

	if err := query.Find(&devices).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, devices)
}

func (h *DeviceHandler) GetDevice(c *gin.Context) {
	id := c.Param("id")
	var dev models.Device
	if err := h.db.First(&dev, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Device not found"})
		return
	}

	// Generate 24-point latency history waveform (last 24 hours)
	var waveform []map[string]interface{}
	now := time.Now()
	baseLat := dev.LatencyMs
	if baseLat <= 0 {
		baseLat = 12.4
	}

	for i := 23; i >= 0; i-- {
		t := now.Add(-time.Duration(i) * time.Hour)
		lat := baseLat + (rand.Float64()-0.5)*3.0
		loss := 0.0

		// Simulate incident spike for offline nodes
		if dev.Status == models.StatusOffline && i <= 1 {
			lat = 128.0
			loss = 100.0
		} else if lat < 0.5 {
			lat = 0.8
		}

		waveform = append(waveform, map[string]interface{}{
			"time":        t.Format("15:04"),
			"latency_ms":  float64(int(lat*10)) / 10,
			"packet_loss": loss,
		})
	}

	var recentIncidents []models.Incident
	h.db.Where("device_id = ?", dev.ID).Order("started_at DESC").Limit(5).Find(&recentIncidents)

	c.JSON(http.StatusOK, gin.H{
		"device":           dev,
		"latency_waveform": waveform,
		"recent_incidents": recentIncidents,
	})
}

func (h *DeviceHandler) CreateDevice(c *gin.Context) {
	var input models.Device
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Hostname == "" || input.IP == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Hostname and IP are required"})
		return
	}

	now := time.Now()
	input.CreatedAt = now
	input.UpdatedAt = now
	input.LastCheck = now
	input.LastStatusChange = now
	if input.Status == "" {
		input.Status = models.StatusOnline
	}
	if input.CheckIntervalSec <= 0 {
		input.CheckIntervalSec = 15
	}
	if input.CheckMethod == "" {
		input.CheckMethod = "icmp"
	}

	if err := h.db.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, input)
}

func (h *DeviceHandler) UpdateDevice(c *gin.Context) {
	id := c.Param("id")
	var dev models.Device
	if err := h.db.First(&dev, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Device not found"})
		return
	}

	var input models.Device
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	dev.Hostname = input.Hostname
	dev.IP = input.IP
	dev.MAC = input.MAC
	dev.Category = input.Category
	dev.SubnetVlan = input.SubnetVlan
	dev.ParentID = input.ParentID
	dev.ParentName = input.ParentName
	dev.Location = input.Location
	dev.Rack = input.Rack
	dev.CheckMethod = input.CheckMethod
	dev.CheckIntervalSec = input.CheckIntervalSec
	dev.TargetPort = input.TargetPort
	dev.MaintenanceMode = input.MaintenanceMode
	dev.Details = input.Details
	dev.UpdatedAt = time.Now()

	if dev.MaintenanceMode {
		dev.Status = models.StatusMaintenance
	}

	if err := h.db.Save(&dev).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, dev)
}

func (h *DeviceHandler) DeleteDevice(c *gin.Context) {
	id := c.Param("id")
	if err := h.db.Delete(&models.Device{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Device deleted successfully"})
}

func (h *DeviceHandler) ToggleMaintenance(c *gin.Context) {
	id := c.Param("id")
	var dev models.Device
	if err := h.db.First(&dev, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Device not found"})
		return
	}

	dev.MaintenanceMode = !dev.MaintenanceMode
	if dev.MaintenanceMode {
		dev.Status = models.StatusMaintenance
	} else {
		dev.Status = models.StatusOnline
	}
	dev.LastStatusChange = time.Now()

	h.db.Save(&dev)
	c.JSON(http.StatusOK, dev)
}

func (h *DeviceHandler) ManualPing(c *gin.Context) {
	id := c.Param("id")
	var dev models.Device
	if err := h.db.First(&dev, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Device not found"})
		return
	}

	success, lat, err := h.poller.ManualPing(&dev)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"hostname":   dev.Hostname,
		"ip":         dev.IP,
		"status":     dev.Status,
		"success":    success,
		"latency_ms": lat,
	})
}

func (h *DeviceHandler) PingAll(c *gin.Context) {
	go func() {
		var devices []models.Device
		h.db.Find(&devices)
		for i := range devices {
			_, _, _ = h.poller.ManualPing(&devices[i])
		}
	}()
	c.JSON(http.StatusOK, gin.H{"message": "Global scan initiated across all cluster nodes"})
}

func (h *DeviceHandler) SubnetScan(c *gin.Context) {
	cidr := c.DefaultQuery("cidr", "192.168.10.0/24")
	results, err := h.poller.SubnetScan(cidr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"cidr":      cidr,
		"found":     len(results),
		"addresses": results,
	})
}

func (h *DeviceHandler) ImportCSV(c *gin.Context) {
	file, _, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please upload a CSV file"})
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)
	// Skip header
	_, _ = reader.Read()

	count := 0
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil || len(record) < 3 {
			continue
		}

		hostname := strings.TrimSpace(record[0])
		ip := strings.TrimSpace(record[1])
		category := strings.TrimSpace(record[2])
		location := "Kantor Pusat"
		if len(record) > 3 {
			location = strings.TrimSpace(record[3])
		}

		dev := models.Device{
			Hostname:         hostname,
			IP:               ip,
			Category:         category,
			Location:         location,
			CheckMethod:      "icmp",
			CheckIntervalSec: 15,
			Status:           models.StatusOnline,
			LastCheck:        time.Now(),
			LastStatusChange: time.Now(),
		}
		h.db.Create(&dev)
		count++
	}

	c.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("Successfully imported %d devices", count)})
}

func (h *DeviceHandler) ExportCSV(c *gin.Context) {
	var devices []models.Device
	h.db.Find(&devices)

	c.Header("Content-Disposition", "attachment; filename=wifitics_devices_export.csv")
	c.Header("Content-Type", "text/csv")

	writer := csv.NewWriter(c.Writer)
	_ = writer.Write([]string{"ID", "Hostname", "IP", "MAC", "Category", "Location", "Rack", "Status", "Latency_ms", "PacketLoss_pct"})

	for _, d := range devices {
		_ = writer.Write([]string{
			strconv.Itoa(int(d.ID)),
			d.Hostname,
			d.IP,
			d.MAC,
			d.Category,
			d.Location,
			d.Rack,
			string(d.Status),
			fmt.Sprintf("%.2f", d.LatencyMs),
			fmt.Sprintf("%.1f", d.PacketLoss),
		})
	}
	writer.Flush()
}

func (h *DeviceHandler) GetLANOverview(c *gin.Context) {
	var switches, pcs, printers []models.Device
	h.db.Where("category = 'switch' OR hostname ILIKE '%aruba%'").Find(&switches)
	h.db.Where("category = 'pc'").Find(&pcs)
	h.db.Where("category = 'printer'").Find(&printers)

	var offlineCount int64
	h.db.Where("(category IN ('switch', 'pc', 'printer') OR hostname ILIKE '%aruba%') AND status = 'offline'").Count(&offlineCount)

	c.JSON(http.StatusOK, gin.H{
		"total_connected": len(switches) + len(pcs) + len(printers),
		"switches":        switches,
		"pcs":             pcs,
		"printers":        printers,
		"offline_alerts":  offlineCount,
	})
}
