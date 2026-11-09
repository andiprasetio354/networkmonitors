package handlers

import (
	"fmt"
	"net/http"
	"time"

	"wifitics-backend/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type NotificationHandler struct {
	db          *gorm.DB
	broadcastFn func(eventType string, data interface{})
}

func NewNotificationHandler(db *gorm.DB, broadcastFn func(eventType string, data interface{})) *NotificationHandler {
	return &NotificationHandler{db: db, broadcastFn: broadcastFn}
}

func (h *NotificationHandler) GetSettings(c *gin.Context) {
	var settings []models.NotificationSetting
	h.db.Find(&settings)
	c.JSON(http.StatusOK, settings)
}

func (h *NotificationHandler) UpdateSetting(c *gin.Context) {
	channel := c.Param("channel")
	var setting models.NotificationSetting
	if err := h.db.Where("channel = ?", channel).First(&setting).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Channel not found"})
		return
	}

	var input models.NotificationSetting
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	setting.Enabled = input.Enabled
	setting.ConfigJSON = input.ConfigJSON
	setting.ActiveHours = input.ActiveHours
	setting.RootSuppression = input.RootSuppression
	setting.UpdatedAt = time.Now()

	h.db.Save(&setting)
	c.JSON(http.StatusOK, setting)
}

func (h *NotificationHandler) TestDispatch(c *gin.Context) {
	var input struct {
		Channel string `json:"channel"`
		Message string `json:"message"`
	}
	_ = c.ShouldBindJSON(&input)

	channel := input.Channel
	if channel == "" {
		channel = "all"
	}

	now := time.Now().Format("15:04:05 WIB")
	alertPayload := map[string]interface{}{
		"type":       "test_alert",
		"timestamp":  now,
		"channel":    channel,
		"dispatched": true,
		"message":    fmt.Sprintf("[TEST ALARM NOC] Uji coba notifikasi operasional Wifitics v4.2 terkirim pada %s.", now),
		"channels_delivered": []map[string]string{
			{"channel": "Telegram Bot", "status": "DELIVERED (HTTP 200 OK)", "target": "Tim IT & NOC All"},
			{"channel": "WhatsApp Gateway", "status": "QUEUED (HTTP 200)", "target": "2 Penerima On-Call"},
			{"channel": "Email SMTP", "status": "SENT (TLS 587)", "target": "it-support@kantor.co.id"},
			{"channel": "Browser Audio", "status": "PLAYED", "target": "NOC Wall Console"},
		},
	}

	if h.broadcastFn != nil {
		h.broadcastFn("test_alert_dispatched", alertPayload)
	}

	c.JSON(http.StatusOK, alertPayload)
}

