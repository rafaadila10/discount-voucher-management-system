package infrastructure

import (
	"voucher-backend/internal/delivery/http"
	"voucher-backend/internal/domain"

	"github.com/gin-gonic/gin"
)

func InitRouter(r *gin.Engine, uc domain.VoucherUsecase) {
	api := r.Group("/")

	// login
	http.NewAuthHandler(api)

	// protected routes
	protected := api.Group("/")
	protected.Use(http.AuthMiddleware())

	// get voucher handler instance
	vh := http.NewVoucherHandler(protected, uc)

	// CSV endpoints
	protected.POST("/vouchers/upload-csv", vh.UploadCSV)
	protected.GET("/vouchers/export", vh.ExportCSV)
}
