package http

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func NewAuthHandler(r *gin.RouterGroup) {
	r.POST("/login", func(c *gin.Context) {
		// dummy login, always return token
		token := os.Getenv("JWT_TOKEN")
		if token == "" {
			token = "123456"
		}

		c.JSON(http.StatusOK, gin.H{"token": token})
	})
}
