package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for dev/dashboard
	},
}

type WsHub struct {
	clients    map[*websocket.Conn]bool
	broadcast  chan []byte
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	mu         sync.RWMutex
}

func NewWsHub() *WsHub {
	return &WsHub{
		clients:    make(map[*websocket.Conn]bool),
		broadcast:  make(chan []byte, 100),
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
	}
}

func (h *WsHub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			// Send initial welcome message
			welcome, _ := json.Marshal(map[string]interface{}{
				"event": "connected",
				"data": map[string]interface{}{
					"message":   "Connected to Wifitics NOC WebSocket Stream",
					"timestamp": time.Now().Format(time.RFC3339),
				},
			})
			_ = client.WriteMessage(websocket.TextMessage, welcome)

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				_ = client.Close()
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				err := client.WriteMessage(websocket.TextMessage, message)
				if err != nil {
					log.Printf("WS write error: %v", err)
					_ = client.Close()
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *WsHub) Broadcast(eventType string, data interface{}) {
	payload, err := json.Marshal(map[string]interface{}{
		"event": eventType,
		"data":  data,
	})
	if err != nil {
		log.Printf("Failed to marshal WS message: %v", err)
		return
	}
	select {
	case h.broadcast <- payload:
	default:
		// Queue full, drop message
	}
}

func (h *WsHub) HandleWS(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to set websocket upgrade: %v", err)
		return
	}

	h.register <- conn

	go func() {
		defer func() {
			h.unregister <- conn
		}()
		for {
			_, _, err := conn.ReadMessage()
			if err != nil {
				break
			}
		}
	}()
}

