package handlers

import (
	"net/http"

	"wifitics-backend/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type TopologyHandler struct {
	db *gorm.DB
}

func NewTopologyHandler(db *gorm.DB) *TopologyHandler {
	return &TopologyHandler{db: db}
}

func (h *TopologyHandler) GetTopology(c *gin.Context) {
	var nodes []models.TopologyNode
	var links []models.TopologyLink

	h.db.Find(&nodes)
	h.db.Find(&links)

	// Correlate with live device status from devices table if matches
	var devices []models.Device
	h.db.Find(&devices)
	deviceStatusMap := make(map[string]string)
	for _, d := range devices {
		deviceStatusMap[d.IP] = string(d.Status)
	}

	for i := range nodes {
		if st, ok := deviceStatusMap[nodes[i].IP]; ok {
			nodes[i].Status = st
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"nodes": nodes,
		"links": links,
	})
}

